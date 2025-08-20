"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useParams } from "next/navigation";

export function AuthStatus() {
  const { user, loading } = useAuth();
  const t = useTranslations("HomePage");
  const params = useParams();
  const locale = params.locale as "en" | "es" | "pt";

  if (loading) {
    return null;
  }

  return user ? (
    <Button asChild>
      <Link href="/dashboard" locale={locale}>{t("goToDashboard")}</Link>
    </Button>
  ) : (
    <div className="flex items-center gap-3">
      <LocaleSwitcher />
      <Button asChild>
        <Link href="/login" locale={locale}>{t("login")}</Link>
      </Button>
    </div>
  );
}
