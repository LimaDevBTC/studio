import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useSubscriptionStatus } from './use-subscription-status';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';

export interface UserSubscription {
  id: string;
  userId: string;
  type: 'monthly' | 'annual' | 'consultation' | 'course';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  purchaseMethod: 'crypto' | 'card' | 'pix';
  planDetails: {
    name: string;
    price: number;
    currency: string;
    features: string[];
  };
  courseId?: string; // Para cursos individuais
  planId?: string; // Para assinaturas
}

export interface SubscriptionDisplayLogic {
  showMonthly: boolean;
  showAnnual: boolean;
  showConsultation: boolean;
  showCourses: string[]; // IDs dos cursos a mostrar
  currentSubscription: UserSubscription | null;
  upgradeOptions: string[];
  hasActiveSubscription: boolean;
  subscriptionType: 'none' | 'monthly' | 'annual' | 'consultation' | 'course';
}

export function useSubscriptionLogic() {
  const [displayLogic, setDisplayLogic] = useState<SubscriptionDisplayLogic>({
    showMonthly: true,
    showAnnual: true,
    showConsultation: true,
    showCourses: [],
    currentSubscription: null,
    upgradeOptions: [],
    hasActiveSubscription: false,
    subscriptionType: 'none'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { user, userData } = useAuth();
  const { subscriptionStatus } = useSubscriptionStatus();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchUserSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // Buscar assinaturas ativas do usuário
        const subscriptionsQuery = query(
          collection(db, 'userSubscriptions'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const activeSubscriptions = subscriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserSubscription[];

        // Buscar acesso a cursos individuais
        const courseAccessQuery = query(
          collection(db, 'userCourseAccess'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        
        const courseAccessSnapshot = await getDocs(courseAccessQuery);
        const courseAccess = courseAccessSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Determinar tipo de assinatura atual
        let currentType: 'none' | 'monthly' | 'annual' | 'consultation' | 'course' = 'none';
        let hasActive = false;

        if (subscriptionStatus.isActive && subscriptionStatus.planName !== 'Free Trial') {
          hasActive = true;
          if (subscriptionStatus.planName.toLowerCase().includes('mensal')) {
            currentType = 'monthly';
          } else if (subscriptionStatus.planName.toLowerCase().includes('anual')) {
            currentType = 'annual';
          } else if (subscriptionStatus.planName.toLowerCase().includes('consultoria')) {
            currentType = 'consultation';
          }
        }

        // Se tem acesso a cursos individuais
        if (courseAccess.length > 0) {
          hasActive = true;
          currentType = 'course';
        }

        // Lógica de exibição inteligente
        let showMonthly = true;
        let showAnnual = true;
        let showConsultation = true;
        let showCourses: string[] = [];
        let upgradeOptions: string[] = [];

        switch (currentType) {
          case 'none':
            // Usuário sem assinatura: mostra tudo
            showMonthly = true;
            showAnnual = true;
            showConsultation = true;
            showCourses = ['all']; // Mostra todos os cursos
            break;

          case 'monthly':
            // Usuário com mensal: mostra anual e consultoria
            showMonthly = false; // Não mostra o que já tem
            showAnnual = true;   // Mostra upgrade para anual
            showConsultation = true; // Mostra consultoria
            showCourses = []; // Não mostra cursos (já tem acesso via assinatura)
            upgradeOptions = ['annual', 'consultation'];
            break;

          case 'annual':
            // Usuário com anual: mostra apenas consultoria
            showMonthly = false; // Não mostra mensal (pior que o atual)
            showAnnual = false;  // Não mostra anual (já tem)
            showConsultation = true; // Mostra consultoria
            showCourses = []; // Não mostra cursos (já tem acesso via assinatura)
            upgradeOptions = ['consultation'];
            break;

          case 'consultation':
            // Usuário com consultoria: mostra planos de assinatura
            showMonthly = true;
            showAnnual = true;
            showConsultation = false; // Não mostra o que já tem
            showCourses = ['all']; // Mostra cursos
            upgradeOptions = ['monthly', 'annual'];
            break;

          case 'course':
            // Usuário com curso específico: mostra tudo menos o curso que tem
            showMonthly = true;
            showAnnual = true;
            showConsultation = true;
            showCourses = courseAccess.map(access => access.courseId).filter(Boolean);
            upgradeOptions = ['monthly', 'annual', 'consultation'];
            break;
        }

        setDisplayLogic({
          showMonthly,
          showAnnual,
          showConsultation,
          showCourses,
          currentSubscription: activeSubscriptions[0] || null,
          upgradeOptions,
          hasActiveSubscription: hasActive,
          subscriptionType: currentType
        });

      } catch (error) {
        console.error('Erro ao buscar assinaturas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSubscriptions();
  }, [user, subscriptionStatus]);

  return { displayLogic, isLoading };
}
