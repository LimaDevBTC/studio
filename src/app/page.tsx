"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, BookOpen, Video, Mail, ArrowRight, Play, Clock, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import XIcon from "@/components/icons/XIcon";
import Image from 'next/image';
import { usePublicCourses } from "@/hooks/use-public-courses";

function CoursesSection() {
  const { courses, loading, error } = usePublicCourses();

  // Função para garantir que os campos obrigatórios tenham valores padrão
  const getCourseDisplayData = (course: any) => ({
    title: course.title ?? course.name ?? 'Curso sem título',
    description: course.description ?? course.summary ?? 'Descrição não disponível',
    thumbnail: course.thumbnail ?? course.image ?? course.coverImage ?? '/images/placeholder-course.jpg',
    level: course.level ?? 'beginner',
    duration: course.duration ?? 'Não especificado',
    waitlistCount: course.waitlistCount ?? 0
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Erro ao carregar cursos. Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum curso disponível no momento.</p>
      </div>
    );
  }

  // Se não há cursos com status específico, mostrar todos os cursos como publicados
  const publishedCourses = courses.filter(course => course.status === 'published' || !course.status);
  const waitlistCourses = courses.filter(course => course.status === 'waitlist');

  return (
    <div className="space-y-12">
      {/* Cursos Publicados */}
      {publishedCourses.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-foreground">Cursos Disponíveis</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => {
              const displayData = getCourseDisplayData(course);
              return (
                <Card key={course.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      {displayData.thumbnail ? (
                        <Image 
                          src={displayData.thumbnail} 
                          alt={displayData.title}
                          width={400}
                          height={225}
                          className="rounded-t-lg object-cover w-full h-full"
                        />
                      ) : (
                        <BookOpen className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Disponível
                      </Badge>
                      {displayData.level && (
                        <Badge variant="outline" className="text-xs">
                          {displayData.level === 'beginner' ? 'Iniciante' : 
                           displayData.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-2 text-foreground">{displayData.title}</CardTitle>
                    <CardDescription className="text-muted-foreground mb-4 line-clamp-2">
                      {displayData.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {displayData.duration && (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>{displayData.duration}</span>
                          </>
                        )}
                      </div>
                      <Button asChild size="sm">
                        <Link href="/signup">Começar Agora</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cursos em Lista de Espera */}
      {waitlistCourses.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-foreground">Próximos Lançamentos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waitlistCourses.map((course) => {
              const displayData = getCourseDisplayData(course);
              return (
                <Card key={course.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      {displayData.thumbnail ? (
                        <Image 
                          src={displayData.thumbnail} 
                          alt={displayData.title}
                          width={400}
                          height={225}
                          className="rounded-t-lg object-cover w-full h-full"
                        />
                      ) : (
                        <BookOpen className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {displayData.level && (
                        <Badge variant="outline" className="text-xs">
                          {displayData.level === 'beginner' ? 'Iniciante' : 
                           displayData.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-2 text-foreground">{displayData.title}</CardTitle>
                    <CardDescription className="text-muted-foreground mb-4 line-clamp-2">
                      {displayData.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UsersIcon className="w-4 h-4" />
                        <span>{displayData.waitlistCount} pessoas aguardando</span>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/signup">Entrar na Lista</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-card-foreground hover:bg-accent">
                  Entrar
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
            Aprenda com o mQm, participe de lives exclusivas e tenha acesso a 
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

      {/* Courses Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Nossos Cursos Disponíveis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore nossa coleção de cursos premium e junte-se às listas de espera para os próximos lançamentos.
            </p>
          </div>
          
          <CoursesSection />
        </div>
      </section>

      {/* Consultoria Personalizada Banner */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10 border-y">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Consultoria Personalizada</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Receba orientação individual do mQm para maximizar seus investimentos em criptomoedas
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-2 border-primary/20 shadow-lg">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">Atendimento Individual</h3>
                        <p className="text-muted-foreground">Sessão personalizada com o mQm</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Análise do seu perfil de investidor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Estratégias personalizadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Suporte direto do mQm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Sem recorrência - pagamento único</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-6">
                    <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                      <div className="text-4xl font-bold text-primary mb-2">$39.00</div>
                      <div className="text-muted-foreground">por sessão</div>
                    </div>
                    
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Agendar Consultoria
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    
                    <p className="text-sm text-muted-foreground">
                      Sessão única de 60 minutos com o mQm
                    </p>
                  </div>
                </div>
              </CardContent>
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
                Falar com o mQm
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
