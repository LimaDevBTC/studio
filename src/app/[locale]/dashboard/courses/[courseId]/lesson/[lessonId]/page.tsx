
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, File, Check, ArrowLeft, BookOpen } from "lucide-react";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, setDoc, arrayUnion, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CourseProgress } from "@/types/progress";
import { Link } from "@/navigation";

interface Lesson {
    id: string;
    title: string;
    description: string;
    videoUrl?: string;
    pdfUrl?: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export default function CoursePlayerPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
        if (!courseId || !user) return;
        setIsCourseLoading(true);
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
                    lessons: lessonsList,
                };
                setCourse(fetchedCourse);

                const lessonToPlay = lessonsList.find(l => l.id === lessonId);
                setCurrentLesson(lessonToPlay || null);

                // Fetch progress after setting the course
                if (user) {
                    const progressRef = doc(db, "users", user.uid, "courseProgress", courseId);
                    const progressSnap = await getDoc(progressRef);
                    if (progressSnap.exists()) {
                        const progressData = progressSnap.data() as CourseProgress;
                        setCompletedLessons(progressData.completedLessons || []);
                    }
                }
            } else {
                console.error("Course not found");
            }
        } catch (error) {
            console.error("Failed to fetch course:", error);
        } finally {
            setIsCourseLoading(false);
        }
    };
    if (user && !authLoading) {
        fetchCourseAndProgress();
    }
  }, [courseId, lessonId, user, authLoading]);


  const handleLessonClick = (lesson: any) => {
    setCurrentLesson(lesson);
    // Use Next.js router to change URL without full page reload
    window.history.pushState({}, '', `/dashboard/courses/${courseId}/lesson/${lesson.id}`);
  };

  const handleMarkAsCompleted = async (lessonId: string) => {
    if (!user || !courseId) return;
    setIsSavingProgress(true);
    try {
        const progressRef = doc(db, "users", user.uid, "courseProgress", courseId);
        await setDoc(progressRef, { 
            courseId: courseId,
            completedLessons: arrayUnion(lessonId) 
        }, { merge: true });
        
        setCompletedLessons(prev => [...prev, lessonId]);
        
    } catch(error) {
        console.error("Error marking lesson as complete: ", error);
    } finally {
        setIsSavingProgress(false);
    }
  }

  if (isCourseLoading || authLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading course...</p>
        </div>
    );
  }

  if (!course) {
    return <div className="text-center">Course not found.</div>;
  }


  const isCurrentLessonCompleted = currentLesson ? completedLessons.includes(currentLesson.id) : false;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
      
      <div className="xl:col-span-2">
         <Button asChild variant="ghost" className="mb-4 -ml-4">
             <Link href={`/dashboard/courses/${courseId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
             </Link>
         </Button>
        <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
            {currentLesson?.videoUrl ? (
                 <video key={currentLesson.videoUrl} controls className="w-full h-full rounded-lg" autoPlay>
                    <source src={currentLesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                 <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2" />
                    <p>No video for this lesson.</p>
                    <p className="text-sm">Select a lesson from the list to begin.</p>
                 </div>
            )}
        </div>
        <h1 className="text-3xl font-bold font-headline">{currentLesson?.title || course.title}</h1>
        <p className="text-muted-foreground mt-2">
          {currentLesson?.description}
        </p>
        
        <div className="mt-6 flex items-center gap-4">
            {currentLesson?.pdfUrl && (
                <Button asChild variant="outline">
                    <a href={currentLesson.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <File className="mr-2 h-4 w-4" />
                        Download PDF
                    </a>
                </Button>
            )}
            {currentLesson && (
                 <Button 
                    onClick={() => handleMarkAsCompleted(currentLesson.id)}
                    disabled={isCurrentLessonCompleted || isSavingProgress}
                 >
                    {isSavingProgress ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    ) : isCurrentLessonCompleted ? (
                        <Check className="mr-2 h-4 w-4"/>
                    ) : null}
                    {isCurrentLessonCompleted ? "Completed" : "Mark as Completed"}
                </Button>
            )}
        </div>



      </div>
      
      <div className="w-full xl:col-span-1 flex flex-col gap-4">
        <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold font-headline mb-2">{course.title}</h2>
            </div>
            <Accordion type="single" collapsible defaultValue="item-0" className="w-full p-2">
                <AccordionItem value="item-0" className="border-none">
                    <AccordionTrigger className="rounded-md px-2 hover:bg-muted/50 hover:no-underline">
                        Course Lessons
                    </AccordionTrigger>
                    <AccordionContent>
                        {course.lessons.length > 0 ? (
                            <ul className="space-y-1 p-1">
                                {course.lessons.map((lesson) => (
                                    <li 
                                        key={lesson.id} 
                                        onClick={() => handleLessonClick(lesson)}
                                        className={`flex items-center justify-between p-3 rounded-md hover:bg-muted/80 cursor-pointer
                                            ${currentLesson?.id === lesson.id ? 'bg-muted' : ''}`}
                                    >
                                      <div className="flex items-center gap-3">
                                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${completedLessons.includes(lesson.id) ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                          <span className="text-sm font-medium">{lesson.title}</span>
                                      </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-sm text-muted-foreground">No lessons available for this course yet.</p>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
        

      </div>
    </div>
  );
}

