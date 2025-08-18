import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useSubscriptionStatus } from './use-subscription-status';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useCourseAccess(courseId: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { subscriptionStatus } = useSubscriptionStatus();

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

    const unsubscribeCourse = onSnapshot(courseAccessQuery, (snapshot) => {
      if (!snapshot.empty) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Se não tem acesso direto, verificar se tem assinatura ativa
      if (subscriptionStatus.isActive && !subscriptionStatus.isExpired) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeCourse();
    };
  }, [user, courseId, subscriptionStatus]);

  return { hasAccess, isLoading };
}
