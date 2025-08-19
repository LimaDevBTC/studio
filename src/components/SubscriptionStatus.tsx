import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, RefreshCw, Crown, BookOpen, Users } from "lucide-react";
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

interface SubscriptionStatusProps {
  className?: string;
}

export default function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const t = useTranslations('SubscriptionPage');
  const { subscriptionStatus, isLoading } = useSubscriptionStatus();
  const { userData } = useAuth();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem assinatura ativa, não mostra nada
  if (!subscriptionStatus.isActive || subscriptionStatus.planName === 'Free Trial') {
    return null;
  }

  const getPlanIcon = (planName: string) => {
    const plan = planName.toLowerCase();
    if (plan.includes('anual')) return <Crown className="h-5 w-5 text-[#F7931A]" />;
    if (plan.includes('mensal')) return <RefreshCw className="h-5 w-5 text-[#F7931A]" />;
    if (plan.includes('consultoria')) return <Users className="h-5 w-5 text-[#F7931A]" />;
    return <BookOpen className="h-5 w-5 text-[#F7931A]" />;
  };

  const getPlanBadgeColor = (planName: string) => {
    const plan = planName.toLowerCase();
    if (plan.includes('anual')) return "bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/20";
    if (plan.includes('mensal')) return "bg-blue-50 text-blue-700 border-blue-200";
    if (plan.includes('consultoria')) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Expira hoje';
    if (days === 1) return 'Expira amanhã';
    if (days < 0) return 'Expirada';
    return `Expira em ${days} dias`;
  };

  return (
    <Card className={`${className} border-[#F7931A]/20 bg-gradient-to-r from-[#F7931A]/5 to-white`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlanIcon(subscriptionStatus.planName)}
            <div>
              <CardTitle className="text-xl text-[#F7931A]">
                Assinatura Ativa
              </CardTitle>
              <CardDescription className="text-base">
                {subscriptionStatus.planName}
              </CardDescription>
            </div>
          </div>
          <Badge className={getPlanBadgeColor(subscriptionStatus.planName)}>
            {subscriptionStatus.isExpired ? 'Expirada' : 'Ativa'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status da Assinatura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <Calendar className="h-4 w-4 text-[#F7931A]" />
            <div>
              <span className="font-medium text-card-foreground">Validade</span>
              <div className="text-card-foreground">
                {formatDate(subscriptionStatus.expiryDate)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <RefreshCw className="h-4 w-4 text-[#F7931A]" />
            <div>
              <span className="font-medium text-card-foreground">Status</span>
              <div className="text-card-foreground">
                {getDaysText(subscriptionStatus.daysUntilExpiry)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <CreditCard className="h-4 w-4 text-[#F7931A]" />
            <div>
              <span className="font-medium text-card-foreground">Plano</span>
              <div className="text-card-foreground capitalize">
                {subscriptionStatus.planName}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          {subscriptionStatus.isExpiringSoon && !subscriptionStatus.isExpired && (
            <Button className="bg-[#F7931A] hover:bg-[#F7931A]/90 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Renovar Assinatura
            </Button>
          )}
          
          {subscriptionStatus.isExpired && (
            <Button className="bg-[#F7931A] hover:bg-[#F7931A]/90 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reativar Assinatura
            </Button>
          )}
          
          <Button variant="outline" className="text-[#F7931A] border-[#F7931A] hover:bg-[#F7931A]/10">
            <Crown className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        </div>

        {/* Aviso de Expiração */}
        {subscriptionStatus.isExpiringSoon && !subscriptionStatus.isExpired && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <RefreshCw className="h-4 w-4" />
              <span className="font-medium">Sua assinatura expira em breve!</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Renove agora para manter o acesso contínuo a todos os cursos e recursos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
