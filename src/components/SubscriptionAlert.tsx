import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function SubscriptionAlert() {
  const { subscriptionStatus, isLoading } = useSubscriptionStatus();
  const t = useTranslations("SubscriptionAlert");

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
        <AlertTitle className="text-primary">{t("expiredTitle")}</AlertTitle>
        <AlertDescription className="text-primary/80">
          {t("expiredMessage", {
            planName: subscriptionStatus.planName,
            expiryDate: subscriptionStatus.expiryDate?.toLocaleDateString()
          })}
        </AlertDescription>
        <div className="mt-3">
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard/subscription">{t("renewSubscription")}</Link>
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
        <AlertTitle className="text-primary">{t("expiringTitle")}</AlertTitle>
        <AlertDescription className="text-primary/80">
          {t("expiringMessage", {
            planName: subscriptionStatus.planName,
            daysUntilExpiry: subscriptionStatus.daysUntilExpiry
          })}
        </AlertDescription>
        <div className="mt-3">
          <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Link href="/dashboard/subscription">{t("renewNow")}</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  return null;
}
