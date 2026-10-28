# Initial Chrome (Página Inicial Personalizada)

## Finalidade

Extensão para Google Chrome (Manifest V3) que substitui a nova guia padrão por uma página inicial altamente personalizável e focada em produtividade, com gerenciamento de marcadores por Espaços, busca rápida fuzzy e timer Pomodoro integrado ao Toggl Track.

## Escopo atual

- **Incluído:**
  - Gerenciamento de Espaços (Spaces) e Categorias com sincronização em `chrome.bookmarks`.
  - Organização por Drag & Drop usando SortableJS.
  - Sistema de busca fuzzy rápida (`Alt+K` ou `/`) com filtros, breadcrumbs e realce visual.
  - Customização de layout (Masonry vs Lista vertical), temas (Claro, Escuro, Solar, Minimalista), cartões e tipografia.
  - Suporte a ícones inteligentes (Favicon oficial, SimpleIcons, TechIcons, DashboardIcons ou URLs).
  - Timer Pomodoro com integração ao Toggl Track.
  - Wallpapers dinâmicos (Unsplash) com filtro de sobreposição para contraste.
  - Persistência e backup de preferências no `chrome.storage.sync` e exportação/importação JSON.
- **Não incluído:**
  - Backend próprio ou envio de dados privados para servidores terceiros (privacidade local/nativa).

## Contexto estável

- **Tecnologias:** JavaScript Vanilla, HTML5, CSS3 nativo, Chrome Extension APIs (Manifest V3).
- **Estrutura central:**
  - `manifest.json`: Configurações e permissões da extensão.
  - `newtab.html` / `js/`: Interface e lógica da página de nova guia.
  - `settings.html` / `js/`: Painel de configurações e preferências.
  - `background.js`: Service worker para eventos de fundo.

## Fontes principais

| Fonte | Localização | Uso |
|---|---|---|
| Manifest | `manifest.json` | Configuração V3 e permissões |
| Interface Principal | `newtab.html`, `js/`, `css/` | Aba inicial e componentes |
| Configurações | `settings.html` | Modal/página de customizações |
| Documentação | `README.md` | Guia completo de funcionalidades e atalhos |
| Clima (API) | Open-Meteo (`api.open-meteo.com`) | Previsão do tempo e geolocalização (`modules.js`) |
| Timer Foco (API) | Toggl Track (`api.track.toggl.com`) | Integração de tracking de tempo Pomodoro (`toggl.js`) |
| Drag & Drop (Lib) | SortableJS (`js/Sortable.min.js`) | Reordenação visual de marcadores e categorias |

## Restrições e segurança

- Não sobrescrever favoritos sem confirmação.
- Não registrar chaves de API, senhas ou tokens (ex: Toggl) no Git.
- Manter compatibilidade estrita com a política da Chrome Web Store e Manifest V3.

