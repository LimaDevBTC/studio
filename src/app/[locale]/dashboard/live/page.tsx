
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Clapperboard, Video, ExternalLink, Clock, Users, Lock, Play, Calendar, Link as LinkIcon } from "lucide-react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { LiveSession, LiveStatus } from "@/types/live";
import { useTranslations } from 'next-intl';

export default function UserLivePage() {
    const t = useTranslations('LivePage');
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
                console.error("Error fetching sessions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLiveSessions();
    }, [user]);

    const getServiceIcon = (service: string) => {
        switch (service) {
            case 'meet': return <Video className="h-4 w-4" />;
            case 'zoom': return <Video className="h-4 w-4" />;
            case 'youtube': return <Video className="h-4 w-4" />;
            default: return <LinkIcon className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: LiveStatus) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'live': return 'bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/20';
            case 'finished': return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStatusText = (status: LiveStatus) => {
        switch (status) {
            case 'scheduled': return t('statusScheduled');
            case 'live': return t('statusLive');
            case 'finished': return t('statusFinished');
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
                        <p className="text-muted-foreground">{t('loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">{t('title')}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            {/* Live in progress */}
            {liveSessions.some(s => s.status === 'live') && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-3 text-[#F7931A]">
                        <div className="w-3 h-3 bg-[#F7931A] rounded-full animate-pulse"></div>
                        {t('liveNow')}
                    </h2>
                    
                    <div className="grid gap-4">
                        {liveSessions
                            .filter(s => s.status === 'live')
                            .map((session) => (
                                <Card key={session.id} className="border-[#F7931A]/20 bg-gradient-to-r from-[#F7931A]/10 to-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <CardTitle className="text-xl">{session.title}</CardTitle>
                                                    <Badge className="bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/20 font-medium">
                                                        {t('live')}
                                                    </Badge>
                                                    {session.isPrivate && (
                                                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                                                            <Lock className="h-3 w-3 mr-1" />
                                                            {t('private')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-base text-gray-600">
                                                    {session.description}
                                                </CardDescription>
                                            </div>
                                            
                                            <Button
                                                size="lg"
                                                className="bg-[#F7931A] hover:bg-[#F7931A]/90 text-white shadow-sm"
                                                onClick={() => window.open(session.externalUrl, '_blank')}
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                {t('joinNow')}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                                                <Video className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="font-medium text-gray-700">{t('service')}</span>
                                                    <div className="text-gray-900 capitalize">{session.service}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="font-medium text-gray-700">{t('startedAt')}</span>
                                                    <div className="text-gray-900">{formatDate(session.scheduledAt)}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                                                <LinkIcon className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="font-medium text-gray-700">{t('access')}</span>
                                                    <a
                                                        href={session.externalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#F7931A] hover:text-[#F7931A]/80 font-medium hover:underline transition-colors"
                                                    >
                                                        {t('accessLive')}
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

            {/* Upcoming lives */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-3 text-[#F7931A]">
                    <Clock className="h-6 w-6" />
                    {t('upcomingLives')}
                </h2>
                
                {liveSessions.filter(s => s.status === 'scheduled').length === 0 ? (
                    <Card className="border-dashed border-gray-200">
                        <CardContent className="p-8 text-center">
                            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-medium">{t('noUpcomingLives')}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {t('stayTuned')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {liveSessions
                            .filter(s => s.status === 'scheduled')
                            .map((session) => (
                                <Card key={session.id} className="hover:shadow-md transition-shadow border-gray-100">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <CardTitle className="text-lg">{session.title}</CardTitle>
                                                    <Badge variant="secondary" className={getStatusColor(session.status)}>
                                                        {getStatusText(session.status)}
                                                    </Badge>
                                                    {session.isPrivate && (
                                                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                                                            <Lock className="h-3 w-3 mr-1" />
                                                            {t('private')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-gray-600">
                                                    {session.description}
                                                </CardDescription>
                                            </div>
                                            
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(session.externalUrl, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                {t('viewDetails')}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                                                <Video className="h-4 w-4 text-[#F7931A]" />
                                                <div>
                                                    <span className="font-medium text-card-foreground">{t('service')}</span>
                                                    <div className="text-card-foreground capitalize">{session.service}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                                                <Calendar className="h-4 w-4 text-[#F7931A]" />
                                                <div>
                                                    <span className="font-medium text-card-foreground">{t('scheduledFor')}</span>
                                                    <div className="text-card-foreground">{formatDate(session.scheduledAt)}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                                                <LinkIcon className="h-4 w-4 text-[#F7931A]" />
                                                <div>
                                                    <span className="font-medium text-card-foreground">{t('access')}</span>
                                                    <div>
                                                        <a
                                                            href={session.externalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#F7931A] hover:text-[#F7931A]/80 font-medium hover:underline transition-colors"
                                                        >
                                                            {t('accessLive')}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>

            {/* Finished lives */}
            {liveSessions.filter(s => s.status === 'finished').length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-3 text-gray-700">
                        <Video className="h-6 w-6" />
                        {t('previousLives')}
                    </h2>
                    
                    <div className="grid gap-4">
                        {liveSessions
                            .filter(s => s.status === 'finished')
                            .map((session) => (
                                <Card key={session.id} className="opacity-80 hover:opacity-100 transition-opacity border-gray-100">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <CardTitle className="text-lg text-gray-700">
                                                        {session.title}
                                                    </CardTitle>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                                                        {t('finished')}
                                                    </Badge>
                                                    {session.isPrivate && (
                                                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                                                            <Lock className="h-3 w-3 mr-1" />
                                                            {t('private')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-gray-500">
                                                    {session.description}
                                                </CardDescription>
                                            </div>
                                            
                                            {/* Botão removido - link disponível na parte inferior */}
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                                                <Video className="h-4 w-4 text-[#F7931A]" />
                                                <div>
                                                    <span className="font-medium text-card-foreground">{t('service')}</span>
                                                    <div className="text-card-foreground capitalize">{session.service}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                                                <Calendar className="h-4 w-4 text-[#F7931A]" />
                                                <div>
                                                    <span className="font-medium text-card-foreground">{t('completedAt')}</span>
                                                    <div className="text-card-foreground">{formatDate(session.scheduledAt)}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                                                <LinkIcon className="h-4 w-4 text-[#F7931A]" />
                                                <div>
                                                    <span className="font-medium text-card-foreground">{t('access')}</span>
                                                    <div>
                                                        <a
                                                            href={session.externalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#F7931A] hover:text-[#F7931A]/80 font-medium hover:underline transition-colors"
                                                        >
                                                            {t('viewRecording')}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
