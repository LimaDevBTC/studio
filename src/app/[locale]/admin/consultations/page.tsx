"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  CheckCircle, 
  ChevronDown,
  ChevronRight,
  Check
} from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, where, getDoc, setDoc } from 'firebase/firestore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Consultation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: 'available' | 'scheduled' | 'completed';
  calendlyEventId?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingConsultation, setUpdatingConsultation] = useState<string | null>(null);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);

  // Buscar todas as consultorias
  useEffect(() => {
    // Buscar transações de consultoria aprovadas
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('type', '==', 'consultation'),
      where('status', '==', 'approved')
    );
    
    // Buscar status das consultorias
    const consultationsQuery = query(collection(db, 'userConsultations'));
    
    // Observar transações
    const unsubscribeTransactions = onSnapshot(transactionsQuery, async (snapshot) => {
      const consultationsData: Consultation[] = [];
      
      for (const transactionDoc of snapshot.docs) {
        const transactionData = transactionDoc.data();
        
        // Buscar dados do usuário
        let userEmail = 'N/A';
        let userName = 'N/A';
        
        try {
          const userDoc = await getDoc(doc(db, 'users', transactionData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as any;
            userEmail = userData?.email || 'N/A';
            userName = userData?.displayName || 'N/A';
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
        
        // Buscar status da consultoria (se existir)
        let consultationStatus: 'available' | 'scheduled' | 'completed' = 'available';
        let calendlyEventId = undefined;
        let scheduledAt = undefined;
        let completedAt = undefined;
        let createdAt = transactionData.updatedAt?.toDate() || new Date();
        let updatedAt = transactionData.updatedAt?.toDate() || new Date();
        
        try {
          const consultationDoc = await getDoc(doc(db, 'userConsultations', transactionData.userId));
          if (consultationDoc.exists()) {
            const consultationData = consultationDoc.data() as any;
            consultationStatus = consultationData.status || 'available';
            calendlyEventId = consultationData.calendlyEventId;
            scheduledAt = consultationData.scheduledAt?.toDate();
            completedAt = consultationData.completedAt?.toDate();
            createdAt = consultationData.createdAt?.toDate() || createdAt;
            updatedAt = consultationData.updatedAt?.toDate() || updatedAt;
          }
        } catch (error) {
          console.error('Erro ao buscar dados da consultoria:', error);
        }
        
        consultationsData.push({
          id: transactionDoc.id, // ID da transação
          userId: transactionData.userId,
          userEmail,
          userName,
          status: consultationStatus,
          calendlyEventId,
          scheduledAt,
          completedAt,
          createdAt,
          updatedAt
        });
      }
      
      setConsultations(consultationsData);
      setLoading(false);
    });

    return () => {
      unsubscribeTransactions();
    };
  }, []);

  const markAsCompleted = async (consultationId: string) => {
    setUpdatingConsultation(consultationId);
    
    try {
      const consultation = consultations.find(c => c.id === consultationId);
      if (!consultation) return;

      const consultationDocRef = doc(db, 'userConsultations', consultation.userId);
      const consultationDoc = await getDoc(consultationDocRef);

      if (!consultationDoc.exists()) {
        // Criar o documento se não existir
        console.log('📝 Criando documento userConsultations para o usuário...');
        await setDoc(consultationDocRef, {
          userId: consultation.userId,
          status: 'completed',
          completedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Documento userConsultations criado com sucesso!');
      } else {
        // Atualizar o documento existente
        console.log('🔄 Atualizando documento userConsultations existente...');
        await updateDoc(consultationDocRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Documento userConsultations atualizado com sucesso!');
      }

      console.log('✅ Consultoria marcada como realizada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao marcar como concluída:', error);
    } finally {
      setUpdatingConsultation(null);
    }
  };

  const toggleExpanded = (consultationId: string) => {
    setExpandedConsultation(expandedConsultation === consultationId ? null : consultationId);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { 
          label: 'Aguardando', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        };
      case 'scheduled':
        return { 
          label: 'Agendada', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Calendar
        };
      case 'completed':
        return { 
          label: 'Realizada', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      default:
        return { 
          label: 'Desconhecido', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando consultorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
      {/* Header Otimizado */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4">
          Gerenciar Consultorias
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Visualize e gerencie todas as consultorias compradas pelos usuários
        </p>
      </div>

      {/* Estatísticas Responsivas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              {consultations.length}
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {consultations.filter(c => c.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
              {consultations.filter(c => c.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">Agendadas</p>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {consultations.filter(c => c.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Consultorias - Estilo Netflix */}
      <div className="space-y-3">
        {consultations.map((consultation) => {
          const statusInfo = getStatusInfo(consultation.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Collapsible 
              key={consultation.id} 
              open={expandedConsultation === consultation.id}
              onOpenChange={() => toggleExpanded(consultation.id)}
            >
                              <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {consultation.userName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs px-2 py-1 border ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {consultation.userEmail}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {expandedConsultation === consultation.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-gray-500">
                          Criada em {consultation.createdAt?.toLocaleDateString('pt-BR')}
                        </p>
                        
                        {consultation.status === 'scheduled' && consultation.scheduledAt && (
                          <p className="text-xs text-gray-500">
                            Agendada para {consultation.scheduledAt.toLocaleString('pt-BR')}
                          </p>
                        )}

                        {consultation.status === 'completed' && consultation.completedAt && (
                          <p className="text-xs text-gray-500">
                            Realizada em {consultation.completedAt.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      
                      {consultation.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => markAsCompleted(consultation.id)}
                          className="w-full text-xs sm:text-sm h-8 sm:h-9"
                          disabled={updatingConsultation === consultation.id}
                        >
                          {updatingConsultation === consultation.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary mx-auto"></div>
                          ) : (
                            <>
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Marcar como Realizada
                            </>
                          )}
                        </Button>
                      )}
                      
                      {consultation.status === 'completed' && (
                        <div className="text-center text-xs sm:text-sm text-green-600 py-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                          Consultoria concluída
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {consultations.length === 0 && (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">Nenhuma consultoria encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
