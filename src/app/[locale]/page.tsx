"use client";

import {useTranslations} from 'next-intl';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ShieldCheck, BarChart, Users, CheckCircle, ArrowRight, Clock, Users as UsersIcon, Mail, Globe, Phone } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthStatus } from "@/components/AuthStatus";
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/navigation';
import { usePublicCourses } from "@/hooks/use-public-courses";
import { useEffect } from 'react';


const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "feature1Title",
    description: "feature1Desc",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "feature2Title",
    description: "feature2Desc",
  },
  {
    icon: <BarChart className="w-8 h-8 text-primary" />,
    title: "feature3Title",
    description: "feature3Desc",
  },
];

const coursePreviews = [
  {
    title: "course1Title",
    description: "course1Desc",
    image: "/images/pose.png",
    aiHint: "bitcoin abstract",
  },
  {
    title: "course2Title",
    description: "course2Desc",
    image: "/images/pose.png",
    aiHint: "finance technology",
  },
  {
    title: "course3Title",
    description: "course3Desc",
    image: "/images/pose.png",
    aiHint: "stock charts",
  },
];

function CoursesSection() {
  const { courses, loading, error, debugInfo } = usePublicCourses();
  const t = useTranslations('HomePage');

  // DEBUG: Mostrar informações de debug
  console.log('🎬 CoursesSection rendered with:', {
    courses,
    loading,
    error,
    debugInfo,
    coursesLength: courses?.length || 0
  });

  // Função para garantir que os campos obrigatórios tenham valores padrão
  const getCourseDisplayData = (course: any) => ({
    title: course.title ?? course.name ?? 'Curso sem título',
    description: course.description ?? course.summary ?? 'Descrição não disponível',
    thumbnail: course.thumbnail ?? course.image ?? course.coverImage ?? course.courseImage ?? '/images/logo.png',
    status: course.status ?? course.courseStatus ?? 'published',
    level: course.level ?? course.courseLevel ?? 'beginner',
    duration: course.duration ?? course.courseDuration ?? 'Não especificado',
    waitlistCount: course.waitlistCount ?? 0
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar cursos</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          
          {/* DEBUG: Mostrar informações de debug em caso de erro */}
          {debugInfo && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                🔍 Informações de Debug (Clique para expandir)
              </summary>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/50 border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível no momento</h3>
          <p className="text-muted-foreground mb-4">
            Estamos trabalhando para disponibilizar novos cursos em breve.
          </p>
          
          {/* DEBUG: Mostrar informações de debug quando não há cursos */}
          {debugInfo && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                🔍 Informações de Debug (Clique para expandir)
              </summary>
              <div className="bg-muted p-3 rounded text-xs space-y-2">
                <div><strong>Coleção vazia:</strong> {debugInfo.collectionEmpty ? 'Sim' : 'Não'}</div>
                <div><strong>Total de documentos:</strong> {debugInfo.totalDocs || 0}</div>
                <div><strong>Cursos processados:</strong> {debugInfo.processedCourses || 0}</div>
                <div><strong>Cursos com status "published":</strong> {debugInfo.publishedCount || 0}</div>
                <div><strong>Cursos com status "waitlist":</strong> {debugInfo.waitlistCount || 0}</div>
                <div><strong>Cursos sem status:</strong> {debugInfo.withoutStatusCount || 0}</div>
                {debugInfo.courses && (
                  <div>
                    <strong>Cursos encontrados:</strong>
                    <pre className="mt-2 overflow-auto max-h-32">
                      {JSON.stringify(debugInfo.courses, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // DEBUG: Mostrar cursos que serão renderizados
  console.log('🎯 Renderizando cursos:', courses);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const displayData = getCourseDisplayData(course);
          
          return (
            <Card key={course.id} className="overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <div className="aspect-video overflow-hidden border-2 border-border/30 rounded-t-lg shadow-sm">
                  {displayData.thumbnail === '/images/logo.png' ? (
                    // Logo centralizada em fundo cinza quando não há imagem
                    <div className="w-full h-full bg-muted flex items-center justify-center p-4">
                      <Image
                        src={displayData.thumbnail}
                        alt="MQMCrypto Logo"
                        width={200}
                        height={112}
                        className="w-auto h-auto max-w-full max-h-full object-contain"
                        priority
                        quality={100}
                        unoptimized
                      />
                    </div>
                  ) : (
                    // Imagem normal do curso
                    <Image
                      src={displayData.thumbnail}
                      alt={displayData.title}
                      width={400}
                      height={225}
                      className="w-auto h-auto max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
                <div className="p-4 pb-2">
                  <div className="mb-2">
                    <CardTitle className="text-lg">{displayData.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                <CardDescription className="mb-4 flex-1">
                  {displayData.description}
                </CardDescription>
                <div className="flex justify-center mt-auto">
                  {/* CTA INTELIGENTE BASEADO NO STATUS */}
                  {(() => {
                    console.log(`🔍 DEBUG CTA - Curso: ${displayData.title}, Status: ${displayData.status}, Tipo: ${typeof displayData.status}`);
                    
                    if (displayData.status === 'Published') {
                      return (
                        <Button asChild size="sm" className="bg-[#F7931A] text-gray-800 hover:bg-[#F7931A]/90 font-semibold">
                          <Link href="/login">
                            Ver Curso
                          </Link>
                        </Button>
                      );
                    } else if (displayData.status === 'Waitlist') {
                      return (
                        <Button asChild size="sm" className="bg-[#F7931A] text-gray-800 hover:bg-[#F7931A]/90 font-semibold">
                          <Link href="/signup">Lista de Espera</Link>
                        </Button>
                      );
                    } else {
                      return (
                        <Button asChild size="sm" className="bg-[#F7931A] text-gray-800 hover:bg-[#F7931A]/90 font-semibold" disabled>
                          Em Breve
                        </Button>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const t = useTranslations('HomePage');
  
  // Função para garantir que os campos obrigatórios tenham valores padrão
  const getCourseDisplayData = (course: any) => ({
    title: course.title ?? course.name ?? 'Curso sem título',
    description: course.description ?? course.summary ?? 'Descrição não disponível',
    thumbnail: course.thumbnail ?? course.image ?? course.coverImage ?? course.courseImage ?? '/images/logo.png',
    status: course.status ?? course.courseStatus ?? 'published',
    level: course.level ?? course.courseLevel ?? 'beginner',
    duration: course.duration ?? course.courseDuration ?? 'Não especificado',
    waitlistCount: course.waitlistCount ?? 0
  });
  
  // DEBUG: Log de debug para verificar se o componente está sendo renderizado
  useEffect(() => {
    console.log('🏠 === HOME PAGE RENDERIZADA ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌍 Locale atual:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
  }, []);
  
  // DEBUG: Log dos cursos e seus status
  const { courses, loading, error, debugInfo } = usePublicCourses();
  
  useEffect(() => {
    if (courses.length > 0) {
      console.log('🎯 === DEBUG CURSOS NA LANDING PAGE ===');
      courses.forEach((course, index) => {
        const displayData = getCourseDisplayData(course);
        console.log(`📋 Curso ${index + 1}:`, {
          id: course.id,
          title: displayData.title,
          status: displayData.status,
          statusType: typeof displayData.status,
          statusLength: displayData.status ? displayData.status.length : 'N/A',
          hasImage: displayData.thumbnail !== '/images/logo.png'
        });
      });
    }
  }, [courses]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-24 flex items-center">
        <Image 
          src="/images/logo.png"
          alt="MQMCrypto Logo"
          width={4000}
          height={2250}
          className="h-20 w-auto lg:h-32"
          priority
          quality={100}
          unoptimized
        />
        <nav className="ml-auto flex gap-2 sm:gap-4 lg:gap-6 items-center">
          <AuthStatus />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-20 lg:py-24 xl:py-28 -mt-[80px]">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[450px_1fr] lg:gap-6 xl:grid-cols-[550px_1fr]">
              <Image
                src="/images/pose.png"
                data-ai-hint="MQM Crypto pose"
                width="600"
                height="600"
                alt="MQM Crypto - Desvende o Futuro das Finanças"
                className="mx-auto w-full h-auto max-w-[400px] lg:max-w-[600px] object-contain -mt-[0px] lg:-mt-[50px] lg:order-first"
                priority
                quality={100}
                unoptimized
              />
              <div className="flex flex-col justify-center space-y-6 lg:space-y-8 -mt-[5px] lg:-mt-[170px] lg:order-last text-center lg:text-left">
                <div className="space-y-3 lg:space-y-4">
                  <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl lg:text-5xl xl:text-6xl/none leading-tight">
                    {t('heroTitle')}
                  </h1>
                  <p className="max-w-full lg:max-w-[500px] text-muted-foreground text-lg lg:md:text-xl xl:text-2xl leading-relaxed text-center lg:text-left">
                    {t('heroSubtitle')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button size="lg" className="px-6 py-4 lg:px-8 lg:py-6 text-base lg:text-lg font-semibold" asChild>
                    <Link href="/signup">{t('startFreeTrial')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-4 md:py-8 lg:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-3 lg:space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t('featuresTitle')}</div>
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl lg:text-5xl">{t('featuresTitle')}</h2>
                <p className="max-w-full lg:max-w-[900px] text-muted-foreground text-base lg:text-xl/relaxed xl:text-xl/relaxed px-4 lg:px-0">
                  {t('featuresSubtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 lg:gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-8 lg:mt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-1 text-center">
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-bold">{t(feature.title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(feature.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Consultoria Personalizada Banner */}
        <section className="w-full py-8 md:py-16 lg:py-20 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t('consultationTitle')}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('consultationSubtitle')}
                </p>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto mt-12">
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-card-foreground">{t('consultationIndividualTitle')}</h3>
                          <p className="text-muted-foreground">{t('consultationIndividualDesc')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{t('consultationFeature1')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{t('consultationFeature2')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{t('consultationFeature3')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="text-card-foreground">{t('consultationFeature4')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-6">
                      <div className="bg-muted rounded-xl p-6 border border-border">
                        <div className="text-4xl font-bold text-card-foreground mb-2">USD$39,00</div>
                        <div className="text-muted-foreground">{t('consultationPrice')}</div>
                      </div>
                      
                      <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        {t('consultationButton')}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      
                      <p className="text-sm text-muted-foreground">
                        {t('consultationSessionInfo')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="courses" className="w-full py-8 md:py-16 lg:py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t('coursesAvailableTitle')}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('coursesAvailableSubtitle')}
                </p>
              </div>
            </div>
            <div className="mt-12">
              <CoursesSection />
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
                              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                {t('pricingTitle')}
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('pricingSubtitle')}
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/dashboard/subscription">{t('viewSubscriptions')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Light */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Logo e Descrição */}
            <div className="md:col-span-2 space-y-4">
              <Image 
                src="/images/logo.png"
                alt="MQMCrypto Logo"
                width={2000}
                height={1125}
                className="h-24 w-auto"
                priority
                quality={100}
                unoptimized
              />
              <p className="text-muted-foreground max-w-md">
                {t('footerDescription')}
              </p>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('footerContact')}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@mqmcrypto.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>mqmcrypto.com</span>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('footerSocialMedia')}</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://x.com/mqmcrypto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`${t('footerFollowUs')} X (Twitter)`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.youtube.com/channel/UCq8MNoheHr387J6RnWNLURQ/join" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={t('footerYouTube')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/mqm_racional/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={t('footerInstagram')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Linha de Copyright */}
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MQM CRYPTO. {t('footerRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
