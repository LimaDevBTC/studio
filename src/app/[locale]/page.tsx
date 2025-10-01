"use client";

import {useTranslations} from 'next-intl';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ShieldCheck, BarChart, Users, CheckCircle, ArrowRight, Clock, Users as UsersIcon, Mail, Globe, Phone } from "lucide-react";
import { IconUserCheck, IconShieldCheck, IconBrain, IconTrendingUp, IconSchool, IconKey } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthStatus } from "@/components/AuthStatus";
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/navigation';
import { usePublicCourses } from "@/hooks/use-public-courses";
import { useEffect } from 'react';
import { PublicCourse } from '@/hooks/use-public-courses';


const features = [
  {
    icon: <IconUserCheck className="w-12 h-12 text-primary" stroke={2} />,
    title: "featureBeginnerTitle",
    description: "featureBeginnerDesc",
    level: "INICIANTE",
    gradient: "from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/30",
    iconBg: "bg-yellow-500/10",
  },
  {
    icon: <IconShieldCheck className="w-12 h-12 text-primary" stroke={2} />,
    title: "featureIntermediateTitle",
    description: "featureIntermediateDesc",
    level: "INTERMEDIÁRIO",
    gradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconBg: "bg-orange-500/10",
  },
  {
    icon: <IconTrendingUp className="w-12 h-12 text-primary" stroke={2} />,
    title: "featureAdvancedTitle",
    description: "featureAdvancedDesc",
    level: "AVANÇADO",
    gradient: "from-red-500/20 to-red-600/20",
    borderColor: "border-red-500/30",
    iconBg: "bg-red-500/10",
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
  const { courses, loading, error } = usePublicCourses();
  const t = useTranslations('HomePage');


  // Função para garantir que os campos obrigatórios tenham valores padrão
  const getCourseDisplayData = (course: PublicCourse) => {
    return {
      title: course.title || 'Curso sem título',
      description: course.description || 'Descrição não disponível',
      thumbnail: course.thumbnail || '/images/logo.png',
      status: course.status || 'Published',
      level: course.level || 'Iniciante',
      duration: course.duration || 'Não definido',
      waitlistCount: course.waitlistCount || 0,
      category: course.category || 'Geral'
    };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/50 border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Carregando cursos...</h3>
          <p className="text-muted-foreground">
            Aguarde enquanto preparamos os melhores cursos para você.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/50 border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar cursos</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
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
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const displayData = getCourseDisplayData(course);
          
          return (
            <div 
              key={course.id} 
              className="group relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 flex flex-col h-full"
            >
              {/* Imagem do curso */}
              <div className="relative flex-shrink-0">
                <div className="aspect-video overflow-hidden rounded-t-2xl">
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                
                {/* Badge de status */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    className={`${
                      displayData.status === 'Published' 
                        ? 'bg-primary text-primary-foreground group-hover:bg-primary/90' 
                        : 'bg-white/10 text-white backdrop-blur-sm border-white/20'
                    } transition-colors duration-300`}
                  >
                    {displayData.status === 'Published' ? t('courseAvailable') : t('courseComingSoon')}
                  </Badge>
                </div>
              </div>
              
              {/* Conteúdo do card */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors duration-300 leading-tight">
                    {displayData.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 text-sm line-clamp-2">
                  {displayData.description}
                </p>
                </div>
                
                <div className="mt-6 space-y-4">
                  {(() => {
                    if (displayData.status === 'Published') {
                      return (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                          onClick={() => window.open(`https://wa.me/5511977486383?text=Tenho%20interesse%20no%20curso%20${encodeURIComponent(displayData.title)}%20mQm`, '_blank')}
                        >
                          {t('courseStartNow')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      );
                    }
                    
                    if (displayData.status === 'Waitlist' || displayData.status === 'waitlist') {
                      return (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                          onClick={() => window.open(`https://wa.me/5511977486383?text=Tenho%20interesse%20no%20curso%20${encodeURIComponent(displayData.title)}%20mQm`, '_blank')}
                        >
                          {t('courseStartNow')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      );
                    }
                    
                    // Status padrão
                    return (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                        onClick={() => window.open(`https://wa.me/5511977486383?text=Tenho%20interesse%20no%20curso%20${encodeURIComponent(displayData.title)}%20mQm`, '_blank')}
                      >
                        Fale com o mQm sobre este curso
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const t = useTranslations('HomePage');
  
  // Função para garantir que os campos obrigatórios tenham valores padrão
  const getCourseDisplayData = (course: PublicCourse) => {
    return {
      title: course.title || 'Curso sem título',
      description: course.description || 'Descrição não disponível',
      thumbnail: course.thumbnail || '/images/logo.png',
      status: course.status || 'Published',
      level: course.level || 'Iniciante',
      duration: course.duration || 'Não definido',
      waitlistCount: course.waitlistCount || 0,
      category: course.category || 'Geral'
    };
  };
  
  const { courses, loading, error } = usePublicCourses();
  
  return (
    <div 
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: '#0a0a0a'
      }}
    >
      <header className="header-fixed w-full">
        <div className="px-4 lg:px-6 h-20 lg:h-24 flex items-center justify-between relative">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          <nav className="ml-auto flex gap-2 sm:gap-4 lg:gap-6 items-center relative">
            <AuthStatus />
          </nav>
        </div>
      </header>
              <main className="flex-1 pt-20 lg:pt-4">
        <section
          className="w-full py-8 md:py-12 lg:py-16 xl:py-20 relative bg-no-repeat overflow-hidden"
          style={{
            backgroundColor: '#0a0a0a'
          }}
        >
          {/* Construção do império usando bg.png - múltiplas camadas de baixo para cima */}
          
          {/* Camada 1: Fundação - base sólida (90% a 100%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildFoundationLayer 2s ease-out forwards'
            }}
          />
          
          {/* Camada 2: Muralhas de base (75% a 90%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildBaseWallsLayer 2s ease-out forwards 0.5s'
            }}
          />
          
          {/* Camada 3: Muralhas laterais (55% a 75%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildWallsLayer 2s ease-out forwards 1s'
            }}
          />
          
          {/* Camada 4: Torres de base (40% a 55%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildBaseTowersLayer 2s ease-out forwards 1.5s'
            }}
          />
          
          {/* Camada 5: Torres laterais (20% a 40%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildTowersLayer 2s ease-out forwards 2s'
            }}
          />
          
          {/* Camada 6: Torre central - base (10% a 20%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildCentralTowerBaseLayer 2s ease-out forwards 2.5s'
            }}
          />
          
          {/* Camada 7: Torre central - corpo (5% a 10%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildCentralTowerLayer 2s ease-out forwards 3s'
            }}
          />
          
          {/* Camada 8: Detalhes arquitetônicos (2% a 5%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildArchitecturalDetailsLayer 2s ease-out forwards 3.5s'
            }}
          />
          
          {/* Camada 9: Acabamentos finais (0% a 2%) */}
          <div 
            className="absolute inset-0 md:bg-[url('/images/bg.png')] bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'center -100px',
              backgroundSize: 'cover',
              animation: 'buildFinalDetailsLayer 2s ease-out forwards 4s'
            }}
          />
          
          {/* ===== CAMADAS MOBILE ===== */}
          {/* Mobile: Camada 1: Fundação - base sólida (90% a 100%) - usando borda direita da imagem */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildFoundationLayerMobile 5s ease-out forwards'
            }}
          />
          
          {/* Mobile: Camada 2: Muralhas de base (75% a 90%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildBaseWallsLayerMobile 5s ease-out forwards 0.1s'
            }}
          />
          
          {/* Mobile: Camada 3: Muralhas laterais (55% a 75%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildWallsLayerMobile 5s ease-out forwards 0.2s'
            }}
          />
          
          {/* Mobile: Camada 4: Torres de base (40% a 55%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildBaseTowersLayerMobile 5s ease-out forwards 0.3s'
            }}
          />
          
          {/* Mobile: Camada 5: Torres laterais (20% a 40%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildTowersLayerMobile 5s ease-out forwards 0.4s'
            }}
          />
          
          {/* Mobile: Camada 6: Torre central - base (10% a 20%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildCentralTowerBaseLayerMobile 5s ease-out forwards 0.5s'
            }}
          />
          
          {/* Mobile: Camada 7: Torre central - corpo (5% a 10%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildCentralTowerLayerMobile 5s ease-out forwards 0.6s'
            }}
          />
          
          {/* Mobile: Camada 8: Detalhes arquitetônicos (2% a 5%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildArchitecturalDetailsLayerMobile 5s ease-out forwards 0.7s'
            }}
          />
          
          {/* Mobile: Camada 9: Acabamentos finais (0% a 2%) */}
          <div 
            className="absolute inset-0 bg-[url('/images/bg.png')] md:hidden bg-no-repeat bg-cover opacity-0"
            style={{
              backgroundPosition: 'right 0px',
              backgroundSize: 'cover',
              animation: 'buildFinalDetailsLayerMobile 5s ease-out forwards 0.8s'
            }}
          />
          
          <div className="container px-4 md:px-6 relative z-20">
            <div className="grid gap-6 lg:grid-cols-[450px_1fr] lg:gap-6 xl:grid-cols-[550px_1fr]">
              <Image
                src="/images/pose.png"
                data-ai-hint="MQM Crypto pose"
                width="500"
                height="500"
                alt="MQM Crypto - Desvende o Futuro das Finanças"
                className="mx-auto w-full h-auto max-w-[300px] lg:max-w-[500px] object-contain -mt-[0px] lg:mt-8 lg:order-first"
                style={{
                  animation: 'fadeIn 0.3s ease-out 0s both'
                }}
                priority
                quality={100}
                unoptimized
              />
              <div 
                className="flex flex-col justify-center space-y-6 lg:space-y-8 -mt-[240px] lg:-mt-[220px] lg:order-last text-center lg:text-left lg:-ml-8"
                style={{
                  animation: 'fadeIn 0.3s ease-out 0.1s both',
                  transform: 'translateY(-25px)'
                }}
              >
                <div className="space-y-3 lg:space-y-4">
                  <h1 
                    className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl leading-tight"
                    style={{
                      animation: 'fadeIn 0.3s ease-out 0.2s both'
                    }}
                  >
                    {t('heroTitle')}
                  </h1>
                  <p 
                    className="max-w-full lg:max-w-[600px] text-muted-foreground text-2xl lg:text-3xl xl:text-4xl leading-relaxed text-center lg:text-left"
                    style={{
                      animation: 'fadeIn 0.5s ease-out 0.3s both'
                    }}
                  >
                    {t('heroSubtitle')}
                  </p>
                </div>
                <div 
                  className="flex flex-col gap-3 min-[400px]:flex-row justify-center lg:justify-start"
                  style={{
                    animation: 'fadeIn 0.5s ease-out 0.4s both',
                    transform: 'translateY(-10px)'
                  }}
                >
                  <Button 
                    size="lg" 
                    className="px-6 py-4 lg:px-8 lg:py-6 text-xl lg:text-2xl font-semibold"
                    onClick={() => window.open('https://wa.me/5511977486383?text=Quero%20a%20consultoria%20exclusiva%20com%20você%20mQm.', '_blank')}
                  >
                    {t('startFreeTrial')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consultoria Personalizada Banner */}
        <section 
          className="w-full py-8 md:py-16 lg:py-20"
          style={{
            backgroundColor: '#111111'
          }}
        >
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
              <div className="group relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/5 p-8 hover:border-orange-500/20 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-primary group-hover:text-primary/80 transition-colors duration-300">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors duration-300 leading-tight">
                          {t('consultationIndividualTitle')}
                        </h3>
                        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 text-sm mt-2">
                          {t('consultationIndividualDesc')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">{t('consultationFeature1')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">{t('consultationFeature2')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">{t('consultationFeature3')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">{t('consultationFeature4')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-6">
                    <div className="bg-white/[0.02] rounded-xl p-6 border border-white/5 group-hover:border-orange-500/20 transition-all duration-300">
                      <div className="text-4xl font-bold text-primary group-hover:text-primary/80 transition-colors duration-300 mb-2">$39.00</div>
                      <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">{t('consultationPrice')}</div>
                    </div>
                    
                    <Button 
                      size="lg" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => window.open('https://wa.me/5511977486383?text=Quero%20a%20consultoria%20exclusiva%20com%20você%20mQm.', '_blank')}
                    >
                      {t('consultationButton')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {t('consultationSessionInfo')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section 
          id="features" 
          className="w-full py-16 md:py-20 lg:py-24"
          style={{
            backgroundColor: '#0a0a0a'
          }}
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl xl:text-6xl">
                  Temos o que você precisa
                </h2>
                <p className="max-w-3xl mx-auto text-muted-foreground text-lg lg:text-xl xl:text-2xl leading-relaxed">
                  {t('featuresSubtitle')}
                </p>
              </div>
            </div>
            
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/[0.02] border border-white/5 p-8 hover:border-orange-500/20 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
                      {feature.level}
                    </span>
                  </div>
                  
                  {/* Icon - Apple style minimal */}
                  <div className="relative z-10 mb-6">
                    <div className="text-primary group-hover:text-primary/80 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Content - Apple style clean typography */}
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-semibold text-primary group-hover:text-primary transition-colors duration-300 leading-tight">
                      {t(feature.title)}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 text-sm">
                      {t(feature.description)}
                    </p>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </section>

        <section 
          id="courses" 
          className="w-full py-8 md:py-16 lg:py-20"
          style={{
            backgroundColor: '#111111'
          }}
        >
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
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.open('https://wa.me/5511977486383?text=Quero%20contratar%20uma%20mentoria%20completa%20e%20exclusiva%20com%20você%20mQm.', '_blank')}
              >
                {t('viewSubscriptions')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Light */}
      <footer 
        className="border-t border-border"
        style={{
          backgroundColor: '#0a0a0a'
        }}
      >
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
