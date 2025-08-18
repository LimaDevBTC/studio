import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import Link from "next/link";

export default function SubscriptionAlert() {
  const { subscriptionStatus, isLoading } = useSubscriptionStatus();

  if (isLoading || !subscriptionStatus) {
    return null;
  }

  // Se o plano não está ativo ou não está expirando, não mostrar nada
  if (!subscriptionStatus.isActive && !subscriptionStatus.isExpired) {
    return null;
  }

  // Se o plano expirou
  if (subscriptionStatus.isExpired) {
    return (
      <Alert className="border-red-200 bg-red-50 mb-6">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Plano Expirado</AlertTitle>
        <AlertDescription className="text-red-700">
          Seu plano {subscriptionStatus.planName} expirou em {subscriptionStatus.expiryDate?.toLocaleDateString('pt-BR')}. 
          Renove sua assinatura para continuar acessando todos os cursos.
        </AlertDescription>
        <div className="mt-3">
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
            <Link href="/dashboard/subscription">Renovar Assinatura</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  // Se o plano está expirando em breve
  if (subscriptionStatus.isExpiringSoon) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 mb-6">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Plano Expirando</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Seu plano {subscriptionStatus.planName} expira em {subscriptionStatus.daysUntilExpiry} dia{subscriptionStatus.daysUntilExpiry > 1 ? 's' : ''}. 
          Renove para não perder o acesso aos cursos.
        </AlertDescription>
        <div className="mt-3">
          <Button asChild size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
            <Link href="/dashboard/subscription">Renovar Agora</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  return null;
}
