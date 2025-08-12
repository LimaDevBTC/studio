
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Radio, Clapperboard, Video, Copy, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

interface LiveState {
    status: 'inactive' | 'generating' | 'ready' | 'streaming' | 'error';
    rtmpUrl?: string;
    streamKey?: string;
    playbackUrl?: string;
    errorMessage?: string;
}

// Mock Cloud Functions locally for UI development
// const createLiveStream = httpsCallable(functions, 'createLiveStream');
// const finishLiveStreamCallable = httpsCallable(functions, 'finishLiveStream');

export default function AdminLivePage() {
    
    const [liveState, setLiveState] = useState<LiveState>({ status: 'inactive' });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        const liveDocRef = doc(db, 'live', 'current');
        const unsubscribe = onSnapshot(liveDocRef, (doc) => {
            setIsLoading(true);
            if (doc.exists()) {
                setLiveState(doc.data() as LiveState);
            } else {
                setLiveState({ status: 'inactive' });
            }
            setIsLoading(false); // Stop loading once we get the state
        }, (error) => {
            console.error("Error fetching live status:", error);
            setLiveState({ status: 'error', errorMessage: error.message });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const prepareStream = async () => {
        setIsLoading(true);
        const liveDocRef = doc(db, 'live', 'current');
        const mockData = {
            status: 'ready',
            rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
            streamKey: 'abcd-1234-efgh-5678',
            playbackUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            errorMessage: '',
        }
        try {
            await setDoc(liveDocRef, mockData);
            toast({ title: "Live stream channel created!", description: "You can now configure your streaming software."});
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed to create channel", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const goLive = async () => {
        setIsLoading(true);
        const liveDocRef = doc(db, 'live', 'current');
        try {
            await updateDoc(liveDocRef, { status: 'streaming' });
            toast({ title: "Success!", description: "You are now live on the platform." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
             setIsLoading(false);
        }
    }
    
    const finishStream = async () => {
        setIsLoading(true);
        const liveDocRef = doc(db, 'live', 'current');
        try {
             await deleteDoc(liveDocRef);
            toast({ title: "Stream finished", description: "The live stream has been ended." });
        } catch (error: any) {
            console.error(error);
             toast({ variant: "destructive", title: "Failed to finish stream", description: error.message });
        } finally {
            // Firestore listener will update the state and loading status
        }
    };

    const copyToClipboard = (text: string) => {
        if(!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Text copied to your clipboard." });
    }


  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Live Streaming</h1>
          <p className="text-muted-foreground">Manage your live streams here.</p>
        </div>
      </div>

       {liveState.status === 'error' && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>{liveState.errorMessage || "Something went wrong. Check the console and try again."}</AlertDescription>
            </Alert>
       )}

      {liveState.status === 'inactive' && (
        <Card>
            <CardHeader>
                <CardTitle>Start a new live stream</CardTitle>
                <CardDescription>
                    Click the button below to generate a new stream key and server URL. This will prepare the platform to receive your live video feed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center flex-col gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                    <Clapperboard className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg font-semibold">You are not currently live.</p>
                    <Button size="lg" disabled={isLoading} onClick={prepareStream}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Prepare New Stream
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      {liveState.status === 'generating' && (
         <Card>
            <CardContent className="p-8 text-center">
                 <div className="flex items-center justify-center flex-col gap-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <p className="text-lg font-semibold text-muted-foreground">Generating stream channel...</p>
                    <p className="text-sm text-muted-foreground">This can take a moment. Please wait.</p>
                </div>
            </CardContent>
         </Card>
      )}

      {liveState.status === 'ready' && (
        <div className="grid lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Stream Ready</CardTitle>
                    <CardDescription>
                        Use the details below in your streaming software (e.g., OBS, StreamYard) to start your broadcast.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="server-url">RTMP Server URL</Label>
                        <div className="flex gap-2">
                             <Input id="server-url" readOnly value={liveState.rtmpUrl} />
                             <Button variant="outline" size="icon" onClick={() => copyToClipboard(liveState.rtmpUrl || '')}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="stream-key">Stream Key</Label>
                         <div className="flex gap-2">
                            <Input id="stream-key" readOnly value={liveState.streamKey} />
                             <Button variant="outline" size="icon" onClick={() => copyToClipboard(liveState.streamKey || '')}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-secondary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-muted-foreground animate-pulse" />
                        Awaiting Signal
                    </CardTitle>
                    <CardDescription>
                        Once you start streaming from your software, click the button below to make the stream live for your users on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Button size="lg" className="w-full" disabled={isLoading} onClick={goLive}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Go Live Now
                    </Button>
                     <Button variant="destructive" className="w-full" disabled={isLoading} onClick={finishStream}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Cancel Stream
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}
        
      {liveState.status === 'streaming' && (
        <Card className="border-primary/50">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-primary">
                    <Radio className="w-5 h-5 animate-pulse" />
                    You are LIVE
                </CardTitle>
                <CardDescription>
                    Your stream is currently active on the platform. Click the button below to stop the broadcast for everyone.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-8">
                 <Button size="lg" variant="destructive" disabled={isLoading} onClick={finishStream}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Finish Live Stream
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
