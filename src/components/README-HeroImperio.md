# Hero Imperio - Efeito de Castelo em Hexágonos

## 🎯 Visão Geral

O componente `HeroImperio` cria um efeito visual impressionante de um castelo sendo construído a partir de hexágonos, representando a metáfora de "acumulação de patrimônio" e "construção de império" do MQM Crypto.

## ✨ Características

- **Animação em 3 Fases**: Muralha (0-2s) → Torres (2-4s) → Keep (4-6s)
- **Efeito de Respiração**: Após formação completa, o castelo "respira" sutilmente
- **Responsivo**: Paths diferentes para desktop e mobile
- **Acessível**: Respeita `prefers-reduced-motion`
- **Performance**: Otimizado com SVG e CSS animations
- **Não Invasivo**: Mantém o layout existente intacto

## 🚀 Como Usar

```tsx
import HeroImperio from '@/components/HeroImperio';

// Na sua hero section
<section className="relative">
  <HeroImperio />
  <div className="relative z-10">
    {/* Seu conteúdo existente */}
  </div>
</section>
```

## 🎨 Personalização

### Props Disponíveis

```tsx
interface HeroImperioProps {
  className?: string; // Classes CSS adicionais
}
```

### CSS Custom Properties

```css
:root {
  --hexagon-size: 20px;           /* Tamanho base dos hexágonos */
  --hexagon-spacing: 25px;        /* Espaçamento entre hexágonos */
  --castle-stroke: #ffffff;       /* Cor do stroke do castelo */
  --castle-stroke-width: 2px;     /* Espessura do stroke */
  --particle-color: #ffd700;      /* Cor das partículas */
  --animation-duration: 6s;       /* Duração total da animação */
  --breathing-duration: 4s;       /* Duração do efeito de respiração */
}
```

## 🔧 Estrutura Técnica

### Arquivos Principais

```
src/
├── components/
│   ├── HeroImperio.tsx              # Componente principal
│   └── hooks/
│       ├── useImperioAnimation.ts   # Hook de animação
│       └── useHexagonGenerator.ts   # Geração de hexágonos
└── styles/
    └── imperio.css                  # Estilos e animações
```

### Hooks Utilizados

- **`useImperioAnimation`**: Gerencia o timeline da animação
- **`useHexagonGenerator`**: Gera o grid de hexágonos responsivo

## 📱 Responsividade

### Desktop
- Grid denso de hexágonos
- Silhueta completa do castelo
- Partículas maiores e mais visíveis

### Mobile
- Grid simplificado
- Silhueta compacta do castelo
- Partículas menores e mais sutis

## ♿ Acessibilidade

- **Reduced Motion**: Para usuários com `prefers-reduced-motion: reduce`, o castelo aparece já formado
- **Performance**: Otimizado para não impactar a performance da página
- **Sem Interferência**: `pointer-events: none` para não bloquear interações

## 🎬 Timeline da Animação

1. **0-2s**: Muralha emerge com hexágonos de fundação
2. **2-4s**: Torres laterais se constroem
3. **4-6s**: Keep central se eleva
4. **6s+**: Efeito de respiração contínuo

## 🚀 Performance

- **SVG Otimizado**: Renderização vetorial para qualquer resolução
- **CSS Animations**: Melhor performance que JavaScript
- **Lazy Loading**: Hexágonos gerados apenas quando necessário
- **Debounced Resize**: Otimização para redimensionamento

## 🐛 Troubleshooting

### Problemas Comuns

1. **Animação não aparece**: Verifique se o CSS foi importado
2. **Performance lenta**: Reduza o número de hexágonos no `useHexagonGenerator`
3. **Layout quebrado**: Certifique-se de que o container pai tem `position: relative`

### Debug

```tsx
// Adicione logs para debug
const { currentPhase, isComplete } = useImperioAnimation();
console.log('Current Phase:', currentPhase, 'Complete:', isComplete);
```

## 🔮 Futuras Melhorias

- [ ] Sistema de partículas mais complexo
- [ ] Interatividade com mouse/touch
- [ ] Mais variações de castelo
- [ ] Integração com WebGL para performance extrema
- [ ] Sistema de temas personalizáveis

## 📄 Licença

Este componente é parte do projeto MQM Crypto Studio e segue as mesmas diretrizes de licenciamento.
