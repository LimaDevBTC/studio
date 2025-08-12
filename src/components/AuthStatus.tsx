"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

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
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">{t("login")}</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">{t("getStarted")}</Link>
      </Button>
    </>
  );
}
