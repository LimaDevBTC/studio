
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useCourseAccess } from "@/hooks/use-course-access";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle2, Lock, Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import UnifiedPaymentModal from "@/components/UnifiedPaymentModal";
import { WaitlistButton } from "@/components/WaitlistButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CourseProgress } from "@/types/progress";

interface Lesson {
    id: string;
    title: string;
    description: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    aiHint: string;
    lessons: Lesson[];
    price: number;
    status?: "Published" | "Draft" | "Waitlist";
}

export default function CourseOverviewPage() {
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;

    // Verificar acesso usando o hook adequado
    const { hasAccess, isLoading: accessLoading } = useCourseAccess(courseId);

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            if (!courseId || !user) return;
            setIsLoading(true);
            try {
                const courseRef = doc(db, "courses", courseId);
                const courseSnap = await getDoc(courseRef);

                if (courseSnap.exists()) {
                    const courseData = courseSnap.data();

                    const lessonsCollectionRef = collection(db, "courses", courseId, "lessons");
                    const lessonsSnap = await getDocs(lessonsCollectionRef);
                    const lessonsList = lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));

                    const fetchedCourse = {
                        id: courseSnap.id,
                        title: courseData.title,
                        description: courseData.description,
                        imageUrl: courseData.imageUrl,
                        aiHint: courseData.aiHint,
                        lessons: lessonsList,
                        price: courseData.price || 0,
                        status: courseData.status || "Published",
                    };
                    setCourse(fetchedCourse);

                    const progressRef = doc(db, "users", user.uid, "courseProgress", courseId);
                    const progressSnap = await getDoc(progressRef);
                    if (progressSnap.exists()) {
                        const progressData = progressSnap.data() as CourseProgress;
                        setCompletedLessons(progressData.completedLessons || []);
                    }
                } else {
                    console.error("Course not found");
                }
            } catch (error) {
                console.error("Failed to fetch course:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && !authLoading) {
            fetchCourseAndProgress();
        }
    }, [courseId, user, authLoading]);

    const firstLessonId = course?.lessons[0]?.id;

    if (isLoading || authLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-4">
                         <Skeleton className="h-12 w-full" />
                         <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!course) {
        return <div>Course not found.</div>;
    }

    return (
        <div className="space-y-6">
             <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
             </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                     <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                        <Image 
                            src={course.imageUrl || 'https://placehold.co/600x400.png'} 
                            alt={course.title} 
                            fill
                            className="object-cover"
                            data-ai-hint={course.aiHint}
                        />
                     </div>
                     <h1 className="text-3xl font-bold">{course.title}</h1>
                     <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold mb-4">Course Content</h2>
                            

                            
                            {course.status === "Waitlist" ? (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                                            <p className="text-sm text-orange-800 font-medium">
                                                Este curso está em desenvolvimento
                                            </p>
                                            <p className="text-xs text-orange-700 mt-1">
                                                Entre na lista de espera para ser notificado quando estiver disponível
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <WaitlistButton
                                        courseId={course.id}
                                        courseTitle={course.title}
                                        coursePrice={course.price}
                                    />
                                </div>
                            ) : hasAccess ? (
                                firstLessonId ? (
                                    <Button asChild className="w-full">
                                        <Link href={`/dashboard/courses/${course.id}/lesson/${firstLessonId}` as any}>
                                            <PlayCircle className="mr-2 h-5 w-5"/> Start Course
                                        </Link>
                                    </Button>
                                ) : <p className="text-sm text-muted-foreground">No lessons yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            This course requires payment to access
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <span className="text-2xl font-bold text-primary">
                                                ${course.price}
                                            </span>
                                            <span className="text-muted-foreground">USD</span>
                                        </div>
                                    </div>
                                    
                                    <UnifiedPaymentModal
                                        courseId={course.id}
                                        courseTitle={course.title}
                                        coursePrice={course.price}
                                        trigger={
                                            <Button className="w-full">
                                                <ShoppingCart className="mr-2 h-4 w-4"/>
                                                Buy Course
                                            </Button>
                                        }
                                        type="course"
                                    />
                                </div>
                            )}

                             <Accordion type="single" collapsible defaultValue="lessons" className="w-full mt-4">
                                <AccordionItem value="lessons" className="border-none">
                                    <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                                        Lessons
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-2">
                                            {course.lessons.map(lesson => (
                                                <li key={lesson.id}>
                                                     <Link 
                                                        href={hasAccess ? `/dashboard/courses/${course.id}/lesson/${lesson.id}` as any: '#'} 
                                                        className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                                                            hasAccess 
                                                            ? 'hover:bg-muted/80 cursor-pointer'
                                                            : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {hasAccess ? (
                                                                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${completedLessons.includes(lesson.id) ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                                            ) : (
                                                                <Lock className="h-5 w-5 flex-shrink-0 text-muted-foreground/50" />
                                                            )}
                                                            <span className="text-sm font-medium">{lesson.title}</span>
                                                        </div>
                                                     </Link>
                                                </li>
                                            ))}
                                            {course.lessons.length === 0 && <p className="text-sm text-muted-foreground px-3">No lessons have been added to this course yet.</p>}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
