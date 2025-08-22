"use client";

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useConsultationAccess } from '@/hooks/use-consultation-access';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from '@/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Declaração de tipo para o Calendly
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}

export default function ConsultationPage() {
  const t = useTranslations('ConsultationPage');
  const { user, userData } = useAuth();
  const consultationAccess = useConsultationAccess();
  const router = useRouter();
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  // Verificar se o usuário tem acesso à consultoria
  const hasConsultationAccess = consultationAccess.hasAccess;

  // Carregar o script do Calendly
  useEffect(() => {
    // Verificar se o script já existe
    if (document.querySelector('script[src*="calendly"]')) {
      setIsCalendlyLoaded(true);
      return;
    }

    // Carregar o script do Calendly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Script do Calendly carregado com sucesso');
      setIsCalendlyLoaded(true);
      
      // Aguardar um pouco para o Calendly inicializar completamente
      setTimeout(() => {
        console.log('🔄 Verificando se o Calendly está disponível...');
        if (window.Calendly) {
          console.log('✅ Calendly disponível na janela global');
        } else {
          console.log('❌ Calendly não está disponível na janela global');
        }
      }, 1000);
    };
    script.onerror = () => {
      console.error('❌ Erro ao carregar script do Calendly');
      setIsCalendlyLoaded(false);
    };
    document.head.appendChild(script);
  }, []);

  // Inicializar o widget quando o script estiver carregado
  useEffect(() => {
    if (isCalendlyLoaded && window.Calendly) {
      console.log('🔄 Inicializando widget do Calendly...');
      
      // Aguardar um pouco para garantir que o DOM está pronto
      setTimeout(() => {
        try {
          if (window.Calendly) {
            window.Calendly.initInlineWidget({
              url: 'https://calendly.com/airdropmqm/new-meeting',
              parentElement: document.getElementById('calendly-widget'),
              minWidth: '320px',
              height: '700px'
            });
            console.log('✅ Widget do Calendly inicializado com sucesso!');
          }
        } catch (error) {
          console.error('❌ Erro ao inicializar widget do Calendly:', error);
        }
      }, 500);
    }
  }, [isCalendlyLoaded]);

  // Se não tiver acesso à consultoria, redirecionar
  useEffect(() => {
    if (!hasConsultationAccess && !consultationAccess.isLoading) {
      router.push('/dashboard/subscription');
    }
  }, [hasConsultationAccess, consultationAccess.isLoading, router]);

  if (!hasConsultationAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToDashboard')}
            </Link>
          </Button>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Calendly Embed */}
        <div className="space-y-6">
          {/* Debug info - remover depois */}
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            Debug: Script carregado = {isCalendlyLoaded ? 'true' : 'false'}
          </div>
          
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                {t('selectDateTime')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isCalendlyLoaded ? (
                <div 
                  id="calendly-widget"
                  style={{ 
                    minWidth: '320px', 
                    height: '700px',
                    width: '100%'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center min-h-[700px] p-8">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Carregando calendário...</p>
                    <p className="text-sm text-muted-foreground">Se não carregar, recarregue a página</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações da Consultoria */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('consultationDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{t('sessionInfo')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{t('profileAnalysis')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{t('personalizedStrategies')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{t('directSupport')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{t('noRecurrence')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('importantInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• {t('videoCall')}</p>
              <p>• {t('emailLink')}</p>
              <p>• {t('prepareQuestions')}</p>
              <p>• {t('sessionRecorded')}</p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{t('consultationPrice')}</p>
                <p className="text-2xl font-bold text-primary">USD$39,00</p>
                <p className="text-xs text-muted-foreground">{t('singlePayment')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
