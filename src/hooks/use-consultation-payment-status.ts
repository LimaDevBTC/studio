import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from './use-auth';

export interface ConsultationPaymentStatus {
  hasPayment: boolean;
  isPending: boolean;
  isConfirmed: boolean;
  isLoading: boolean;
  error: string | null;
  transactionId: string | null;
  paymentMethod: string | null;
  amount: number | null;
  createdAt: any;
}

export const useConsultationPaymentStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConsultationPaymentStatus>({
    hasPayment: false,
    isPending: false,
    isConfirmed: false,
    isLoading: true,
    error: null,
    transactionId: null,
    paymentMethod: null,
    amount: null,
    createdAt: null
  });

  useEffect(() => {
    if (!user) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      where('type', '==', 'consultation')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          if (snapshot.empty) {
            setStatus({
              hasPayment: false,
              isPending: false,
              isConfirmed: false,
              isLoading: false,
              error: null,
              transactionId: null,
              paymentMethod: null,
              amount: null,
              createdAt: null
            });
            return;
          }

          // Ordenar por createdAt no JavaScript (mais recente primeiro)
          const sortedDocs = snapshot.docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis() || 0;
            const bTime = b.data().createdAt?.toMillis() || 0;
            return bTime - aTime;
          });

          const transaction = sortedDocs[0].data();
          const isPending = transaction.status === 'pending';
          const isConfirmed = transaction.status === 'completed' || transaction.status === 'confirmed' || transaction.status === 'approved';

          setStatus({
            hasPayment: true,
            isPending,
            isConfirmed,
            isLoading: false,
            error: null,
            transactionId: snapshot.docs[0].id,
            paymentMethod: transaction.currency,
            amount: transaction.amount,
            createdAt: transaction.createdAt
          });
        } catch (error) {
          console.error('Erro ao verificar status do pagamento:', error);
          setStatus(prev => ({
            ...prev,
            isLoading: false,
            error: 'Erro ao verificar status do pagamento'
          }));
        }
      },
      (error) => {
        console.error('Erro na consulta do Firestore:', error);
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao conectar com o servidor'
        }));
      }
    );

    return () => unsubscribe();
  }, [user]);

  return status;
};
