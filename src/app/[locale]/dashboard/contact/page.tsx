"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, Users, BookOpen, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import XIcon from "@/components/icons/XIcon";
import Image from 'next/image';

export default function DashboardContactPage() {
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
        <Card className="text-center border-border bg-card">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">Mensagem Enviada!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Obrigado pelo seu contato. Entraremos em contato em breve!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Enviar Nova Mensagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        <h1 className="text-4xl font-bold text-foreground">Suporte e Contato</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Estamos aqui para ajudar! Entre em contato conosco para dúvidas, sugestões ou suporte técnico.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Informações de Contato */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <MessageSquare className="h-5 w-5" />
                Canais de Contato
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Escolha a melhor forma de entrar em contato conosco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Email Principal</p>
                  <a 
                    href="mailto:support@mqmcrypto.com" 
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    support@mqmcrypto.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <XIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Twitter/X</p>
                  <a 
                    href="https://twitter.com/mqmcrypto" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    @mqmcrypto
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Localização</p>
                  <p className="text-muted-foreground">Brasil</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="h-5 w-5" />
                Horário de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Segunda a Sexta:</span>
                <span className="font-medium text-card-foreground">9h às 18h (BRT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sábado:</span>
                <span className="font-medium text-card-foreground">9h às 14h (BRT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domingo:</span>
                <span className="font-medium text-card-foreground">Fechado</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="h-5 w-5" />
                Tipos de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Suporte técnico para cursos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Dúvidas sobre lives e consultorias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Problemas com assinatura</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Sugestões e feedback</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Contato */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Envie sua Mensagem</CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha o formulário abaixo e entraremos em contato o mais breve possível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-card-foreground">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    required
                    className="border-border bg-background text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    required
                    className="border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-card-foreground">Assunto *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Qual o motivo do contato?"
                  required
                  className="border-border bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-card-foreground">Mensagem *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                  rows={5}
                  required
                  className="border-border bg-background text-foreground"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
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
