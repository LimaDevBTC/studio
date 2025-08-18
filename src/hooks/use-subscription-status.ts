import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface SubscriptionStatus {
  isActive: boolean;
  planName: string;
  expiryDate: Date | null;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export function useSubscriptionStatus() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    planName: 'Free Trial',
    expiryDate: null,
    daysUntilExpiry: 0,
    isExpired: false,
    isExpiringSoon: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user || !userData) {
      setIsLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const planName = data.plan || 'Free Trial';
        const expiryDate = data.planExpiryDate?.toDate ? data.planExpiryDate.toDate() : null;
        
        const now = new Date();
        let daysUntilExpiry = 0;
        let isExpired = false;
        let isExpiringSoon = false;
        let isActive = false;

        if (expiryDate) {
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          isExpired = daysUntilExpiry < 0;
          isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
          isActive = !isExpired && planName !== 'Free Trial';
        } else {
          // Sem data de expiração = Free Trial
          isActive = false;
          isExpired = false;
          isExpiringSoon = false;
        }

        setSubscriptionStatus({
          isActive,
          planName,
          expiryDate,
          daysUntilExpiry,
          isExpired,
          isExpiringSoon
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  return { subscriptionStatus, isLoading };
}
