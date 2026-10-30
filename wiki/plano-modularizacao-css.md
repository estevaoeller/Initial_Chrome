# Plano: Modularização da Arquitetura CSS (`ACT-007`) e Higiene Documental

- **ID da Tarefa:** `ACT-007` (Planejamento Técnico)
- **Data:** 2026-10-29
- **Status de Validação:** `AI_PROPOSED`

---

## 1. Contexto e Diagnóstico do Monólito (`css/style.css`)

Atualmente, o arquivo [`css/style.css`](../css/style.css) concentra **~3.340 linhas** de regras CSS cobrindo desde variáveis de temas e layout estrutural até cartões de favoritos, relógio, widgets (To-Do, Citações, RSS, Pomodoro), modais, menu de contexto, animações, responsividade e o novo Quick Settings Popover.

### Problemas identificados no modelo monolítico:
1. **Sobreposição e duplicidade histórica:** Algumas classes (como `#content-area`, `.bookmark-item`, `.bookmark-name`, `.category-header` e `@media (prefers-reduced-motion: reduce)`) foram redeclaradas em múltiplos pontos ao longo da evolução das fases 1 a 6.
2. **Alto custo cognitivo e conflitos de merge:** Qualquer alteração visual em um componente isolado (ex.: Quick Popover ou Temas) exige edição no mesmo arquivo de 3.300+ linhas.
3. **Acoplamento de responsabilidades:** Regras estruturais do grid principal dividem espaço com estilos específicos de modais secundários.

---

## 2. Arquitetura Proposta de Módulos CSS (`css/`)

A estratégia recomendada divide [`css/style.css`](../css/style.css) em **7 módulos temáticos coesos** dentro de `css/modules/` (ou importados diretamente em `newtab.html` para zero custo de `@import` em cascata), mantendo [`css/tokens.css`](../css/tokens.css) como fundação do Design System:

| Ordem de Carga | Arquivo Proposto | Escopo e Responsabilidade | Linhas Originais Aproximadas (`css/style.css`) |
|---|---|---|---|
| **1** | `css/tokens.css` *(existente)* | Tokens primitivos e semânticos (`--space-*`, `--radius-*`, `--surface*`, `--shadow-*`, `--dur-*`). | Já modularizado (`100 linhas`) |
| **2** | `css/themes.css` | Reset base (`:root`, `body`), classes de superfície (`.solid-surfaces`), os **9 temas nativos** (`body.<theme>-theme`) e animações globais (`@keyframes`, `prefers-reduced-motion`, `:focus-visible`). | Linhas `1–150`, `1540–1556`, `2224–2328` (~260 linhas) |
| **3** | `css/layout.css` | Estrutura macro (`#app-container`, `#main-wrapper`, `#top-header`, `.top-bar`, `#quick-links-bar`, `#content-area`, `.layout-columns`), **Sidebar Esquerda** (`#sidebar`, `.space-item`, `.space-shortcut-badge`), **Action Sidebar Direita** (`#action-sidebar`), **Modo Zen** (`body.zen-mode`), **Lock Mode** (`body.layout-locked`) e `@media` queries responsivas. | Linhas `164–495`, `1000–1057`, `2100–2223`, `2273–2307`, `2864–2901`, `3013–3026` (~620 linhas) |
| **4** | `css/bookmarks.css` | Categorias (`.bookmark-category`, `.category-header`, `.group-toggle-btn`, `.group-open-all-btn`, `.group-count-badge`), Grid (`.bookmarks-grid`), Cartões (`.bookmark-item`, `.bookmark-favicon`, `.bookmark-name`, `.edit-bookmark-btn`, `.delete-bookmark-btn`), **Estilos de Cartão** (`body.card-style-frameless`, `body.card-style-compact`), **Empty States** e **Skeleton Loading**. | Linhas `579–927`, `1747–1820`, `2071–2100`, `2245–2271`, `2712–2860`, `2902–3012` (~780 linhas) |
| **5** | `css/widgets.css` | Saudação e Clima (`#greeting-box`, `.weather-badge`), Relógio Analógico/Digital (`#clock-area`, `.clock-time`, `.analog-clock-face`), Dashboard Superior (`.widgets-dashboard-wrapper`, `.top-widgets-container`), **Quote Widget**, **To-Do Widget**, **RSS Widget** e **Pomodoro/Toggl Popup** (`.pomodoro-popup`). | Linhas `496–540`, `929–998`, `1395–1538`, `2329–2711` (~680 linhas) |
| **6** | `css/modals-and-menus.css` | Estrutura base de modais (`.modal-overlay`, `.modal-content`), **Edit Link Modal & Catálogo Visual de Ícones** (`#edit-link-modal`, `.icon-catalog-*`), **Search Modal & Command Palette** (`#search-modal`, `.search-result-*`), **Space Modal & Emoji Picker**, **Shortcuts Modal** e **Custom Context Menu** (`.context-menu`). | Linhas `1058–1394`, `1557–1746`, `1822–2070` (~720 linhas) |
| **7** | `css/quick-popover.css` | **Quick Appearance & Settings Popover** (`#quick-appearance-popover`, `.qap-tabs`, `.qap-pane`, `.qap-theme-grid`, `.qap-segmented`, `.qap-toggle-row`). | Linhas `3027–3341` (~280 linhas) |

---

## 3. Estratégia de Migração Segura (Quando `ACT-007` for Executada)

Para garantir **zero regressão de especificidade CSS** durante a futura execução de `ACT-007`:
1. **Preservar a ordem exata da cascata:** Os `<link rel="stylesheet">` em `newtab.html` serão declarados na mesma ordem lógica em que os blocos aparecem hoje em `css/style.css` (`tokens.css` → `themes.css` → `layout.css` → `bookmarks.css` → `widgets.css` → `modals-and-menus.css` → `quick-popover.css`).
2. **Consolidação sem alterar seletores:** Unificar declarações duplicadas do mesmo seletor (ex.: `.category-header` na linha 2714 e na linha 2903) preservando as propriedades finais vencedoras.
3. **Verificação automatizada e visual:** Validar que `npm run lint` e `npm test` passam e inspecionar os 9 temas + 3 modos de cartão + responsividade antes de remover o `css/style.css` legado.

