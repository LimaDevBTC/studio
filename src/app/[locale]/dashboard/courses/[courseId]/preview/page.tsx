"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, BookOpen, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: string;
  price?: number;
  duration?: number;
  lessons?: number;
  level?: string;
  instructor?: string;
  tags?: string[];
}

export default function CoursePreviewPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWaitlist, setIsInWaitlist] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      checkWaitlistStatus();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do curso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do curso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWaitlistStatus = async () => {
    if (!user) return;
    
    try {
      // Aqui você implementaria a verificação se o usuário já está na lista de espera
      // Por enquanto, vamos simular como false
      setIsInWaitlist(false);
    } catch (error) {
      console.error('Erro ao verificar status da lista de espera:', error);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para entrar na lista de espera.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Aqui você implementaria a lógica para adicionar o usuário à lista de espera
      // Por enquanto, vamos simular o sucesso
      setIsInWaitlist(true);
      toast({
        title: "Sucesso!",
        description: "Você foi adicionado à lista de espera! Entraremos em contato quando o curso estiver disponível.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível entrar na lista de espera. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Curso não encontrado</h1>
        <p className="text-muted-foreground mt-2">O curso que você está procurando não existe ou foi removido.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/courses">Voltar aos Cursos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Cursos
          </Link>
        </Button>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Lista de Espera
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagem do curso */}
          <div className="relative w-full h-64 lg:h-80 rounded-lg overflow-hidden">
            <Image 
              src={course.imageUrl} 
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Título e descrição */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Detalhes do curso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sobre este Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Duração: {course.duration || 'A definir'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {course.lessons || 'Múltiplas'} lições
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Nível: {course.level || 'Todos os níveis'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Instrutor: {course.instructor || 'MQMCrypto'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* O que você vai aprender */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">O que você vai aprender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Fundamentos sólidos de criptomoedas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Estratégias de investimento comprovadas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Análise técnica e fundamental</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Gestão de risco e portfolio</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com CTA */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-center">Lista de Espera</CardTitle>
              <CardDescription className="text-center">
                Este curso está em desenvolvimento. Entre na lista de espera para ser notificado quando estiver disponível!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {course.price ? `$${course.price}` : 'Preço a definir'}
                </p>
                <p className="text-sm text-muted-foreground">Quando disponível</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Notificação por email</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Acesso prioritário</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Desconto especial</span>
                </div>
              </div>

              <Button 
                onClick={handleJoinWaitlist}
                disabled={isInWaitlist}
                className="w-full"
                size="lg"
              >
                {isInWaitlist ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Na Lista de Espera
                  </>
                ) : (
                  <>
                    Entrar na Lista de Espera
                  </>
                )}
              </Button>

              {isInWaitlist && (
                <p className="text-xs text-center text-green-600">
                  ✅ Você foi adicionado à lista de espera!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
