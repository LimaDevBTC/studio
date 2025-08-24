"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Mail, Users, Send, Loader2, AlertCircle, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from "lucide-react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

interface WaitlistEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  joinedAt: any;
  status: 'active' | 'notified' | 'converted' | 'unsubscribed';
}

interface CourseWaitlist {
  courseId: string;
  courseTitle: string;
  count: number;
  entries: WaitlistEntry[];
}

export function AdminWaitlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [waitlists, setWaitlists] = useState<CourseWaitlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseWaitlist | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    fetchWaitlists();
  }, []);

  const fetchWaitlists = async () => {
    setIsLoading(true);
    try {
            // Buscar todas as entradas da coleção global waitlist
      const waitlistRef = collection(db, 'waitlist');
      
      const q = query(waitlistRef, orderBy('joinedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      // Se não há entradas na coleção waitlist, buscar cursos com status "Waitlist"
      if (snapshot.size === 0) {
        const coursesRef = collection(db, 'courses');
        const coursesQuery = query(coursesRef, where('status', '==', 'Waitlist'));
        const coursesSnapshot = await getDocs(coursesQuery);
        
        // Se há cursos em waitlist, mostrar eles mesmo sem usuários inscritos
        if (coursesSnapshot.size > 0) {
          const waitlistCourses = coursesSnapshot.docs.map(doc => ({
            courseId: doc.id,
            courseTitle: doc.data().title,
            count: 0,
            entries: []
          }));
          
          setWaitlists(waitlistCourses);
          return;
        }
      }
      
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WaitlistEntry[];

          // Agrupar por curso
      const courseGroups = entries.reduce((acc, entry) => {
        const existing = acc.find(c => c.courseId === entry.courseId);
        if (existing) {
          existing.entries.push(entry);
          existing.count++;
        } else {
          acc.push({
            courseId: entry.courseId,
            courseTitle: entry.courseTitle,
            count: 1,
            entries: [entry]
          });
        }
        return acc;
      }, [] as CourseWaitlist[]);

      setWaitlists(courseGroups);
    } catch (error) {
      console.error('Erro ao buscar listas de espera:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar listas de espera",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleStatusChange = async (entryId: string, newStatus: string) => {
    try {
      const entryRef = doc(db, 'waitlist', entryId);
      await updateDoc(entryRef, { status: newStatus });
      
      // Atualizar estado local
      setWaitlists(prev => prev.map(course => ({
        ...course,
        entries: course.entries.map(entry => 
          entry.id === entryId ? { ...entry, status: newStatus as any } : entry
        )
      })));

      toast({
        title: "Status Atualizado",
        description: "Status do usuário foi alterado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromWaitlist = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, 'waitlist', entryId));
      
      // Atualizar estado local
      setWaitlists(prev => prev.map(course => ({
        ...course,
        entries: course.entries.filter(entry => entry.id !== entryId),
        count: course.entries.filter(entry => entry.id !== entryId).length
      })).filter(course => course.count > 0));

      toast({
        title: "Usuário Removido",
        description: "Usuário foi removido da lista de espera",
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover usuário",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!selectedCourse || !emailTemplate.trim()) return;
    
    setIsSendingEmail(true);
    try {
      // Obter emails dos leads ativos
      const activeEntries = selectedCourse.entries.filter(entry => entry.status === 'active');
      const recipientEmails = activeEntries.map(entry => entry.userEmail);
      
      if (recipientEmails.length === 0) {
        toast({
          title: "Nenhum lead ativo",
          description: "Não há leads ativos para enviar emails",
          variant: "destructive",
        });
        return;
      }

      // Chamar Cloud Function para enviar emails
      const sendWaitlistEmails = httpsCallable(functions, 'sendWaitlistEmails');
      const result = await sendWaitlistEmails({
        courseId: selectedCourse.courseId,
        emailTemplate: emailTemplate.trim(),
        recipientEmails: recipientEmails
      });

      const data = result.data as any;
      
      if (data.success) {
        // Atualizar estado local
        setWaitlists(prev => prev.map(course => 
          course.courseId === selectedCourse.courseId 
            ? {
                ...course,
                entries: course.entries.map(entry => 
                  entry.status === 'active' ? { ...entry, status: 'notified' } : entry
                )
              }
            : course
        ));

        toast({
          title: "Emails Enviados!",
          description: `${data.totalSent} emails foram enviados com sucesso${data.totalErrors > 0 ? ` (${data.totalErrors} falharam)` : ''}`,
        });

        setIsEmailModalOpen(false);
        setEmailTemplate('');
      } else {
        throw new Error('Falha ao enviar emails');
      }

    } catch (error: any) {
      console.error('Erro ao enviar emails:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar emails",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      notified: 'secondary',
      converted: 'default',
      unsubscribed: 'destructive'
    };

    const labels = {
      active: 'Ativo',
      notified: 'Notificado',
      converted: 'Convertido',
      unsubscribed: 'Cancelado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Sem filtros - mostrar todas as listas de espera
  const filteredWaitlists = waitlists;

  const totalLeads = waitlists.reduce((sum, course) => sum + course.count, 0);
  const activeLeads = waitlists.reduce((sum, course) => 
    sum + course.entries.filter(entry => entry.status === 'active').length, 0
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Lista de Espera</h2>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão de Atualizar */}
      <div className="flex justify-end">
        <Button onClick={fetchWaitlists} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Total de Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Leads Ativos</p>
                <p className="text-2xl font-bold">{activeLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Cursos</p>
                <p className="text-2xl font-bold">{waitlists.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Lista de Cursos */}
      <div className="space-y-4">
        {filteredWaitlists.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhuma lista de espera encontrada</p>
              <p className="text-muted-foreground">
                Crie cursos com status "Waitlist" para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredWaitlists.map(course => (
            <Card key={course.courseId}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{course.courseTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.count} {course.count === 1 ? 'lead' : 'leads'} na lista de espera
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsEmailModalOpen(true);
                      }}
                      size="sm"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </Button>
                  </div>
                </div>

                {/* Lista de Leads em Cards Responsivos */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Leads na Lista de Espera ({course.entries.length})
                  </h4>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {course.entries.map(entry => (
                      <Card key={entry.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate" title={entry.userName}>
                                {entry.userName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate" title={entry.userEmail}>
                                {entry.userEmail}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {getStatusBadge(entry.status)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Entrou em {entry.joinedAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'N/A'}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Select
                              value={entry.status}
                              onValueChange={(value: string) => handleStatusChange(entry.id, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="notified">Notificado</SelectItem>
                                <SelectItem value="converted">Convertido</SelectItem>
                                <SelectItem value="unsubscribed">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromWaitlist(entry.id)}
                              className="h-8 px-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>




      {/* Modal de Email */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Email em Massa</DialogTitle>
            <DialogDescription>
              Envie um email para todos os leads ativos do curso "{selectedCourse?.courseTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Destinatários:</p>
              <p className="text-sm text-muted-foreground">
                {selectedCourse?.entries.filter(entry => entry.status === 'active').length || 0} leads ativos
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Template do Email:</label>
              <Textarea
                value={emailTemplate}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailTemplate(e.target.value)}
                placeholder="Digite o conteúdo do email aqui..."
                className="w-full h-32 mt-2 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsEmailModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail || !emailTemplate.trim()}
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
