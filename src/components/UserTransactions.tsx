"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, CheckCircle2, XCircle, DollarSign, Eye, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";

interface Transaction {
  id: string;
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

export default function UserTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const t = useTranslations("UserTransactions");

  useEffect(() => {
    console.log("UserTransactions useEffect triggered, user:", user?.uid);
    
    if (!user) {
      console.log("No user, setting loading to false");
      setLoading(false);
      return;
    }

    console.log("Setting up Firestore listener for user:", user.uid);

    // Buscar transações do usuário (sem orderBy para evitar problemas de índice)
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Firestore snapshot received, docs count:", snapshot.docs.length);
      const trans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      // Ordenar localmente por data de criação (mais recente primeiro)
      trans.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
      });
      
      console.log("Processed transactions:", trans);
      setTransactions(trans);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      setLoading(false);
      
      // Se for erro de permissão, mostrar mensagem específica
      if (error.code === 'permission-denied') {
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para acessar as transações. Entre em contato com o suporte.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao Carregar Transações",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
      }
    });

    return () => {
      console.log("Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [user]);

  const handleRefreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      // Forçar atualização das transações (sem orderBy para evitar problemas de índice)
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user?.uid)
      );

      const snapshot = await getDocs(q);
      const trans = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      // Ordenar localmente por data de criação (mais recente primeiro)
      trans.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
      });
      
      setTransactions(trans);
      toast({
        title: t("refreshSuccess"),
        description: t("refreshSuccessDesc"),
      });
    } catch (error: any) {
      console.error("Error refreshing transactions:", error);
      let errorMessage = t("refreshErrorDesc");
      
      // Mensagens de erro mais específicas
      if (error.code === 'permission-denied') {
        errorMessage = "Você não tem permissão para acessar as transações.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Serviço temporariamente indisponível. Tente novamente.";
      }
      
      toast({
        title: t("refreshError"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return t("statusPendingDesc");
      case "approved":
        return t("statusApprovedDesc");
      case "rejected":
        return t("statusRejectedDesc");
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-auto overflow-visible">
        <CardHeader className="w-full h-auto">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full h-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto overflow-visible">
      <CardHeader className="w-full h-auto">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshTransactions}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {t("refresh")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="w-full h-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noTransactions")}
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{transaction.courseTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {transaction.amount} {transaction.currency} ({transaction.network})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getStatusDescription(transaction.status)}
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
                                {t("network")}
                              </label>
                              <p className="font-medium">{selectedTransaction.network}</p>
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

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              {t("createdAt")}
                            </label>
                            <p className="font-medium">
                              {selectedTransaction.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'N/A'}
                            </p>
                          </div>

                          {selectedTransaction.updatedAt && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {t("updatedAt")}
                              </label>
                              <p className="font-medium">
                                {selectedTransaction.updatedAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'N/A'}
                              </p>
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
  );
}
