# Plano: Modularização da Arquitetura CSS (`ACT-007`) e Verificação de Cascata

- **ID da Tarefa:** `ACT-007` (`AGT-012`)
- **Data:** 2026-10-29
- **Status de Validação:** `HUMAN_VALIDATED`

---

## 1. Contexto e Diagnóstico do Monólito (`css/style.css`)

Anteriormente, o arquivo [`css/style.css`](../css/style.css) concentrava **~3.330 linhas** de regras CSS cobrindo desde variáveis de temas e layout estrutural até cartões de favoritos, relógio, widgets (To-Do, Citações, RSS, Pomodoro), modais, menu de contexto, animações, responsividade e o Quick Settings Popover.

---

## 2. Arquitetura Modular Implementada (`css/modules/`)

O monólito foi dividido em **6 módulos temáticos** dentro de `css/modules/` (carregados em paralelo no `<head>` de [`newtab.html`](../newtab.html) logo após [`css/tokens.css`](../css/tokens.css)), mantendo [`css/style.css`](../css/style.css) como arquivo *barrel* (`@import`) para compatibilidade com [`settings.html`](../settings.html):

| Ordem de Carga | Arquivo | Escopo e Responsabilidade |
| --- | --- | --- |
| **0** | `css/tokens.css` | Tokens primitivos e semânticos (`--space-*`, `--radius-*`, `--surface*`, `--shadow-*`, `--dur-*`). |
| **1** | `css/modules/themes.css` | Variáveis base (`:root`), os **9 temas nativos de alto contraste** (`body.<theme>-theme`), reset de `body` e animação de entrada em cascata (`@keyframes slideUpFadeIn`). |
| **2** | `css/modules/layout.css` | Estrutura macro (`#app-container`, `#main-wrapper`, `#top-header`, `.top-bar`, `#quick-links-bar`, `#content-area`, `.layout-columns`), **Sidebar Esquerda** (`#sidebar`, `.space-item`, `.space-shortcut-badge`), **Action Sidebar Direita** (`#action-sidebar`), Relógio/Header e **Lock Mode** (`body.layout-locked`). |
| **3** | `css/modules/bookmarks.css` | Categorias (`.bookmark-category`, `.category-header`, `.group-toggle-btn`, `.group-open-all-btn`, `.group-count-badge`), Grid (`.bookmarks-grid`), Cartões (`.bookmark-item`, `.bookmark-favicon`, `.bookmark-name`, `.edit-bookmark-btn`, `.delete-bookmark-btn`), **Estilos de Cartão** (`body.card-style-frameless`, `body.card-style-compact`), **Empty States** e **Skeleton Loading**. |
| **4** | `css/modules/modals.css` | Estrutura base de modais (`.modal-overlay`, `.modal-content`), **Edit Link Modal & Catálogo Visual de Ícones**, **Search Modal & Command Palette**, **Space Modal & Emoji Picker**, **Shortcuts Modal** e **Custom Context Menu** (`.context-menu`). |
| **5** | `css/modules/widgets.css` | Créditos Unsplash, **Pomodoro/Toggl Popup**, `:focus-visible`, Dashboard Superior (`.widgets-dashboard-wrapper`, `.top-widgets-container`), **Quote Widget**, **To-Do Widget**, **RSS Widget**, `@media` queries responsivas (`<768px`, `768–1024px`, `>1440px`), **Modo Zen** (`body.zen-mode`) e `prefers-reduced-motion`. |
| **6** | `css/modules/quick-popover.css` | **Quick Appearance & Settings Popover** em 3 micro-abas (`#quick-appearance-popover`, `.qap-tabs`, `.qap-pane`, `.qap-theme-grid`, `.qap-segmented`, `.qap-toggle-row`). |

---

## 3. Auditoria de Equivalência e Ordem de Cascata

Para garantir **zero regressão visual**, a modularização passou por verificação automatizada comparando o commit monolítico de referência (`7b66024:css/style.css`) com a união ordenada dos 6 módulos:

- **1.895 chaves de declaração (`@media | seletor | propriedade`):** `1.895 = 1.895` (`0` declarações faltando, `0` declarações extras, `0` valores vencedores divergentes).
- **Detector de inversões de cascata (`cascade-order.py`):** `0` inversões candidatas entre seletores de mesma especificidade após preservar a ordem exata de `text-behavior-*` / `name-display-hover` em `bookmarks.css` e `:focus-visible` antes de `.todo-input-container input` em `widgets.css`.
