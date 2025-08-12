# Plano de Migração: JavaScript para TypeScript

Este documento detalha o plano de migração do projeto de JavaScript para TypeScript. O plano é dividido em fases incrementais para minimizar riscos, permitir o desenvolvimento contínuo e garantir a qualidade do código ao final do processo.

---

## Fase 1: Fundação e Configuração do Ambiente

**Objetivo:** Preparar todo o ferramental necessário para o TypeScript sem ainda alterar o código da aplicação. Esta é a base para todo o resto.

- [ ] **Tarefa 1.1: Instalar Dependências de Desenvolvimento**
  - Adicionar o TypeScript e as definições de tipo essenciais.
  - **Comando:** `npm install -D typescript @types/node @types/react @types/react-dom @typescript-eslint/parser @typescript-eslint/eslint-plugin`

- [ ] **Tarefa 1.2: Criar o Arquivo `tsconfig.json`**
  - Instruir o compilador TypeScript sobre como analisar o código. Um arquivo inicial com configurações estritas recomendadas para Vite + React será criado.

- [ ] **Tarefa 1.3: Criar Arquivo de Definição de Tipos do Vite**
  - Criar o arquivo `src/vite-env.d.ts` para que o TypeScript entenda os tipos de assets importados pelo Vite (ex: `.svg`).
  - **Conteúdo:** `/// <reference types="vite/client" />`

- [ ] **Tarefa 1.4: Configurar o ESLint para TypeScript**
  - Modificar o `eslint.config.js` para que ele possa analisar (`parse`) e validar (`lint`) código TypeScript.

- [ ] **Tarefa 1.5: Testar a Configuração**
  - Renomear o ponto de entrada da aplicação de `src/main.jsx` para `src/main.tsx`.
  - Rodar `npm run dev`. Se o projeto iniciar sem erros, a Fase 1 foi um sucesso.

> **Dica:** Execute `npx tsc --noEmit` no terminal após esta fase. Este comando fará uma verificação de tipos em todo o projeto. O objetivo é ver o número de erros diminuir a cada fase.

---

## Fase 2: Migração Inicial e Componentes Simples

**Objetivo:** Começar a migração pelos arquivos de menor complexidade para ganhar tração e ver os benefícios da tipagem rapidamente.

- [ ] **Tarefa 2.1: Migrar Constantes e Utilitários**
  - Renomear os arquivos em `src/constants`, `src/helpers` e `src/hooks` para a extensão `.ts`.
  - Adicionar tipos para as constantes e funções exportadas.

- [ ] **Tarefa 2.2: Migrar Componentes de Apresentação**
  - Identificar e converter componentes que são primariamente visuais.
  - **Ação:** Renomear para `.tsx` e criar `interfaces` de `Props` para componentes como `Card`, `CopyEmailButton`, `Loader`, `Project`, `Alert`, etc.

- [ ] **Tarefa 2.3: Tipar Hooks Básicos**
  - Nos componentes migrados, adicionar tipos explícitos para os hooks `useState`, `useRef` e `useCallback`.
  - **Exemplo:** `const [isActive, setIsActive] = useState<boolean>(false);`

---

## Fase 3: Migração do Core da Aplicação

**Objetivo:** Tipar as partes centrais e mais complexas da aplicação: o gerenciamento de estado e os componentes que interagem com Three.js.

- [ ] **Tarefa 3.1: Tipar o Store do Zustand**
  - Renomear `src/stores/navigation.store.js` para `navigation.store.ts`.
  - Criar uma `interface` que defina a "forma" do seu store (o estado e as ações) para garantir 100% de segurança de tipo.

- [ ] **Tarefa 3.2: Tipar o React Context**
  - Renomear `src/contexts/NavigationContext.jsx` (e suas variantes) para `.tsx`.
  - Criar uma `interface` para o valor do contexto e tipar o hook `useNavigation`.

- [ ] **Tarefa 3.3: Migrar Componentes de Lógica e Seções**
  - Com o estado já tipado, migrar os componentes que o consomem, como `SectionPagesZustand` e as seções (`About`, `Projects`, etc.).

- [ ] **Tarefa 3.4: Tipar Componentes Three.js / R3F**
  - Migrar componentes da cena 3D (`Astronaut`, `CameraController`, etc.).
  - Usar os tipos do Three.js e React Three Fiber. Ex: `const meshRef = useRef<THREE.Mesh>(null!);`.

---

## Fase 4: Finalização e Validação Estrita

**Objetivo:** Limpar o código, remover "gambiarras" de tipagem e fortalecer as regras para garantir a máxima qualidade.

- [ ] **Tarefa 4.1: Eliminar o `any`**
  - Fazer uma busca global no projeto por `any` e substituir por tipos mais específicos ou `unknown`.

- [ ] **Tarefa 4.2: Habilitar Regras Estritas no `tsconfig.json`**
  - Em `compilerOptions`, definir `"strict": true`.
  - Corrigir os novos erros que aparecerão, tratando principalmente casos de `null` e `undefined`.

- [ ] **Tarefa 4.3: Atualizar Scripts no `package.json`**
  - Adicionar um script para verificação de tipos: `"typecheck": "tsc --noEmit"`.

- [ ] **Tarefa 4.4: Documentação**
  - Atualize o `README.md` para mencionar que o projeto agora usa TypeScript e incluir o novo comando `npm run typecheck`.

---

## Fase 5: Limpeza e Refatoração Pós-Migração

**Objetivo:** Remover código legado, identificar e apagar arquivos não utilizados e melhorar a estrutura geral do código agora que está totalmente tipado.

- [ ] **Tarefa 5.1: Remover Componentes e Contextos Duplicados**
  - **Análise:** O projeto contém múltiplas versões de arquivos (ex: `HeroV2`, `HeroV3`, `HeroZustand` e `CameraControllerV1` a `V5`, múltiplos `NavigationContext`).
  - **Ação:** Identificar a versão final e canônica que está em uso na aplicação (`App.jsx`). Apagar todos os arquivos de versões antigas e experimentais que não estão sendo importados em nenhum lugar.

- [ ] **Tarefa 5.2: Centralizar Definições de Tipos**
  - Identificar `interfaces` e `types` que são usados em múltiplos lugares.
  - **Ação:** Considere criar um arquivo `src/types/index.ts` para exportar tipos globais ou compartilhados, evitando duplicação.

- [ ] **Tarefa 5.3: Revisão de Código e Oportunidades de Refatoração**
  - Com a segurança dos tipos, procure por lógica complexa que possa ser simplificada ou extraída para hooks customizados (`use...`).
  - Verifique a consistência de nomes e a clareza de funções.

- [ ] **Tarefa 5.4: Limpeza Final do Repositório**
  - Apague quaisquer outros arquivos de teste ou anotações que não são mais necessários (ex: `ZUSTAND_MIGRATION_PLAN.md` se este novo plano o substitui).
