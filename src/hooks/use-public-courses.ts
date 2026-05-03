"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PublicCourse {
  id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  status?: string;
  level?: string;
  duration?: string;
  waitlistCount?: number;
  publishedAt?: any;
  category?: string;
}

export function usePublicCourses() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        if (!db) {
          setCourses([]);
          return;
        }

        const coursesCollection = collection(db, 'courses');
        const allCoursesQuery = query(coursesCollection);
        
        try {
          const allCoursesSnapshot = await getDocs(allCoursesQuery);
          
          if (allCoursesSnapshot.empty) {
            setCourses([]);
            return;
          }
          
          const allCourses: PublicCourse[] = [];
          
          allCoursesSnapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            
            // Criar objeto do curso
            const course: PublicCourse = {
              id: doc.id,
              title: data.title || 'Curso sem título',
              description: data.description || 'Descrição não disponível',
              thumbnail: data.thumbnail || data.image || data.coverImage || data.courseImage || '/images/logo.png',
              status: data.status || 'Published',
              level: data.level || 'Iniciante',
              duration: data.duration || 'Não definido',
              publishedAt: data.publishedAt,
              waitlistCount: data.waitlistCount || 0,
              category: data.category || 'Geral'
            };
            
            allCourses.push(course);
          });
          
          // Filtrar apenas cursos publicados ou em lista de espera
          const publishedCourses = allCourses.filter(course => 
            course.status === 'Published' || course.status === 'published'
          );
          
          const waitlistCourses = allCourses.filter(course => 
            course.status === 'Waitlist' || course.status === 'waitlist'
          );
          
          // Combinar e ordenar cursos
          const finalCourses = [...publishedCourses, ...waitlistCourses];
          finalCourses.sort((a, b) => {
            // Cursos publicados primeiro
            if (a.status === 'Published' || a.status === 'published') return -1;
            if (b.status === 'Published' || b.status === 'published') return 1;
            return 0;
          });
          
          setCourses(finalCourses);
          
        } catch (allCoursesError) {
          console.error('❌ ERRO ao buscar todos os cursos:', allCoursesError);
          setError(`Erro ao buscar cursos: ${(allCoursesError as any)?.message}`);
        }
        
      } catch (error) {
        console.error('❌ ERRO GERAL no usePublicCourses:', error);
        setError(`Erro geral: ${(error as any)?.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return { courses, loading, error };
}
