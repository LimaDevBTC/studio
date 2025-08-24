
"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import SubscriptionAlert from "@/components/SubscriptionAlert";
import { Progress } from '@/components/ui/progress';
import { BookOpen } from 'lucide-react';


interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aiHint: string;
  status?: string;
}

interface InProgressCourse extends Course {
    progress: number;
}


export default function DashboardPage() {
  const { user, userData } = useAuth();
  const t = useTranslations('DashboardPage');
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<InProgressCourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
          setLoading(false);
          return;
      }
      setLoading(true);

      try {
        // Fetch In-Progress Courses
        const progressQuery = query(collection(db, `users/${user.uid}/courseProgress`));
        const progressSnapshot = await getDocs(progressQuery);

        if (!progressSnapshot.empty) {
            const coursesWithProgress = await Promise.all(progressSnapshot.docs.map(async (progressDoc) => {
                const progressData = progressDoc.data();
                const courseRef = doc(db, 'courses', progressData.courseId);
                const courseSnap = await getDoc(courseRef);

                if (!courseSnap.exists()) return null;

                const lessonsCollectionRef = collection(db, "courses", progressData.courseId, "lessons");
                const lessonsSnap = await getDocs(lessonsCollectionRef);
                const totalLessons = lessonsSnap.size;
                const completedLessons = progressData.completedLessons?.length || 0;
                const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                const courseData = courseSnap.data();
                return {
                    id: courseSnap.id,
                    title: courseData.title || "Untitled Course",
                    description: courseData.description || "No description.",
                    imageUrl: courseData.imageUrl || "https://placehold.co/600x400.png",
                    aiHint: courseData.aiHint || "abstract",
                    progress: Math.round(progressPercentage)
                };
            }));
            setInProgressCourses(coursesWithProgress.filter(c => c !== null) as InProgressCourse[]);
        }

        // Fetch ALL Available Courses (Published + Waitlist) - SEM FILTRAR por acesso do usuário
        // Primeiro, buscar cursos Published
        const publishedQuery = query(
          collection(db, "courses"), 
          where("status", "==", "Published")
        );
        const publishedSnapshot = await getDocs(publishedQuery);
        
        // Depois, buscar cursos Waitlist
        const waitlistQuery = query(
          collection(db, "courses"), 
          where("status", "==", "Waitlist")
        );
        const waitlistSnapshot = await getDocs(waitlistQuery);
        
        // Combinar TODOS os cursos disponíveis (sem filtrar por acesso)
        const allAvailableCourses = [
          ...publishedSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, status: "Published" })),
          ...waitlistSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, status: "Waitlist" }))
        ];
        
        // Mapear para o formato correto (sem filtrar por acesso)
        const availableCoursesList = allAvailableCourses
          .map(course => ({
            id: course.id,
            title: (course as any).title || "Untitled Course",
            description: (course as any).description || "No description available.",
            imageUrl: (course as any).imageUrl || "https://placehold.co/600x400.png",
            aiHint: (course as any).aiHint || "abstract",
            status: course.status,
          }));
        
        // Limitar a 6 cursos para o grid 3x2
        setRecommendedCourses(availableCoursesList.slice(0, 6));

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Alerta de Status da Assinatura */}
      <SubscriptionAlert />
      
      {/* Header de Boas-vindas */}
      <div>
        <h1 className="text-3xl font-bold">{t('welcome', { name: user?.displayName?.split(' ')[0] || 'User' })}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* NOVO LAYOUT: Grid 3x2 Consistente - Sempre 3 colunas no desktop */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        
        {/* PRIMEIRA LINHA: Continue Assistindo + Cursos Recomendados */}
        
        {/* Card 1: Continue Assistindo (APENAS se houver cursos em progresso) */}
        {loading ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Skeleton className="rounded-t-lg aspect-video" />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : inProgressCourses.length > 0 ? (
          // MOSTRAR CARD "Continue assistindo" apenas se houver cursos em progresso
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Image 
                src={inProgressCourses[0].imageUrl} 
                data-ai-hint={inProgressCourses[0].aiHint}
                alt={inProgressCourses[0].title} 
                width={600} 
                height={400} 
                className="rounded-t-lg aspect-video object-cover" 
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{inProgressCourses[0].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{inProgressCourses[0].description}</p>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">PROGRESSO</span>
                  <span className="text-xs font-bold text-primary">{inProgressCourses[0].progress}%</span>
                </div>
                <Progress value={inProgressCourses[0].progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/dashboard/courses/${inProgressCourses[0].id}` as any}>
                  {t('resumeCourse')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : null}
        {/* NÃO MOSTRAR PLACEHOLDER quando não há cursos em progresso */}

        {/* Card 2: Primeiro Curso Recomendado */}
        {loading ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Skeleton className="rounded-t-lg aspect-video" />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : recommendedCourses.length > 0 ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Image 
                src={recommendedCourses[0].imageUrl} 
                data-ai-hint={recommendedCourses[0].aiHint}
                alt={recommendedCourses[0].title} 
                width={600} 
                height={400} 
                className="rounded-t-lg aspect-video object-cover" 
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{recommendedCourses[0].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{recommendedCourses[0].description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {recommendedCourses[0].status === "Waitlist" ? (
                  <Link href={`/dashboard/courses/${recommendedCourses[0].id}/preview` as any}>
                    {t('viewPreview')}
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${recommendedCourses[0].id}` as any}>
                    {t('viewCourse')}
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <div className="rounded-t-lg aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando...</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )}

        {/* Card 3: Segundo Curso Recomendado */}
        {loading ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Skeleton className="rounded-t-lg aspect-video" />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : recommendedCourses.length > 1 ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Image 
                src={recommendedCourses[1].imageUrl} 
                data-ai-hint={recommendedCourses[1].aiHint}
                alt={recommendedCourses[1].title} 
                width={600} 
                height={400} 
                className="rounded-t-lg aspect-video object-cover" 
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{recommendedCourses[1].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{recommendedCourses[1].description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {recommendedCourses[1].status === "Waitlist" ? (
                  <Link href={`/dashboard/courses/${recommendedCourses[1].id}/preview` as any}>
                    {t('viewPreview')}
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${recommendedCourses[1].id}` as any}>
                    {t('viewCourse')}
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <div className="rounded-t-lg aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando...</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )}

        {/* SEGUNDA LINHA: Mais Cursos Recomendados */}
        
        {/* Card 4: Terceiro Curso Recomendado */}
        {loading ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Skeleton className="rounded-t-lg aspect-video" />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : recommendedCourses.length > 2 ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Image 
                src={recommendedCourses[2].imageUrl} 
                data-ai-hint={recommendedCourses[2].aiHint}
                alt={recommendedCourses[2].title} 
                width={600} 
                height={400} 
                className="rounded-t-lg aspect-video object-cover" 
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{recommendedCourses[2].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{recommendedCourses[2].description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {recommendedCourses[2].status === "Waitlist" ? (
                  <Link href={`/dashboard/courses/${recommendedCourses[2].id}/preview` as any}>
                    {t('viewPreview')}
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${recommendedCourses[2].id}` as any}>
                    {t('viewCourse')}
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <div className="rounded-t-lg aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando...</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )}

        {/* Card 5: Quarto Curso Recomendado */}
        {loading ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Skeleton className="rounded-t-lg aspect-video" />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : recommendedCourses.length > 3 ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Image 
                src={recommendedCourses[3].imageUrl} 
                data-ai-hint={recommendedCourses[3].aiHint}
                alt={recommendedCourses[3].title} 
                width={600} 
                height={400} 
                className="rounded-t-lg aspect-video object-cover" 
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{recommendedCourses[3].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{recommendedCourses[3].description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {recommendedCourses[3].status === "Waitlist" ? (
                  <Link href={`/dashboard/courses/${recommendedCourses[3].id}/preview` as any}>
                    {t('viewPreview')}
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${recommendedCourses[3].id}` as any}>
                    {t('viewCourse')}
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <div className="rounded-t-lg aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando...</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )}

        {/* Card 6: Quinto Curso Recomendado */}
        {loading ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Skeleton className="rounded-t-lg aspect-video" />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : recommendedCourses.length > 4 ? (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <Image 
                src={recommendedCourses[4].imageUrl} 
                data-ai-hint={recommendedCourses[4].aiHint}
                alt={recommendedCourses[4].title} 
                width={600} 
                height={400} 
                className="rounded-t-lg aspect-video object-cover" 
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{recommendedCourses[4].title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{recommendedCourses[4].description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {recommendedCourses[4].status === "Waitlist" ? (
                  <Link href={`/dashboard/courses/${recommendedCourses[4].id}/preview` as any}>
                    {t('viewPreview')}
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${recommendedCourses[4].id}` as any}>
                    {t('viewCourse')}
                  </Link>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="p-0">
              <div className="rounded-t-lg aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando...</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )}

      </div>


    </div>
  )
}
