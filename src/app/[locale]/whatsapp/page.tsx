"use client";

import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, MessageCircle, Clock, Users, Shield } from "lucide-react";
import { useEffect } from 'react';

export default function WhatsAppRedirect() {
  const t = useTranslations('HomePage');

  useEffect(() => {
    // Redirecionar automaticamente após 5 segundos
    const timer = setTimeout(() => {
      window.open('https://wa.me/5511977486383?text=Quero%20a%20consultoria%20exclusiva%20com%20você%20mQm.', '_blank');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5511977486383?text=Quero%20a%20consultoria%20exclusiva%20com%20você%20mQm.', '_blank');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#0a0a0a'
      }}
    >
      <div className="max-w-2xl w-full">
        <Card className="bg-white/[0.02] border-white/5 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Você será redirecionado para o WhatsApp
            </CardTitle>
            <p className="text-muted-foreground">
              Conecte-se diretamente com o mQm para agendar sua consultoria personalizada
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Como funciona:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Entre no grupo do WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Você será adicionado ao grupo exclusivo do mQm</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Apresente-se e seus objetivos</p>
                    <p className="text-xs text-muted-foreground">Conte ao mQm sobre seus objetivos no mercado crypto</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Agende sua consultoria</p>
                    <p className="text-xs text-muted-foreground">O mQm irá agendar uma sessão personalizada de 60 minutos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Sessão de 60 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Atendimento individual</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Estratégias personalizadas</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Entrar no WhatsApp Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Redirecionamento automático em 5 segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
