"use client";

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Camera,
  Save,
  Edit,
  Eye,
  EyeOff,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export default function AccountPage() {
  const t = useTranslations('AccountPage');
  const { user, userData } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Aqui implementaríamos a lógica de atualização do perfil
      toast({
        title: t('toast.profileUpdated.title'),
        description: t('toast.profileUpdated.description'),
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: t('toast.profileError.title'),
        description: t('toast.profileError.description'),
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: t('toast.passwordMismatch.title'),
        description: t('toast.passwordMismatch.description'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Aqui implementaríamos a lógica de alteração de senha
      toast({
        title: t('toast.passwordChanged.title'),
        description: t('toast.passwordChanged.description'),
      });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast({
        title: t('toast.passwordError.title'),
        description: t('toast.passwordError.description'),
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Perfil Pessoal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('personalProfile.title')}
              </CardTitle>
              <CardDescription>
                {t('personalProfile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'user'} />
                  <AvatarFallback className="text-lg">{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    {t('personalProfile.changePhoto')}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {t('personalProfile.photoHint')}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t('personalProfile.fullName')}</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('personalProfile.email')}</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('personalProfile.emailHint')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      {t('personalProfile.save')}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {t('personalProfile.cancel')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('personalProfile.editProfile')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('security.title')}
              </CardTitle>
              <CardDescription>
                {t('security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('security.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder={t('security.currentPasswordPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('security.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder={t('security.newPasswordPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('security.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={t('security.confirmPasswordPlaceholder')}
                  />
                </div>
              </div>

              <Button onClick={handlePasswordChange}>
                <Shield className="h-4 w-4 mr-2" />
                {t('security.changePassword')}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Coluna Lateral - Configurações */}
        <div className="space-y-6">
          
          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('settings.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Idioma */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('settings.language')}
                </Label>
                <LocaleSwitcher />
              </div>

              <Separator />

              {/* Tema */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {t('settings.theme')}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    {t('settings.light')}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    {t('settings.dark')}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Notificações */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {t('settings.notifications')}
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('settings.email')}</span>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('settings.push')}</span>
                    <Badge variant="outline">Inativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accountInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('accountInfo.memberSince')}</span>
                <span className="text-sm font-medium">
                  {user?.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('accountInfo.lastLogin')}</span>
                <span className="text-sm font-medium">
                  {user?.metadata?.lastSignInTime 
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('accountInfo.status')}:</span>
                <Badge variant="default">{t('accountInfo.active')}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
