
"use client";

import { Link, useRouter } from "@/navigation";
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Package2,
  Users,
  BookCopy,
  LogOut,
  Undo2,
  Clapperboard,
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
    { href: "/admin/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { href: "/admin/courses", icon: <BookCopy className="h-4 w-4" />, label: "Courses" },
    { href: "/admin/users", icon: <Users className="h-4 w-4" />, label: "Users" },
    { href: "/admin/live", icon: <Clapperboard className="h-4 w-4" />, label: "Live" },
];

const secondaryNavItems = [
    { href: "/dashboard", icon: <Undo2 className="h-4 w-4" />, label: "Back to App" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Usar window.location para fazer redirect para landing page
      window.location.href = '/pt';
    });
  };
  
  return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-16 items-center border-b px-4 lg:px-6">
                <Logo />
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  {navItems.map(item => {
                    const isActive = pathname.endsWith(item.href);
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
                 <div className="grid items-start px-2 text-sm font-medium lg:px-4 mb-4 border-t pt-4">
                    {secondaryNavItems.map(item => {
                      const isActive = pathname.endsWith(item.href);
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
                 </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
               <div className="w-full flex-1">
                <h1 className="text-lg font-semibold">Admin Panel</h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Link para Minha Conta */}
                <Link href="/dashboard/account">
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'admin'} />
                      <AvatarFallback>AD</AvatarFallback>
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
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
              {children}
            </main>
          </div>
        </div>
  );
}
