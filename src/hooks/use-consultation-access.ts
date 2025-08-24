import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { ConsultationStatus } from '@/types/consultation';

export interface ConsultationAccess {
  hasAccess: boolean;
  transactionId: string | null;
  approvedAt: Date | null;
  isLoading: boolean;
  // NOVOS CAMPOS
  consultationStatus?: ConsultationStatus;
  isPolling?: boolean;
  isBlocked?: boolean; // NOVO: indica se está bloqueado
}

export function useConsultationAccess() {
  const [consultationAccess, setConsultationAccess] = useState<ConsultationAccess>({
    hasAccess: false,
    transactionId: null,
    approvedAt: null,
    isLoading: true,
    consultationStatus: undefined,
    isPolling: false,
    isBlocked: false
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConsultationAccess(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Buscar transações de consultoria aprovadas para este usuário
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', user.uid),
      where('type', '==', 'consultation'),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Nenhuma transação aprovada encontrada
        setConsultationAccess({
          hasAccess: false,
          transactionId: null,
          approvedAt: null,
          isLoading: false,
          consultationStatus: undefined,
          isPolling: false,
          isBlocked: false
        });
      } else {
        // Transação aprovada encontrada - pegar a mais recente
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        
        // Ordenar por updatedAt (mais recente primeiro)
        const sortedTransactions = transactions.sort((a, b) => {
          const aTime = a.data.updatedAt?.toDate ? a.data.updatedAt.toDate().getTime() : 0;
          const bTime = b.data.updatedAt?.toDate ? b.data.updatedAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
        
        const latestTransaction = sortedTransactions[0];
        
        // Buscar status da consultoria
        let consultationStatus: ConsultationStatus | undefined;
        try {
          const statusDoc = await getDoc(doc(db, 'userConsultations', user.uid));
          if (statusDoc.exists()) {
            consultationStatus = statusDoc.data() as ConsultationStatus;
          }
        } catch (error) {
          console.error('Erro ao buscar status da consultoria:', error);
        }

        // Se não há status, criar um inicial
        if (!consultationStatus) {
          consultationStatus = {
            userId: user.uid,
            status: 'available',
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        // NOVA LÓGICA: Verificar se está bloqueado
        const isBlocked = consultationStatus?.status === 'completed';
        
        // Só dar acesso se NÃO estiver bloqueado
        const hasAccess = !isBlocked;

        setConsultationAccess({
          hasAccess,
          transactionId: latestTransaction.id,
          approvedAt: latestTransaction.data.updatedAt?.toDate ? latestTransaction.data.updatedAt.toDate() : null,
          isLoading: false,
          consultationStatus,
          isPolling: consultationStatus?.status === 'available' && !isBlocked,
          isBlocked
        });
      }
    }, (error) => {
      console.error('Erro ao verificar acesso à consultoria:', error);
      setConsultationAccess(prev => ({ ...prev, isLoading: false }));
    });

    return () => unsubscribe();
  }, [user]);

  return consultationAccess;
}
