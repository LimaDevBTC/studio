# Análise Completa do Firestore - MQM Crypto Studio

## 📊 Estrutura de Coleções e Subcoleções

### 🗂️ Coleções Principais

#### 1. **users** 
- **Propósito**: Dados dos usuários do sistema
- **Regras**: 
  - Leitura/Escrita: Apenas o próprio usuário
  - Leitura: Admins podem ler todos
- **Campos Principais**:
  - `isAdmin`: boolean
  - `email`: string
  - `displayName`: string
  - `createdAt`: timestamp

#### 2. **courses**
- **Propósito**: Cursos disponíveis na plataforma
- **Regras**:
  - Leitura: Pública (qualquer pessoa)
  - Escrita: Apenas admins
- **Campos Principais**:
  - `title`: string
  - `description`: string
  - `status`: "Published" | "Waitlist" | "Draft"
  - `level`: "beginner" | "intermediate" | "advanced"
  - `duration`: string
  - `thumbnail`: string
  - `createdAt`: timestamp

#### 3. **transactions**
- **Propósito**: Transações de pagamento
- **Regras**:
  - Leitura/Escrita: Apenas o próprio usuário
  - Criação: Usuários autenticados
  - Exclusão: Proibida
- **Campos Principais**:
  - `userId`: string
  - `amount`: number
  - `currency`: string
  - `type`: "course" | "subscription" | "consultation"
  - `status`: "pending" | "completed" | "confirmed"
  - `paymentAddress`: string
  - `network`: string
  - `originalAmountUSD`: number
  - `convertedAmount`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

#### 4. **adminNotifications**
- **Propósito**: Notificações para administradores
- **Regras**:
  - Leitura: Apenas admins
  - Criação: Usuários autenticados
  - Atualização: Apenas admins
  - Exclusão: Proibida
- **Campos Principais**:
  - `userId`: string
  - `userName`: string
  - `userEmail`: string
  - `type`: string
  - `title`: string
  - `message`: string
  - `status`: "pending" | "approved" | "rejected"
  - `amount`: number
  - `currency`: string
  - `createdAt`: timestamp

#### 5. **userCourseAccess**
- **Propósito**: Controle de acesso aos cursos
- **Regras**:
  - Leitura/Escrita: Apenas o próprio usuário
- **Campos Principais**:
  - `userId`: string
  - `courseId`: string
  - `status`: "active" | "inactive"
  - `purchasedAt`: timestamp

#### 6. **userSubscriptions**
- **Propósito**: Assinaturas dos usuários
- **Regras**:
  - Leitura/Escrita: Apenas o próprio usuário
- **Campos Principais**:
  - `userId`: string
  - `planId`: string
  - `status`: "active" | "cancelled" | "expired"
  - `startDate`: timestamp
  - `endDate`: timestamp

#### 7. **liveSessions**
- **Propósito**: Sessões de live
- **Regras**:
  - Leitura: Pública
  - Escrita: Apenas admins
- **Campos Principais**:
  - `title`: string
  - `description`: string
  - `scheduledAt`: timestamp
  - `status`: "scheduled" | "live" | "ended"
  - `createdAt`: timestamp

#### 8. **waitlist**
- **Propósito**: Lista de espera para cursos
- **Regras**:
  - Leitura: Pública
  - Escrita: Usuários autenticados
- **Campos Principais**:
  - `userId`: string
  - `courseId`: string
  - `joinedAt`: timestamp
  - `status`: "waiting" | "notified"

#### 9. **userProgress**
- **Propósito**: Progresso do usuário nos cursos
- **Regras**:
  - Leitura/Escrita: Apenas o próprio usuário
- **Campos Principais**:
  - `userId`: string
  - `courseId`: string
  - `lessonsCompleted`: number
  - `totalLessons`: number
  - `lastAccessedAt`: timestamp

### 🗂️ Subcoleções

#### 1. **courses/{courseId}/lessons**
- **Propósito**: Lições de cada curso
- **Regras**:
  - Leitura: Pública
  - Escrita: Apenas admins
- **Campos Principais**:
  - `title`: string
  - `description`: string
  - `videoUrl`: string
  - `pdfUrl`: string
  - `order`: number
  - `duration`: number
  - `createdAt`: timestamp

#### 2. **courses/{courseId}/waitlist**
- **Propósito**: Lista de espera específica do curso
- **Regras**:
  - Leitura: Pública
  - Escrita: Usuários autenticados
- **Campos Principais**:
  - `userId`: string
  - `joinedAt`: timestamp
  - `status`: string

#### 3. **users/{userId}/courseProgress**
- **Propósito**: Progresso específico do usuário
- **Regras**:
  - Leitura/Escrita: Apenas o próprio usuário
- **Campos Principais**:
  - `courseId`: string
  - `lessonsCompleted`: number
  - `totalLessons`: number
  - `lastAccessedAt`: timestamp
  - `completedAt`: timestamp

## 🔒 Análise de Segurança

### ✅ Pontos Fortes
1. **Isolamento de dados**: Cada usuário só acessa seus próprios dados
2. **Controle de admin**: Apenas admins podem modificar conteúdo
3. **Proteção de transações**: Ninguém pode deletar transações
4. **Validação de propriedade**: Verificação de `userId` em todas as operações

### ⚠️ Pontos de Atenção
1. **Regra geral muito permissiva**: A regra `/{document=**}` permite leitura pública
2. **Consultas complexas**: Algumas consultas podem precisar de índices
3. **Validação de admin**: Depende de consulta ao documento do usuário

## 📈 Índices Configurados

### 1. **transactions** - Índice Composto 1
- `userId` (ASC)
- `type` (ASC) 
- `status` (ASC)
- `updatedAt` (DESC)

### 2. **transactions** - Índice Composto 2
- `userId` (ASC)
- `type` (ASC)
- `createdAt` (DESC)

## 🚨 Problemas Identificados

### 1. **Regra Duplicada**
- `waitlist` aparece duas vezes nas regras (linhas 22-25 e 71-74)

### 2. **Índices Não Implantados**
- Os índices configurados não estão sendo reconhecidos pelo Firebase

### 3. **Consultas Sem Índice**
- Algumas consultas complexas podem falhar sem índices apropriados

## 🔧 Recomendações

### 1. **Limpar Regras Duplicadas**
```javascript
// Remover a regra duplicada de waitlist
// Manter apenas uma versão
```

### 2. **Adicionar Índices Necessários**
```javascript
// Para consultas de adminNotifications
{
  "collectionGroup": "adminNotifications",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 3. **Otimizar Consultas**
- Usar `limit()` para consultas grandes
- Implementar paginação onde necessário
- Considerar cache local para dados frequentemente acessados

### 4. **Melhorar Validação**
- Adicionar validação de campos obrigatórios
- Implementar regras de negócio mais específicas
- Considerar usar Cloud Functions para validações complexas

## 📊 Estatísticas de Uso

### Coleções Mais Utilizadas
1. **transactions** - 15+ referências
2. **courses** - 12+ referências  
3. **adminNotifications** - 8+ referências
4. **users** - 6+ referências

### Subcoleções Mais Utilizadas
1. **courses/{courseId}/lessons** - 8+ referências
2. **users/{userId}/courseProgress** - 4+ referências

## 🎯 Próximos Passos

1. **Limpar regras duplicadas**
2. **Implantar índices corretamente**
3. **Adicionar índices para consultas frequentes**
4. **Implementar validação de dados**
5. **Considerar migração para estrutura mais otimizada**
