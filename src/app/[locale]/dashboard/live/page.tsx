
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radio, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReactPlayer from 'react-player/lazy';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveState {
    status: 'loading' | 'streaming' | 'inactive';
    playbackUrl?: string | null;
}

export default function LivePage() {
    const [liveState, setLiveState] = useState<LiveState>({ status: 'loading' });

    useEffect(() => {
        const liveDocRef = doc(db, 'live', 'current');

        const unsubscribe = onSnapshot(liveDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.status === 'streaming' && data.playbackUrl) {
                    setLiveState({ status: 'streaming', playbackUrl: data.playbackUrl });
                } else {
                    setLiveState({ status: 'inactive' });
                }
            } else {
                setLiveState({ status: 'inactive' });
            }
        });

        return () => unsubscribe();
    }, []);

    if (liveState.status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h1 className="text-2xl font-bold">Verificando transmissão...</h1>
            </div>
        );
    }

    if (liveState.status === 'inactive') {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                 <div className="p-6 bg-muted rounded-full mb-6">
                    <Radio className="w-16 h-16 text-muted-foreground" />
                 </div>
                <h1 className="text-4xl font-bold font-headline">Nenhuma transmissão ao vivo</h1>
                <p className="text-muted-foreground mt-2 max-w-md">
                    Não há nenhuma transmissão acontecendo no momento. Fique de olho nos anúncios para saber quando será a próxima!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <h1 className="text-3xl font-bold font-headline">Ao Vivo Agora</h1>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {liveState.playbackUrl ? (
                    <ReactPlayer
                        url={liveState.playbackUrl}
                        playing={true}
                        controls={true}
                        width='100%'
                        height='100%'
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <p>Carregando stream...</p>
                    </div>
                )}
            </div>

            {/* Placeholder for a chat component */}
            <Card>
                <CardHeader>
                    <CardTitle>Chat da Live</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">O chat aparecerá aqui.</p>
                </CardContent>
            </Card>
        </div>
    );
}
