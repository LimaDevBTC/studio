
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations('ProfilePage');
  const { toast } = useToast();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    setLoading(true);

    let photoURL = user.photoURL;

    try {
      if (imageFile) {
        setIsUploading(true);
        const storageRef = ref(storage, `users/${user.uid}/profile-picture`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => {
              console.error("Upload failed:", error);
              reject(error);
            }, 
            async () => {
              photoURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
        setIsUploading(false);
      }

      // Update Firebase Auth profile
      await updateProfile(user, { displayName, photoURL });
      
      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { name: displayName, photoURL: photoURL });

      toast({ title: t('toast.successTitle'), description: t('toast.successDescription') });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: t('toast.errorTitle'), description: error.message });
    } finally {
      setLoading(false);
      setIsUploading(false);
      setImageFile(null);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('card.title')}</CardTitle>
          <CardDescription>{t('card.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewImage || user?.photoURL || ''} alt={user?.displayName || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">{t('form.photoLabel')}</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
               <p className="text-xs text-muted-foreground">{t('form.photoHint')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.nameLabel')}</Label>
            <Input 
              id="name" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('form.emailLabel')}</Label>
            <Input id="email" value={user?.email || ''} readOnly disabled />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleProfileUpdate} disabled={loading || authLoading}>
          {(loading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? `${t('form.savingButton')} (${Math.round(uploadProgress)}%)` : loading ? t('form.savingButton') : t('form.saveButton')}
        </Button>
      </div>
    </div>
  );
}
