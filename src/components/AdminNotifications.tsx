"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, CheckCircle2, XCircle, Clock, DollarSign, Eye, Loader2, Filter, Search, Users, TrendingUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";

interface AdminNotification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId?: string;
  courseTitle?: string;
  planId?: string;
  planName?: string;
  transactionId: string;
  amount: number;
  currency: string;
  network: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  type: string;
}

interface Transaction {
  id: string;
  userId: string;
  courseId?: string;
  courseTitle?: string;
  planId?: string;
  planName?: string;
  amount: number;
  currency: string;
  network: string;
  paymentAddress: string;
  status: string;
  createdAt: any;
  updatedAt: any;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Estatísticas
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const t = useTranslations("AdminNotifications");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupNotifications = async () => {
      try {
        // Verificar se o usuário é admin
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          setLoading(false);
          return;
        }

        // Buscar todas as notificações
        const q = query(collection(db, "adminNotifications"));

        unsubscribe = onSnapshot(q, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AdminNotification[];
          
          // Ordenar localmente por data de criação (mais recente primeiro)
          notifs.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
          });
          
          setNotifications(notifs);
          setFilteredNotifications(notifs);
          calculateStats(notifs);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up notifications:", error);
        setLoading(false);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Calcular estatísticas
  const calculateStats = (notifs: AdminNotification[]) => {
    if (!notifs || notifs.length === 0) {
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
      });
      return;
    }

    const stats: Stats = {
      total: notifs.length,
      pending: notifs.filter(n => n.status === "pending").length,
      approved: notifs.filter(n => n.status === "approved").length,
      rejected: notifs.filter(n => n.status === "rejected").length,
      totalAmount: notifs.reduce((sum, n) => sum + (n.amount || 0), 0)
    };
    setStats(stats);
  };

  // Aplicar filtros
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setFilteredNotifications([]);
      return;
    }

    let filtered = [...notifications];

    // Filtro de busca
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(n => 
        (n.userName && n.userName.toLowerCase().includes(term)) ||
        (n.userEmail && n.userEmail.toLowerCase().includes(term)) ||
        (n.courseTitle && n.courseTitle.toLowerCase().includes(term)) ||
        (n.planName && n.planName.toLowerCase().includes(term))
      );
    }

    // Filtro de status
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(n => n.status === statusFilter);
    }

    // Filtro de rede
    if (networkFilter && networkFilter !== "all") {
      filtered = filtered.filter(n => n.network === networkFilter);
    }

    // Filtro de tipo
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, statusFilter, networkFilter, typeFilter]);

  const handleViewDetails = async (notification: AdminNotification) => {
    try {
      // Simplesmente mostrar os detalhes da notificação
      setSelectedNotification(notification);
      setIsViewingDetails(true);
    } catch (error) {
      console.error("Error opening notification details:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir detalhes da notificação",
        variant: "destructive",
      });
    }
  };

  const handleApprovePayment = async (notification: AdminNotification) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      console.log("🚀 Aprovando pagamento:", {
        notificationId: notification.id,
        type: notification.type,
        userId: notification.userId
      });

      // Atualizar status da notificação
      await updateDoc(doc(db, "adminNotifications", notification.id), {
        status: "approved",
        updatedAt: serverTimestamp(),
        approvedBy: user?.uid,
        approvedAt: serverTimestamp()
      });

      // LIBERAR ACESSO AUTOMATICAMENTE
      if (notification.type === 'course') {
        // Adicionar acesso ao curso
        const accessRef = doc(db, "userCourseAccess", `${notification.userId}_${notification.courseId}`);
        await setDoc(accessRef, {
          userId: notification.userId,
          courseId: notification.courseId,
          courseTitle: notification.courseTitle,
          status: "active",
          grantedAt: serverTimestamp(),
          transactionId: notification.transactionId
        });
        console.log("✅ Acesso ao curso liberado!");
      } else if (notification.type === 'subscription') {
        // Criar/atualizar assinatura
        const subscriptionRef = doc(db, "userSubscriptions", notification.userId);
        await setDoc(subscriptionRef, {
          userId: notification.userId,
          planId: notification.planId,
          planName: notification.planName,
          status: "active",
          startDate: serverTimestamp(),
          lastPayment: serverTimestamp(),
          transactionId: notification.transactionId
        }, { merge: true });
        console.log("✅ Assinatura criada/atualizada!");
      }

      toast({
        title: t("paymentApproved"),
        description: t("paymentApprovedDesc"),
      });

      // Recarregar dados
      handleRefresh();

    } catch (error) {
      console.error("❌ Erro ao aprovar pagamento:", error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Erro ao aprovar pagamento. Verifique o console.";
      
      if (error instanceof Error) {
        if (error.message.includes("permission")) {
          errorMessage = "Erro de permissão. Verifique as regras do Firestore.";
        } else if (error.message.includes("not-found")) {
          errorMessage = "Documento não encontrado. Tente atualizar a página.";
        } else if (error.message.includes("already-exists")) {
          errorMessage = "Acesso já foi liberado anteriormente.";
        }
      }
      
      toast({
        title: t("approvalError"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async (notification: AdminNotification) => {
    setIsProcessing(true);
    try {
      // Atualizar status da notificação
      await updateDoc(doc(db, "adminNotifications", notification.id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
        rejectedBy: user?.uid,
        rejectedAt: serverTimestamp()
      });

      toast({
        title: t("paymentRejected"),
        description: t("paymentRejectedDesc"),
      });

      // Recarregar dados
      handleRefresh();

    } catch (error) {
      console.error("Error rejecting payment:", error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Erro ao rejeitar pagamento";
      
      if (error instanceof Error) {
        if (error.message.includes("permission")) {
          errorMessage = "Erro de permissão. Verifique as regras do Firestore.";
        } else if (error.message.includes("not-found")) {
          errorMessage = "Documento não encontrado. Tente atualizar a página.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsViewingDetails(false);
      setSelectedNotification(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Forçar atualização das notificações
      const q = query(collection(db, "adminNotifications"));
      const snapshot = await getDocs(q);
      
      // Atualizar o estado local com os novos dados
      const updatedNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNotification[];
      
      // Ordenar por data de criação (mais recente primeiro)
      updatedNotifications.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });
      
      // Atualizar o estado
      setNotifications(updatedNotifications);
      
      toast({
        title: "Notificações Atualizadas!",
        description: `Encontradas ${snapshot.size} notificações.`,
      });
    } catch (error) {
      console.error("Error refreshing notifications:", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Falha ao atualizar notificações. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const testSystem = async () => {
    try {
      console.log("🧪 TESTE DO SISTEMA - Verificando estrutura de dados...");
      
      // Verificar se há notificações
      console.log("📊 Total de notificações:", notifications.length);
      
      // Verificar tipos de notificação
      const types = notifications.map(n => n.type);
      console.log("🏷️ Tipos de notificação encontrados:", [...new Set(types)]);
      
      // Verificar notificações aprovadas
      const approvedNotifications = notifications.filter(n => n.status === 'approved');
      console.log("✅ Notificações aprovadas:", approvedNotifications.length);
      
      // Verificar assinaturas existentes
      try {
        const allSubscriptionsSnapshot = await getDocs(collection(db, "userSubscriptions"));
        console.log("💳 Total de assinaturas no sistema:", allSubscriptionsSnapshot.size);
      } catch (error) {
        console.error("❌ Erro ao verificar assinaturas:", error);
      }
      
      toast({
        title: "Teste do Sistema",
        description: "Verifique o console para detalhes",
      });
      
    } catch (error) {
      console.error("❌ Erro no teste:", error);
      toast({
        title: "Erro no Teste",
        description: "Verifique o console para detalhes",
        variant: "destructive",
      });
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

  // Se não é admin ou não há usuário, não mostrar nada
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não há notificações, mostrar mensagem
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("noNotifications")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuário, email ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovadas</SelectItem>
                  <SelectItem value="rejected">Rejeitadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rede</label>
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Redes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Redes</SelectItem>
                  <SelectItem value="Solana">Solana</SelectItem>
                  <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="course">Cursos</SelectItem>
                  <SelectItem value="subscription">Assinaturas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("title")} ({filteredNotifications.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                onClick={testSystem}
                variant="outline"
                size="sm"
                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                🧪 Testar Sistema
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredNotifications || filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" || networkFilter !== "all" || typeFilter !== "all"
                ? "Nenhuma notificação encontrada com os filtros aplicados"
                : t("noNotifications")
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{notification.userName || "Usuário"}</h4>
                      <p className="text-sm text-muted-foreground">{notification.userEmail || "Email não disponível"}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">
                          {notification.type === 'subscription' ? 'Plano:' : 'Curso:'}
                        </span> {notification.courseTitle || notification.planName || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-mono">
                          {notification.amount || 0} {notification.currency || "USD"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({notification.network || "N/A"})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(notification.status)}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(notification)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t("viewDetails")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t("paymentDetails")}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {t("user")}
                              </label>
                              <p className="font-medium">{notification.userName || "Usuário"}</p>
                              <p className="text-sm text-muted-foreground">{notification.userEmail || "Email não disponível"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {notification.type === 'subscription' ? 'Plano' : 'Curso'}
                              </label>
                              <p className="font-medium">{notification.courseTitle || notification.planName || "N/A"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {t("amount")}
                              </label>
                              <p className="font-medium">
                                {notification.amount || 0} {notification.currency || "USD"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                {t("status")}
                              </label>
                              {getStatusBadge(notification.status)}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Tipo de Produto
                            </label>
                            <p className="font-medium capitalize">
                              {notification.type === 'subscription' ? 'Assinatura' : 'Curso'}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              ID da Transação
                            </label>
                            <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                              {notification.transactionId || "ID não disponível"}
                            </code>
                          </div>

                          {notification.status === "pending" && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => handleApprovePayment(notification)}
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
                                onClick={() => handleRejectPayment(notification)}
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

                          {notification.status !== "pending" && (
                            <div className="pt-4 text-center text-sm text-muted-foreground">
                              {notification.status === "approved" 
                                ? "Esta notificação já foi processada e aprovada."
                                : "Esta notificação já foi processada e rejeitada."
                              }
                            </div>
                          )}
                        </div>
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
