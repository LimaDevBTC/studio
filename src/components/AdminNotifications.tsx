"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, CheckCircle2, XCircle, Clock, DollarSign, Eye, Loader2, Users, TrendingUp, RefreshCw } from "lucide-react";
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

    const approvedNotifications = notifs.filter(n => n.status === "approved");
    const totalAmount = approvedNotifications.reduce((sum, n) => sum + (n.amount || 0), 0);
    
    const stats: Stats = {
      total: notifs.length,
      pending: notifs.filter(n => n.status === "pending").length,
      approved: approvedNotifications.length,
      rejected: notifs.filter(n => n.status === "rejected").length,
      totalAmount: totalAmount
    };
    setStats(stats);
  };

  // Sem filtros - mostrar todas as notificações
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setFilteredNotifications([]);
      return;
    }
    setFilteredNotifications(notifications);
  }, [notifications]);

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
        userId: notification.userId,
        courseId: notification.courseId,
        courseTitle: notification.courseTitle,
        transactionId: notification.transactionId
      });

      // Verificar se todos os campos necessários estão presentes
      if (notification.type === 'course' && (!notification.courseId || !notification.courseTitle)) {
        throw new Error(`Campos obrigatórios ausentes para curso: courseId=${notification.courseId}, courseTitle=${notification.courseTitle}`);
      }

      // Atualizar status da notificação
      await updateDoc(doc(db, "adminNotifications", notification.id), {
        status: "approved",
        updatedAt: serverTimestamp(),
        approvedBy: user?.uid,
        approvedAt: serverTimestamp()
      });

      // ATUALIZAR STATUS DA TRANSAÇÃO CORRESPONDENTE
      if (notification.transactionId) {
        console.log("🔄 Atualizando transação:", notification.transactionId);
        try {
          await updateDoc(doc(db, "transactions", notification.transactionId), {
            status: "approved",
            updatedAt: serverTimestamp(),
            approvedBy: user?.uid,
            approvedAt: serverTimestamp()
          });
          console.log("✅ Status da transação atualizado para 'approved'!");
        } catch (error) {
          console.error("❌ Erro ao atualizar transação:", error);
          throw error;
        }
      } else {
        console.warn("⚠️ Nenhum transactionId encontrado na notificação");
      }

      // LIBERAR ACESSO AUTOMATICAMENTE
      if (notification.type === 'course') {
        console.log("📚 Liberando acesso ao curso:", {
          userId: notification.userId,
          courseId: notification.courseId,
          courseTitle: notification.courseTitle
        });
        
        // Adicionar acesso ao curso
        const accessRef = doc(db, "userCourseAccess", `${notification.userId}_${notification.courseId}`);
        await setDoc(accessRef, {
          userId: notification.userId,
          courseId: notification.courseId,
          courseTitle: notification.courseTitle,
          status: "active",
          grantedAt: serverTimestamp(),
          transactionId: notification.transactionId || notification.id // Usar notification.id como fallback
        });
        console.log("✅ Acesso ao curso liberado com sucesso!");
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
          transactionId: notification.transactionId || notification.id // Usar notification.id como fallback
        }, { merge: true });
        console.log("✅ Assinatura criada/atualizada!");
      } else if (notification.type === 'consultation') {
        // Consultoria aprovada - acesso será verificado pelo hook useConsultationAccess
        console.log("✅ Consultoria aprovada - usuário pode agendar!");
        console.log("🔍 Verificando se transação foi atualizada:", {
          transactionId: notification.transactionId,
          userId: notification.userId
        });
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

      // ATUALIZAR STATUS DA TRANSAÇÃO CORRESPONDENTE
      if (notification.transactionId) {
        await updateDoc(doc(db, "transactions", notification.transactionId), {
          status: "rejected",
          updatedAt: serverTimestamp(),
          rejectedBy: user?.uid,
          rejectedAt: serverTimestamp()
        });
        console.log("✅ Status da transação atualizado para 'rejected'!");
      }

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



  const getStatusBadge = (status: string, compact: boolean = false) => {
    const baseClasses = "flex items-center gap-1.5 px-2 py-1 rounded-full border";
    
    switch (status) {
      case "pending":
        return (
          <div className={`${baseClasses} bg-yellow-50 border-yellow-200 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            {!compact && <span className="text-xs font-medium text-yellow-700">Pendente</span>}
          </div>
        );
      case "approved":
        return (
          <div className={`${baseClasses} bg-green-50 border-green-200 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            {!compact && <span className="text-xs font-medium text-green-700">Aprovado</span>}
          </div>
        );
      case "rejected":
        return (
          <div className={`${baseClasses} bg-red-50 border-red-200 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
            <XCircle className="w-3 h-3 text-red-600" />
            {!compact && <span className="text-xs font-medium text-red-700">Rejeitado</span>}
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-50 border-gray-200 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
            {!compact && <span className="text-xs font-medium text-gray-700 capitalize">{status}</span>}
          </div>
        );
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
            <CardTitle className="text-sm font-medium">Valor Aprovado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Apenas notificações aprovadas
            </p>
          </CardContent>
        </Card>
      </div>



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

            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredNotifications || filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noNotifications")}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base truncate">
                            {notification.userName || "Usuário"}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {notification.userEmail || "Email não disponível"}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {/* Badge compacto em mobile, completo em desktop */}
                        <div className="hidden sm:block">
                          {getStatusBadge(notification.status, false)}
                        </div>
                        <div className="block sm:hidden">
                          {getStatusBadge(notification.status, true)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Informações do Produto */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {notification.type === 'subscription' ? 'Plano' : 'Curso'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {notification.courseTitle || notification.planName || "N/A"}
                      </p>
                    </div>

                    {/* Valor e Rede */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {notification.amount || 0} {notification.currency || "USD"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {notification.network || "N/A"}
                      </span>
                    </div>

                    {/* Data de Criação */}
                    <div className="text-xs text-muted-foreground">
                      {notification.createdAt?.toDate?.() 
                        ? new Date(notification.createdAt.toDate()).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Data não disponível'
                      }
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(notification)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("viewDetails")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t("paymentDetails")}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
