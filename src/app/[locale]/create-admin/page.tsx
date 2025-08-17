"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

export default function CreateAdminPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { toast } = useToast();
    const { user, userData } = useAuth();

    const createFirstAdmin = httpsCallable(functions, 'createFirstAdmin');

    const handleCreateAdmin = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado." });
            return;
        }

        setIsCreating(true);
        try {
            const result = await createFirstAdmin();
            const data = result.data as any;
            
            toast({ 
                title: "Sucesso!", 
                description: data.message || "Admin criado com sucesso!" 
            });
            
            setIsAdmin(true);
            
            // Log out and log back in to refresh claims
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error: any) {
            console.error("Error creating admin:", error);
            toast({ 
                variant: "destructive", 
                title: "Erro", 
                description: error.message || "Falha ao criar admin." 
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Acesso Negado</CardTitle>
                        <CardDescription className="text-center">
                            Você precisa estar logado para acessar esta página.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (userData?.isAdmin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-center text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Já é Admin!
                        </CardTitle>
                        <CardDescription className="text-center">
                            Você já tem permissões de administrador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <a href="/admin/dashboard">Ir para Dashboard Admin</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Criar Primeiro Admin</CardTitle>
                    <CardDescription>
                        Esta função cria o primeiro usuário administrador da plataforma.
                        <br />
                        <strong>Use apenas uma vez!</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Atenção</AlertTitle>
                        <AlertDescription>
                            Esta ação tornará você o primeiro administrador da plataforma.
                            Após a criação, você terá acesso total ao painel administrativo.
                        </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            <strong>Usuário atual:</strong> {user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong>UID:</strong> {user.uid}
                        </p>
                    </div>

                    <Button 
                        onClick={handleCreateAdmin} 
                        disabled={isCreating || isAdmin}
                        className="w-full"
                        size="lg"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando Admin...
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                Criar Primeiro Admin
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
