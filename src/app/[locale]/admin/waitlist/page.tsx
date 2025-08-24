"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Users, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Mail,
  Search,
  Filter,
  Eye
} from "lucide-react";
import { AdminWaitlist } from "@/components/AdminWaitlist";
import { useTranslations } from "next-intl";

interface WaitlistStats {
  totalLeads: number;
  activeLeads: number;
  notifiedLeads: number;
  convertedLeads: number;
}

export default function AdminWaitlistPage() {
  const [stats, setStats] = useState<WaitlistStats>({
    totalLeads: 0,
    activeLeads: 0,
    notifiedLeads: 0,
    convertedLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations("AdminWaitlist");

  const fetchWaitlistStats = async () => {
    try {
      // Buscar todas as entradas da coleção waitlist
      const waitlistRef = collection(db, 'waitlist');
      const q = query(waitlistRef);
      const snapshot = await getDocs(q);
      
      let totalLeads = 0;
      let activeLeads = 0;
      let notifiedLeads = 0;
      let convertedLeads = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalLeads++;
        
        switch (data.status) {
          case 'active':
            activeLeads++;
            break;
          case 'notified':
            notifiedLeads++;
            break;
          case 'converted':
            convertedLeads++;
            break;
        }
      });

      setStats({
        totalLeads,
        activeLeads,
        notifiedLeads,
        convertedLeads,
      });
    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas da lista de espera:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistStats();

    // Listener em tempo real
    const unsubscribeWaitlist = onSnapshot(
      collection(db, "waitlist"),
      () => fetchWaitlistStats()
    );

    return () => {
      unsubscribeWaitlist();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button 
          onClick={fetchWaitlistStats}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("refresh")}
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalLeads")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Total de leads na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeLeads")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads ativos aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifiedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads notificados por email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.convertedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads convertidos em clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status da Lista de Espera */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status da Lista de Espera
            </CardTitle>
            <CardDescription>
              Visão geral das listas de espera e métricas de conversão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxa de Conversão:</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.totalLeads > 0 ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Leads Ativos:</span>
              <span className={`text-lg font-bold ${stats.activeLeads > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {stats.activeLeads}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Gerenciamento de Lista de Espera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Sistema de Gerenciamento de Lista de Espera
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
