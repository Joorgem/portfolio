# Portfolio 3D — Guia para Agentes/Colaboradores

Este repositório contém um portfólio interativo com dois modos:
- Modo 3D imersivo (astronauta + planetas como seções)
- Modo One Page (scroll tradicional)

Abaixo estão os pontos essenciais para entender e evoluir o projeto com segurança, performance e previsibilidade.

## Stack
- React 19 + TypeScript + Vite 6
- Three.js + @react-three/fiber + @react-three/drei
- Zustand 5 para estado global
- Framer Motion 12 para animações de UI
- Tailwind CSS 4 para estilos

## Arquitetura de Estado (Zustand)

### Estados de navegação 3D
Ciclo principal do modo 3D (sem relação com seleção de modo):
- idle ? orbiting ? zooming_in ? entering ? in_section ? exiting ? zooming_out ? idle
Configurações sensíveis a dispositivo (ver `src/constants/navigationConfig.ts`).

### Máquina de Modo do Portfólio
A seleção e ativação de modo agora é regida por um estado explícito no store:
- `portfolioMode`: `'choosing' | '3d' | 'onepage'`
- `modeStatus`: `'selector' | 'loading-3d' | 'ready-3d' | 'ready-onepage'`
- `showModeSelector`: controla overlay de seleção
- `loading3DScene` e `is3DSceneReady`: sinalizam carregamento e prontidão 3D

Fonte da verdade: `src/stores/navigation.store.ts`.

Regras:
- A UI chama apenas `setPortfolioMode('3d' | 'onepage')` e `hide/showPortfolioModeSelector()`. Transições derivadas são calculadas no store (não na UI).
- Ao entrar em `'3d'`, o store seta `modeStatus: 'loading-3d'`, mostra loading e agenda um fallback de 5s; quando a cena estiver pronta, o store promove para `'ready-3d'` e abre o tutorial (se ainda não concluído na sessão).
- `sessionStorage` guarda uma intenção efêmera do modo (TTL ~4s) para evitar pisca ao carregar chunks (não persiste preferências de longo prazo).
- App.jsx não possui mais timeouts — todo fallback/timeout acontece no store.

Do/Don’t:
- Do: pré-carregar o chunk do Hero 3D no mount do App e no clique do modo 3D (ver `preloadHeroZustand`).
- Don’t: manipular `showModeSelector`, `loading3DScene`, `is3DSceneReady` diretamente fora do store.
- Don’t: chamar `setPortfolioMode('choosing')` a partir de componentes; use `showPortfolioModeSelector()`.

## Componentes Principais
- `src/App.jsx`: orquestra UI e aplica classes `mode-3d`/`mode-onepage`; pré-carrega a cena 3D e inicializa tutorial.
- `src/sections/HeroZustand.tsx`: cena 3D (Canvas, astronauta, navegação, câmera). Listeners de wheel/touch só atuam quando `is3DSceneReady = true`.
- `src/components/PortfolioModeSelector.tsx`: overlay de seleção; chama `preloadHeroZustand()` ao escolher 3D e delega transição ao store.
- `src/pages/SectionPagesZustand.jsx`: páginas 2D das seções quando em 3D.
- `src/components/OnePagePortfolio.tsx`: modo One Page completo.

## Boas Práticas de Performance
- Three.js/R3F
  - Evite criar objetos Three dentro de `useFrame`.
  - Reuse geometrias/materiais (useMemo/useRef).
  - Gatilhe listeners apenas quando `is3DSceneReady`.
  - Ajuste DPR e frameloop conforme `canvas3DActive`.
- Framer Motion
  - Prefira transforms, use `will-change` quando necessário.
- React
  - Use seletor do Zustand para evitar renders desnecessários.
  - Lazy-load do Hero 3D com pré-carregamento proativo.

## Persistência & Tutorial
- O tutorial é “por sessão” (não persiste em localStorage); `tutorialCompleted` reseta a cada sessão por design.
- A intenção de modo é guardada em `sessionStorage` com TTL curto para evitar regressões de overlay/volta para `choosing` durante carregamento.

## Detalhes de Build/Tipos
- Import do GLTFLoader deve usar sufixo `.js` para compatibilidade com bundler: `three/examples/jsm/loaders/GLTFLoader.js`.
- Tipos podem divergir entre `@types/three` e `three-stdlib`; se necessário, faça cast intermediário com `unknown` ao converter `GLTF` carregado.
- TypeScript está em modo strict; mantenha props e generics explícitos.

## Comandos
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run typecheck` — checagem de tipos
- `npm run validate` — pipeline rápida (typecheck)

## Regras Críticas (não quebrar)
- Não alterar a semântica de `modeStatus` e transições do store sem revisar UI acoplada.
- Não reintroduzir timeouts concorrentes fora do store para 3D.
- Não persistir estados de tutorial/visitedSections em localStorage (intencionalmente por sessão).
- Testar modo 3D: clique único deve ativar loading e transicionar para tutorial sem recarregar/voltar para `choosing`.

## Estrutura
```
src/
  App.jsx
  stores/navigation.store.ts
  sections/HeroZustand.tsx
  components/PortfolioModeSelector.tsx
  components/ui/video-text.tsx
  pages/SectionPagesZustand.jsx
  constants/navigationConfig.ts
```

## Troubleshooting
- “Precisa clicar duas vezes no 3D”: verifique se `modeStatus` progride de `selector` ? `loading-3d` ? `ready-3d` e se o fallback do store (5s) está ativo; confirme que `preloadHeroZustand` roda no mount e no clique.
- Tipos de GLTF: alinhar import do loader e usar cast `unknown` ? tipo interno quando necessário.
- Event listeners sem efeito: confirmar `is3DSceneReady = true` antes de processar scroll/touch.
