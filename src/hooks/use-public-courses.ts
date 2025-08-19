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
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 === INICIANDO DEBUG COMPLETO ===');
        console.log('📅 Timestamp:', new Date().toISOString());
        
        // DEBUG: Verificar se o Firebase está funcionando
        console.log('🔥 Firebase DB:', db ? 'CONECTADO' : 'NÃO CONECTADO');
        console.log('🔥 Firebase App:', db?.app ? 'APP OK' : 'APP NÃO OK');
        
        // DEBUG: Verificar se a coleção existe
        const coursesCollection = collection(db, 'courses');
        console.log('📚 Coleção courses:', coursesCollection ? 'EXISTE' : 'NÃO EXISTE');
        console.log('📚 Path da coleção:', coursesCollection?.path);
        
        // DEBUG: Tentar buscar TODOS os cursos primeiro (sem filtros)
        console.log('🔍 === BUSCANDO TODOS OS CURSOS (SEM FILTROS) ===');
        const allCoursesQuery = query(coursesCollection);
        
        try {
          const allCoursesSnapshot = await getDocs(allCoursesQuery);
          console.log('📊 Total de documentos na coleção:', allCoursesSnapshot.size);
          console.log('📊 Empty:', allCoursesSnapshot.empty);
          
          if (allCoursesSnapshot.empty) {
            console.log('❌ COLEÇÃO ESTÁ VAZIA - NENHUM CURSO ENCONTRADO');
            setDebugInfo({
              collectionEmpty: true,
              totalDocs: 0,
              error: 'Coleção courses está vazia'
            });
            setCourses([]);
            return;
          }
          
          // DEBUG: Analisar cada documento individualmente
          console.log('🔍 === ANALISANDO CADA DOCUMENTO ===');
          const allCourses: PublicCourse[] = [];
          
          allCoursesSnapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>, index: number) => {
            const data = doc.data();
            console.log(`📄 Documento ${index + 1} (ID: ${doc.id}):`, {
              id: doc.id,
              exists: doc.exists(),
              hasData: !!data,
              dataKeys: data ? Object.keys(data) : 'NENHUMA',
              data: data
            });
            
            // DEBUG: Verificar campos específicos
            if (data) {
              console.log(`🔍 Campos do documento ${doc.id}:`, {
                title: data.title || 'NÃO TEM',
                description: data.description || 'NÃO TEM',
                status: data.status || 'NÃO TEM',
                publishedAt: data.publishedAt || 'NÃO TEM',
                waitlistCount: data.waitlistCount || 'NÃO TEM',
                level: data.level || 'NÃO TEM',
                duration: data.duration || 'NÃO TEM',
                category: data.category || 'NÃO TEM',
                // DEBUG: Verificar campos de imagem
                thumbnail: data.thumbnail || 'NÃO TEM',
                image: data.image || 'NÃO TEM',
                coverImage: data.coverImage || 'NÃO TEM',
                courseImage: data.courseImage || 'NÃO TEM'
              });
              
              // DEBUG: Verificar se há alguma imagem
              const hasImage = data.thumbnail || data.image || data.coverImage || data.courseImage;
              console.log(`🖼️ Documento ${doc.id} tem imagem? ${hasImage ? 'SIM' : 'NÃO'}`);
              
              // DEBUG: Verificar estrutura da lista de espera
              console.log(`👥 LISTA DE ESPERA - Curso: ${data.title || 'Sem título'}`);
              console.log(`   - waitlistCount: ${data.waitlistCount} (tipo: ${typeof data.waitlistCount})`);
              console.log(`   - waitlist: ${data.waitlist ? 'EXISTE' : 'NÃO EXISTE'}`);
              if (data.waitlist) {
                console.log(`   - waitlist é array? ${Array.isArray(data.waitlist)}`);
                console.log(`   - waitlist length: ${Array.isArray(data.waitlist) ? data.waitlist.length : 'N/A'}`);
              }
              
              // DEBUG: Verificar todos os campos relacionados à lista de espera
              console.log(`🔍 CAMPOS LISTA DE ESPERA:`);
              console.log(`   - waitlistCount: ${data.waitlistCount}`);
              console.log(`   - waitlist: ${data.waitlist}`);
              console.log(`   - waitlistUsers: ${data.waitlistUsers}`);
              console.log(`   - waitlistMembers: ${data.waitlistMembers}`);
              console.log(`   - waitlistParticipants: ${data.waitlistParticipants}`);
              console.log(`   - waitlistQueue: ${data.waitlistQueue}`);
              
              // DEBUG: Verificar se waitlistCount é um número válido
              const count = parseInt(data.waitlistCount) || 0;
              console.log(`   - waitlistCount parseado: ${count}`);
              
              // DEBUG: Verificar TODOS os campos disponíveis no documento
              console.log(`🔍 TODOS OS CAMPOS DISPONÍVEIS:`);
              console.log(`   - Chaves do documento:`, Object.keys(data));
              console.log(`   - Valores completos:`, data);
              
              // DEBUG: Verificar campo waitlistInfo se existir
              if (data.waitlistInfo) {
                console.log(`🔍 CAMPO WAITLISTINFO ENCONTRADO!`);
                console.log(`   - waitlistInfo:`, data.waitlistInfo);
                console.log(`   - Tipo: ${typeof data.waitlistInfo}`);
                if (typeof data.waitlistInfo === 'object') {
                  console.log(`   - Chaves do waitlistInfo:`, Object.keys(data.waitlistInfo));
                }
              }
            }
            
            allCourses.push({
              id: doc.id,
              title: data?.title || 'Título não definido',
              description: data?.description || 'Descrição não definida',
              thumbnail: data?.thumbnail || data?.image || data?.coverImage || data?.courseImage || '/images/logo.png',
              status: data?.status || 'published',
              level: data?.level || 'Iniciante',
              duration: data?.duration || '2 horas',
              waitlistCount: (() => {
                // Tentar extrair waitlistCount de diferentes fontes
                if (data?.waitlistCount) {
                  return parseInt(data.waitlistCount) || 0;
                }
                if (data?.waitlistInfo) {
                  // Se waitlistInfo existe, tentar extrair o contador
                  if (typeof data.waitlistInfo === 'object') {
                    return parseInt(data.waitlistInfo.count) || parseInt(data.waitlistInfo.total) || parseInt(data.waitlistInfo.length) || 0;
                  }
                  if (typeof data.waitlistInfo === 'number') {
                    return data.waitlistInfo;
                  }
                  if (typeof data.waitlistInfo === 'string') {
                    return parseInt(data.waitlistInfo) || 0;
                  }
                }
                return 0;
              })(),
              publishedAt: data?.publishedAt || new Date(),
              category: data?.category || 'Geral'
            });
          });
          
          console.log('✅ Total de cursos processados:', allCourses.length);
          console.log('📋 Cursos finais:', allCourses);
          
          setCourses(allCourses);
          setDebugInfo({
            collectionEmpty: false,
            totalDocs: allCoursesSnapshot.size,
            processedCourses: allCourses.length,
            courses: allCourses
          });
          
          // DEBUG: Tentar buscar com filtros específicos
          console.log('🔍 === TESTANDO FILTROS ESPECÍFICOS ===');
          
          try {
            // Teste 1: Cursos com status 'Published'
            console.log('🔍 Teste 1: Buscando cursos com status "Published"');
            const publishedQuery = query(coursesCollection, where('status', '==', 'Published'));
            const publishedSnapshot = await getDocs(publishedQuery);
            console.log('📊 Cursos com status "Published":', publishedSnapshot.size);
            
            // Teste 2: Cursos com status 'Waitlist'
            console.log('🔍 Teste 2: Buscando cursos com status "Waitlist"');
            const waitlistQuery = query(coursesCollection, where('status', '==', 'Waitlist'));
            const waitlistSnapshot = await getDocs(waitlistQuery);
            console.log('📊 Cursos com status "Waitlist":', waitlistSnapshot.size);
            
            // Teste 3: Cursos sem status (undefined)
            console.log('🔍 Teste 3: Verificando cursos sem campo status');
            const coursesWithoutStatus = allCourses.filter((course: PublicCourse) => !course.status || course.status === '');
            console.log('📊 Cursos sem status definido:', coursesWithoutStatus.length);
            
            // DEBUG: Verificar status de cada curso individualmente
            console.log('🔍 === VERIFICANDO STATUS INDIVIDUAL ===');
            allCourses.forEach((course, index) => {
              console.log(`📋 Curso ${index + 1}:`, {
                id: course.id,
                title: course.title,
                status: course.status,
                statusType: typeof course.status,
                statusLength: course.status ? course.status.length : 'N/A'
              });
            });
            
            // DEBUG: Verificar se existe uma coleção separada para listas de espera
            console.log('🔍 === VERIFICANDO COLECÃO DE LISTA DE ESPERA ===');
            try {
              const waitlistCollection = collection(db, 'waitlist');
              const waitlistDocs = await getDocs(waitlistCollection);
              console.log('📊 Coleção waitlist existe? SIM');
              console.log('📊 Total de documentos na waitlist:', waitlistDocs.size);
              
              if (waitlistDocs.size > 0) {
                waitlistDocs.forEach((doc) => {
                  const waitlistData = doc.data();
                  console.log(`👥 Documento waitlist ${doc.id}:`, {
                    courseId: waitlistData.courseId,
                    userId: waitlistData.userId,
                    timestamp: waitlistData.timestamp,
                    status: waitlistData.status
                  });
                });
              }
            } catch (waitlistError) {
              console.log('📊 Coleção waitlist existe? NÃO');
              console.log('❌ Erro ao acessar waitlist:', waitlistError);
            }
            
            setDebugInfo((prev: any) => ({
              ...prev,
              publishedCount: publishedSnapshot.size,
              waitlistCount: waitlistSnapshot.size,
              withoutStatusCount: coursesWithoutStatus.length
            }));
            
          } catch (filterError) {
            console.error('❌ ERRO ao testar filtros:', filterError);
          }
          
        } catch (allCoursesError) {
          console.error('❌ ERRO ao buscar todos os cursos:', allCoursesError);
          console.error('❌ Detalhes do erro:', {
            code: (allCoursesError as any)?.code,
            message: (allCoursesError as any)?.message,
            stack: (allCoursesError as any)?.stack
          });
          
          setError(`Erro ao buscar cursos: ${(allCoursesError as any)?.message}`);
          setDebugInfo({
            error: allCoursesError,
            errorCode: (allCoursesError as any)?.code,
            errorMessage: (allCoursesError as any)?.message
          });
        }
        
        console.log('🔍 === DEBUG COMPLETO FINALIZADO ===');
        
      } catch (error) {
        console.error('❌ ERRO GERAL no usePublicCourses:', error);
        setError(`Erro geral: ${(error as any)?.message}`);
        setDebugInfo({
          generalError: error,
          errorMessage: (error as any)?.message
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // DEBUG: Retornar informações de debug para o componente
  return { courses, loading, error, debugInfo };
}
