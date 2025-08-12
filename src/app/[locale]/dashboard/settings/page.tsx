
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, KeyRound, ShieldAlert, Palette, Languages, Bell } from "lucide-react";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations('SettingsPage');
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    setLoading("password");
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: t('toast.passwordReset.successTitle'),
        description: t('toast.passwordReset.successDescription'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('toast.passwordReset.errorTitle'),
        description: error.message,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading("delete");
    try {
        // First, delete the Firestore document.
        const userDocRef = doc(db, "users", user.uid);
        await deleteDoc(userDocRef);

        // Then, delete the user from Firebase Authentication.
        // This will trigger a logout via the onAuthStateChanged listener.
        await deleteUser(user);

        toast({
            title: t('toast.deleteAccount.successTitle'),
            description: t('toast.deleteAccount.successDescription'),
        });
        // The AuthProvider will handle the redirect to the login page.
    } catch (error: any) {
        console.error("Error deleting account:", error);
        toast({
            variant: "destructive",
            title: t('toast.deleteAccount.errorTitle'),
            description: error.message,
        });
        setLoading(null);
    }
  };


  if (authLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backButton')}
      </Button>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> {t('appearance.title')}</CardTitle>
          <CardDescription>{t('appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <Label className="font-semibold">{t('appearance.theme.label')}</Label>
                    <p className="text-sm text-muted-foreground">{t('appearance.theme.description')}</p>
                </div>
                <ThemeToggle />
            </div>
             <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <Label className="font-semibold">{t('appearance.language.label')}</Label>
                    <p className="text-sm text-muted-foreground">{t('appearance.language.description')}</p>
                </div>
                <LocaleSwitcher />
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> {t('notifications.title')}</CardTitle>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <Label htmlFor="push-notifications" className="font-semibold">{t('notifications.push.label')}</Label>
                    <p className="text-sm text-muted-foreground">{t('notifications.push.description')}</p>
                </div>
                <Switch id="push-notifications" />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('account.title')}</CardTitle>
          <CardDescription>{t('account.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <h3 className="font-semibold">{t('account.password.label')}</h3>
                    <p className="text-sm text-muted-foreground">{t('account.password.description')}</p>
                </div>
                 <Button onClick={handlePasswordReset} disabled={loading === 'password'} variant="outline">
                    {loading === 'password' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     <KeyRound className="mr-2 h-4 w-4" />
                    {t('account.password.button')}
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card className="border-destructive">
        <CardHeader>
            <CardTitle className="text-destructive">{t('account.delete.title')}</CardTitle>
            <CardDescription>{t('account.delete.description')}</CardDescription>
        </CardHeader>
        <CardFooter className="bg-destructive/10 p-4 flex justify-between items-center rounded-b-lg">
             <p className="text-sm text-destructive font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                {t('account.delete.warning')}
            </p>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading === 'delete'}>
                  {loading === 'delete' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('account.delete.button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('dialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                  >
                    {t('dialog.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
