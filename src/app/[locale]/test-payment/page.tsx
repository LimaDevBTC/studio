"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DebugPaymentModal from "@/components/DebugPaymentModal";
import UnifiedPaymentModal from "@/components/UnifiedPaymentModal";
import CryptoPaymentModal from "@/components/CryptoPaymentModal";
import StripePaymentModal from "@/components/StripePaymentModal";

export default function TestPaymentPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Teste de Modais de Pagamento</h1>
        <p className="text-muted-foreground">
          Esta página é para testar todos os modais de pagamento implementados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Teste 1: Modal de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>1. Modal de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <DebugPaymentModal
              courseId="debug-123"
              courseTitle="Curso de Debug"
              coursePrice={99.99}
              trigger={
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Testar Modal de Debug
                </Button>
              }
              type="course"
            />
          </CardContent>
        </Card>

        {/* Teste 2: Modal Unificado */}
        <Card>
          <CardHeader>
            <CardTitle>2. Modal Unificado (USDT/USDC/Solana + PIX/Cartão)</CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedPaymentModal
              courseId="unified-123"
              courseTitle="Curso Unificado"
              coursePrice={149.99}
              trigger={
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Testar Modal Unificado
                </Button>
              }
              type="course"
            />
          </CardContent>
        </Card>

        {/* Teste 3: Modal Crypto Original */}
        <Card>
          <CardHeader>
            <CardTitle>3. Modal Crypto Original</CardTitle>
          </CardHeader>
          <CardContent>
            <CryptoPaymentModal
              courseId="crypto-123"
              courseTitle="Curso Crypto"
              coursePrice={199.99}
              trigger={
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Testar Modal Crypto
                </Button>
              }
              type="course"
            />
          </CardContent>
        </Card>

        {/* Teste 4: Modal Stripe */}
        <Card>
          <CardHeader>
            <CardTitle>4. Modal Stripe (PIX + Cartão)</CardTitle>
          </CardHeader>
          <CardContent>
            <StripePaymentModal
              courseId="stripe-123"
              courseTitle="Curso Stripe"
              coursePrice={249.99}
              trigger={
                <Button className="w-full bg-purple-500 hover:bg-purple-600">
                  Testar Modal Stripe
                </Button>
              }
              type="course"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instruções de Teste:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Clique em cada botão para testar os diferentes modais</li>
          <li>Verifique se os modais abrem corretamente</li>
          <li>Teste a navegação entre as opções</li>
          <li>Verifique se não há erros no console (F12)</li>
        </ul>
      </div>
    </div>
  );
}
