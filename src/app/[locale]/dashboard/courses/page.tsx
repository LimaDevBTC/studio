
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from '@/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aiHint: string;
  price: number;
  status: string;
  progress?: number;
  totalLessons?: number;
}

export default function MyCoursesPage() {
  const t = useTranslations('DashboardLayout');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData, loading: authLoading } = useAuth();

  // Lógica de acesso será controlada pelo hook useCourseAccess

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // IMPORTANTE: Buscar apenas cursos que o usuário TEM ACESSO
        // 1. Cursos comprados individualmente
        const userAccessQuery = query(
          collection(db, "userCourseAccess"), 
          where("userId", "==", user.uid), 
          where("status", "==", "active")
        );
        const userAccessSnapshot = await getDocs(userAccessQuery);
        const userCourseIds = userAccessSnapshot.docs.map(doc => doc.data().courseId);
        
        // 2. Verificar se tem assinatura ativa (dá acesso a todos os cursos)
        let hasActiveSubscription = false;
        if (userData?.plan && userData.plan !== 'Free Trial') {
          // Verificar se a assinatura não expirou
          const now = new Date();
          const subscriptionEnd = userData.subscriptionEnd?.toDate?.() || new Date(0);
          hasActiveSubscription = subscriptionEnd > now;
        }
        
        // 3. Se tem assinatura ativa, buscar todos os cursos disponíveis
        // Se não tem, buscar apenas os cursos comprados individualmente
        let coursesToFetch = userCourseIds;
        
        if (hasActiveSubscription) {
          // Buscar todos os cursos Published e Waitlist
          const allCoursesQuery = query(
            collection(db, "courses"),
            where("status", "in", ["Published", "Waitlist"])
          );
          const allCoursesSnapshot = await getDocs(allCoursesQuery);
          coursesToFetch = allCoursesSnapshot.docs.map(doc => doc.id);
        }
        
        // 4. Buscar dados dos cursos acessíveis
        const coursesListPromises = coursesToFetch.map(async (courseId) => {
          const courseRef = doc(db, "courses", courseId);
          const courseSnap = await getDoc(courseRef);
          
          if (!courseSnap.exists()) return null;
          
          const courseData = courseSnap.data();
          
          // Buscar progresso do usuário neste curso
          const progressRef = doc(db, "users", user.uid, "courseProgress", courseId);
          const progressSnap = await getDoc(progressRef);
          
          // Contar total de aulas
          const lessonsCollectionRef = collection(db, "courses", courseId, "lessons");
          const lessonsSnap = await getDocs(lessonsCollectionRef);
          const totalLessons = lessonsSnap.size;
          
          let progressPercentage = 0;
          if (progressSnap.exists()) {
            const progressData = progressSnap.data();
            const completedLessons = progressData.completedLessons?.length || 0;
            if (totalLessons > 0) {
              progressPercentage = Math.round((completedLessons / totalLessons) * 100);
            }
          }
          
          return {
            id: courseId,
            title: courseData.title || "Untitled Course",
            description: courseData.description || "No description available.",
            imageUrl: courseData.imageUrl || "https://placehold.co/600x400.png",
            aiHint: courseData.aiHint || "abstract",
            price: courseData.price || 0,
            status: courseData.status || "Draft",
            progress: progressPercentage,
            totalLessons: totalLessons
          };
        });
        
        const coursesList = await Promise.all(coursesListPromises);
        const validCourses = coursesList.filter(course => course !== null) as Course[];
        
        // DEBUG: Log dos cursos encontrados
        console.log('🔍 === CURSOS DO USUÁRIO ===');
        console.log('📊 Total de cursos acessíveis:', validCourses.length);
        console.log('👤 Usuário tem assinatura ativa?', hasActiveSubscription);
        console.log('🎯 IDs dos cursos:', coursesToFetch);
        
        setCourses(validCourses);
      } catch (error) {
        console.error("Erro ao buscar cursos do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user, userData]);

  const getButtonText = (progress?: number) => {
    if (progress === undefined || progress === 0) return "Iniciar Curso";
    if (progress === 100) return "Revisar Curso";
    return "Continuar Curso";
  }

  const isLoading = loading || authLoading;

  return (
    <div className="space-y-8">
      <div>
                    <h1 className="text-3xl font-bold">{t('navMyCourses')}</h1>
        <p className="text-muted-foreground">{t('coursesDescription')}</p>
        
        {/* DEBUG: Mostrar quantidade de cursos */}
        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
          <span className="font-medium">DEBUG:</span> {courses.length} cursos carregados
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className='p-0'>
                <Skeleton className="rounded-t-lg aspect-video" />
              </CardHeader>
              <CardContent className="flex-1 pt-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-2 w-full mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map(course => (
              <Card key={course.id} className="flex flex-col overflow-hidden">
                <CardHeader className='p-0 relative'>
                   {course.progress === 100 && (
                     <Badge className="absolute top-2 right-2 z-10 gap-1 pl-2 pr-3">
                        <CheckCircle className="h-3 w-3"/>
                        Concluído!
                     </Badge>
                   )}

                  <Image src={course.imageUrl} data-ai-hint={course.aiHint} alt={course.title} width={600} height={400} className="rounded-t-lg aspect-video object-cover" />
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-[40px]">{course.description}</p>
                   {course.totalLessons !== undefined && course.totalLessons > 0 && (
                     <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-muted-foreground">PROGRESSO</span>
                            <span className="text-xs font-bold text-primary">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                     </div>
                   )}
                </CardContent>
                <CardFooter>
                  {course.status === "Waitlist" ? (
                    <Button className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Lista de Espera
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/courses/${course.id}`}>{getButtonText(course.progress)}</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : (
        <Card className="mt-8 text-center max-w-lg mx-auto">
          <CardHeader>
             <div className="flex justify-center mb-4">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary"/>
               </div>
             </div>
                            <CardTitle className="text-2xl">Desbloqueie todos os cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você está atualmente no Teste Gratuito. Para ter acesso aos nossos cursos premium, por favor, atualize seu plano.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button asChild className="w-full">
              <Link href="/dashboard/subscription">Ver Planos de Assinatura</Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/dashboard">Voltar ao Painel</Link>
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
