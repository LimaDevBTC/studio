
"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  BookOpenCheck,
  CreditCard,
  LogOut,
  Shield,
  Clapperboard,
  User as UserIcon,
  Settings,
  MessageSquare,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Link, useRouter } from '@/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Footer from "@/components/Footer";
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('DashboardLayout');
  
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Usar window.location para fazer redirect para landing page
      window.location.href = '/pt';
    });
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const navItems = [
      { href: "/dashboard" as const, icon: <Home className="h-4 w-4" />, label: t('navDashboard') },
      { href: "/dashboard/courses" as const, icon: <BookOpenCheck className="h-4 w-4" />, label: t('navMyCourses') },
      { href: "/dashboard/subscription" as const, icon: <CreditCard className="h-4 w-4" />, label: t('navSubscription') },
      { href: "/dashboard/consultation" as const, icon: <Calendar className="h-4 w-4" />, label: t('navConsultation') },
      { href: "/dashboard/live" as const, icon: <Clapperboard className="h-4 w-4" />, label: t('navLive') },
      { href: "/dashboard/account" as const, icon: <UserIcon className="h-4 w-4" />, label: t('navMyAccount') },
  ];
  

  const isAdmin = userData?.isAdmin === true;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Image 
              src="/images/logo.png"
              alt="MQMCrypto Logo"
              width={4000}
              height={2250}
              className="h-20 w-auto"
              priority
              quality={100}
              unoptimized
            />
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => {
                // Lógica corrigida para detectar link ativo
                let isActive = false;
                
                if (item.href === '/dashboard') {
                  // Dashboard ativo apenas quando estiver exatamente na página principal
                  isActive = pathname === '/dashboard' || pathname === '/pt/dashboard' || pathname === '/en/dashboard' || pathname === '/es/dashboard';
                } else {
                  // Outras páginas ativas quando o pathname contém o href
                  isActive = pathname.includes(item.href);
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
                        {isAdmin && (
              <div className="grid items-start px-2 text-sm font-medium lg:px-4 mb-4 border-t pt-4">
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    pathname.includes("/admin/dashboard")
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Header Mobile com Logo */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          {/* Logo Mobile - Visível apenas em mobile */}
          <div className="md:hidden flex-shrink-0">
            <Image 
              src="/images/logo.png"
              alt="MQMCrypto Logo"
              width={200}
              height={112}
              className="h-16 w-auto"
              priority
              quality={100}
              unoptimized
            />
          </div>
          
          <div className="w-full flex-1">
            {/* Add search bar if needed */}
          </div>
          <div className="flex items-center gap-3">
            {/* Link para Minha Conta */}
            <Link href="/dashboard/account">
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'user'} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </Link>
            
            {/* Botão de Logout */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
