
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, PlusCircle, BookOpen, Trash2, File, Video, Upload, DollarSign, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface LessonData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  lessonImageUrl?: string;
}

interface CourseData {
  title: string;
  description: string;
  status: "Draft" | "Published";
  imageUrl: string;
  aiHint: string;
  price: number;
}

interface LessonFormState {
    title: string;
    description: string;
    videoFile: File | null;
    pdfFile: File | null;
    lessonImageFile: File | null;
}


export default function AdminCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Partial<CourseData>>({
    title: "",
    description: "",
    status: "Draft",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "abstract",
    price: 0,
  });
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewCourse, setIsNewCourse] = useState(false);
  
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonFormState>({ title: "", description: "", videoFile: null, pdfFile: null, lessonImageFile: null });
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const courseId = params.courseId as string;

  useEffect(() => {
    if (courseId === 'new') {
      setIsNewCourse(true);
      setLoading(false);
    } else {
      setIsNewCourse(false);
      const fetchCourseAndLessons = async () => {
        setLoading(true);
        try {
          const courseRef = doc(db, "courses", courseId);
          const courseSnap = await getDoc(courseRef);
          
          if (courseSnap.exists()) {
            const courseData = courseSnap.data() as CourseData;
            setCourse({
                ...courseData,
                price: courseData.price || 0
            });

            const lessonsCollectionRef = collection(db, "courses", courseId, "lessons");
            const lessonsSnap = await getDocs(lessonsCollectionRef);
            const lessonsList = lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonData));
            setLessons(lessonsList);

          } else {
            toast({ variant: "destructive", title: "Course not found." });
            router.push("/admin/courses");
          }
        } catch (error) {
          console.error("Error fetching course data: ", error);
          toast({ variant: "destructive", title: "Failed to fetch course data." });
        } finally {
          setLoading(false);
        }
      };

      fetchCourseAndLessons();
    }
  }, [courseId, router, toast]);

  const handleSaveCourse = async () => {
    if (!course.title) {
        toast({ variant: "destructive", title: "Title is required to create a course."});
        return;
    }

    setSaving(true);
    
    try {
        const courseDataToSave = {
            title: course.title,
            description: course.description,
            status: course.status,
            imageUrl: course.imageUrl,
            aiHint: course.aiHint,
            price: Number(course.price) || 0,
        };

        if (isNewCourse) {
            const newCourseRef = await addDoc(collection(db, "courses"), {
                ...courseDataToSave,
                createdAt: serverTimestamp()
            });
            toast({ title: "Course created successfully!" });
            router.replace(`/admin/courses/${newCourseRef.id}`); 
        } else {
            const courseRef = doc(db, "courses", courseId);
            await setDoc(courseRef, courseDataToSave, { merge: true });
            toast({ title: "Course updated successfully!" });
        }
    } catch (error) {
        console.error("Error saving course: ", error);
        toast({ variant: "destructive", title: "Failed to save course." });
    } finally {
        setSaving(false);
    }
};

  const uploadFile = (file: File, path: string, onProgress: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast({ variant: "destructive", title: "Upload Failed", description: error.message });
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Failed to get download URL:", error);
            reject(error);
          }
        }
      );
    });
  };

  const openAddLessonModal = () => {
    setEditingLesson(null);
    setLessonForm({ title: "", description: "", videoFile: null, pdfFile: null, lessonImageFile: null });
    setIsLessonModalOpen(true);
  };
  
  const openEditLessonModal = (lesson: LessonData) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      videoFile: null,
      pdfFile: null,
      lessonImageFile: null,
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title) {
        toast({ variant: "destructive", title: "Lesson title is required." });
        return;
    }
    setSavingLesson(true);
    setUploadProgress(0);

    try {
        const lessonDataToUpdate: any = {
            title: lessonForm.title,
            description: lessonForm.description,
        };
        
        const lessonId = editingLesson ? editingLesson.id : doc(collection(db, "courses", courseId, "lessons")).id;
        
        const filesToUpload: {type: 'video' | 'pdf' | 'image', file: File}[] = [];
        if (lessonForm.videoFile) filesToUpload.push({ type: 'video', file: lessonForm.videoFile });
        if (lessonForm.pdfFile) filesToUpload.push({ type: 'pdf', file: lessonForm.pdfFile });
        if (lessonForm.lessonImageFile) filesToUpload.push({ type: 'image', file: lessonForm.lessonImageFile });
        
        const totalSize = filesToUpload.reduce((acc, curr) => acc + curr.file.size, 0);
        let progressByFile: {[key: string]: number} = {};

        if (filesToUpload.length > 0) {
            const uploadPromises = filesToUpload.map(async ({ type, file }) => {
                const extension = file.name.split('.').pop();
                let pathType = type;
                if (type === 'image') pathType = 'lessonCover';
                const path = `courses/${courseId}/lessons/${lessonId}/${pathType}.${extension}`;
                
                const url = await uploadFile(file, path, (progress) => {
                   progressByFile[file.name] = progress * (file.size / totalSize);
                   const totalProgress = Object.values(progressByFile).reduce((acc, curr) => acc + curr, 0);
                   setUploadProgress(totalProgress);
                });

                if (type === 'video') lessonDataToUpdate.videoUrl = url;
                if (type === 'pdf') lessonDataToUpdate.pdfUrl = url;
                if (type === 'image') lessonDataToUpdate.lessonImageUrl = url;
            });
            await Promise.all(uploadPromises);
        }
        
        const lessonRef = doc(db, "courses", courseId, "lessons", lessonId);

        if (editingLesson) {
            await updateDoc(lessonRef, lessonDataToUpdate);
            setLessons(lessons.map(l => l.id === lessonId ? { ...l, ...lessonDataToUpdate } : l));
            toast({ title: "Lesson updated successfully!" });
        } else {
            await setDoc(lessonRef, lessonDataToUpdate);
            setLessons([...lessons, { ...lessonDataToUpdate, id: lessonId }]);
            toast({ title: "Lesson added successfully!" });
        }
        
        setIsLessonModalOpen(false);
        setEditingLesson(null);
    } catch (error) {
        console.error("Error saving lesson: ", error);
        toast({ variant: "destructive", title: "Failed to save lesson." });
    } finally {
        setSavingLesson(false);
        setUploadProgress(0);
    }
  };

  const handleDeleteLesson = async (lessonToDelete: LessonData) => {
    if (isNewCourse || !courseId) return;
    try {
      const lessonRef = doc(db, "courses", courseId, "lessons", lessonToDelete.id);
      await deleteDoc(lessonRef);

      const storage = getStorage();
      if(lessonToDelete.videoUrl) await deleteObject(ref(storage, lessonToDelete.videoUrl)).catch(e => console.warn(e));
      if(lessonToDelete.pdfUrl) await deleteObject(ref(storage, lessonToDelete.pdfUrl)).catch(e => console.warn(e));
      if(lessonToDelete.lessonImageUrl) await deleteObject(ref(storage, lessonToDelete.lessonImageUrl)).catch(e => console.warn(e));

      setLessons(lessons.filter(lesson => lesson.id !== lessonToDelete.id));
      toast({ title: "Lesson removed successfully" });
    } catch (error) {
      console.error("Error removing lesson: ", error);
      toast({ variant: "destructive", title: "Failed to remove lesson." });
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({ variant: "destructive", title: "Please select an image file first." });
      return;
    }
    if (isNewCourse) {
      toast({ variant: "destructive", title: "Please save the course before uploading an image." });
      return;
    }
    setIsUploadingImage(true);
    setImageUploadProgress(0);
    try {
      const extension = imageFile.name.split('.').pop();
      const imagePath = `courses/${courseId}/coverImage.${extension}`;
      const imageUrl = await uploadFile(imageFile, imagePath, setImageUploadProgress);

      const courseRef = doc(db, "courses", courseId);
      await setDoc(courseRef, { imageUrl }, { merge: true });

      setCourse((prev) => ({ ...prev, imageUrl }));

      toast({ title: "Cover image uploaded successfully!" });
      setImageFile(null);
    } catch (error) {
      console.error("Error uploading image: ", error);
      toast({ variant: "destructive", title: "Failed to upload image." });
    } finally {
      setIsUploadingImage(false);
      setImageUploadProgress(0);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-headline">
                        {isNewCourse ? "Create New Course" : "Edit Course"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isNewCourse ? "Fill in the details for your new course." : `Editing: ${course.title || '...'}`}
                    </p>
                </div>
            </div>
             <Button onClick={handleSaveCourse} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNewCourse ? (saving ? "Creating..." : "Create & Continue") : (saving ? "Saving..." : "Save Changes")}
            </Button>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                    Provide the main information for the course.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                        id="title"
                        value={course.title}
                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                        placeholder="e.g. Bitcoin for Beginners"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                        id="description"
                        value={course.description}
                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                        placeholder="A brief summary of what this course is about."
                        rows={5}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="price"
                                type="text"
                                value={course.price || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                       setCourse({ ...course, price: value as any });
                                    }
                                }}
                                onBlur={(e) => {
                                    const parsedValue = parseFloat(e.target.value) || 0;
                                    setCourse({ ...course, price: parsedValue });
                                }}
                                placeholder="49.99"
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Publishing &amp; Media</CardTitle>
                    <CardDescription>Set the course status and upload a cover image.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid gap-3">
                        <Label htmlFor="status">Status</Label>
                        <Select
                        value={course.status}
                        onValueChange={(value: "Draft" | "Published") => setCourse({ ...course, status: value as "Draft" | "Published" })}
                        >
                        <SelectTrigger id="status" className="w-[240px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-4">
                        <Label>Course Image</Label>
                        {isNewCourse ? (
                             <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/50">
                                <p className="text-sm font-semibold text-muted-foreground">Save the course to upload an image.</p>
                                <p className="text-xs text-muted-foreground mt-1">First, fill in the details and click "Create Course".</p>
                             </div>
                        ) : (
                            <>
                                <div className="aspect-video rounded-md overflow-hidden border relative bg-muted">
                                    <Image
                                        src={imageFile ? URL.createObjectURL(imageFile) : course.imageUrl || "https://placehold.co/600x400.png"}
                                        alt="Course Image"
                                        fill
                                        className="object-cover"
                                        data-ai-hint={course.aiHint || 'abstract'}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="course-image" className="sr-only">New Image</Label>
                                    <Input
                                        id="course-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                        disabled={isUploadingImage}
                                    />
                                </div>
                                {isUploadingImage && (
                                    <div className="space-y-1">
                                        <Label>Upload Progress</Label>
                                        <Progress value={imageUploadProgress} />
                                        <p className="text-xs text-muted-foreground text-center">{Math.round(imageUploadProgress)}%</p>
                                    </div>
                                )}
                                <Button onClick={handleImageUpload} disabled={isUploadingImage || !imageFile} className="w-fit">
                                    {isUploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Upload className="mr-2 h-4 w-4"/>
                                    {isUploadingImage ? "Uploading..." : "Upload Image"}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Course Lessons</CardTitle>
                            <CardDescription>
                                {isNewCourse ? "Save the course to start adding lessons." : "Manage the lessons for this course."}
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={openAddLessonModal} disabled={isNewCourse}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Lesson
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isNewCourse ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm font-semibold">Lessons can be added after creating the course.</p>
                            <p className="mt-1 text-xs text-muted-foreground">First, fill in the details above and click "Create Course" at the top.</p>
                        </div>
                    ) : lessons && lessons.length > 0 ? (
                        <ul className="space-y-4">
                            {lessons.map(lesson => (
                                <li key={lesson.id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                                    {lesson.lessonImageUrl ? (
                                        <div className="relative w-32 h-20 rounded-md overflow-hidden flex-shrink-0">
                                            <Image src={lesson.lessonImageUrl} alt={lesson.title} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-20 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{lesson.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lesson.description}</p>
                                        <div className="flex items-center flex-wrap gap-4 mt-3">
                                            {lesson.videoUrl && (
                                                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                                                    <Video className="h-4 w-4" />
                                                    <span>Video</span>
                                                </a>
                                            )}
                                            {lesson.pdfUrl && (
                                                <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                                                    <File className="h-4 w-4" />
                                                    <span>PDF</span>
                                                </a>
                                            )}
                                             {!lesson.videoUrl && !lesson.pdfUrl && !lesson.lessonImageUrl && (
                                                <p className="text-xs text-muted-foreground">No media attached.</p>
                                             )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditLessonModal(lesson)} className="text-muted-foreground hover:text-primary">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                            </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                This action cannot be undone. This will permanently remove the lesson from the course.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteLesson(lesson)}>
                                                Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm font-semibold">No lessons added yet.</p>
                            <p className="mt-1 text-xs text-muted-foreground">Get started by adding your first lesson.</p>
                            <Button variant="secondary" size="sm" className="mt-4" onClick={openAddLessonModal}>Add Lesson</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update the details for this lesson.' : 'Fill in the details for the new lesson and upload materials.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g., What is a Blockchain?"
                disabled={savingLesson}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-description">Lesson Description</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="A short summary of what this lesson covers."
                disabled={savingLesson}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-image">Lesson Cover Image</Label>
              <Input
                id="lesson-image"
                type="file"
                accept="image/*"
                onChange={(e) => setLessonForm({ ...lessonForm, lessonImageFile: e.target.files ? e.target.files[0] : null })}
                disabled={savingLesson}
              />
               <p className="text-xs text-muted-foreground">{editingLesson && 'Uploading a new file will replace the existing one.'}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-video">Lesson Video</Label>
              <Input
                id="lesson-video"
                type="file"
                accept="video/*"
                onChange={(e) => setLessonForm({ ...lessonForm, videoFile: e.target.files ? e.target.files[0] : null })}
                disabled={savingLesson}
              />
              <p className="text-xs text-muted-foreground">{editingLesson && 'Uploading a new file will replace the existing one.'}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-pdf">Lesson PDF</Label>
              <Input
                id="lesson-pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => setLessonForm({ ...lessonForm, pdfFile: e.target.files ? e.target.files[0] : null })}
                disabled={savingLesson}
              />
               <p className="text-xs text-muted-foreground">{editingLesson && 'Uploading a new file will replace the existing one.'}</p>
            </div>
             {savingLesson && (
                <div className="space-y-1">
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} />
                    <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={savingLesson}>
                Cancel
                </Button>
            </DialogClose>
            <Button onClick={handleSaveLesson} disabled={savingLesson}>
              {savingLesson && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savingLesson ? "Saving..." : "Save Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
