
"use client";

import { Link, useRouter } from "@/navigation";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Bell,
  Home,
  Package2,
  Users,
  BookCopy,
  LogOut,
  Clapperboard,
  Calendar,
  Menu,
  X,
  DollarSign,
  Clock,
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
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

const navItems = [
    { href: "/admin/dashboard" as const, icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { href: "/admin/payments" as const, icon: <DollarSign className="h-4 w-4" />, label: "Pagamentos" },
    { href: "/admin/waitlist" as const, icon: <Clock className="h-4 w-4" />, label: "Lista de Espera" },
    { href: "/admin/courses" as const, icon: <BookCopy className="h-4 w-4" />, label: "Courses" },
    { href: "/admin/users" as const, icon: <Users className="h-4 w-4" />, label: "Users" },
    { href: "/admin/live" as const, icon: <Clapperboard className="h-4 w-4" />, label: "Live" },
    { href: "/admin/consultations" as const, icon: <Calendar className="h-4 w-4" />, label: "Consultorias" },
];

const secondaryNavItems = [
    { href: "/dashboard" as const, icon: <Home className="h-4 w-4" />, label: "Back to App" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
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
  
  return (
    <div className="admin-layout min-h-screen w-full bg-background">
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
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'admin'} />
                  <AvatarFallback>AD</AvatarFallback>
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
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay Otimizado */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-card border-r shadow-xl">
            <div className="flex h-20 sm:h-24 items-center justify-between border-b px-4 sm:px-6">
              <div className="flex flex-col">
                <Logo />
              </div>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="p-2 h-12 w-12">
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium space-y-2">
                {navItems.map(item => {
                  const isActive = pathname.endsWith(item.href as string);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all text-base ${
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
              
              <div className="mt-8 p-4 border-t">
                <div className="grid items-start px-4 text-sm font-medium">

                                  {secondaryNavItems.map(item => {
                  const isActive = pathname.endsWith(item.href as string);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all text-base ${
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Desktop Otimizado */}
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] overflow-hidden pt-20 sm:pt-24 lg:pt-0">
        {/* Sidebar Desktop */}
        <div className="hidden border-r bg-card lg:block w-full max-w-[300px] lg:pt-20 xl:pt-24">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-20 sm:h-24 items-center border-b px-6">
              <div className="flex flex-col">
                <Logo />

              </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium space-y-2">
                {navItems.map(item => {
                  const isActive = pathname.endsWith(item.href as string);
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
              <div className="grid items-start px-4 text-sm font-medium">

                {secondaryNavItems.map(item => {
                  const isActive = pathname.endsWith(item.href as string);
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
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal Otimizado */}
        <div className="flex flex-col w-full overflow-hidden lg:pt-20 xl:pt-24">
          {/* Header Desktop */}
          <header className="hidden h-20 sm:h-24 items-center gap-4 border-b bg-card px-6 lg:flex w-full">
            <div className="w-full flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold">Admin Panel</h1>

            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/account">
                <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'admin'} />
                    <AvatarFallback>AD</AvatarFallback>
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
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>

          {/* Conteúdo Principal Responsivo */}
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:gap-6 lg:p-8 bg-background overflow-x-hidden w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
