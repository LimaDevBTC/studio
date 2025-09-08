# Exemplo de Migração para UnifiedPaymentModal

## Como Substituir CryptoPaymentModal por UnifiedPaymentModal

### 1. Página de Curso Individual

**Arquivo**: `src/app/[locale]/dashboard/courses/[courseId]/page.tsx`

```tsx
// ANTES - Importação
import CryptoPaymentModal from "@/components/CryptoPaymentModal";

// DEPOIS - Importação
import UnifiedPaymentModal from "@/components/UnifiedPaymentModal";

// ANTES - Uso do componente
<CryptoPaymentModal
    courseId={course.id}
    courseTitle={course.title}
    coursePrice={course.price}
    trigger={
        <Button className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4"/>
            Buy Course
        </Button>
    }
/>

// DEPOIS - Uso do componente (mesma interface!)
<UnifiedPaymentModal
    courseId={course.id}
    courseTitle={course.title}
    coursePrice={course.price}
    trigger={
        <Button className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4"/>
            Buy Course
        </Button>
    }
/>
```

### 2. Planos de Assinatura

**Arquivo**: `src/components/IntelligentSubscriptionPlans.tsx`

```tsx
// ANTES - Importação
import CryptoPaymentModal from './CryptoPaymentModal';

// DEPOIS - Importação
import UnifiedPaymentModal from './UnifiedPaymentModal';

// ANTES - Uso do componente
<CryptoPaymentModal
    courseId={plan.id}
    courseTitle={plan.name}
    coursePrice={plan.price}
    trigger={
        <Button className="w-full bg-primary hover:bg-orange-500 text-primary-foreground">
            {t('startNow')}
        </Button>
    }
    type="subscription"
/>

// DEPOIS - Uso do componente (mesma interface!)
<UnifiedPaymentModal
    courseId={plan.id}
    courseTitle={plan.name}
    coursePrice={plan.price}
    trigger={
        <Button className="w-full bg-primary hover:bg-orange-500 text-primary-foreground">
            {t('startNow')}
        </Button>
    }
    type="subscription"
/>
```

### 3. Cards de Curso na Home

**Arquivo**: `src/app/[locale]/page.tsx`

```tsx
// ANTES - Importação
import CryptoPaymentModal from "@/components/CryptoPaymentModal";

// DEPOIS - Importação
import UnifiedPaymentModal from "@/components/UnifiedPaymentModal";

// ANTES - Uso do componente
<CryptoPaymentModal
    courseId={course.id}
    courseTitle={course.title}
    coursePrice={course.price}
    trigger={
        <Button className="w-full bg-primary hover:bg-orange-500 text-primary-foreground">
            Comprar Curso
        </Button>
    }
/>

// DEPOIS - Uso do componente (mesma interface!)
<UnifiedPaymentModal
    courseId={course.id}
    courseTitle={course.title}
    coursePrice={course.price}
    trigger={
        <Button className="w-full bg-primary hover:bg-orange-500 text-primary-foreground">
            Comprar Curso
        </Button>
    }
/>
```

## Vantagens da Migração

### ✅ **Interface Idêntica**
- Mesma props interface que o CryptoPaymentModal
- Migração sem quebras de código
- Substituição direta

### ✅ **Experiência do Usuário Melhorada**
- Escolha entre criptomoedas e cartão
- Interface unificada e intuitiva
- Fluxo de pagamento mais flexível

### ✅ **Integração Completa**
- Firebase para ambos os métodos
- Stripe para pagamentos com cartão
- Sistema de notificações unificado

### ✅ **Manutenibilidade**
- Código organizado e modular
- Fácil adição de novos métodos de pagamento
- Logs centralizados

## Próximos Passos

1. **Configurar variáveis de ambiente do Stripe**
2. **Testar pagamentos em ambiente de desenvolvimento**
3. **Fazer migração gradual por componente**
4. **Configurar webhooks do Stripe**
5. **Implementar em produção**

## Teste da Integração

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves

# 3. Executar em desenvolvimento
npm run dev

# 4. Testar fluxo de pagamento
# - Acessar página de curso
# - Clicar em "Comprar Curso"
# - Escolher método de pagamento
# - Testar ambos os fluxos
```
