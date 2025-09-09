"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  Check,
  Plus,
  Loader2,
  Lock,
  Video,
  ExternalLink
} from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, where, getDoc, setDoc, addDoc, getDocs, orderBy } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LiveSession, LiveService, LiveStatus } from "@/types/live";
import UserSelector from "@/components/UserSelector";

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
  
  // Estados para criação de consultoria
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [service, setService] = useState<LiveService>("meet");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [consultationType, setConsultationType] = useState<'public' | 'private'>('public');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setExternalUrl("");
    setService("meet");
    setScheduledAt("");
    setIsPrivate(false);
    setAllowedUsers([]);
    setEditingSession(null);
    setShowCreateForm(false);
  };

  const createConsultationSession = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const sessionData = {
        title,
        description,
        externalUrl,
        service,
        status: 'scheduled' as LiveStatus,
        scheduledAt: new Date(scheduledAt),
        adminId: user.uid,
        isPrivate,
        allowedUsers: isPrivate ? allowedUsers : [],
        consultationType: isPrivate ? 'private' : 'public',
        maxParticipants: isPrivate ? allowedUsers.length : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'liveSessions'), sessionData);
      
      toast({ title: "Sucesso!", description: "Consultoria criada com sucesso!" });
      resetForm();
    } catch (error: any) {
      console.error("❌ ERRO ao criar consultoria:", error);
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

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


  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { 
          label: 'Aguardando', 
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: Clock
        };
      case 'scheduled':
        return { 
          label: 'Agendada', 
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: Calendar
        };
      case 'completed':
        return { 
          label: 'Realizada', 
          color: 'bg-gray-50 text-gray-600 border-gray-200',
          icon: CheckCircle
        };
      default:
        return { 
          label: 'Desconhecido', 
          color: 'bg-gray-50 text-gray-700 border-gray-200',
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4">
              Gerenciar Consultorias
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Visualize e gerencie todas as consultorias compradas pelos usuários
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 w-full sm:w-auto bg-[#F7931A] hover:bg-[#F7931A]/90 text-gray-800"
          >
            <Plus className="h-4 w-4" />
            Nova Consultoria
          </Button>
        </div>
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

      {/* Formulário de criação/edição */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingSession ? 'Editar Consultoria' : 'Nova Consultoria'}
            </CardTitle>
            <CardDescription>
              Configure os detalhes da sua consultoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Consultoria</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Consultoria de Criptomoedas"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Select value={service} onValueChange={(value: LiveService) => setService(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o conteúdo da consultoria..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">Link da Consultoria</Label>
              <Input
                id="externalUrl"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                type="url"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Data e Hora</Label>
                <Input
                  id="scheduledAt"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  type="datetime-local"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Consultoria Privada
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPrivate">Consultoria privada</Label>
                </div>
              </div>
            </div>

            {isPrivate && (
              <div className="space-y-2">
                <Label htmlFor="allowedUsers">Usuários Permitidos</Label>
                <UserSelector
                  selectedUsers={allowedUsers}
                  onUsersChange={setAllowedUsers}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={createConsultationSession}
                disabled={isLoading || !title || !externalUrl || !scheduledAt}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Criar Consultoria'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Consultorias */}
      <div className="space-y-4">
        {consultations.map((consultation) => {
          const statusInfo = getStatusInfo(consultation.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={consultation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-lg">{consultation.userName}</CardTitle>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>{consultation.userEmail}</CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    {consultation.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => markAsCompleted(consultation.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updatingConsultation === consultation.id}
                      >
                        {updatingConsultation === consultation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Marcar como Realizada
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                    <User className="h-4 w-4 text-[#F7931A]" />
                    <div>
                      <span className="font-medium text-card-foreground">Cliente</span>
                      <div className="text-card-foreground">{consultation.userName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                    <Calendar className="h-4 w-4 text-[#F7931A]" />
                    <div>
                      <span className="font-medium text-card-foreground">Criada em</span>
                      <div className="text-card-foreground">
                        {consultation.createdAt?.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                    <StatusIcon className="h-4 w-4 text-[#F7931A]" />
                    <div>
                      <span className="font-medium text-card-foreground">Status</span>
                      <div className="text-card-foreground">{statusInfo.label}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
