"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function AuthStatus() {
  const { user, loading } = useAuth();
  const t = useTranslations("HomePage");

  if (loading) {
    return null;
  }

  return user ? (
    <Button asChild>
      <Link href="/dashboard">{t("goToDashboard")}</Link>
    </Button>
  ) : (
    <div className="flex items-center gap-3">
      <LocaleSwitcher />
      <Button asChild>
        <Link href="/login">{t("login")}</Link>
      </Button>
    </div>
  );
}
