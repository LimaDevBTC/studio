
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, getDocsFromServer } from "firebase/firestore";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface CourseData {
  id: string;
  title: string;
  status: "Published" | "Draft";
  lessons: number;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      
        // Delete lessons subcollection
        const lessonsCollectionRef = collection(db, 'courses', courseId, 'lessons');
        const lessonsSnapshot = await getDocs(lessonsCollectionRef);
        lessonsSnapshot.forEach(doc => deleteDoc(doc.ref));

        // Delete course document
        await deleteDoc(doc(db, "courses", courseId));

        toast({ title: "Course deleted successfully!" });
        fetchCourses();
    } catch (error) {
        console.error("Error deleting course: ", error);
        toast({ variant: "destructive", title: "Failed to delete course." });
    }
  };


  return (
    <div>
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Courses</h1>
          <p className="text-muted-foreground">Manage your educational content here.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
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
              {loading ? (
                 Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5}>
                     <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : Array.isArray(courses) && courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === "Published" ? "default" : "secondary"}>
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
                            <Link href={`/admin/courses/${course.id}`}>Edit</Link>
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
    </div>
  );
}
