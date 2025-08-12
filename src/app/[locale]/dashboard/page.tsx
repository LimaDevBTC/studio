
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
import { Progress } from '@/components/ui/progress';


interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aiHint: string;
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

        // Fetch Recommended Courses
        const recommendedQuery = query(collection(db, "courses"), where("status", "==", "Published"), limit(4));
        const recommendedSnapshot = await getDocs(recommendedQuery);
        const recommendedList = recommendedSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled Course",
            description: data.description || "No description available.",
            imageUrl: data.imageUrl || "https://placehold.co/600x400.png",
            aiHint: data.aiHint || "abstract",
          };
        });
        setRecommendedCourses(recommendedList);

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
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('welcome', { name: user?.displayName?.split(' ')[0] || 'User' })}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            {loading ? (
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                 </Card>
            ) : inProgressCourses.length > 0 ? (
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('continueWatching')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {inProgressCourses.map(course => (
                        <div key={course.id} className="flex items-center gap-4">
                           <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
                             <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                           </div>
                           <div className="flex-1">
                             <p className="font-semibold truncate">{course.title}</p>
                             <Progress value={course.progress} className="h-2 mt-1" />
                             <p className="text-xs text-muted-foreground mt-1">{t('progressComplete', {progress: course.progress})}</p>
                             <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                                <Link href={`/dashboard/courses/${course.id}`}>{t('resumeCourse')}</Link>
                             </Button>
                           </div>
                         </div>
                    ))}
                    </CardContent>
                </Card>
            ) : null}

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{t('mySubscription')}</CardTitle>
                <CardDescription>{userData?.plan ? `You are on the ${userData.plan} plan.` : t('subscriptionDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{t('subscriptionRenewal')}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" asChild>
                    <Link href="/dashboard/subscription">{t('manageSubscription')}</Link>
                </Button>
              </CardFooter>
            </Card>
        </div>
        
        <section className="lg:col-span-2">
            <h2 className="text-2xl font-semibold font-headline mb-4">{t('recommendedForYou')}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
                {loading ? (
                   Array.from({ length: 2 }).map((_, index) => (
                    <Card key={index} className="flex flex-col">
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
                   ))
                ) : recommendedCourses.length > 0 ? (
                    recommendedCourses.map(course => (
                        <Card key={course.id} className="flex flex-col">
                            <CardHeader className='p-0'>
                                <Image src={course.imageUrl} data-ai-hint={course.aiHint} alt={course.title} width={600} height={400} className="rounded-t-lg aspect-video object-cover" />
                            </CardHeader>
                            <CardContent className="flex-1 pt-6">
                                <h3 className="font-bold text-lg">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/courses/${course.id}`}>{t('viewCourse')}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-10">No recommended courses available right now.</p>
                )}
            </div>
        </section>
      </div>
    </div>
  )
}
