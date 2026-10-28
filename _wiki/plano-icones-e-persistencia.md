# Plano: Ícones Inteligentes e Persistência Definitiva de Dados

Status: `AI_PROPOSED`  
Data: 2026-10-28  
Tarefas associadas: `ACT-008`, `ACT-009`

---

## 1. Contexto e Problema

O usuário relatou duas dores principais no uso diário da extensão:

1. **Configuração trabalhosa de ícones:** Hoje, para usar ícones de alta qualidade como o **DashboardIcons** (Homarr), **SimpleIcons** ou **TechIcons**, é preciso abrir o modal de cada bookmark individualmente e adivinhar o nome exato (*slug*) do ícone sem uma prévia de catálogo. Além disso, os links sem ícone customizado caem diretamente no Favicon do Google (`google.com/s2/favicons`), que muitas vezes possui baixa resolução ou fundo inadequado.
2. **Perda de configurações e ícones ao reinstalar:** Quando a extensão é reinstalada ou recarregada do zero em um novo perfil, o Chrome limpa o `chrome.storage.sync` e `chrome.storage.local` associados àquele ID de instalação. Embora os favoritos sobrevivam porque ficam na árvore nativa do `chrome.bookmarks` (pasta `"Pagina Inicial"`), todos os ícones customizados (`icon:*`), temas e configurações de layout são perdidos caso o usuário não tenha importado um JSON manualmente.

---

## 2. Solução Arquitetural

### Parte A: Motor de Ícones Inteligentes (`js/icon-resolver.js`) + Catálogo Visual

1. **Inferência Automática de Slug com Cascata de Fallback:**
   - Criar módulo dedicado [`js/icon-resolver.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/icon-resolver.js) que extrai candidatos de *slug* a partir do **domínio da URL** e do **nome do bookmark** (com dicionário de aliases populares como `github`, `gitlab`, `youtube`, `gmail` → `google-gmail`, `drive` → `google-drive`, `calendar` → `google-calendar`, `chatgpt` → `openai`, `claude`, `proxmox`, `plex`, `jellyfin`, `portainer`, `home-assistant`, `grafana`, `synology`, `nextcloud`, `cloudflare`, `vercel`, `supabase`, `notion`, `figma`, `discord`, `whatsapp`, `telegram`, `reddit`, `twitch`, `netflix`, `spotify`, `steam`, `trello`, `jira`, `bitbucket`, `aws`, `azure`, `gcp` → `google-cloud`, etc.).
   - Quando um link não tem ícone customizado manual (ou quando `defaultIconSource` está em `'dashboardicons'`):
     1. Tenta carregar primeiro do **DashboardIcons CDN** (`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/{slug}.svg`).
     2. Se o SVG não existir no DashboardIcons (`onerror`), faz fallback automático para candidatos secundários (ex: slug pelo título do bookmark) ou cai suavemente no **Favicon Oficial do Google** (`sz=64`).
   - Adicionar configuração global `defaultIconSource` em [`js/config.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/config.js) e [`settings.html`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/settings.html) (padrão: `'dashboardicons'`, com opções `'dashboardicons'`, `'simpleicons'`, `'favicon'`).

