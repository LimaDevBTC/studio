
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
  Menu,
  X,
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
import { Logo } from "@/components/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('DashboardLayout');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Usar window.location para fazer redirect para landing page
      window.location.href = '/pt';
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    <div className="dashboard-layout min-h-screen w-full bg-background">
      {/* Header Mobile com Menu Hamburger */}
      <header className="header-fixed lg:hidden w-full">
        <div className="flex h-20 sm:h-24 items-center justify-between px-4 sm:px-6 w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 h-12 w-12"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <div className="flex flex-col">
              <Logo />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard/account">
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'user'} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-card border-r shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Logo />
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="p-2">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                {navItems.map(item => {
                  let isActive = false;
                  
                  if (item.href === '/dashboard') {
                    isActive = pathname === '/dashboard' || pathname === '/pt/dashboard' || pathname === '/en/dashboard' || pathname === '/es/dashboard';
                  } else {
                    isActive = pathname.includes(item.href);
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-primary hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Seção Admin no Menu Mobile */}
              {isAdmin && (
                <div className="mt-auto p-4 border-t">
                  <div className="grid items-start px-2 text-sm font-medium">

                    <Link
                      href="/admin/dashboard"
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/20 ${
                        pathname.includes("/admin/dashboard")
                          ? 'text-orange-600 bg-orange-500/20 border-orange-300/40' 
                          : 'text-orange-600 hover:text-orange-700 hover:bg-orange-500/20'
                      }`}
                    >
                      <Shield className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold">Painel Admin</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Layout Desktop */}
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] overflow-hidden pt-20 sm:pt-24 lg:pt-0">
        {/* Sidebar Desktop */}
        <div className="hidden border-r bg-card lg:block w-full max-w-[300px]">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-20 sm:h-24 items-center border-b px-6">
              <div className="flex flex-col">
                <Logo />
              </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium space-y-2">
                {navItems.map(item => {
                  let isActive = false;
                  
                  if (item.href === '/dashboard') {
                    isActive = pathname === '/dashboard' || pathname === '/pt/dashboard' || pathname === '/en/dashboard' || pathname === '/es/dashboard';
                  } else {
                    isActive = pathname.includes(item.href);
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                        isActive 
                          ? 'text-primary bg-primary/10 border border-primary/20' 
                          : 'text-muted-foreground hover:text-primary hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t">
              {isAdmin && (
                <div className="grid items-start px-4 text-sm font-medium">

                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/20 ${
                      pathname.includes("/admin/dashboard")
                        ? 'text-orange-600 bg-orange-500/20 border-orange-300/40' 
                        : 'text-orange-600 hover:text-orange-700 hover:bg-orange-500/20'
                    }`}
                  >
                    <Shield className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold">Painel Admin</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex flex-col w-full overflow-hidden">
          {/* Header Desktop */}
          <header className="hidden h-20 sm:h-24 items-center gap-4 border-b bg-card px-6 lg:flex w-full">
            <div className="w-full flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>

            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/account">
                <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'user'} />
                    <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2 h-12 px-4"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Button>
            </div>
          </header>

          {/* Conteúdo Principal Responsivo */}
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:gap-6 lg:p-8 bg-background overflow-x-hidden w-full">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
