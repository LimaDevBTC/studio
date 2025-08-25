"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, CheckCircle2, Loader2, QrCode, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";

interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  qrCode: string;
  icon: string; // Caminho para a imagem do logo
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pix",
    name: "PIX",
    symbol: "BRL",
    network: "PIX",
    address: "FLAVIA MATTOS ALVES DE CARVALHO - Banco: 104 - CAIXA ECONOMICA FEDERAL",
    qrCode: "/images/pixqrcode.jpeg",
    icon: "/images/pix.png",
    description: ""
  },
  {
    id: "usdt",
    name: "USDT",
    symbol: "USDT",
    network: "Multi",
    address: "",
    qrCode: "",
    icon: "/images/usdt.png",
    description: ""
  },
  {
    id: "usdc",
    name: "USDC",
    symbol: "USDC",
    network: "Multi",
    address: "",
    qrCode: "",
    icon: "/images/usdc.png",
    description: ""
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    network: "Solana",
    address: "9SHsC3LiGNKcG7HporwEcujwfUu29BQHtz1oy6LHqUxn",
    qrCode: "/images/solqrcode.jpeg",
    icon: "/images/sol.png",
    description: ""
  }
];

// Métodos de rede para USDT e USDC
const NETWORK_METHODS = {
  usdt: [
    {
      id: "usdt-solana",
      name: "USDT na Solana",
      symbol: "USDT",
      network: "Solana",
      address: "9SHsC3LiGNKcG7HporwEcujwfUu29BQHtz1oy6LHqUxn",
      qrCode: "/images/solqrcode.jpeg",
      icon: "/images/usdt.png",
      description: ""
    },
    {
      id: "usdt-ethereum",
      name: "USDT na Ethereum",
      symbol: "USDT",
      network: "Ethereum",
      address: "0xc71adf6807c3149d8b931092da44e0c5c15e4911",
      qrCode: "/images/ethqrcode.jpeg",
      icon: "/images/usdt.png",
      description: ""
    }
  ],
  usdc: [
    {
      id: "usdc-solana",
      name: "USDC na Solana",
      symbol: "USDC",
      network: "Solana",
      address: "9SHsC3LiGNKcG7HporwEcujwfUu29BQHtz1oy6LHqUxn",
      qrCode: "/images/solqrcode.jpeg",
      icon: "/images/usdc.png",
      description: ""
    },
    {
      id: "usdc-ethereum",
      name: "USDC na Ethereum",
      symbol: "USDC",
      network: "Ethereum",
      address: "0xc71adf6807c3149d8b931092da44e0c5c15e4911",
      qrCode: "/images/ethqrcode.jpeg",
      icon: "/images/usdc.png",
      description: ""
    }
  ]
};

