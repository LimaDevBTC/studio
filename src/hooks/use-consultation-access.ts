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
    // Primeiro, buscar TODAS as transações de consultoria para debug
    const allTransactionsQuery = query(
      transactionsRef,
      where('userId', '==', user.uid),
      where('type', '==', 'consultation')
    );
    
    // Query específica para transações aprovadas
    const q = query(
      transactionsRef,
      where('userId', '==', user.uid),
      where('type', '==', 'consultation'),
      where('status', '==', 'approved')
    );

    // Primeiro, verificar todas as transações de consultoria para debug
    const unsubscribeAll = onSnapshot(allTransactionsQuery, (allSnapshot) => {
      console.log('🔍 TODAS as transações de consultoria:', {
        size: allSnapshot.size,
        transactions: allSnapshot.docs.map(doc => ({
          id: doc.id,
          status: doc.data().status,
          createdAt: doc.data().createdAt
        }))
      });
    });

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('🔍 useConsultationAccess - Snapshot recebido:', {
        size: snapshot.size,
        empty: snapshot.empty,
        userId: user?.uid
      });
      
      if (snapshot.empty) {
        console.log('❌ Nenhuma transação aprovada encontrada');
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
        console.log('✅ Transação aprovada encontrada!');
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

    return () => {
      unsubscribe();
      unsubscribeAll();
    };
  }, [user]);

  return consultationAccess;
}
