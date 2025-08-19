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
              <Alert className="border-primary/20 bg-primary/5 mb-6">
          <XCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Plano Expirado</AlertTitle>
          <AlertDescription className="text-primary/80">
          Seu plano {subscriptionStatus.planName} expirou em {subscriptionStatus.expiryDate?.toLocaleDateString('pt-BR')}. 
          Renove sua assinatura para continuar acessando todos os cursos.
        </AlertDescription>
        <div className="mt-3">
                                                          <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                                                    <Link href="/dashboard/subscription">Renovar Assinatura</Link>
                                                </Button>
        </div>
      </Alert>
    );
  }

  // Se o plano está expirando em breve
  if (subscriptionStatus.isExpiringSoon) {
    return (
              <Alert className="border-primary/20 bg-primary/5 mb-6">
          <Clock className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Plano Expirando</AlertTitle>
          <AlertDescription className="text-primary/80">
            Seu plano {subscriptionStatus.planName} expira em {subscriptionStatus.daysUntilExpiry} dia{subscriptionStatus.daysUntilExpiry > 1 ? 's' : ''}. 
            Renove para não perder o acesso aos cursos.
          </AlertDescription>
          <div className="mt-3">
            <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/dashboard/subscription">Renovar Agora</Link>
            </Button>
          </div>
        </Alert>
    );
  }

  return null;
}
