
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Radio, Clapperboard, Video, Copy, Loader2, AlertCircle, Play, Square, Plus, Edit, Trash2, ExternalLink, Users, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, orderBy, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { LiveSession, LiveService, LiveStatus } from "@/types/live";
import UserSelector from "@/components/UserSelector";

export default function AdminLivePage() {
    
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
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
    
    useEffect(() => {
        if (!user) return;
        
        const fetchLiveSessions = async () => {
            try {
                const q = query(collection(db, 'liveSessions'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const sessions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as LiveSession[];
                
                setLiveSessions(sessions);
            } catch (error) {
                console.error("Erro ao buscar sessões:", error);
            }
        };
        
        fetchLiveSessions();
    }, [user]);

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

    const createLiveSession = async () => {
        if (!user) return;
        
        console.log("🔍 DEBUG: Criando sessão de live...");
        console.log("🔍 DEBUG: Dados:", { title, description, externalUrl, service, scheduledAt, isPrivate });
        
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
            
            console.log("🔍 DEBUG: Dados preparados:", sessionData);
            
            const docRef = await addDoc(collection(db, 'liveSessions'), sessionData);
            console.log("🔍 DEBUG: Sessão criada com ID:", docRef.id);
            
            toast({ title: "Sucesso!", description: "Sessão de live criada com sucesso!" });
            resetForm();
        } catch (error: any) {
            console.error("❌ ERRO ao criar sessão:", error);
            toast({ variant: "destructive", title: "Erro", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const updateLiveSession = async () => {
        if (!editingSession) return;
        
        setIsLoading(true);
        try {
            const sessionRef = doc(db, 'liveSessions', editingSession.id);
            await updateDoc(sessionRef, {
                title,
                description,
                externalUrl,
                service,
                scheduledAt: new Date(scheduledAt),
                isPrivate,
                allowedUsers: isPrivate ? allowedUsers : [],
                consultationType: isPrivate ? 'private' : 'public',
                maxParticipants: isPrivate ? allowedUsers.length : undefined,
                updatedAt: new Date()
            });
            
            toast({ title: "Sucesso!", description: "Sessão de live atualizada com sucesso!" });
            resetForm();
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteLiveSession = async (sessionId: string) => {
        if (!confirm("Tem certeza que deseja excluir esta sessão?")) return;
        
        try {
            await deleteDoc(doc(db, 'liveSessions', sessionId));
            
            // Atualizar o estado local para refletir a mudança na UI
            setLiveSessions(prevSessions => 
                prevSessions.filter(s => s.id !== sessionId)
            );
            
            toast({ title: "Sucesso!", description: "Sessão de live excluída com sucesso!" });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: error.message });
        }
    };

    const startLiveSession = async (session: LiveSession) => {
        try {
            const sessionRef = doc(db, 'liveSessions', session.id);
            await updateDoc(sessionRef, {
                status: 'live',
                startedAt: new Date(),
                updatedAt: new Date()
            });
            
            // Atualizar o estado local para refletir a mudança na UI
            setLiveSessions(prevSessions => 
                prevSessions.map(s => 
                    s.id === session.id 
                        ? { ...s, status: 'live', startedAt: new Date(), updatedAt: new Date() }
                        : s
                )
            );
            
            toast({ title: "Live iniciada!", description: "A sessão está agora ao vivo!" });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: error.message });
        }
    };

    const finishLiveSession = async (session: LiveSession) => {
        try {
            const sessionRef = doc(db, 'liveSessions', session.id);
            await updateDoc(sessionRef, {
                status: 'finished',
                finishedAt: new Date(),
                updatedAt: new Date()
            });
            
            // Atualizar o estado local para refletir a mudança na UI
            setLiveSessions(prevSessions => 
                prevSessions.map(s => 
                    s.id === session.id 
                        ? { ...s, status: 'finished', finishedAt: new Date(), updatedAt: new Date() }
                        : s
                )
            );
            
            toast({ title: "Live finalizada!", description: "A sessão foi encerrada!" });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: error.message });
        }
    };

    const editSession = (session: LiveSession) => {
        setEditingSession(session);
        setTitle(session.title);
        setDescription(session.description);
        setExternalUrl(session.externalUrl);
        setService(session.service);
        setScheduledAt(session.scheduledAt instanceof Date ? session.scheduledAt.toISOString().slice(0, 16) : session.scheduledAt.toDate().toISOString().slice(0, 16));
        setIsPrivate(session.isPrivate);
        setAllowedUsers(session.allowedUsers || []);
        setConsultationType(session.consultationType || 'public');
        setShowCreateForm(true);
    };

    const getServiceIcon = (service: LiveService) => {
        switch (service) {
            case 'meet': return '🔵';
            case 'zoom': return '🔵';
            case 'youtube': return '🔴';
            default: return '🔗';
        }
    };

    const getStatusColor = (status: LiveStatus) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'live': return 'bg-green-100 text-green-800';
            case 'finished': return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Gerenciar Lives</h1>
                    <p className="text-muted-foreground">Crie e gerencie sessões de live streaming.</p>
                </div>
                <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nova Sessão
                </Button>
            </div>

            {/* Formulário de criação/edição */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingSession ? 'Editar Sessão' : 'Nova Sessão de Live'}
                        </CardTitle>
                        <CardDescription>
                            Configure os detalhes da sua sessão de live streaming.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título da Live</Label>
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
                                placeholder="Descreva o conteúdo da live..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="externalUrl">Link da Live</Label>
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
                                    Live Privada
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
                                onClick={editingSession ? updateLiveSession : createLiveSession}
                                disabled={isLoading || !title || !externalUrl || !scheduledAt}
                                className="flex-1"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : editingSession ? (
                                    'Atualizar Sessão'
                                ) : (
                                    'Criar Sessão'
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

            {/* Lista de sessões */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Sessões de Live</h2>
                
                {liveSessions.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Clapperboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhuma sessão de live criada ainda.</p>
                            <Button 
                                onClick={() => setShowCreateForm(true)}
                                className="mt-4"
                            >
                                Criar Primeira Sessão
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {liveSessions.map((session) => (
                            <Card key={session.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{getServiceIcon(session.service)}</span>
                                                <CardTitle className="text-lg">{session.title}</CardTitle>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                    {session.status === 'scheduled' && 'Agendada'}
                                                    {session.status === 'live' && 'AO VIVO'}
                                                    {session.status === 'finished' && 'Finalizada'}
                                                </span>
                                                {session.isPrivate ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                                                        <Lock className="h-3 w-3" />
                                                        Consultoria Privada
                                                        {session.allowedUsers && session.allowedUsers.length > 0 && (
                                                            <span className="ml-1">({session.allowedUsers.length} participante{session.allowedUsers.length > 1 ? 's' : ''})</span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Live Pública
                                                    </span>
                                                )}
                                            </div>
                                            <CardDescription>{session.description}</CardDescription>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {session.status === 'scheduled' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => startLiveSession(session)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Iniciar
                                                </Button>
                                            )}
                                            
                                            {session.status === 'live' && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => finishLiveSession(session)}
                                                >
                                                    <Square className="h-4 w-4" />
                                                    Finalizar
                                                </Button>
                                            )}
                                            
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => editSession(session)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deleteLiveSession(session.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Serviço:</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span>{getServiceIcon(session.service)}</span>
                                                <span className="capitalize">{session.service}</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="font-medium">Agendada para:</span>
                                            <div className="mt-1">
                                                {session.scheduledAt instanceof Date ? session.scheduledAt.toLocaleString('pt-BR') : session.scheduledAt.toDate().toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="font-medium">Link:</span>
                                            <div className="mt-1">
                                                <a
                                                    href={session.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Acessar Live
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