interface CryptoPaymentModalProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  trigger: React.ReactNode;
  type?: 'course' | 'subscription' | 'consultation'; // Tipos de pagamento
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
  originalAmountUSD?: number;
  convertedAmount?: number;
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
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentMethod | null>(null);
  
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const t = useTranslations("CryptoPayment");
  const { getFormattedAmount, loading: ratesLoading, error: ratesError } = useCurrencyConversion(coursePrice);

  const getItemType = () => {
    if (type === 'subscription') return t('subscriptionType');
    if (type === 'consultation') return t('consultationType');
    return t('courseType');
  };

  const getItemTitle = () => {
    return courseTitle;
  };

  const getItemDescription = () => {
    if (type === 'subscription') {
      return t('subscriptionDescription');
    } else if (type === 'consultation') {
      return t('consultationDescription');
    } else {
      return t('courseDescription');
    }
  };

  const handleMethodSelection = (method: PaymentMethod) => {
    if (method.network === 'Multi') {
      // Para USDT e USDC, mostrar seleção de rede
      setSelectedMethod(method);
      setSelectedNetwork(null);
    } else {
      // Para PIX e Solana, ir direto para detalhes
      setSelectedMethod(method);
      setSelectedNetwork(null);
    }
  };

  const handleNetworkSelection = (networkMethod: PaymentMethod) => {
    setSelectedNetwork(networkMethod);
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
        amount: (selectedNetwork ? selectedNetwork.id : selectedMethod.id) === 'pix' ? parseFloat(getFormattedAmount('BRL').replace('R$ ', '')) : coursePrice,
        currency: selectedNetwork ? selectedNetwork.symbol : selectedMethod.symbol,
        network: selectedNetwork ? selectedNetwork.network : selectedMethod.network,
        paymentAddress: selectedNetwork ? selectedNetwork.address : selectedMethod.address,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: type || "course",
        originalAmountUSD: coursePrice,
        convertedAmount: (selectedNetwork ? selectedNetwork.id : selectedMethod.id) === 'pix' ? parseFloat(getFormattedAmount('BRL').replace('R$ ', '')) : coursePrice
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

      console.log("📝 Dados da transação:", transactionData);

      console.log("🔥 Tentando criar transação na coleção 'transactions'...");
      const transactionRef = await addDoc(collection(db, "transactions"), transactionData);
      console.log("✅ Transação criada com sucesso, ID:", transactionRef.id);

      // Criar notificação para o admin
      const notificationData: NotificationData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email || '',
        amount: (selectedNetwork ? selectedNetwork.id : selectedMethod.id) === 'pix' ? parseFloat(getFormattedAmount('BRL').replace('R$ ', '')) : coursePrice,
        currency: selectedNetwork ? selectedNetwork.symbol : selectedMethod.symbol,
        network: selectedNetwork ? selectedNetwork.network : selectedMethod.network,
        status: "pending",
        createdAt: serverTimestamp(),
        type: type || "course",
        transactionId: transactionRef.id,
        originalAmountUSD: coursePrice,
        convertedAmount: selectedMethod.id === 'pix' ? parseFloat(getFormattedAmount('BRL').replace('R$ ', '')) : coursePrice
      };

      // Adicionar campos específicos baseado no tipo
      if (type === 'subscription') {
        notificationData.planId = courseId;
        notificationData.planName = courseTitle;
      } else if (type === 'consultation') {
        notificationData.courseId = courseId;
        notificationData.courseTitle = courseTitle;
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
    setSelectedNetwork(null);
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
          {/* Indicador de carregamento das taxas */}
          {ratesLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("loadingRates")}</p>
            </div>
          )}
          
          {ratesError && (
            <div className="text-center py-4">
              <p className="text-sm text-orange-600">{ratesError}</p>
            </div>
          )}
          
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
                    ${coursePrice}
                  </span>
                  <span className="text-muted-foreground">USD</span>
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
                      onClick={() => handleMethodSelection(method)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0">
                          <img 
                            src={method.icon} 
                            alt={`${method.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{method.name}</h4>
                          <p className="text-xs text-primary font-medium">
                            {ratesLoading ? "Carregando..." : getFormattedAmount(method.symbol as any)}
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
          ) : selectedMethod && selectedMethod.network === 'Multi' && !selectedNetwork ? (
            /* Seleção de rede para USDT e USDC */
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("chooseNetwork", { name: selectedMethod.name })}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethod(null)}
                  className="absolute left-4 top-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {NETWORK_METHODS[selectedMethod.id as keyof typeof NETWORK_METHODS]?.map((networkMethod) => (
                    <div
                      key={networkMethod.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={() => handleNetworkSelection(networkMethod)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0">
                          <img 
                            src={networkMethod.icon} 
                            alt={`${networkMethod.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                                                <div>
                          <h4 className="font-semibold">{networkMethod.name}</h4>
                          <p className="text-xs text-primary font-medium">
                            {ratesLoading ? "Carregando..." : getFormattedAmount(networkMethod.symbol as any)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Selecionar
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
                  {t("payWith")} {selectedNetwork ? selectedNetwork.name : selectedMethod.name}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Valor: {ratesLoading ? "Carregando..." : getFormattedAmount((selectedNetwork ? selectedNetwork.symbol : selectedMethod.symbol) as any)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedNetwork) {
                      setSelectedNetwork(null);
                    } else {
                      setSelectedMethod(null);
                    }
                  }}
                  className="absolute left-4 top-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-lg">
                      <img
                        src={selectedNetwork ? selectedNetwork.qrCode : selectedMethod.qrCode}
                        alt={`QR Code for ${selectedNetwork ? selectedNetwork.name : selectedMethod.name}`}
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
                        {selectedNetwork ? selectedNetwork.address : selectedMethod.address}
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

                  {/* Instruções específicas por método */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <h4 className="font-semibold text-foreground">{t("paymentInstructions")}</h4>
                    {(selectedNetwork ? selectedNetwork.id : selectedMethod.id) === 'pix' ? (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Escaneie o QR Code ou copie os dados bancários</li>
                        <li>Transfira exatamente {getFormattedAmount('BRL')} para a conta</li>
                        <li>Após a transferência, clique em "Já Paguei"</li>
                        <li>Aguarde a confirmação do administrador</li>
                      </ul>
                    ) : (selectedNetwork ? selectedNetwork.network : selectedMethod.network) === 'Solana' ? (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Envie exatamente {getFormattedAmount((selectedNetwork ? selectedNetwork.symbol : selectedMethod.symbol) as any)} para o endereço</li>
                        <li>Use a rede Solana para transações rápidas e baratas</li>
                        <li>Após o envio, clique em "Já Paguei"</li>
                        <li>Aguarde a confirmação na blockchain</li>
                      </ul>
                    ) : (
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Envie exatamente {getFormattedAmount((selectedNetwork ? selectedNetwork.symbol : selectedMethod.symbol) as any)} para o endereço</li>
                        <li>Use a rede Ethereum para transações seguras</li>
                        <li>Após o envio, clique em "Já Paguei"</li>
                        <li>Aguarde a confirmação na blockchain</li>
                      </ul>
                    )}
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
                        Já Paguei
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
