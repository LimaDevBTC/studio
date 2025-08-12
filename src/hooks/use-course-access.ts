import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export function useCourseAccess(courseId: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !courseId) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    // Verificar se o usuário tem acesso direto ao curso
    const courseAccessQuery = query(
      collection(db, "userCourseAccess"),
      where("userId", "==", user.uid),
      where("courseId", "==", courseId),
      where("status", "==", "active")
    );

    // Verificar se o usuário tem assinatura ativa
    const subscriptionQuery = query(
      collection(db, "userSubscriptions"),
      where("userId", "==", user.uid),
      where("status", "==", "active")
    );

    const unsubscribeCourse = onSnapshot(courseAccessQuery, (snapshot) => {
      if (!snapshot.empty) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Se não tem acesso direto, verificar assinatura
      const unsubscribeSubscription = onSnapshot(subscriptionQuery, (subSnapshot) => {
        if (!subSnapshot.empty) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
        setIsLoading(false);
      });

      return unsubscribeSubscription;
    });

    return () => {
      unsubscribeCourse();
    };
  }, [user, courseId]);

  return { hasAccess, isLoading };
}
