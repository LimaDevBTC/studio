import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, BookOpen, Video, Mail, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import XIcon from "@/components/icons/XIcon";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-card-foreground">MQMCrypto</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-card-foreground hover:bg-accent">
                  Entrar
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-card border-b py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/30">
            🚀 Plataforma Premium de Educação Crypto
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-card-foreground">
            Domine o Mundo das
            <span className="block text-primary">
              Criptomoedas
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Aprenda com especialistas, participe de lives exclusivas e tenha acesso a 
            consultorias personalizadas para maximizar seus investimentos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-border text-card-foreground hover:bg-accent text-lg px-8 py-6">
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>+1000 alunos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>4.9/5 avaliação</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Certificado garantido</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Por que escolher a MQMCrypto?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma experiência educacional única e personalizada para seu sucesso no mundo crypto.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border bg-card">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Cursos Premium</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Conteúdo exclusivo criado por especialistas do mercado crypto
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-border bg-card">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Lives Exclusivas</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Participe de transmissões ao vivo e consultorias personalizadas
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-border bg-card">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Comunidade Ativa</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Conecte-se com outros investidores e compartilhe experiências
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card border-t">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4 text-card-foreground">Pronto para começar sua jornada?</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Junte-se a milhares de alunos que já transformaram seus conhecimentos em resultados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-border text-card-foreground hover:bg-accent text-lg px-8 py-6">
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