2. **Buscador Visual de Ícones no Modal (`edit-link-modal`):**
   - No modal de edição ([`js/features/edit-modal.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/features/edit-modal.js)), ao abrir a aba **"Galeria Oficial"** ou digitar no campo de busca (`#gallery-search`), exibir uma **grade visual interativa (`#icon-suggestions-grid`)** com os ícones correspondentes renderizados em tempo real.
   - Incluir catálogo embutido de ~200 ícones populares de Dashboard/Dev/Web + busca dinâmica da lista completa da árvore do repositório `homarr-labs/dashboard-icons` (cacheada em `chrome.storage.local` por 7 dias) para encontrar qualquer um dos +2.000 ícones do DashboardIcons instantaneamente.
   - Clicar em um card da grade preenche o slug, atualiza o preview e já seleciona o ícone com 1 clique.

---

### Parte B: Persistência Imortal (Bookmarks Metadata + `user-defaults.json` na Pasta)

Para garantir que **nenhum ícone ou configuração se perca ao reinstalar**:

1. **Camada 1 — Sincronização Automática nos Bookmarks do Chrome (`[InitialChrome_Config_Backup]`):**
   - Como a pasta `"Pagina Inicial"` no `chrome.bookmarks` sobrevive à desinstalação da extensão e sincroniza via conta Google, criaremos uma subpasta de sistema oculta na renderização (`_config_backup`) ou um bookmark especial com título `[InitialChrome_Config_Backup]` e URL `https://initial-chrome.local/backup#<base64_json>`.
   - Sempre que um ícone customizado, configuração, tema ou link rápido for salvo, a extensão atualiza automaticamente esse nó de backup dentro de `"Pagina Inicial"`.
   - Ao instalar/iniciar a extensão com storage vazio, ela verifica se existe o marcador `[InitialChrome_Config_Backup]` nos favoritos do Chrome e **restaura automaticamente todos os ícones customizados, configurações, temas e quick links**, sem exigir nenhuma ação do usuário!

2. **Camada 2 — Arquivo `user-defaults.json` na Pasta da Extensão:**
   - Adicionar um arquivo [`user-defaults.json`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/user-defaults.json) na raiz do projeto.
   - Na inicialização, se o storage e o backup nos Bookmarks estiverem vazios, a extensão faz `fetch(chrome.runtime.getURL('user-defaults.json'))` e carrega as configurações e ícones salvos na pasta do projeto (sincronizada pelo OneDrive do usuário).
   - Na aba **Sistema** de [`settings.html`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/settings.html), adicionar o botão **"📌 Salvar para Pasta do Projeto (user-defaults.json)"** e indicador de status do **Auto-Sync nos Favoritos do Chrome**, permitindo atualizar o arquivo `user-defaults.json` a qualquer momento ou forçar sincronização imediata.

---

## 3. Arquivos Afetados

- [`js/icon-resolver.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/icon-resolver.js) *(novo)*: Resolução automática de ícones, aliases, fallback em cascata e busca no catálogo do DashboardIcons.
- [`user-defaults.json`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/user-defaults.json) *(novo)*: Semente persistente de configurações e ícones na pasta local do projeto.
- [`js/config.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/config.js): Adição de `defaultIconSource: 'dashboardicons'`.
- [`js/modules.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/modules.js): Ignorar pasta/nó de metadados `_config_backup` na listagem de espaços e integrar espelhamento automático de ícones e configurações nos Bookmarks do Chrome + restauração automática.
- [`js/bookmark-renderer.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/bookmark-renderer.js): Uso do `resolveBookmarkIcon` com fallback encadeado (`onerror`) para carregar DashboardIcons automaticamente sem quebrar quando um ícone não existir.
- [`js/features/search.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/features/search.js): Usar a mesma resolução inteligente de ícones nos resultados de busca.
- [`js/features/edit-modal.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/features/edit-modal.js) e [`newtab.html`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/newtab.html): Grade visual de sugestões de ícones em tempo real e botão de auto-detectar no modal.
- [`settings.html`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/settings.html), [`js/settings-app.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/settings-app.js), [`js/settings-handlers.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/settings-handlers.js) e [`js/features/settings-data.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/js/features/settings-data.js): Seletor de Fonte Padrão de Ícones e painel de Persistência Automática / Exportação para `user-defaults.json`.
- [`background.js`](file:///c:/Users/estev/OneDrive/10_Projects/90_Coding-Projects/Aba_Inicial/AntiG/Initial_Chrome/background.js): Restauração multi-camada (Chrome Bookmarks Backup → `user-defaults.json` → `settingsBackup` local) no `onInstalled` e `onStartup`.

