# Análise e Plano de Correção para o Dome Gallery

Este documento detalha a investigação e o plano de ação para corrigir a funcionalidade do Dome Gallery na seção "Sobre".

## 1. Resumo do Problema

O card interativo na seção "Sobre", que deveria acionar a abertura de uma galeria de fotos em formato de domo 3D, não apresenta nenhuma reação ao clique. A galeria não é exibida.

## 2. Análise e Causa Raiz

Após uma investigação no código-fonte, o fluxo de interação entre os componentes foi mapeado:

- **`src/sections/About.tsx`**: Contém a seção "Sobre". Ele renderiza o card de gatilho e é responsável por renderizar condicionalmente o componente da galeria.
- **`src/components/DomeGalleryCard.tsx`**: É o card clicável. Seu evento `onClick` está configurado para chamar uma função que deveria mostrar a galeria.
- **`src/components/DomeGallery.tsx`**: É o componente da galeria que deve ser exibido.

O design da interação entre os componentes está correto. Eles estão programados para usar um estado centralizado (Zustand) para comunicar a necessidade de exibir a galeria.

**Causa Raiz Identificada:**

A análise do arquivo `src/stores/navigation.store.ts` revelou que a lógica de estado para controlar a visibilidade do Dome Gallery é **inexistente**. Os componentes estão tentando invocar um estado (`isDomeGalleryVisible`) e ações (`showDomeGallery`, `hideDomeGallery`) que não foram implementados no store.

## 3. Plano de Implementação Detalhado

A correção exige a adição da lógica ausente no arquivo de estado central. Nenhuma alteração nos componentes React é necessária.

**Arquivo-alvo:** `src/stores/navigation.store.ts`

### Passo 1: Atualizar as Interfaces TypeScript

As interfaces `NavigationStoreState` e `NavigationStoreActions` precisam ser estendidas.

**Em `NavigationStoreState`:**

```typescript
// Antes
interface NavigationStoreState {
  // ...
  scrollLocked: boolean;
}

// Depois
interface NavigationStoreState {
  // ...
  scrollLocked: boolean;
  // Dome Gallery
  isDomeGalleryVisible: boolean;
}
```

**Em `NavigationStoreActions`:**

```typescript
// Antes
interface NavigationStoreActions {
  // ...
  lockScroll: () => void;
  unlockScroll: () => void;
}

// Depois
interface NavigationStoreActions {
  // ...
  lockScroll: () => void;
  unlockScroll: () => void;
  // Dome Gallery actions
  showDomeGallery: () => void;
  hideDomeGallery: () => void;
}
```

### Passo 2: Atualizar o Estado Inicial

Adicionar a nova propriedade de estado ao objeto inicial dentro de `create<NavigationStore>()(...)`.

```javascript
// ...
// Scroll lock state
scrollLocked: false,

// Dome Gallery state
isDomeGalleryVisible: false,
// ...
```

### Passo 3: Implementar as Ações

Adicionar as novas funções de ação ao final do objeto de implementação do store. Essas ações irão controlar tanto a visibilidade da galeria quanto o travamento do scroll da página principal.

```javascript
// ...
    unlockScroll: () => {
      set({ scrollLocked: false });
    },

    // ===================================
    // DOME GALLERY
    // ===================================
    showDomeGallery: () => {
      set({ isDomeGalleryVisible: true, scrollLocked: true });
    },

    hideDomeGallery: () => {
      set({ isDomeGalleryVisible: false, scrollLocked: false });
    }
// ...
```

## 4. Verificação

Uma vez que as alterações acima sejam aplicadas ao arquivo `src/stores/navigation.store.ts`, a funcionalidade deve ser restaurada automaticamente. Os componentes `About.tsx` e `DomeGalleryCard.tsx` já estão corretamente conectados para usar o estado e as ações que serão adicionadas, portanto, o clique no card passará a funcionar como esperado.

## 5. Próximos Passos

A próxima ação é executar a escrita do arquivo `src/stores/navigation.store.ts` com todo o conteúdo atualizado, conforme detalhado neste plano.
