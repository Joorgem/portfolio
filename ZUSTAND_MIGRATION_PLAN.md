# Plano de Migração para Zustand (Versão Detalhada)

**Análise Prévia:** A análise do código revelou um sistema de navegação robusto baseado em uma máquina de estados (`IDLE`, `ORBITING`, `ZOOMING_IN`, etc.) gerenciada no `NavigationContextFinal`. O `CameraControllerFinal` implementa uma lógica de câmera orbital que segue dinamicamente os pontos de interesse no modelo 3D.

**Objetivo:** Migrar esta máquina de estados e a lógica de controle para um store centralizado do Zustand. Isso irá:
1.  **Eliminar Re-renders:** Desacoplar os updates de estado de alta frequência (animações) dos re-renders dos componentes React.
2.  **Simplificar o Fluxo de Dados:** Remover a necessidade de passar props e estado por múltiplos níveis de componentes.
3.  **Centralizar a Lógica:** Consolidar toda a lógica de transição e estado em um único local, facilitando a manutenção e depuração.
4.  **Limpar o Código:** Remover a pasta `contexts` e os componentes versionados obsoletos.

---

## **Fase 0: Preparação e Setup**

Preparar o ambiente para a migração sem fazer alterações funcionais.

**Checklist:**
- [ ] **Backup:** Garantir que o projeto esteja versionado com Git e que todas as mudanças atuais estejam "commitadas".
- [ ] **Instalar Zustand:** Se ainda não foi feito, rode no terminal:
  ```bash
  npm install zustand
  ```
- [ ] **Verificação:** Confirmar que `zustand` foi adicionado ao `package.json`.

---

## **Fase 1: Criação do Store Zustand (A Nova Máquina de Estados)**

Vamos traduzir fielmente a máquina de estados do `NavigationContextFinal` para um store Zustand.

**Checklist:**
- [ ] **Criar Diretório:** Crie a pasta `src/stores` se ela não existir.
- [ ] **Criar Arquivo do Store:** Crie o arquivo `src/stores/navigation.store.js`.
- [ ] **Implementar o Store:** Copie o código abaixo para `navigation.store.js`. Este código replica a máquina de estados e a lógica de transição existentes.

  ```javascript
  // src/stores/navigation.store.js
  import { create } from 'zustand';

  // A máquina de estados, diretamente do NavigationContextFinal
  export const NavigationStates = {
    IDLE: 'idle',
    ORBITING: 'orbiting',
    ZOOMING_IN: 'zooming_in',
    ENTERING: 'entering',
    IN_SECTION: 'in_section',
    EXITING: 'exiting',
    ZOOMING_OUT: 'zooming_out',
  };

  const CONFIG = {
    zoomSpeed: 0.02, // Ajuste a velocidade conforme necessário
    fadeSpeed: 0.03,
  };

  export const useNavigationStore = create((set, get) => ({
    // ===================================
    // ESTADO (STATE)
    // ===================================
    navigationState: NavigationStates.IDLE,
    currentSection: 'MAIN', // A seção onde a UI está (página visível)
    targetSection: 'MAIN',  // O alvo da câmera 3D
    zoomProgress: 0,        // Progresso do zoom (0 a 1)
    fadeProgress: 0,        // Progresso do fade (0 a 1)
    pageVisible: false,     // Controla a visibilidade do conteúdo da seção
    canvas3DActive: true,   // Controla o loop de renderização do canvas

    // ===================================
    // AÇÕES (ACTIONS)
    // ===================================

    // Inicia a navegação para um ponto de interesse (clique no planeta)
    goToSection: (sectionId) => {
      const { navigationState, targetSection } = get();
      if (navigationState !== NavigationStates.IDLE && navigationState !== NavigationStates.ORBITING) {
        return; // Bloqueia navegação durante transições
      }
      
      // Se já está orbitando outro planeta, reseta o zoom
      if (navigationState === NavigationStates.ORBITING && targetSection !== sectionId) {
        set({ zoomProgress: 0, fadeProgress: 0 });
      }

      set({ targetSection: sectionId, navigationState: NavigationStates.ORBITING });
    },

    // Inicia o processo de zoom-in (chamado pelo evento de scroll)
    startZoomIn: () => {
      const { navigationState } = get();
      if (navigationState !== NavigationStates.ORBITING) return;
      set({ navigationState: NavigationStates.ZOOMING_IN });
    },

    // Inicia o processo de saída da seção (chamado pelo scroll ou ESC)
    startExit: () => {
      const { navigationState } = get();
      if (navigationState !== NavigationStates.IN_SECTION) return;
      set({ navigationState: NavigationStates.EXITING, pageVisible: false });
    },

    // Ação interna para ser chamada pelo loop de animação
    _updateProgress: (delta) => {
      const { navigationState, zoomProgress, fadeProgress } = get();
      
      // Lógica de ZOOM_IN
      if (navigationState === NavigationStates.ZOOMING_IN) {
        const newZoom = Math.min(1, zoomProgress + delta * CONFIG.zoomSpeed * 2);
        set({ zoomProgress: newZoom });
        if (newZoom >= 0.85) { // Inicia o fade
          const newFade = Math.min(1, fadeProgress + delta * CONFIG.fadeSpeed * 2);
          set({ fadeProgress: newFade });
          if (newFade >= 0.95) set({ canvas3DActive: false });
        }
        if (newZoom >= 1) { // Completa o zoom e entra na seção
          set({ navigationState: NavigationStates.ENTERING });
          setTimeout(() => {
            set({ 
              currentSection: get().targetSection,
              pageVisible: true, 
              navigationState: NavigationStates.IN_SECTION 
            });
          }, 200);
        }
      }

      // Lógica de EXITING (fade out)
      if (navigationState === NavigationStates.EXITING) {
        const newFade = Math.max(0, fadeProgress - delta * CONFIG.fadeSpeed * 3);
        set({ fadeProgress: newFade });
        if (newFade < 0.5) set({ canvas3DActive: true });
        if (newFade <= 0) {
          set({ navigationState: NavigationStates.ZOOMING_OUT });
        }
      }

      // Lógica de ZOOMING_OUT
      if (navigationState === NavigationStates.ZOOMING_OUT) {
        const newZoom = Math.max(0, zoomProgress - delta * CONFIG.zoomSpeed * 3);
        set({ zoomProgress: newZoom });
        if (newZoom <= 0) { // Completa a saída
          set({ 
            navigationState: NavigationStates.ORBITING,
            currentSection: get().targetSection,
          });
        }
      }
    },
  }));
  ```

