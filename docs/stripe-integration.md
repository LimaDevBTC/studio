# Integração Stripe + Firebase

## Configuração Necessária

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Configuração do Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Obtenha suas chaves de API (teste e produção)
3. Configure webhooks para receber notificações de pagamento

### 3. Estrutura de Arquivos Criados

```
src/
├── lib/
│   └── stripe.ts                    # Configuração do Stripe
├── components/
│   ├── StripePaymentModal.tsx       # Modal para pagamento com cartão
│   └── UnifiedPaymentModal.tsx      # Modal unificado (crypto + cartão)
└── app/api/stripe/
    └── create-payment-intent/
        └── route.ts                 # API route para criar Payment Intent
```

## Como Usar

### 1. Substituir CryptoPaymentModal por UnifiedPaymentModal

```tsx
// Antes
import CryptoPaymentModal from "@/components/CryptoPaymentModal";

<CryptoPaymentModal
  courseId={course.id}
  courseTitle={course.title}
  coursePrice={course.price}
  trigger={<Button>Comprar Curso</Button>}
/>

// Depois
import UnifiedPaymentModal from "@/components/UnifiedPaymentModal";

<UnifiedPaymentModal
  courseId={course.id}
  courseTitle={course.title}
  coursePrice={course.price}
  trigger={<Button>Comprar Curso</Button>}
/>
```

### 2. Fluxo de Pagamento

1. **Seleção de Método**: Usuário escolhe entre criptomoedas ou cartão
2. **Criptomoedas**: Usa o modal existente (CryptoPaymentModal)
3. **Cartão**: Usa o novo modal (StripePaymentModal)
4. **Integração Firebase**: Ambos salvam transações no Firestore

### 3. Estrutura de Dados no Firebase

#### Transações (collection: "transactions")
```typescript
interface TransactionData {
  userId: string;
  amount: number;
  currency: string;
  network: string; // "Stripe" para pagamentos com cartão
  paymentAddress: string;
  status: "pending" | "completed" | "failed";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  type: "course" | "subscription" | "consultation";
  courseId?: string;
  courseTitle?: string;
  planId?: string;
  planName?: string;
  originalAmountUSD?: number;
  convertedAmount?: number;
  stripePaymentIntentId?: string; // Apenas para Stripe
  stripeSessionId?: string; // Apenas para Stripe
}
```

#### Notificações (collection: "notifications")
```typescript
interface NotificationData {
  userId: string;
  userName: string | null;
  userEmail: string;
  type: string;
  title: string;
  message: string;
  courseId?: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Timestamp;
  stripePaymentIntentId?: string; // Apenas para Stripe
}
```

## Próximos Passos

1. **Configurar variáveis de ambiente**
2. **Testar pagamentos com cartão de teste**
3. **Configurar webhooks do Stripe**
4. **Implementar verificação de pagamento em tempo real**
5. **Adicionar logs de auditoria**
6. **Configurar ambiente de produção**

## Testes

### Cartões de Teste do Stripe

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **Requer autenticação**: 4000 0025 0000 3155

### Códigos de Teste

- **CVV**: Qualquer código de 3 dígitos
- **Data de expiração**: Qualquer data futura
- **CEP**: Qualquer código postal válido
