"use client";

import Link from "next/link";
import { Mail, ArrowRight, BookOpen, Video, Users, CreditCard } from "lucide-react";
import XIcon from "./icons/XIcon";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-card-foreground">MQMCrypto</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A plataforma premium para educação em criptomoedas. 
              Aprenda, conecte-se e invista com confiança.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/mqmcrypto" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a 
                href="mailto:support@mqmcrypto.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Acesso Rápido</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <ArrowRight className="h-3 w-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/courses" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <BookOpen className="h-3 w-3" />
                  Meus Cursos
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/live" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <Video className="h-3 w-3" />
                  Lives
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/subscription" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <CreditCard className="h-3 w-3" />
                  Assinatura
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <ArrowRight className="h-3 w-3" />
                  Contato
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/account" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <Users className="h-3 w-3" />
                  Minha Conta
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@mqmcrypto.com"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
                >
                  <Mail className="h-3 w-3" />
                  Suporte
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:support@mqmcrypto.com"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  support@mqmcrypto.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-primary" />
                <a 
                  href="https://twitter.com/mqmcrypto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  @mqmcrypto
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 MQMCrypto. Todos os direitos reservados. 
            Plataforma de educação em criptomoedas.
          </p>
        </div>
      </div>
    </footer>
  );
}
