
"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useTranslations } from 'next-intl';
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useToast } from "@/hooks/use-toast";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link, useRouter } from "@/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations('SignupPage');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirecionar usuários já autenticados
  useEffect(() => {
    console.log('🔍 DEBUG SIGNUP - user:', user, 'authLoading:', authLoading);
    if (user && !authLoading) {
      console.log('🔄 Usuário já autenticado, redirecionando para dashboard...');
      // Usar window.location para evitar problemas de roteamento
      window.location.href = '/dashboard';
    }
  }, [user, authLoading]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Please enter your full name.",
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // We still update the profile displayName for Firebase Auth
      await updateProfile(user, {
        displayName: fullName,
      });

      // The AuthProvider will now handle creating the Firestore document.
      // We no longer need to call router.push here.
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The AuthProvider will now handle creating the Firestore document.
      // We no longer need to call router.push here.
    } catch (error: any) {
      console.error("Error signing up with Google:", error);
      toast({
        variant: "destructive",
        title: "Google Signup Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  // Não mostrar a página se estiver redirecionando
  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Verificando autenticação...' : 'Redirecionando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
            <div className="absolute top-4 right-4">
                <LocaleSwitcher />
            </div>
          <div className="mb-8">
            <Link href="/">
              <Image 
                src="/images/logo.png"
                alt="MQMCrypto Logo"
                width={4000}
                height={2250}
                className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                priority
                quality={100}
                unoptimized
              />
            </Link>
          </div>
          <Card className="mx-auto max-w-sm w-[400px] bg-card">
            <CardHeader>
                              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>
                {t('description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">{t('fullNameLabel')}</Label>
                    <Input 
                      id="full-name" 
                      placeholder={t('fullNamePlaceholder')}
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
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
                    <Label htmlFor="password">{t('passwordLabel')}</Label>
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
                    {loading ? t('loadingButton') : t('createAccountButton')}
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
              <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={loading}>
                <GoogleIcon className="mr-2" />
                {t('googleButton')}
              </Button>
              <div className="mt-4 text-center text-sm">
                {t('hasAccount')}{" "}
                <Link href="/login" className="underline">
                  {t('login')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
