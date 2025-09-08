"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DebugPaymentModalProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  trigger: React.ReactNode;
  type?: 'course' | 'subscription' | 'consultation';
}

export default function DebugPaymentModal({
  courseId,
  courseTitle,
  coursePrice,
  trigger,
  type = 'course'
}: DebugPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  console.log('DebugPaymentModal renderizado:', { courseId, courseTitle, coursePrice, type });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Debug Payment Modal</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{courseTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {type === 'course' ? 'Curso' : type === 'subscription' ? 'Plano de Assinatura' : 'Consultoria'}
            </p>
            <p className="text-2xl font-bold">${coursePrice}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                console.log('Botão Criptomoedas clicado');
                alert('Criptomoedas selecionado!');
              }}
            >
              Pagar com Criptomoedas
            </Button>
            
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                console.log('Botão Cartão clicado');
                alert('Cartão selecionado!');
              }}
            >
              Pagar com Cartão
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
