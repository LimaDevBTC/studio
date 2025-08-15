"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Clock
} from "lucide-react";
import AdminNotifications from "@/components/AdminNotifications";
import { AdminWaitlist } from "@/components/AdminWaitlist";

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalCourses: number;
  activeSubscriptions: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalUsers: 0,
    totalCourses: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardStats = async () => {
    try {
      const statsPromises = [
        getDocs(query(collection(db, "adminNotifications"), where("status", "==", "approved"))),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "courses")),
        getDocs(query(collection(db, "adminNotifications"), where("status", "==", "pending")))
      ];

      const [
        revenueSnapshot,
        usersSnapshot,
        coursesSnapshot,
        pendingSnapshot
      ] = await Promise.all(statsPromises);

      // Calcular receita total
      let totalRevenue = 0;
      revenueSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.amount && data.status === "approved") {
          totalRevenue += data.amount;
        }
      });

      // Buscar assinaturas ativas
      const subscriptionsSnapshot = await getDocs(collection(db, "userSubscriptions"));
      let activeSubscriptions = 0;
      subscriptionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "active") {
          activeSubscriptions++;
        }
      });

      setStats({
        totalRevenue,
        totalUsers: usersSnapshot.size,
        totalCourses: coursesSnapshot.size,
        activeSubscriptions,
        pendingPayments: pendingSnapshot.size,
      });
    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Listeners em tempo real
    const unsubscribeTransactions = onSnapshot(
      collection(db, "adminNotifications"),
      () => fetchDashboardStats()
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      () => fetchDashboardStats()
    );

    const unsubscribeCourses = onSnapshot(
      collection(db, "courses"),
      () => fetchDashboardStats()
    );

    const unsubscribeSubscriptions = onSnapshot(
      collection(db, "userSubscriptions"),
      () => fetchDashboardStats()
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeUsers();
      unsubscribeCourses();
      unsubscribeSubscriptions();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma e gerenciamento de pagamentos
          </p>
        </div>
        <Button 
          onClick={fetchDashboardStats}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total de pagamentos aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Total de cursos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Assinaturas atualmente ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status da Plataforma */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status da Plataforma
            </CardTitle>
            <CardDescription>
              Visão geral do sistema e métricas de performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pagamentos Pendentes:</span>
              <span className={`text-lg font-bold ${stats.pendingPayments > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {stats.pendingPayments}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxa de Conversão:</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificações de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Notificações de Pagamento
          </CardTitle>
          <CardDescription>
            Gerenciar e aprovar pagamentos em criptomoedas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminNotifications />
        </CardContent>
      </Card>

      {/* Lista de Espera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lista de Espera
          </CardTitle>
          <CardDescription>
            Gerenciar listas de espera dos cursos e enviar emails em massa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminWaitlist />
        </CardContent>
      </Card>
    </div>
  );
}
