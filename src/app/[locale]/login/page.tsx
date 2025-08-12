
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useTranslations } from 'next-intl';
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useToast } from "@/hooks/use-toast";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link, useRouter } from "@/navigation";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('LoginPage');
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No need to call router.push, the AuthProvider will handle the redirect
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // No need to call router.push, the AuthProvider will handle the redirect
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };


  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
            <div className="absolute top-4 right-4">
                <LocaleSwitcher />
            </div>
          <div className="mb-8">
              <Logo />
          </div>
          <Card className="mx-auto max-w-sm w-[400px] bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{t('title')}</CardTitle>
              <CardDescription>
                {t('description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">{t('passwordLabel')}</Label>
                      <Link href="#" className="ml-auto inline-block text-sm underline">
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('loadingButton') : t('loginButton')}
                  </Button>
                </div>
              </form>
              <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
                  </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                <GoogleIcon className="mr-2" />
                {t('googleButton')}
              </Button>
              <div className="mt-4 text-center text-sm">
                {t('noAccount')}{" "}
                <Link href="/signup" className="underline">
                  {t('signUp')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
