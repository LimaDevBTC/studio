# Sistema de Pagamento em Criptomoedas

## Visão Geral

Este sistema permite que usuários comprem cursos usando criptomoedas (USDT na rede Solana e Bitcoin). O processo é completamente descentralizado e não requer intermediários financeiros tradicionais.

## Fluxo de Pagamento

### 1. Seleção do Curso
- Usuário navega para a página do curso
- Vê o preço em dólares (USD)
- Clica no botão "Buy Course"

### 2. Modal de Pagamento
- Abre modal com opções de pagamento:
  - **USDT (Solana)**: Rede Solana, endereço específico
  - **Bitcoin**: Rede Bitcoin, endereço específico
- Usuário seleciona método preferido

### 3. Detalhes do Pagamento
- Exibe QR Code para o endereço selecionado
- Mostra endereço da carteira para copiar
- Instruções claras sobre como fazer o pagamento
- Botão "I've Made the Payment" para confirmar

### 4. Confirmação
- Usuário clica em "I've Made the Payment"
- Sistema cria transação no Firestore
- Envia notificação para admin
- Fecha modal e mostra mensagem de sucesso

### 5. Aprovação pelo Admin
- Admin recebe notificação no painel
- Pode ver detalhes da transação
- Aprova ou rejeita o pagamento
- Se aprovado, libera acesso ao curso

## Estrutura de Dados

### Transações (`transactions`)
```typescript
{
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  network: string;
  paymentAddress: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  type: "course_purchase";
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedBy?: string;
  rejectedAt?: Timestamp;
}
```

### Notificações (`adminNotifications`)
```typescript
{
  type: "payment_confirmation";
  title: string;
  message: string;
  transactionId: string;
  userId: string;
  courseId: string;
  status: "unread" | "read" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
}
```

## Configuração das Carteiras

As carteiras de pagamento são configuradas em `src/config/payment.ts`:

```typescript
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "usdt-solana",
    name: "USDT",
    symbol: "USDT",
    network: "Solana",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    icon: "💎",
    description: "USDT on Solana network - Fast and low fees"
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yf4jf2j0vwpw4hqcqw8",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    icon: "₿",
    description: "Bitcoin - The original cryptocurrency"
  }
];
```

## Segurança

### Regras do Firestore
- Usuários só podem ler/escrever suas próprias transações
- Admins podem ler/escrever todas as transações
- Notificações só podem ser lidas/escritas por admins
- Usuários podem criar notificações (para enviar confirmações)

### Validações
- Verificação de autenticação em todas as operações
- Validação de dados antes de salvar no Firestore
- Controle de acesso baseado em roles (admin/user)

## Componentes

### CryptoPaymentModal
- Modal principal para seleção e confirmação de pagamento
- Integração com Firestore para salvar transações
- Criação automática de notificações para admin

### AdminNotifications
- Lista de notificações de pagamento pendentes
- Visualização detalhada de transações
- Aprovação/rejeição de pagamentos
- Atualização de status em tempo real

## Personalização

### Adicionar Novas Criptomoedas
1. Adicionar novo método em `src/config/payment.ts`
2. Incluir endereço da carteira
3. Gerar QR Code para o endereço
4. Atualizar traduções se necessário

### Modificar Preços
- Os preços são definidos no campo `price` de cada curso
- Sistema usa dólares (USD) como moeda base
- Conversão para criptomoedas é feita pelo usuário

### Alterar Endereços
- Atualizar endereços em `src/config/payment.ts`
- Regenerar QR Codes
- Notificar usuários sobre mudanças

## Monitoramento

### Logs de Transação
- Todas as transações são registradas no Firestore
- Histórico completo de pagamentos
- Status de cada transação (pending/approved/rejected)

### Notificações em Tempo Real
- Sistema de notificações push para admins
- Contador de notificações não lidas
- Priorização por importância

## Troubleshooting

### Problemas Comuns
1. **QR Code não carrega**: Verificar URL da API de QR Code
2. **Transação não salva**: Verificar regras do Firestore
3. **Notificação não aparece**: Verificar permissões de admin
4. **Endereço incorreto**: Atualizar configuração de pagamento

### Debug
- Verificar console do navegador para erros
- Verificar logs do Firestore
- Testar permissões de usuário
- Validar estrutura de dados

## Futuras Melhorias

- Integração com APIs de blockchain para verificação automática
- Sistema de webhooks para notificações instantâneas
- Dashboard de analytics de pagamentos
- Sistema de reembolso
- Suporte a mais redes blockchain
- Integração com carteiras Web3
