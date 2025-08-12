"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2, Loader2, QrCode, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";

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
    id: "usdt-solana",
    name: "USDT",
    symbol: "USDT",
    network: "Solana",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    icon: "💎",
    description: "USDT on Solana network - Fast and low fees"
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yf4jf2j0vwpw4hqcqw8",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bc1qxy2kgdygjrsqtzq2n0yf4jf2j0vwpw4hqcqw8",
    icon: "₿",
    description: "Bitcoin - The original cryptocurrency"
  }
];

interface CryptoPaymentModalProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  trigger: React.ReactNode;
  type?: 'course' | 'subscription'; // Novo campo para diferenciar cursos de assinaturas
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
}

interface NotificationData {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  amount: number;
  currency: string;
  network: string;
  status: string;
  createdAt: any;
  type: string;
  transactionId: string;
  courseId?: string;
  courseTitle?: string;
  planId?: string;
  planName?: string;
}

export default function CryptoPaymentModal({
  courseId,
  courseTitle,
  coursePrice,
  trigger,
  type
}: CryptoPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const t = useTranslations("CryptoPayment");

  const getItemType = () => {
    return type === 'subscription' ? 'Plano' : 'Curso';
  };

  const getItemTitle = () => {
    return type === 'subscription' ? courseTitle : courseTitle;
  };

  const getItemDescription = () => {
    return type === 'subscription' 
      ? 'Plano de assinatura com acesso completo a todos os cursos'
      : 'Curso completo com todas as aulas e materiais';
  };

  const handleCopyAddress = async () => {
    if (selectedMethod) {
      try {
        await navigator.clipboard.writeText(selectedMethod.address);
        setAddressCopied(true);
        toast({
          title: t("addressCopied"),
          description: t("addressCopiedDesc"),
        });
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (err) {
        toast({
          title: t("copyError"),
          description: t("copyErrorDesc"),
          variant: "destructive",
        });
      }
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!user || !selectedMethod) return;

    // VERIFICAÇÃO CRÍTICA: Admin não deve pagar
    if (userData?.isAdmin) {
      toast({
        title: "Acesso Direto",
        description: "Como administrador, você tem acesso direto a todos os produtos. Não é necessário fazer pagamento.",
        variant: "default",
      });
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("💳 Iniciando processo de pagamento para usuário:", {
        userId: user.uid,
        userEmail: user.email,
        isAdmin: userData?.isAdmin,
        type: type,
        courseId: courseId,
        courseTitle: courseTitle
      });

      // Criar transação no Firestore
      const transactionData: TransactionData = {
        userId: user.uid,
        amount: coursePrice,
        currency: selectedMethod.symbol,
        network: selectedMethod.network,
        paymentAddress: selectedMethod.address,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: type === 'subscription' ? "subscription" : "course"
      };

      // Adicionar campos específicos baseado no tipo
      if (type === 'subscription') {
        transactionData.planId = courseId;
        transactionData.planName = courseTitle;
      } else {
        transactionData.courseId = courseId;
        transactionData.courseTitle = courseTitle;
      }

      const transactionRef = await addDoc(collection(db, "transactions"), transactionData);

      // Criar notificação para o admin
      const notificationData: NotificationData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email || '',
        amount: coursePrice,
        currency: selectedMethod.symbol,
        network: selectedMethod.network,
        status: "pending",
        createdAt: serverTimestamp(),
        type: type === 'subscription' ? "subscription" : "course", // CORRIGIDO: tipo correto
        transactionId: transactionRef.id
      };

      // Adicionar campos específicos baseado no tipo
      if (type === 'subscription') {
        notificationData.planId = courseId;
        notificationData.planName = courseTitle;
      } else {
        notificationData.courseId = courseId;
        notificationData.courseTitle = courseTitle;
      }

      await addDoc(collection(db, "adminNotifications"), notificationData);

      // Atualizar a transação com o ID da notificação (optional, but good for linking)
      await updateDoc(transactionRef, {
        notificationId: transactionRef.id // Storing notification ID in transaction
      });

      // Mostrar toast de sucesso
      toast({
        title: t("paymentSubmitted"),
        description: t("paymentSubmittedDesc"),
      });

      setIsOpen(false);
      setSelectedMethod(null); // Reset selected method after submission
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast({
        title: t("submissionError"),
        description: t("submissionErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setAddressCopied(false);
    setIsSubmitting(false);
  };

  return (
          <Dialog open={isOpen} onOpenChange={(open: boolean) => {
        setIsOpen(open);
        if (!open) resetModal();
      }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t("title", { type: getItemType() })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do curso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("courseInfo", { type: getItemType() })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{getItemTitle()}</h3>
                <p className="text-muted-foreground">{getItemDescription()}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {coursePrice}
                  </span>
                  <span className="text-muted-foreground">{t("credits")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção do método de pagamento */}
          {!selectedMethod ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("selectPayment")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMethod(method)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-semibold">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {t("select")}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Detalhes do pagamento */
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("payWith")} {selectedMethod.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethod(null)}
                  className="absolute right-4 top-4"
                >
                  {t("changeMethod")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-lg">
                      <img
                        src={selectedMethod.qrCode}
                        alt={`QR Code for ${selectedMethod.name}`}
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Endereço da carteira */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-center">
                      {t("sendToAddress")}
                    </h4>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-sm break-all">
                        {selectedMethod.address}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyAddress}
                        className="flex-shrink-0"
                      >
                        {addressCopied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Instruções */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <h4 className="font-semibold text-foreground">{t("instructionsTitle")}</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>{t("instruction1")}</li>
                      <li>{t("instruction2")}</li>
                      <li>{t("instruction3")}</li>
                    </ul>
                  </div>

                  {/* Botão de confirmação */}
                  <Button
                    onClick={handlePaymentConfirmation}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("processing")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t("confirmPayment")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
