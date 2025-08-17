
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Clapperboard, Video, ExternalLink, Clock, Users, Lock, Play } from "lucide-react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { LiveSession, LiveStatus } from "@/types/live";

export default function UserLivePage() {

    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchLiveSessions = async () => {
            try {
                // Buscar todas as sessões primeiro (sem filtros complexos)
                const q = query(
                    collection(db, 'liveSessions'),
                    orderBy('createdAt', 'desc')
                );
                
                const querySnapshot = await getDocs(q);
                const allSessions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as LiveSession[];
                
                // Filtrar no frontend para evitar problemas de índices
                let filteredSessions = allSessions;
                
                if (user) {
                    // Usuário logado: mostrar públicas + privadas onde ele tem acesso
                    filteredSessions = allSessions.filter(session => 
                        !session.isPrivate || session.allowedUsers?.includes(user.uid)
                    );
                } else {
                    // Usuário não logado: apenas públicas
                    filteredSessions = allSessions.filter(session => !session.isPrivate);
                }
                
                // Ordenar por data
                filteredSessions.sort((a, b) => {
                    const dateA = a.scheduledAt instanceof Date ? a.scheduledAt : a.scheduledAt.toDate();
                    const dateB = b.scheduledAt instanceof Date ? b.scheduledAt : b.scheduledAt.toDate();
                    return dateB.getTime() - dateA.getTime();
                });
                
                setLiveSessions(filteredSessions);
            } catch (error) {
                console.error("Erro ao buscar sessões:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLiveSessions();
    }, [user]);

    const getServiceIcon = (service: string) => {
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

    const getStatusText = (status: LiveStatus) => {
        switch (status) {
            case 'scheduled': return 'Agendada';
            case 'live': return 'AO VIVO';
            case 'finished': return 'Finalizada';
        }
    };

    const formatDate = (date: any) => {
        if (date instanceof Date) {
            return date.toLocaleString('pt-BR');
        }
        return date.toDate().toLocaleString('pt-BR');
    };

    const isLiveNow = (session: LiveSession) => {
        if (session.status !== 'live') return false;
        
        const now = new Date();
        const scheduledDate = session.scheduledAt instanceof Date ? session.scheduledAt : session.scheduledAt.toDate();
        
        // Considerar "ao vivo" se foi agendada para hoje e status é 'live'
        return scheduledDate.toDateString() === now.toDateString();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Carregando lives...</p>
                    </div>
                </div>
            </div>
        );
    }

        return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold font-headline">Lives e Consultorias</h1>
                <p className="text-xl text-muted-foreground">
                    Acompanhe nossas transmissões ao vivo e participe de consultorias personalizadas
                </p>
            </div>

            {/* Live em andamento */}
            {liveSessions.some(s => s.status === 'live') && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Radio className="h-6 w-6 text-green-600 animate-pulse" />
                        AO VIVO AGORA
                    </h2>
                    
                    <div className="grid gap-4">
                        {liveSessions
                            .filter(s => s.status === 'live')
                            .map((session) => (
                                <Card key={session.id} className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-3xl">{getServiceIcon(session.service)}</span>
                                                    <CardTitle className="text-xl text-gray-900">
                                                        {session.title}
                                                    </CardTitle>
                                                    <Badge className="bg-red-600 text-white animate-pulse shadow-md">
                                                        🔴 AO VIVO
                                                    </Badge>
                                                    {session.isPrivate && (
                                                        <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200">
                                                            <Lock className="h-3 w-3" />
                                                            Privada
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-gray-700 font-medium">
                                                    {session.description}
                                                </CardDescription>
                                            </div>
                                            
                                            <Button
                                                size="lg"
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                                onClick={() => window.open(session.externalUrl, '_blank')}
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                Participar Agora
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="bg-white/70 rounded-lg p-4 border border-green-200">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="bg-white p-3 rounded-lg border border-green-100">
                                                <span className="font-semibold text-gray-800">Serviço:</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-lg">{getServiceIcon(session.service)}</span>
                                                    <span className="capitalize font-medium text-gray-900">{session.service}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 rounded-lg border border-green-100">
                                                <span className="font-semibold text-gray-800">Iniciada em:</span>
                                                <div className="mt-2 font-medium text-gray-900">
                                                    {formatDate(session.scheduledAt)}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-3 rounded-lg border border-green-100">
                                                <span className="font-semibold text-gray-800">Link:</span>
                                                <div className="mt-2">
                                                    <a
                                                        href={session.externalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-700 hover:text-green-800 flex items-center gap-1 font-medium hover:underline transition-colors"
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
                </div>
            )}

            {/* Próximas lives */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Clock className="h-6 w-6" />
                    Próximas Lives
                </h2>
                
                {liveSessions.filter(s => s.status === 'scheduled').length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhuma live agendada no momento.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Fique atento às nossas próximas transmissões!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {liveSessions
                            .filter(s => s.status === 'scheduled')
                            .map((session) => (
                                <Card key={session.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{getServiceIcon(session.service)}</span>
                                                    <CardTitle className="text-lg">{session.title}</CardTitle>
                                                    <Badge variant="secondary">
                                                        {getStatusText(session.status)}
                                                    </Badge>
                                                    {session.isPrivate && (
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <Lock className="h-3 w-3" />
                                                            Privada
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription>{session.description}</CardDescription>
                                            </div>
                                            
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(session.externalUrl, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Ver Detalhes
                                            </Button>
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
                                                    {formatDate(session.scheduledAt)}
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

            {/* Lives finalizadas */}
            {liveSessions.filter(s => s.status === 'finished').length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Video className="h-6 w-6" />
                        Lives Anteriores
                    </h2>
                    
                    <div className="grid gap-4">
                        {liveSessions
                            .filter(s => s.status === 'finished')
                            .map((session) => (
                                <Card key={session.id} className="opacity-75">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{getServiceIcon(session.service)}</span>
                                                    <CardTitle className="text-lg text-gray-600">
                                                        {session.title}
                                                    </CardTitle>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                        Finalizada
                                                    </Badge>
                                                    {session.isPrivate && (
                                                        <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200">
                                                            <Lock className="h-3 w-3" />
                                                            Privada
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-gray-500">
                                                    {session.description}
                                                </CardDescription>
                                            </div>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                                onClick={() => window.open(session.externalUrl, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Ver Gravação
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Serviço:</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span>{getServiceIcon(session.service)}</span>
                                                    <span className="capitalize text-gray-700">{session.service}</span>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <span className="font-medium text-gray-600">Finalizada em:</span>
                                                <div className="mt-1 text-gray-700">
                                                    {formatDate(session.finishedAt || session.scheduledAt)}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <span className="font-medium text-gray-600">Duração:</span>
                                                <div className="mt-1 text-gray-700">
                                                    {session.startedAt && session.finishedAt 
                                                        ? `${Math.round((session.finishedAt.toDate() - session.startedAt.toDate()) / (1000 * 60))} min`
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </div>
            )}

            {/* Mensagem se não há lives */}
            {liveSessions.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Clapperboard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma live disponível</h3>
                        <p className="text-muted-foreground">
                            Não há lives agendadas ou em andamento no momento.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Volte mais tarde para conferir nossas próximas transmissões!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
