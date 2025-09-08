"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Coins, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import CryptoPaymentModal from "./CryptoPaymentModal";
import StripePaymentModal from "./StripePaymentModal";
import { isStripeConfigured } from "@/lib/stripe";

interface UnifiedPaymentModalProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  trigger: React.ReactNode;
  type?: 'course' | 'subscription' | 'consultation';
}

export default function UnifiedPaymentModal({
  courseId,
  courseTitle,
  coursePrice,
  trigger,
  type = 'course'
}: UnifiedPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('CryptoPayment');
  const stripeConfigured = isStripeConfigured();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            Escolher Método de Pagamento
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{courseTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {type === 'course' ? 'Curso' : type === 'subscription' ? 'Plano de Assinatura' : 'Consultoria'}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                ${coursePrice}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Renderizar diretamente os modais específicos */}
            <div className="space-y-4">
              <h4 className="font-semibold">Escolha seu método de pagamento:</h4>
              
              <div className="grid gap-4">
                {/* Opção Criptomoedas - Modal direto */}
                <CryptoPaymentModal
                  courseId={courseId}
                  courseTitle={courseTitle}
                  coursePrice={coursePrice}
                  trigger={
                    <Card className="cursor-pointer hover:border-orange-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <Coins className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">Pagar em Cripto</h4>
                            <p className="text-sm text-muted-foreground">
                              USDT, USDC, Solana
                            </p>
                          </div>
                          <div className="text-orange-500">
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  }
                  type={type}
                />

                {/* Opção PIX e Cartão - Modal direto (apenas se Stripe configurado) */}
                {stripeConfigured ? (
                  <StripePaymentModal
                    courseId={courseId}
                    courseTitle={courseTitle}
                    coursePrice={coursePrice}
                    trigger={
                      <Card className="cursor-pointer hover:border-orange-500/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">Pagar em PIX ou Cartão de Crédito</h4>
                              <p className="text-sm text-muted-foreground">
                                PIX instantâneo ou Visa, Mastercard, Amex
                              </p>
                            </div>
                            <div className="text-orange-500">
                              <ArrowLeft className="h-4 w-4 rotate-180" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    }
                    type={type}
                  />
                ) : (
                  <Card className="opacity-50 cursor-not-allowed">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-400 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-500">PIX e Cartão de Crédito</h4>
                          <p className="text-sm text-gray-400">
                            Em breve - Apenas pagamentos em cripto disponíveis
                          </p>
                        </div>
                        <div className="text-gray-400">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
