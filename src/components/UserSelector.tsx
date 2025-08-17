"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, X, Check } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface User {
    uid: string;
    email: string;
    displayName?: string;
    isAdmin?: boolean;
}

interface UserSelectorProps {
    selectedUsers: string[];
    onUsersChange: (userIds: string[]) => void;
    maxUsers?: number;
}

export default function UserSelector({ selectedUsers, onUsersChange, maxUsers = 10 }: UserSelectorProps) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log("🔍 UserSelector: Iniciando busca de usuários...");
                
                // Query mais simples e robusta
                const q = query(collection(db, 'users'));
                const querySnapshot = await getDocs(q);
                
                console.log(`🔍 UserSelector: Encontrados ${querySnapshot.docs.length} usuários no total`);
                
                const users = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    console.log(`🔍 UserSelector: Usuário ${doc.id}:`, data);
                    return {
                        uid: doc.id,
                        ...data
                    };
                }) as User[];
                
                // Filtrar apenas usuários não-admin (com debug)
                const nonAdminUsers = users.filter(user => {
                    const isNotAdmin = !user.isAdmin;
                    console.log(`🔍 UserSelector: ${user.email} - isAdmin: ${user.isAdmin}, incluído: ${isNotAdmin}`);
                    return isNotAdmin;
                });
                
                console.log(`🔍 UserSelector: ${nonAdminUsers.length} usuários não-admin encontrados`);
                setAllUsers(nonAdminUsers);
            } catch (error) {
                console.error("❌ UserSelector: Erro ao buscar usuários:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = allUsers.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.email.toLowerCase().includes(searchLower) ||
            (user.displayName && user.displayName.toLowerCase().includes(searchLower))
        );
    });

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            onUsersChange(selectedUsers.filter(id => id !== userId));
        } else {
            if (selectedUsers.length < maxUsers) {
                onUsersChange([...selectedUsers, userId]);
            }
        }
    };

    const removeUser = (userId: string) => {
        onUsersChange(selectedUsers.filter(id => id !== userId));
    };

    const getSelectedUser = (userId: string) => {
        return allUsers.find(user => user.uid === userId);
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Label>Usuários Permitidos</Label>
                <div className="text-sm text-muted-foreground">
                    Carregando usuários...
                </div>
            </div>
        );
    }

    if (allUsers.length === 0) {
        return (
            <div className="space-y-2">
                <Label>Usuários Permitidos</Label>
                <div className="text-sm text-muted-foreground">
                    Nenhum usuário encontrado na base de dados.
                </div>
                <div className="text-xs text-muted-foreground">
                    Verifique se existem usuários cadastrados na coleção 'users'.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Label>Usuários Permitidos</Label>
            
            {/* Informações de debug */}
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <div>Total de usuários: {allUsers.length}</div>
                <div>Usuários selecionados: {selectedUsers.length}</div>
                {maxUsers && <div>Máximo permitido: {maxUsers}</div>}
            </div>

            {/* Usuários selecionados */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                        {selectedUsers.length} usuário(s) selecionado(s)
                        {maxUsers && ` (máximo: ${maxUsers})`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                            const user = getSelectedUser(userId);
                            return user ? (
                                <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                    {user.displayName || user.email}
                                    <button
                                        onClick={() => removeUser(userId)}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Campo de busca */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar usuários por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Lista de usuários */}
            <Card className="max-h-60 overflow-y-auto">
                <CardContent className="p-3">
                    <div className="text-sm font-medium mb-3 text-center text-muted-foreground">
                        {filteredUsers.length} usuário(s) disponível(is)
                    </div>
                    
                    {filteredUsers.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">
                            {searchTerm ? "Nenhum usuário encontrado para esta busca" : "Nenhum usuário disponível"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.map(user => {
                                const isSelected = selectedUsers.includes(user.uid);
                                const isDisabled = !isSelected && selectedUsers.length >= maxUsers;
                                
                                return (
                                    <button
                                        key={user.uid}
                                        onClick={() => toggleUser(user.uid)}
                                        disabled={isDisabled}
                                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                : isDisabled
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'hover:bg-muted border-border hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                                    isSelected ? 'bg-primary-foreground text-primary' : 'bg-muted'
                                                }`}>
                                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {user.displayName || 'Sem nome'}
                                                    </div>
                                                    <div className="text-sm opacity-80">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
