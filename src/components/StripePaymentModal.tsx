"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { getStripe } from "@/lib/stripe";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";

interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  qrCode: string;
  icon: string;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pix",
    name: "PIX",
    symbol: "BRL",
    network: "PIX",
    address: "e10458c5-e8a7-4ce8-8178-8bd36e8f9a08",
    qrCode: "/images/pixqrcode.jpeg",
    icon: "/images/pix.png",
    description: ""
  }
];

interface StripePaymentModalProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  trigger: React.ReactNode;
  type?: 'course' | 'subscription' | 'consultation';
}

interface TransactionData {
  userId: string;
  amount: number;
  currency: string;
  network: string;
  paymentAddress: string;
  status: string;
  createdAt: any;
  updatedAt: any;
  type: string;
  courseId?: string;
  courseTitle?: string;
  planId?: string;
  planName?: string;
  originalAmountUSD?: number;
  convertedAmount?: number;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
}

interface NotificationData {
  userId: string;
  userName: string | null;
  userEmail: string;
  type: string;
  title: string;
  message: string;
  courseId?: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: any;
  stripePaymentIntentId?: string;
}

export default function StripePaymentModal({
  courseId,
  courseTitle,
  coursePrice,
  trigger,
  type = 'course'
}: StripePaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  // Sempre usar PIX como método selecionado
  const selectedMethod = PAYMENT_METHODS[0]; // PIX
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('CryptoPayment');
  const { getFormattedAmount } = useCurrencyConversion(coursePrice);

  const handlePixPayment = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer o pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('processing');

    try {
      // Criar transação pendente no Firestore
      const transactionData: TransactionData = {
        userId: user.uid,
        amount: parseFloat(getFormattedAmount('BRL').replace('R$ ', '')),
        currency: 'BRL',
        network: 'PIX',
        paymentAddress: 'e10458c5-e8a7-4ce8-8178-8bd36e8f9a08',
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: type,
        originalAmountUSD: coursePrice,
        convertedAmount: parseFloat(getFormattedAmount('BRL').replace('R$ ', ''))
      };

      // Adicionar campos específicos baseado no tipo
      if (type === 'subscription') {
        transactionData.planId = courseId;
        transactionData.planName = courseTitle;
      } else if (type === 'consultation') {
        transactionData.courseId = courseId;
        transactionData.courseTitle = courseTitle;
      } else {
        transactionData.courseId = courseId;
        transactionData.courseTitle = courseTitle;
      }

      console.log("📝 Criando transação PIX no Firestore...");
      const transactionRef = await addDoc(collection(db, "transactions"), transactionData);
      console.log("✅ Transação PIX criada com sucesso, ID:", transactionRef.id);
      setTransactionId(transactionRef.id);

      // Criar notificação para o admin
      const notificationData: any = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email || '',
        type: type,
        title: `Novo pagamento PIX - ${courseTitle}`,
        message: `Pagamento de ${getFormattedAmount('BRL')} processado via PIX`,
        courseTitle: courseTitle,
        amount: parseFloat(getFormattedAmount('BRL').replace('R$ ', '')),
        currency: 'BRL',
        network: 'PIX',
        status: 'pending',
        createdAt: serverTimestamp(),
        paymentMethod: 'PIX'
      };

      // Adicionar courseId apenas se for um curso
      if (type === 'course') {
        notificationData.courseId = courseId;
      }

      // Adicionar transactionId à notificação
      notificationData.transactionId = transactionRef.id;

      await addDoc(collection(db, "adminNotifications"), notificationData);

      setPaymentStatus('success');
      
      toast({
        title: "Pagamento PIX Criado!",
        description: "Sua transação PIX foi registrada. Aguarde a confirmação.",
      });

      // Fechar o modal imediatamente e atualizar a página
      setTimeout(() => {
        setIsOpen(false);
        setPaymentStatus('idle');
        setTransactionId(null);
        // Forçar atualização da página para mostrar o status de pagamento
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erro no pagamento PIX:', error);
      setPaymentStatus('error');
      toast({
        title: "Erro no Pagamento",
        description: "Ocorreu um erro durante o processamento do pagamento PIX.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePayment = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer o pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Criar transação pendente no Firestore
      const transactionData: TransactionData = {
        userId: user.uid,
        amount: coursePrice,
        currency: 'USD',
        network: 'Stripe',
        paymentAddress: 'stripe-payment',
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: type,
        originalAmountUSD: coursePrice,
        convertedAmount: coursePrice
      };

      // Adicionar campos específicos baseado no tipo
      if (type === 'subscription') {
        transactionData.planId = courseId;
        transactionData.planName = courseTitle;
      } else if (type === 'consultation') {
        transactionData.courseId = courseId;
        transactionData.courseTitle = courseTitle;
      } else {
        transactionData.courseId = courseId;
        transactionData.courseTitle = courseTitle;
      }

      console.log("📝 Criando transação pendente no Firestore...");
      const transactionRef = await addDoc(collection(db, "transactions"), transactionData);
      console.log("✅ Transação criada com sucesso, ID:", transactionRef.id);
      setTransactionId(transactionRef.id);

      // Criar sessão de pagamento no Stripe
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(coursePrice * 100), // Stripe usa centavos
          currency: 'usd',
          metadata: {
            courseId,
            courseTitle,
            userId: user.uid,
            transactionId: transactionRef.id,
            type
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de pagamento');
      }

      const { clientSecret } = await response.json();

      // Redirecionar para o Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe não foi carregado');
      }

      const { error } = await stripe.confirmCardPayment(clientSecret);

      if (error) {
        console.error('Erro no pagamento:', error);
        setPaymentStatus('error');
        toast({
          title: "Erro no Pagamento",
          description: error.message || "Ocorreu um erro durante o pagamento.",
          variant: "destructive",
        });
        return;
      }

      // Pagamento bem-sucedido
      setPaymentStatus('success');
      
      // Atualizar transação no Firestore
      await updateDoc(transactionRef, {
        status: 'completed',
        updatedAt: serverTimestamp(),
        stripePaymentIntentId: clientSecret
      });

      // Criar notificação para o admin
      const notificationData: any = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email || '',
        type: type,
        title: `Novo pagamento via Stripe - ${courseTitle}`,
        message: `Pagamento de $${coursePrice} USD processado com sucesso via Stripe`,
        courseTitle: courseTitle,
        amount: coursePrice,
        currency: 'USD',
        status: 'completed',
        createdAt: serverTimestamp(),
        stripePaymentIntentId: clientSecret
      };

      // Adicionar courseId apenas se for um curso
      if (type === 'course') {
        notificationData.courseId = courseId;
      }

      // Adicionar transactionId à notificação
      notificationData.transactionId = transactionRef.id;

      await addDoc(collection(db, "adminNotifications"), notificationData);

      toast({
        title: "Pagamento Realizado!",
        description: "Seu pagamento foi processado com sucesso.",
      });

      // Fechar modal e atualizar a página
      setTimeout(() => {
        setIsOpen(false);
        setPaymentStatus('idle');
        setTransactionId(null);
        // Forçar atualização da página para mostrar o status de pagamento
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erro no pagamento Stripe:', error);
      setPaymentStatus('error');
      toast({
        title: "Erro no Pagamento",
        description: "Ocorreu um erro durante o processamento do pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-6 w-6 animate-spin text-orange-500" />;
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'error':
        return <div className="h-6 w-6 rounded-full bg-red-500" />;
      default:
        return <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs">PIX</span>
        </div>;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'processing':
        return "Processando pagamento...";
      case 'success':
        return "Pagamento realizado com sucesso!";
      case 'error':
        return "Erro no pagamento";
      default:
        return "Pagamento via PIX";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusText()}
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
            {paymentStatus === 'idle' && selectedMethod && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="p-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h4 className="font-semibold">Pagamento PIX</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">PIX</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">PIX - Pagamento Instantâneo</h4>
                          <p className="text-sm text-muted-foreground">
                            Transfira exatamente {getFormattedAmount('BRL')} usando o QR Code ou a chave PIX
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* QR Code */}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">QR Code:</label>
                          <div className="p-4 bg-background border rounded-lg text-center">
                            <img 
                              src={selectedMethod.qrCode} 
                              alt="QR Code PIX" 
                              className="mx-auto max-w-48 h-auto"
                            />
                          </div>
                        </div>

                        {/* Chave Aleatória Copiável */}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Chave PIX (Copie e cole no seu app):</label>
                          <div className="flex items-center gap-2 p-3 bg-background border rounded-lg">
                            <div className="flex-1 font-mono text-sm break-all">
                              e10458c5-e8a7-4ce8-8178-8bd36e8f9a08
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText('e10458c5-e8a7-4ce8-8178-8bd36e8f9a08');
                                toast({
                                  title: "Copiado!",
                                  description: "Chave PIX copiada para a área de transferência",
                                });
                              }}
                              className="flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Dados do Recebedor (Apenas Visualização) */}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Recebedor:</label>
                          <div className="p-3 bg-muted/50 border rounded-lg text-sm">
                            <div><strong>FLAVIA MATTOS ALVES DE CARVALHO</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Resumo do Pagamento:</h4>
                      <div className="flex justify-between text-sm">
                        <span>{courseTitle}</span>
                        <span>{getFormattedAmount('BRL')}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{getFormattedAmount('BRL')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePixPayment}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">PIX</span>
                        Confirmar Pagamento
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
            
            {paymentStatus === 'processing' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
                <div>
                  <h3 className="font-semibold">Processando seu pagamento...</h3>
                  <p className="text-sm text-muted-foreground">
                    Por favor, aguarde enquanto processamos sua transação.
                  </p>
                </div>
              </div>
            )}
            
            {paymentStatus === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="font-semibold text-green-600">Pagamento Realizado!</h3>
                  <p className="text-sm text-muted-foreground">
                    Sua transação foi processada com sucesso. Você receberá um email de confirmação.
                  </p>
                </div>
              </div>
            )}
            
            {paymentStatus === 'error' && (
              <div className="text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-red-500 mx-auto flex items-center justify-center">
                  <span className="text-white font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-600">Erro no Pagamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Ocorreu um erro durante o processamento. Tente novamente.
                  </p>
                </div>
                <Button
                  onClick={() => setPaymentStatus('idle')}
                  variant="outline"
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
