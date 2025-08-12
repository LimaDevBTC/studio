"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, CheckCircle2, XCircle, DollarSign, Eye, Loader2, Filter, Search, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDocs, getDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  network: string;
  paymentAddress: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  updatedAt: any;
}

interface TransactionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [networkFilter, setNetworkFilter] = useState<string>("all");

  const { toast } = useToast();
  const { user } = useAuth();
  const t = useTranslations("AdminTransactions");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Verificar se o usuário é admin
    const checkAdminStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          setLoading(false);
          return;
        }

        // Se é admin, buscar todas as transações (sem filtros complexos)
        const q = query(collection(db, "transactions"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const trans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Transaction[];
          
          // Ordenar localmente por data de criação (mais recente primeiro)
          trans.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
          });
          
          setTransactions(trans);
          setFilteredTransactions(trans);
          calculateStats(trans);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error checking admin status:", error);
        setLoading(false);
        return;
      }
    };

    const unsubscribe = checkAdminStatus();
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [user]);

  const calculateStats = (trans: Transaction[]) => {
    const stats = {
      total: trans.length,
      pending: trans.filter(t => t.status === "pending").length,
      approved: trans.filter(t => t.status === "approved").length,
      rejected: trans.filter(t => t.status === "rejected").length,
      totalAmount: trans.reduce((sum, t) => sum + t.amount, 0)
    };
    setStats(stats);
  };

  useEffect(() => {
    let filtered = transactions;

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filtro por rede
    if (networkFilter !== "all") {
      filtered = filtered.filter(t => t.network === networkFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.paymentAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, statusFilter, networkFilter, searchTerm]);

  const handleApprovePayment = async (transaction: Transaction) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "transactions", transaction.id), {
        status: "approved",
        updatedAt: serverTimestamp()
      });

      // Atualizar notificação se existir
      const notificationQuery = query(
        collection(db, "adminNotifications"),
        where("transactionId", "==", transaction.id)
      );
      const notificationSnapshot = await getDocs(notificationQuery);
      if (!notificationSnapshot.empty) {
        await updateDoc(doc(db, "adminNotifications", notificationSnapshot.docs[0].id), {
          status: "approved",
          updatedAt: serverTimestamp()
        });
      }

      toast({
        title: t("paymentApproved"),
        description: t("paymentApprovedDesc"),
      });
    } catch (error) {
      console.error("Error approving payment:", error);
      toast({
        title: t("approvalError"),
        description: t("approvalErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async (transaction: Transaction) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "transactions", transaction.id), {
        status: "rejected",
        updatedAt: serverTimestamp()
      });

      // Atualizar notificação se existir
      const notificationQuery = query(
        collection(db, "adminNotifications"),
        where("transactionId", "==", transaction.id)
      );
      const notificationSnapshot = await getDocs(notificationQuery);
      if (!notificationSnapshot.empty) {
        await updateDoc(doc(db, "adminNotifications", notificationSnapshot.docs[0].id), {
          status: "rejected",
          updatedAt: serverTimestamp()
        });
      }

      toast({
        title: t("paymentRejected"),
        description: t("paymentRejectedDesc"),
      });
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast({
        title: t("rejectionError"),
        description: t("rejectionErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user || loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t("totalTransactions")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t("pending")}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t("approved")}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t("totalAmount")}</p>
                <p className="text-2xl font-bold">{stats.totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="approved">{t("approved")}</SelectItem>
                <SelectItem value="rejected">{t("rejected")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={networkFilter} onValueChange={setNetworkFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectNetwork")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allNetworks")}</SelectItem>
                <SelectItem value="Solana">{t("solana")}</SelectItem>
                <SelectItem value="Bitcoin">{t("bitcoin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("transactions")} ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noTransactionsFound")}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{transaction.userName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.courseTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.amount} {transaction.currency} ({transaction.network})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsViewingDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t("viewDetails")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t("transactionDetails")}</DialogTitle>
                        </DialogHeader>
                        
                        {selectedTransaction && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  {t("user")}
                                </label>
                                <p className="font-medium">{selectedTransaction.userName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  {t("course")}
                                </label>
                                <p className="font-medium">{selectedTransaction.courseTitle}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  {t("amount")}
                                </label>
                                <p className="font-medium">
                                  {selectedTransaction.amount} {selectedTransaction.currency}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  {t("status")}
                                </label>
                                {getStatusBadge(selectedTransaction.status)}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {t("paymentAddress")}
                              </label>
                              <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                                {selectedTransaction.paymentAddress}
                              </code>
                            </div>

                            {selectedTransaction.status === "pending" && (
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => handleApprovePayment(selectedTransaction)}
                                  disabled={isProcessing}
                                  className="flex-1"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                  )}
                                  {t("approvePayment")}
                                </Button>
                                <Button
                                  onClick={() => handleRejectPayment(selectedTransaction)}
                                  disabled={isProcessing}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {t("rejectPayment")}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
