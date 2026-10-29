# Oportunidades de Melhoria da Página Inicial

Status: `AI_PROPOSED`  
Data: 2026-10-28  

Este documento reúne o diagnóstico técnico e as oportunidades de evolução da extensão **Initial Chrome** levantadas a partir da análise da base de código (`newtab.html`, `js/`, `css/style.css`).

---

## 1. Performance & Otimização de Rede

| Item | Localização | Problema / Diagnóstico | Solução Recomendada |
|---|---|---|---|
| **Cache de Previsão do Tempo** | [`js/modules.js:601`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/modules.js#L601) (`updateWeather`) | Duas requisições `fetch` (geocoding + forecast no Open-Meteo) disparadas a cada nova aba sem persistência. Causa latência e risco de *rate limit*. | Implementar cache no `chrome.storage.local` com TTL de 30 a 60 minutos (seguindo o padrão já adotado no RSS). |
| **Cota do Chrome Sync no To-Do** | [`js/features/todo.js:60`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/features/todo.js#L60) (`saveAndRender`) | O Chrome Sync tem limite estrito de 8 KB por item e 100 KB no total. O acúmulo de tarefas pode exceder a cota. | Adicionar opção de expurgar tarefas concluídas ou salvar em `chrome.storage.local` com sincronização enxuta. |

---

## 2. Experiência do Usuário (UX) & Design Visual

| Item | Localização | Problema / Diagnóstico | Solução Recomendada |
|---|---|---|---|
| **Empty State nos Espaços** | [`js/bookmark-renderer.js:50`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/bookmark-renderer.js#L50) | Ao selecionar um espaço sem bookmarks/categorias, `contentArea` fica totalmente em branco sem feedback visual. | Renderizar componente de estado vazio com botões de ação rápida (`+ Nova Categoria`, `+ Adicionar Link`). |
| **Disposição dos Widgets do Topo** | [`newtab.html:99-138`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/newtab.html#L99-L138) | Widgets de Citação, To-Do e RSS ficam empilhados verticalmente no topo, empurrando os favoritos para fora do campo de visão inicial. | Reorganizar em grade modular lado a lado (estilo dashboard) ou painel recolhível para priorizar os favoritos. |
| **Glassmorphism com Papel de Parede** | [`css/style.css`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/css/style.css) | Ao ativar wallpapers do Unsplash, os cartões têm contraste variável com o fundo. | Aplicar `backdrop-filter: blur(12px)` e bordas sutis semitransparentes nos cards de favoritos para estilo moderno e legível. |

---

## 3. Produtividade & Novas Funcionalidades

| Funcionalidade | Descrição / Proposta | Benefício |
|---|---|---|
| **Barra de Pesquisa Direta (Omnibar)** | Barra de busca central opcional no topo da página (com alternador rápido entre Bookmarks, Google, DuckDuckGo, YouTube). | Permite buscar sem abrir modal e atende usuários acostumados à barra de busca nativa do Chrome. |
| **Navegação por Teclado nos Espaços** | Atalhos como `Alt+1` a `Alt+9` para trocar de espaço instantaneamente na sidebar. | Agiliza o fluxo de trabalho sem depender do clique no mouse. |
| **Drag & Drop no To-Do** | Habilitar reordenação de tarefas pendentes usando o SortableJS (já presente no bundle). | Melhora a priorização do dia a dia. |
| **Favoritos Fixados (Pinned / Top Links)** | Mini-linha de links essenciais persistentes no cabeçalho, independente do espaço ativo. | Acesso em 1 clique às ferramentas mais frequentes. |

---

## 4. Acessibilidade (A11y) & Usabilidade

- **Trap de Foco nos Modais:** Em modais de edição e busca, confinar a tecla `Tab` para não perder o foco na tela de fundo.
- **Anel de Foco (`:focus-visible`):** Garantir contraste e visibilidade de navegação por teclado em botões da action-sidebar e cards.

---

## 5. Arquitetura & Qualidade de Código

- **Modularização de `css/style.css`:** Dividir o arquivo de mais de 2.200 linhas em módulos (`themes.css`, `widgets.css`, `modals.css`, `cards.css`).
- **Expansão da Suíte de Testes:** Ampliar cobertura de testes Jest para cobrir `todo.js`, `rss.js` e funções de armazenamento/migração.
