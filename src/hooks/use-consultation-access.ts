import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export interface ConsultationAccess {
  hasAccess: boolean;
  transactionId: string | null;
  approvedAt: Date | null;
  isLoading: boolean;
}

export function useConsultationAccess() {
  const [consultationAccess, setConsultationAccess] = useState<ConsultationAccess>({
    hasAccess: false,
    transactionId: null,
    approvedAt: null,
    isLoading: true
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConsultationAccess(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Buscar transações de consultoria aprovadas para este usuário
    // Query simplificada para evitar problemas de índice
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', user.uid),
      where('type', '==', 'consultation'),
      where('status', '==', 'approved')
      // Removido orderBy e limit para simplificar a query
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Nenhuma transação aprovada encontrada
        setConsultationAccess({
          hasAccess: false,
          transactionId: null,
          approvedAt: null,
          isLoading: false
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
        
        setConsultationAccess({
          hasAccess: true,
          transactionId: latestTransaction.id,
          approvedAt: latestTransaction.data.updatedAt?.toDate ? latestTransaction.data.updatedAt.toDate() : null,
          isLoading: false
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
