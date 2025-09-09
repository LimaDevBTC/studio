"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import CryptoPaymentModal from "./CryptoPaymentModal";
import StripePaymentModal from "./StripePaymentModal";

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
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'pix' | null>(null);
  const cryptoModalRef = useRef<HTMLButtonElement>(null);
  const pixModalRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations('CryptoPayment');

  const handleClose = () => {
    setIsOpen(false);
    setSelectedMethod(null);
  };

  const handlePaymentSelect = (method: 'crypto' | 'pix') => {
    setSelectedMethod(method);
    setIsOpen(false); // Fechar o modal de seleção imediatamente
    
    // Abrir o modal específico após um pequeno delay
    setTimeout(() => {
      if (method === 'crypto' && cryptoModalRef.current) {
        cryptoModalRef.current.click();
      } else if (method === 'pix' && pixModalRef.current) {
        pixModalRef.current.click();
      }
    }, 200);
  };

  return (
    <>
      {/* Modais específicos escondidos */}
      <div className="hidden">
        <CryptoPaymentModal
          courseId={courseId}
          courseTitle={courseTitle}
          coursePrice={coursePrice}
          trigger={<button ref={cryptoModalRef} />}
          type={type}
        />
        <StripePaymentModal
          courseId={courseId}
          courseTitle={courseTitle}
          coursePrice={coursePrice}
          trigger={<button ref={pixModalRef} />}
          type={type}
        />
      </div>

      {/* Modal de seleção */}
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
              <div className="space-y-4">
                <h4 className="font-semibold">Escolha seu método de pagamento:</h4>
                
                <div className="grid gap-4">
                  {/* Opção Criptomoedas */}
                  <Card 
                    className="cursor-pointer hover:border-orange-500/50 transition-colors"
                    onClick={() => handlePaymentSelect('crypto')}
                  >
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

                  {/* Opção PIX */}
                  <Card 
                    className="cursor-pointer hover:border-orange-500/50 transition-colors"
                    onClick={() => handlePaymentSelect('pix')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Pagar em PIX</h4>
                          <p className="text-sm text-muted-foreground">
                            PIX instantâneo - QR Code e Chave Aleatória
                          </p>
                        </div>
                        <div className="text-orange-500">
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
    </>
  );
}
