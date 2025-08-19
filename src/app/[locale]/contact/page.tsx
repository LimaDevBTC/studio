"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import XIcon from "@/components/icons/XIcon";
import Image from 'next/image';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aqui você implementaria o envio real do email
      // Por enquanto, vamos simular o envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato diretamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Mensagem Enviada!</CardTitle>
            <CardDescription>
              Obrigado pelo seu contato. Entraremos em contato em breve!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Enviar Nova Mensagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-4">
          <Image 
            src="/images/logo.png"
            alt="MQMCrypto Logo"
            width={4000}
            height={2250}
            className="h-24 w-auto"
            priority
            quality={100}
            unoptimized
          />
        </div>
        <h1 className="text-4xl font-bold">Entre em Contato</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tem alguma dúvida, sugestão ou precisa de ajuda? Estamos aqui para você!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Informações de Contato */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Entre em contato conosco através dos canais abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email Principal</p>
                  <a 
                    href="mailto:support@mqmcrypto.com" 
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    support@mqmcrypto.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <XIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Twitter/X</p>
                  <a 
                    href="https://twitter.com/mqmcrypto" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    @mqmcrypto
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Localização</p>
                  <p className="text-muted-foreground">Brasil</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span className="font-medium">9h às 18h (BRT)</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado:</span>
                <span className="font-medium">9h às 14h (BRT)</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo:</span>
                <span className="font-medium">Fechado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por que nos escolher?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Suporte técnico especializado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Resposta em até 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Atendimento em português</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Soluções personalizadas</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Envie sua Mensagem</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e entraremos em contato o mais breve possível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Qual o motivo do contato?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                  rows={5}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
