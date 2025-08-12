
"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Link, useRouter } from '@/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
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
      { href: "/dashboard", icon: <Home />, label: t('navDashboard') },
      { href: "/dashboard/courses", icon: <BookOpenCheck />, label: t('navMyCourses') },
      { href: "/dashboard/subscription", icon: <CreditCard />, label: t('navSubscription') },
      { href: "/dashboard/live", icon: <Clapperboard />, label: "Ao Vivo" },
  ];

  const isAdmin = userData?.isAdmin === true;

  return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                      <Link href={item.href}>
                          <SidebarMenuButton tooltip={item.label}>
                              {item.icon}
                              <span>{item.label}</span>
                          </SidebarMenuButton>
                      </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto">
                <SidebarSeparator />
                <SidebarMenu>
                    {authLoading ? (
                      <SidebarMenuItem>
                         <div className="p-2">
                           <Skeleton className="h-8 w-full" />
                         </div>
                      </SidebarMenuItem>
                    ) : isAdmin ? (
                        <SidebarMenuItem>
                             <Link href="/admin/dashboard">
                                <SidebarMenuButton tooltip="Admin">
                                    <Shield />
                                    <span>Admin</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ) : null}
                </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
              <SidebarTrigger className="hidden md:flex" />
              <div className="w-full flex-1">
                {/* Add search bar if needed */}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'user'} />
                      <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        {t('userMenuProfile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('userMenuSettings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('userMenuLogout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
  );
}
