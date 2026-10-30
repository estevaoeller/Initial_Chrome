# Initial Chrome (Página Inicial Personalizada)

## Finalidade

Extensão para Google Chrome (Manifest V3) que substitui a nova guia padrão por uma página inicial altamente personalizável e focada em produtividade, com gerenciamento de marcadores por Espaços, busca instantânea *Type-to-Search*, *Quick Settings Popover* ao vivo e timer Pomodoro integrado ao Toggl Track.

## Escopo atual

- **Incluído:**
  - Gerenciamento de Espaços (Spaces com badges `1..9`) e Categorias (com contador e botão *"Abrir todos"*) sincronizados em `chrome.bookmarks`.
  - Organização por Drag & Drop usando SortableJS + **Modo Trava de Layout (`Lock Mode`)** contra arraste acidental.
  - Sistema de busca fuzzy rápida (`Alt+K`, `/` ou **Type-to-Search** digitando direto na Nova Aba) com filtros, breadcrumbs, Command Palette (`>`) e realce visual.
  - **Quick Settings Popover na Nova Aba** em 3 micro-abas (`🎨 Aparência`, `📐 Grade` e `✨ Widgets`) com auto-save instantâneo.
  - Customização de layout (Masonry vs Lista vertical), **9 temas nativos de alto contraste** (Claro, Escuro, Solar, Minimalista, Catppuccin Mocha, Dracula, Nord, Tokyo Night e Rosé Pine) + Theme Builder customizado, **3 estilos de cartão** (`Card`, `Frameless`, `Compact`) e tipografia.
  - **Ícones inteligentes automáticos** (`DashboardIcons`, `SimpleIcons`, `TechIcons`, Favicon oficial ou URL customizada) com catálogo visual e cache *Lock-on-First-Resolve* (`0ms`).
  - Timer Pomodoro com integração ao Toggl Track, Lista de Tarefas (To-Do), Citações e Feed RSS em Dashboard modular recolhível.
  - Wallpapers dinâmicos (Unsplash, Upload de Imagem do PC ou URL direta) com **slider de Blur (`0..24px`)**, filtro de contraste e extração automática de cor dominante (*Dynamic Accent*).
  - **Persistência Imortal**: Sincronização no `chrome.storage.sync` + auto-backup invisível na árvore de Favoritos (`[InitialChrome_Config_Backup]`) + fallback em `user-defaults.json` e exportação/importação JSON.
- **Não incluído:**
  - Backend próprio ou envio de dados privados para servidores terceiros (privacidade local/nativa).

## Contexto estável

- **Tecnologias:** JavaScript Vanilla (ES Modules), HTML5, CSS3 nativo (Design Tokens), Chrome Extension APIs (Manifest V3).
- **Estrutura central:**
  - `manifest.json`: Configurações e permissões da extensão.
  - `newtab.html` / `js/` / `css/`: Interface e lógica da página de nova guia.
  - `settings.html` / `js/settings-app.js`: Painel completo de configurações e preferências.
  - `background.js`: Service worker para eventos de fundo.
  - `wiki/` e `scripts/sync-github-wiki.ps1`: Base de conhecimento arquitetural sincronizada com a GitHub Wiki.

## Fontes principais

| Fonte | Localização | Uso |
|---|---|---|
| Manifest | `manifest.json` | Configuração V3 e permissões |
| Interface Principal | `newtab.html`, `js/`, `css/` | Aba inicial, Quick Popover e componentes |
| Configurações | `settings.html`, `js/settings-app.js` | Página completa de customizações, APIs e backups |
| Documentação & Planos | `README.md`, `wiki/INDEX.md` | Guia de funcionalidades, benchmarks e planos técnicos |
| Clima (API) | Open-Meteo (`api.open-meteo.com`) | Previsão do tempo com cache local SWR (`modules.js`) |
| Timer Foco (API) | Toggl Track (`api.track.toggl.com`) | Integração de tracking de tempo Pomodoro (`toggl.js`) |
| Drag & Drop (Lib) | SortableJS (`js/Sortable.min.js`) | Reordenação visual de marcadores, categorias e espaços |

## Restrições e segurança

- Não sobrescrever favoritos sem confirmação.
- Não registrar chaves de API, senhas ou tokens (ex: Toggl, Unsplash) no Git.
- Manter compatibilidade estrita com a política da Chrome Web Store e Manifest V3.
