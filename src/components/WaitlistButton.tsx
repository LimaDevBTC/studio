"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface WaitlistButtonProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
}

export function WaitlistButton({ courseId, courseTitle, coursePrice }: WaitlistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para entrar na lista de espera.",
        variant: "destructive",
      });
      return;
    }

    if (userData?.isAdmin) {
      toast({
        title: "Acesso Direto",
        description: "Como administrador, você tem acesso direto a todos os cursos.",
        variant: "default",
      });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // Adicionar à subcoleção waitlist do curso
      const waitlistRef = doc(collection(db, `courses/${courseId}/waitlist`), user.uid);
      
      await setDoc(waitlistRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        courseId,
        courseTitle,
        coursePrice,
        joinedAt: serverTimestamp(),
        status: 'active'
      });

      // Adicionar à coleção global waitlist para relatórios
      const globalWaitlistRef = doc(collection(db, 'waitlist'));
      
      await setDoc(globalWaitlistRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        courseId,
        courseTitle,
        coursePrice,
        joinedAt: serverTimestamp(),
        status: 'active'
      });

      setIsSuccess(true);
      
      toast({
        title: "Sucesso!",
        description: "Você foi adicionado à lista de espera! Te avisaremos quando o curso estiver disponível.",
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao entrar na lista de espera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar na lista de espera. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsOpen(false);
      setIsSuccess(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        disabled={isLoading}
      >
        <Clock className="h-4 w-4 mr-2" />
        {isLoading ? 'Processando...' : 'Entrar para Lista de Espera'}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          {!isSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Lista de Espera
                </DialogTitle>
                <DialogDescription>
                  Quer ser notificado quando este curso estiver disponível?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{courseTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    Preço: ${coursePrice}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {user?.email}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• Receberá notificação quando o curso for publicado</p>
                  <p>• Acesso prioritário na data de lançamento</p>
                  <p>• Pode cancelar a qualquer momento</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleJoinWaitlist}
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isLoading ? 'Adicionando...' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Sucesso!
                </DialogTitle>
              </DialogHeader>

              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Você foi adicionado à lista de espera!</p>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Receberemos seu email quando o curso estiver disponível</p>
                  <p>• Você terá acesso prioritário na data de lançamento</p>
                  <p>• Obrigado pelo interesse!</p>
                </div>

                <Button onClick={handleClose} className="w-full">
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
