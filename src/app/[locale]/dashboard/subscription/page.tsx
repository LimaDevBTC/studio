
"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, DollarSign, RefreshCw, Eye } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    price: 29.99,
    description: "Acesso completo a todos os cursos por 1 mês",
    features: [
      "Acesso a todos os cursos",
      "Suporte por email",
      "Atualizações gratuitas",
      "Certificado de conclusão"
    ],
    popular: false
  },
  {
    id: "yearly",
    name: "Anual",
    price: 299.99,
    description: "Acesso completo a todos os cursos por 1 ano",
    features: [
      "Acesso a todos os cursos",
      "Suporte prioritário",
      "Atualizações gratuitas",
      "Certificado de conclusão",
      "2 meses grátis"
    ],
    popular: true
  }
];

interface Transaction {
  id: string;
  courseTitle: string;
  amount: number;
  currency: string;
  network: string;
  status: string;
  createdAt: any;
}

export default function SubscriptionPage() {
  const t = useTranslations('SubscriptionPage');
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user?.uid)
        // Removido orderBy para evitar necessidade de índice composto
      );
      const snapshot = await getDocs(q);
      const transactionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      // Ordenação local por data de criação (mais recente primeiro)
      transactionsList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });
      
      setTransactions(transactionsList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Aprovado", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejeitado", className: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Planos de Assinatura */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold">
                ${plan.price}
                <span className="text-lg text-muted-foreground">
                  /{plan.id === "monthly" ? "mês" : "ano"}
                </span>
              </div>
              <CardDescription className="text-base">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  // Abrir modal de pagamento
                  console.log(`Selecionado plano: ${plan.name}`);
                }}
              >
                Escolher {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Transações do Usuário - Versão Simplificada */}
      <div className="max-w-4xl mx-auto">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Histórico de Transações
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando transações...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{transaction.courseTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.amount} {transaction.currency} ({transaction.network})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