---

## **Fase 2: Refatoração do Controlador de Câmera**

Vamos adaptar o `CameraControllerFinal` para ler e interagir com o store Zustand, em vez do Context.

**Checklist:**
- [ ] **Criar Novo Componente:** Crie o arquivo `src/components/CameraController.Zustand.jsx`.
- [ ] **Implementar a Lógica:** Copie o código do `CameraControllerFinal.jsx` para o novo arquivo. Em seguida, faça as seguintes modificações:
    - Remova `import { useNavigationFixed } from '../contexts/NavigationContextFixed';`.
    - Adicione `import { useNavigationStore } from '../stores/navigation.store';`.
    - Dentro do componente, substitua a chamada do hook de contexto por:
      ```jsx
      // Pega os estados reativos que o componente precisa para re-renderizar (se houver)
      // Neste caso, o controller é autônomo e usa getState() no loop, então podemos deixar vazio ou pegar o targetSection.
      const targetSection = useNavigationStore(state => state.targetSection);
      ```
    - Dentro do `useEffect` e do `useFrame`, substitua qualquer referência a `navigationState`, `zoomProgress`, etc., por chamadas diretas ao store: `useNavigationStore.getState().navigationState`.
    - Adicione a chamada para a atualização de progresso dentro do `useFrame`:
      ```jsx
      useFrame((frameState, delta) => {
        // ... (toda a lógica de cálculo de órbita e posição da câmera)

        // Adicione esta linha no final do loop para atualizar a máquina de estados
        useNavigationStore.getState()._updateProgress(delta);
      });
      ```
- [ ] **Substituir no `App.jsx`:**
    - Comente a linha do `<CameraControllerFinal />`.
    - Adicione e use o novo `<CameraControllerZustand />`.

---

## **Fase 3: Refatoração da UI e Interações**

Conectar os componentes de UI e os gatilhos de eventos ao store.

**Checklist:**
- [ ] **Remover o `Provider`:** Em `src/App.jsx`, remova o `<NavigationProviderFixed>`.
- [ ] **Refatorar `HeroFinal.jsx`:**
    - Remova `useNavigationFixed`.
    - Importe `useNavigationStore`.
    - Substitua as chamadas de estado e ações pelas do store. Exemplo:
      ```jsx
      // Antes: const { navigationState, startNavigation } = useNavigationFixed();
      // Depois:
      const navigationState = useNavigationStore(state => state.navigationState);
      const goToSection = useNavigationStore(state => state.goToSection);
      const startZoomIn = useNavigationStore(state => state.startZoomIn); // Para o evento de scroll
      ```
    - Adapte os handlers de eventos (`handleNavigate`, `handleScroll`) para usar as novas ações.
- [ ] **Refatorar `Navbar.jsx`:**
    - Remova `useNavigationFixed`.
    - Importe `useNavigationStore`.
    - Obtenha o estado e a ação necessários:
      ```jsx
      const currentSection = useNavigationStore(state => state.currentSection);
      const goToSection = useNavigationStore(state => state.goToSection);
      ```
    - Atualize os `onClick` para chamar `goToSection(point.id)`.
- [ ] **Refatorar `SectionPagesV2.jsx`:**
    - Este componente provavelmente usa `pageVisible` e `fadeProgress` do contexto. Adapte-o para usar os mesmos estados do `useNavigationStore`.

---

## **Fase 4: A Grande Faxina e Verificação Final**

Eliminar todo o código legado e garantir a estabilidade do novo sistema.

**Checklist:**
- [ ] **VERIFICAÇÃO COMPLETA:** Teste exaustivamente todas as interações: clicar nos planetas, usar o scroll para entrar e sair das seções, pressionar ESC para sair. Verifique se a câmera, os fades e a visibilidade das páginas se comportam como esperado.
- [ ] **Criar Ponto de Restauração:** Faça um `commit` no Git com a mensagem "Feature: Complete migration to Zustand" antes de apagar os arquivos.
- [ ] **Excluir Arquivos e Pastas Obsoletos:** Apague com confiança os seguintes itens:
    - Toda a pasta `src/contexts/`
    - `src/components/CameraControllerFinal.jsx` e todas as outras versões (`V*`)
    - Quaisquer outros componentes (`HeroV*`, etc.) que foram substituídos.
- [ ] **Limpar Imports Mortos:** Use a busca do editor para encontrar e remover referências aos arquivos deletados (ex: `NavigationContextFixed`).
- [ ] **Teste Final:** Rode a aplicação uma última vez para garantir que a exclusão dos arquivos não quebrou nada.