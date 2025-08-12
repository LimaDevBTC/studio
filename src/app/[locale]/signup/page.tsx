
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations('SignupPage');
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
