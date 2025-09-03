# Portfolio 3D Espacial - Contexto para IA

## Conceito do Projeto

Este é um portfolio interativo 3D onde o usuário navega como astronauta pelo espaço, visitando planetas que representam seções (About, Projects, Experience, Contact, Courses). A navegação é cinematográfica com transições suaves entre mundos 3D e 2D.

## Stack Tecnológica Principal

- **React 19** + **TypeScript** + **Vite 6.1**
- **Three.js 0.173** + **@react-three/fiber 9.0** + **@react-three/drei 10.0**
- **Zustand 5.0** para state management
- **Framer Motion 12.23** para animações UI
- **Tailwind CSS 4.0** para styling

## Arquitetura Core

### Estado Central (navigation.store.ts)
O sistema é governado por 7 estados específicos no Zustand:
```
idle → orbiting → zooming_in → entering → in_section → exiting → zooming_out → idle
```

Configurações críticas adaptáveis mobile/desktop:
- `zoomInSensitivity`: mobile 0.0015, desktop 0.0008
- `scrollThrottle`: mobile 5ms, desktop 12ms
- `zoomAutoComplete`: 0.65 threshold

### Componentes Arquiteturais

**App.jsx**: Orquestrador principal
- CustomCursor, MobileBottomNav, NavigationTutorial, HeroZustand, SectionPagesZustand

**HeroZustand.tsx**: Engine 3D
- Canvas Three.js com configurações responsivas
- Astronaut model com escalas dinâmicas por viewport
- NavigationSystemStable para hitboxes planetárias
- CameraControllerZustand para movimentos cinematográficos

**SectionPagesZustand.jsx**: Roteador visual
- Renderização condicional baseada no estado Zustand
- PageContainer com animações Framer Motion
- LanguageToggle para internacionalização

## Fluxo de Navegação

1. **IDLE**: Estado inicial, visão geral do espaço
2. **ORBITING**: Click em planeta inicia órbita
3. **ZOOMING_IN**: Scroll/swipe para cima inicia aproximação
4. **ENTERING**: Transição automática com fade
5. **IN_SECTION**: Conteúdo 2D da seção
6. **EXITING**: ESC ou scroll para baixo sai
7. **ZOOMING_OUT**: Retorno ao espaço

Controles:
- Desktop: Mouse wheel + Click + ESC
- Mobile: Touch/Swipe + Tap + Gestos específicos

## Design System

### Cores CSS Custom Properties
```css
--color-primary: #000000;     /* Base preta */
--color-midnight: #06091f;    /* Escuro profundo */
--color-aqua: #33c2cc;        /* Acento ciano */
--color-mint: #57db96;        /* Acento verde */
--color-royal: #5c33cc;       /* Acento roxo */
```

### Tipografia
```css
font-family: "Funnel Display", sans-serif;
background: #000000;
color: white;
cursor: none; /* Cursor customizado sempre */
```

## Otimizações Críticas

### Performance 3D
```jsx
// Canvas condicional
<Canvas frameloop={canvas3DActive ? 'always' : 'demand'} />

// Reutilização de objetos
const tempVec = useMemo(() => new THREE.Vector3());
useFrame(() => ref.current.position.lerp(tempVec.set(x, y, z), 0.1));

// Partículas adaptáveis
quantity={isMobile ? 50 : 100}
```

### Mobile Responsivo
```javascript
// Escalas dinâmicas por viewport
const getAstronautScale = () => {
  const width = window.innerWidth;
  if (width < 375) return 0.3;
  if (width < 768) return 0.35;
  return 0.4;
};

// Touch handling com threshold
if (Math.abs(deltaY) > 2) {
  e.preventDefault();
  handleScroll(-deltaY * 3, false);
}
```

### Estado Zustand
```typescript
// Acesso direto para performance
useFrame(() => {
  ref.current.position.x = useStore.getState().x;
});

// Throttling de eventos
if (now - lastScrollTime < CONFIG.scrollThrottle) return;
```

## Padrões e Melhores Práticas

### Zustand Store Patterns
- Use slices pattern para organização
- Acesso direto ao state em loops de performance
- Middleware subscribeWithSelector para otimização

### React Three Fiber
- Sempre reutilize geometrias e materiais com useMemo
- Evite criação de objetos Three.js em useFrame
- Use refs para mutação direta de propriedades
- Configure DPR adaptável para performance

### Framer Motion
- Use will-change para propriedades animadas
- Prefira transforms sobre other properties
- Layout animations com configurações específicas
- startTransition para operações custosas

## Funcionalidades Específicas

### Sistema de Tutorial
- localStorage persistence para não repetir
- NavigationTutorial.tsx com step-by-step guidance
- initializeTutorial/completeTutorial no store

### Internacionalização
- useTranslations hook com pt/en
- LanguageToggle aparece em seções específicas
- Estrutura em locales/translations.ts

### Performance Monitoring
```javascript
// Canvas 3D inteligente
frameloop={canvas3DActive ? 'always' : 'demand'}

// Lazy loading de seções
{shouldRender && <motion.div><About /></motion.div>}
```

## Comandos de Desenvolvimento

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run lint         # Linting
npm run typecheck    # Type checking
npm run validate     # Validação completa
```

## Regras Críticas - NÃO QUEBRAR

### Estado Zustand
- NUNCA altere a ordem dos estados
- SEMPRE use transições corretas entre estados
- MANTENHA configurações mobile/desktop separadas

### Performance 3D
- NÃO crie objetos Three.js em loops
- SEMPRE reutilize geometrias/materiais
- MONITORE frameloop do Canvas

### Mobile
- PRESERVE sensibilidades de touch específicas
- MANTENHA escalas adaptáveis por viewport
- TESTE em dispositivos reais sempre

### Debugging
```typescript
// Debug mode para hitboxes
debugMode={true}

// Estado atual
console.log('Estado:', navigationState);

// Dev monitor
const DevMonitor = () => process.env.NODE_ENV === 'development' ? <FPSStats /> : null;
```

## Estrutura de Arquivos Importantes

```
src/
├── App.jsx                    # Orquestrador principal
├── stores/navigation.store.ts # Estado central crítico
├── sections/                  # Seções do portfolio
├── components/
│   ├── CameraController.Zustand.tsx  # Controle cinematográfico
│   ├── NavigationSystemStable.tsx    # Hitboxes planetárias
│   ├── CustomCursor.tsx              # Cursor personalizado
│   └── ScrollIndicator.tsx           # Indicadores visuais
├── pages/SectionPagesZustand.jsx     # Roteador visual
├── locales/translations.ts           # Sistema i18n
└── constants/navigationPoints.ts     # Pontos de navegação
```

## Resolução de Problemas Comuns

- **Estado quebrado**: Verificar navigation.store.ts transitions
- **Performance issues**: Monitor Canvas frameloop e object creation
- **Mobile issues**: Verificar touch handlers e escalas
- **Animações quebradas**: Inspect Framer Motion conflicts
- **3D rendering**: Debug Three.js objects lifecycle

Este projeto representa estado da arte em portfolios interativos, mantendo sempre foco em performance, responsividade e experiência cinematográfica única.