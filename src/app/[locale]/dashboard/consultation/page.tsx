"use client";

import { useAuth } from '@/hooks/use-auth';
import { useConsultationAccess } from '@/hooks/use-consultation-access';
import { useConsultationPaymentStatus } from '@/hooks/use-consultation-payment-status';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import UnifiedPaymentModal from "@/components/UnifiedPaymentModal";

export default function ConsultationPage() {
  const { user } = useAuth();
  const consultationAccess = useConsultationAccess();
  const paymentStatus = useConsultationPaymentStatus();
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  // Verificar se o usuário tem acesso à consultoria
  const hasConsultationAccess = consultationAccess.hasAccess;
  const isBlocked = consultationAccess.isBlocked;
  
  // Determinar o status baseado no pagamento
  const hasPayment = paymentStatus.hasPayment;
  const isPaymentPending = paymentStatus.isPending;
  const isPaymentConfirmed = paymentStatus.isConfirmed;

  // Debug logs
  console.log('🔍 Status da consultoria:', {
    hasConsultationAccess,
    isBlocked,
    hasPayment,
    isPaymentPending,
    isPaymentConfirmed,
    consultationAccessLoading: consultationAccess.isLoading,
    paymentStatusLoading: paymentStatus.isLoading,
    // Prioridade: se tem acesso, ignorar status de pagamento
    shouldShowCalendly: hasConsultationAccess && !isBlocked,
    shouldShowPending: hasPayment && isPaymentPending && !hasConsultationAccess
  });


  // Carregar o script do Calendly - apenas uma vez
  useEffect(() => {
    console.log('🔄 Iniciando carregamento do script do Calendly...');
    
    // Verificar se já existe um script do Calendly específico para esta página
    if (document.getElementById('calendly-script-consultation')) {
      console.log('✅ Script já existe, marcando como carregado');
      setIsCalendlyLoaded(true);
      return;
    }
  
    console.log('📥 Criando novo script do Calendly...');
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.id = 'calendly-script-consultation'; // ID específico
    script.onload = () => {
      console.log('✅ Script do Calendly carregado com sucesso');
      setIsCalendlyLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Erro ao carregar script do Calendly');
      setIsCalendlyLoaded(false);
    };
    document.head.appendChild(script);
    console.log('📤 Script adicionado ao DOM');
  
    // Cleanup: remover script apenas quando componente for desmontado
    return () => {
      console.log('🧹 Cleanup: removendo script do Calendly');
      const existingScript = document.getElementById('calendly-script-consultation');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      
      // Limpar também o objeto global Calendly se existir
      if (window.Calendly) {
        delete (window as any).Calendly;
      }
    };
  }, []); // Sem dependências para carregar apenas uma vez

  // Inicializar o widget quando o script estiver carregado E usuário tiver acesso
  useEffect(() => {
    // NÃO inicializar o widget se o usuário estiver bloqueado
    if (isBlocked) {
      console.log('🚫 Usuário bloqueado, não inicializando Calendly');
      return;
    }

    // Só inicializar se tiver acesso à consultoria
    if (!hasConsultationAccess) {
      console.log('❌ Usuário não tem acesso à consultoria');
      return;
    }

    console.log('🔄 Verificando se pode inicializar widget...');
    console.log('isCalendlyLoaded:', isCalendlyLoaded);
    console.log('window.Calendly:', !!window.Calendly);
    console.log('hasConsultationAccess:', hasConsultationAccess);
    console.log('isBlocked:', isBlocked);
    
    if (!isCalendlyLoaded || !window.Calendly) {
      console.log('❌ Não pode inicializar ainda');
      return;
    }

    // Verificar se o elemento existe
    const parentElement = document.getElementById('calendly-widget');
    console.log('🔍 Elemento calendly-widget existe?', !!parentElement);
    if (parentElement) {
      console.log('📏 Dimensões do elemento:', {
        width: parentElement.offsetWidth,
        height: parentElement.offsetHeight,
        visible: parentElement.offsetParent !== null
      });
    }

    console.log('🔄 Inicializando widget do Calendly...');
    
    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      try {
        const parentElement = document.getElementById('calendly-widget');
        if (!parentElement) {
          console.log('⚠️ Elemento pai não encontrado');
          return;
        }

        console.log('✅ Elemento pai encontrado:', parentElement);

        // Verificar se já existe um widget nesta página específica
        const existingWidget = parentElement.querySelector('[data-calendly-widget]');
        if (existingWidget) {
          console.log('✅ Widget já existe, não inicializando novamente');
          return;
        }

        console.log('🚀 Inicializando novo widget...');

        // Inicializar o widget
        if (window.Calendly) {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/airdropmqm/new-meeting',
            parentElement: parentElement,
            minWidth: '320px',
            height: '700px',
            prefill: {
              email: user?.email || '',
              name: user?.displayName || ''
            }
          });
          console.log('✅ Widget do Calendly inicializado com sucesso!');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar widget do Calendly:', error);
      }
    }, 1000); // Aumentar o delay para garantir que o DOM está pronto

    // Cleanup: limpar timer se componente for desmontado
    return () => {
      clearTimeout(timer);
    };
  }, [isCalendlyLoaded, hasConsultationAccess, isBlocked]); // Removido user?.email e user?.displayName para evitar loops

  // Se não tiver acesso à consultoria, mostrar card de compra
  useEffect(() => {
    if (!hasConsultationAccess && !consultationAccess.isLoading) {
      // Não redirecionar mais, apenas mostrar o card de compra
      console.log('Usuário não tem acesso à consultoria, mostrando card de compra');
    }
  }, [hasConsultationAccess, consultationAccess.isLoading]);

  // Se não tiver acesso à consultoria E não tiver pagamento pendente, mostrar card de compra
  if (!hasConsultationAccess && !consultationAccess.isLoading && !hasPayment) {
    // Se estiver bloqueado, mostrar mensagem de consultoria realizada
    if (isBlocked) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
                Consultoria Realizada
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sua consultoria personalizada foi concluída com sucesso
              </p>
            </div>
          </div>

          {/* Card de Consultoria Realizada */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Consultoria Concluída
                </CardTitle>
                <p className="text-green-700 dark:text-green-300">
                  Obrigado por escolher nossa consultoria personalizada
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Sessão de consultoria realizada com sucesso</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Seus objetivos foram analisados e estratégias definidas</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Continue aplicando as recomendações recebidas</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    <Link href="/dashboard">
                      Voltar ao Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Se não estiver bloqueado, mostrar card de compra
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
              Consultoria Personalizada
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Agende sua sessão de 1 hora com o MQM para transformar sua vida financeira
            </p>
          </div>
        </div>

        {/* Card de Compra da Consultoria */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <CheckCircle className="h-5 w-5 text-primary" />
                Consultoria de 1 Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    $39.00
                  </div>
                  <p className="text-muted-foreground">
                    Sessão única de consultoria personalizada
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Análise completa do seu perfil financeiro</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Estratégias personalizadas para seus objetivos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Suporte direto e acompanhamento</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Pagamento único, sem recorrência</span>
                  </div>
                </div>

                <UnifiedPaymentModal
                  courseId="consultation"
                  courseTitle="Consultoria Personalizada"
                  coursePrice={39.00}
                  type="consultation"
                  trigger={
                    <Button size="lg" className="w-full">
                      Comprar Consultoria
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // PRIORIDADE MÁXIMA: Se tiver acesso à consultoria, mostrar Calendly
  if (hasConsultationAccess && !isBlocked) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
              Consultoria Personalizada
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Agende sua consultoria personalizada com nosso especialista
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Calendly Embed */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                  Selecione Data e Hora
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isCalendlyLoaded ? (
                  <div 
                    id="calendly-widget"
                    data-calendly-widget="true"
                    style={{ 
                      minWidth: '320px',
                      height: '700px',
                      width: '100%'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Carregando calendário...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informações da Consultoria */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Sobre a Consultoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Duração</h4>
                  <p className="text-sm text-muted-foreground">60 minutos de consultoria personalizada</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Formato</h4>
                  <p className="text-sm text-muted-foreground">Videoconferência via Calendly</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Inclui</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Análise do seu perfil</li>
                    <li>• Estratégias personalizadas</li>
                    <li>• Plano de ação detalhado</li>
                    <li>• Suporte pós-consulta</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Acesso Confirmado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  Sua consultoria foi aprovada! Agora você pode agendar sua sessão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } else if (hasPayment && isPaymentPending && !hasConsultationAccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
              Aguardando Confirmação
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Seu pagamento foi enviado e está sendo processado
            </p>
          </div>
        </div>

        {/* Card de Aguardando Confirmação */}
        <div className="max-w-2xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 p-8">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary mb-3">
                Pagamento em Análise
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Aguarde a confirmação do administrador
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Pagamento de <span className="font-semibold text-primary">${paymentStatus.amount} {paymentStatus.paymentMethod}</span> enviado
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Aguardando confirmação do administrador
                  </span>
                </div>
                
                <div className="flex items-center gap-3 justify-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                  <Users className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Você receberá um email quando for confirmado
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                  <Link href="/dashboard">
                    Voltar ao Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
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
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
            Consultoria Personalizada
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Agende sua sessão de 1 hora com o MQM para transformar sua vida financeira
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Calendly Embed - Só mostrar se não estiver bloqueado */}
        {!isBlocked && (
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                  Selecione Data e Hora
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isCalendlyLoaded ? (
                  <div 
                    id="calendly-widget"
                    data-calendly-widget="true"
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
        )}

        {/* Sidebar com Status e Informações */}
        <div className="space-y-6">
          {/* Card de Status - Dinâmico baseado no status */}
          {isBlocked ? (
            // Card para usuários bloqueados (consultoria realizada)
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Consultoria Realizada
                </CardTitle>
                <p className="text-green-700 dark:text-green-300">
                  Sua consultoria foi concluída com sucesso
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Concluída
                </div>
              </CardContent>
            </Card>
          ) : (
            // Card para usuários com acesso (consultoria disponível)
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Acesso Liberado
                </CardTitle>
                <p className="text-green-700 dark:text-green-300">
                  Sua consultoria personalizada está disponível para agendamento
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Consultoria de 1 Hora
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações da Consultoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Detalhes da Consultoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Sessão de 1 hora por videochamada</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Análise completa do seu perfil financeiro</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Estratégias personalizadas para seus objetivos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Suporte direto e acompanhamento</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Pagamento único, sem recorrência</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• A consultoria será realizada por videochamada</p>
              <p>• O link será enviado por email antes da sessão</p>
              <p>• Prepare suas dúvidas e objetivos</p>
              <p>• A sessão será gravada para você revisar depois</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
