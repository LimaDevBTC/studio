
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, getDocsFromServer } from "firebase/firestore";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, AlertCircle, ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CourseData {
  id: string;
  title: string;
  status: "Published" | "Draft" | "Waitlist";
  lessons: number;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesCollection = collection(db, "courses");
      const courseSnapshot = await getDocs(coursesCollection);
      if (courseSnapshot.empty) {
        setCourses([]);
      } else {
        const coursesListPromises = courseSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          
          const lessonsCollection = collection(db, "courses", docSnapshot.id, "lessons");
          const lessonsSnapshot = await getDocsFromServer(lessonsCollection);

          return {
            id: docSnapshot.id,
            title: data.title || "Untitled Course",
            status: data.status || "Draft",
            lessons: lessonsSnapshot.size,
            createdAt: createdAtDate.toLocaleDateString(),
          };
        });
        const coursesList = await Promise.all(coursesListPromises);
        setCourses(coursesList);
      }
    } catch (err) {
      console.error("Error fetching courses: ", err);
      setError("Failed to fetch courses. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const deleteCourseAndSubcollections = async (courseId: string) => {
    try {
        console.log("🗑️ Iniciando exclusão do curso:", courseId);
        
        // Delete lessons subcollection first
        console.log("📚 Excluindo lições...");
        const lessonsCollectionRef = collection(db, 'courses', courseId, 'lessons');
        const lessonsSnapshot = await getDocs(lessonsCollectionRef);
        console.log(`📚 Encontradas ${lessonsSnapshot.size} lições para excluir`);
        
        const lessonDeletePromises = lessonsSnapshot.docs.map(doc => {
            console.log("📚 Excluindo lição:", doc.id);
            return deleteDoc(doc.ref);
        });
        await Promise.all(lessonDeletePromises);
        console.log("✅ Lições excluídas com sucesso");

        // Delete course document
        console.log("📄 Excluindo documento do curso...");
        await deleteDoc(doc(db, "courses", courseId));
        console.log("✅ Documento do curso excluído com sucesso");

        // Try to delete storage files (optional, might not exist)
        try {
            console.log("💾 Tentando excluir arquivos do storage...");
            const storage = getStorage();
            const courseStorageRef = ref(storage, `courses/${courseId}`);
            const allItems = await listAll(courseStorageRef);

            const deletePromises: Promise<any>[] = [];
            
            // Delete folders and files in Storage
            const deleteFolderContents = async (folderRef: any) => {
                const folderItems = await listAll(folderRef);
                folderItems.items.forEach(itemRef => deletePromises.push(deleteObject(itemRef)));
                folderItems.prefixes.forEach(subfolderRef => deleteFolderContents(subfolderRef));
            }
            await deleteFolderContents(courseStorageRef);
            await Promise.all(deletePromises);
            console.log("✅ Arquivos do storage excluídos com sucesso");
        } catch (storageError) {
            console.log("⚠️ Erro ao excluir arquivos do storage (pode não existir):", storageError);
            // Continue even if storage deletion fails
        }

        toast({ title: "Curso excluído com sucesso!" });
        fetchCourses();
    } catch (error) {
        console.error("❌ Erro ao excluir curso:", error);
        toast({ 
            title: "Erro ao excluir curso", 
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive" 
        });
    }
  };

  const toggleExpanded = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-800 border-green-200";
              case "Waitlist": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Draft": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses Management</h1>
          <p className="text-muted-foreground">
            Manage all courses in the platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses" as="/admin/courses">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>

      {/* Tabela Desktop */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(courses) && courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        course.status === "Published" ? "default" : 
                        course.status === "Waitlist" ? "outline" : 
                        "secondary"
                      }>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.lessons}</TableCell>
                    <TableCell>{course.createdAt}</TableCell>
                    <TableCell>
                     <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/courses" as="/admin/courses">Edit</Link>
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive cursor-pointer">
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the course, all its lessons, and associated media from storage.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => deleteCourseAndSubcollections(course.id)}
                            >
                              Delete Course
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        No courses found. Get started by creating one.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cards Mobile - Estilo Netflix */}
      <div className="lg:hidden space-y-3">
        {Array.isArray(courses) && courses.length > 0 ? (
          courses.map((course) => (
            <Collapsible 
              key={course.id} 
              open={expandedCourse === course.id}
              onOpenChange={() => toggleExpanded(course.id)}
            >
                              <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={`text-xs px-2 py-1 border ${getStatusColor(course.status)}`}
                          >
                            {course.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {course.lessons} lessons
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {expandedCourse === course.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-3">
                        Created: {course.createdAt}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href="/admin/courses" as="/admin/courses">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="flex-1">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the course, all its lessons, and associated media from storage.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteCourseAndSubcollections(course.id)}
                              >
                                Delete Course
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No courses found. Get started by creating one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
