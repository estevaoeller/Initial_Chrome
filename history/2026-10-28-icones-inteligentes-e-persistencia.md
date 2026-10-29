# Registro Histórico: Ícones Inteligentes (DashboardIcons) e Persistência Imortal

- **Data:** 2026-10-28
- **Solicitante:** estev
- **Agente e versão:** Antigravity
- **Provedor:** Google DeepMind
- **Modelo configurado/reportado:** Gemini 4 Argon (Medium)
- **Identificação da tarefa:** `ACT-008`, `ACT-009` (`AGT-008`)
- **Status de validação:** `HUMAN_VALIDATED`

## Contexto e Motivação

O usuário relatou duas dores principais no uso contínuo da extensão `Initial_Chrome`:
1. **Resolução de ícones:** Ter que buscar manualmente o nome/slug do ícone no DashboardIcons para cada favorito adicionado ou depender do favicon padrão de baixa qualidade.
2. **Perda de configurações e ícones ao reinstalar:** Como a extensão roda em modo *unpacked* a partir de uma pasta local sincronizada no OneDrive, reinstalar a extensão ou trocar de máquina limpava o `chrome.storage.sync`/`local`, fazendo com que todas as customizações de ícones (`icon:*`) e configurações fossem perdidas, enquanto apenas a árvore de pastas de favoritos (`"Pagina Inicial"`) sobrevivia no Chrome Bookmarks.

## Alterações Realizadas

### 1. Motor de Resolução Inteligente de Ícones e Catálogo Visual (`ACT-008`)
- **Criado [`js/icon-resolver.js`](../js/icon-resolver.js):**
  - Dicionário de mapeamento direto de domínios (`DOMAIN_TO_SLUG_MAP`) e palavras-chave de títulos (`NAME_TO_SLUG_MAP`) para os slugs oficiais do **DashboardIcons** (incluindo serviços populares, bancos brasileiros, ferramentas dev, Google Workspace, Microsoft 365, self-hosted e streaming).
  - Extração inteligente do hostname base ignorando prefixos (`www.`, `app.`, `dash.`, `mail.`, `painel.`, etc.) e TLDs compostos (`.com.br`, `.org.br`, etc.).
  - Cascata resiliente (`resolveIconUrls` e `attachIconCascade`): tenta os candidatos SVG do DashboardIcons via CDN jsDelivr (cacheado pelo Service Worker em `background.js`), faz fallback para SimpleIcons quando aplicável, depois para Google Favicon 128px e por fim para o SVG local.
  - Catálogo visual pesquisável (`getDashboardIconsCatalog` / `searchIconCatalog`): consulta a árvore de arquivos do pacote `@walkxcode/dashboard-icons` via API do jsDelivr (com cache local de 7 dias em `chrome.storage.local` e lista curada offline para resposta imediata).
- **Atualizados [`js/bookmark-renderer.js`](../js/bookmark-renderer.js) e [`js/features/search.js`](../js/features/search.js):**
  - Substituída a resolução estática de `img.src` pela cascata inteligente `resolveIconUrls` + `attachIconCascade`.
- **Atualizados [`newtab.html`](../newtab.html), [`js/features/edit-modal.js`](../js/features/edit-modal.js) e [`css/style.css`](../css/style.css):**
  - Adicionado badge de detecção automática (`#auto-detected-badge`) na aba "Automático" do modal de edição.
  - Adicionada grade visual clicável de sugestões de ícones (`#icon-suggestions-grid`) na aba "Galeria" do modal de edição, que já abre sugerindo ícones compatíveis com o link atual e filtra em tempo real conforme a busca.
  - Atualização imediata do cartão no DOM ao salvar ou remover ícone customizado.
- **Atualizados [`js/config.js`](../js/config.js), [`settings.html`](../settings.html) e [`js/settings-app.js`](../js/settings-app.js):**
  - Nova configuração `defaultIconSource: 'dashboardicons'` como padrão global, configurável em **Configurações → Cartões e Ícones**.

### 2. Persistência Imortal contra Reinstalação (`ACT-009`)
- **Atualizado [`js/modules.js`](../js/modules.js):**
  - Implementado `syncBackupToChromeBookmarks()`: toda vez que um ícone customizado (`saveCustomIconProps` / `removeCustomIconProps`) ou configuração é salvo, a extensão grava um bookmark oculto `[InitialChrome_Config_Backup]` na raiz da pasta `"Pagina Inicial"` do Chrome Bookmarks com o payload Base64 contendo `settings`, `customIcons`, `quickLinks` e `customThemes`.
  - Atualizado `checkAndMigrateToSpaces()` para ignorar `[InitialChrome_Config_Backup]`, evitando falsas migrações legadas.
  - Implementado `restoreFromPersistentSourcesIfNeeded()`: chamado no boot da página (`js/app.js`) antes de carregar as configurações; se o `chrome.storage.sync` estiver vazio (ex.: pós-reinstalação), restaura automaticamente do bookmark `[InitialChrome_Config_Backup]` ou, em segundo caso, do arquivo `user-defaults.json` presente na raiz da pasta da extensão.
- **Criado [`user-defaults.json`](../user-defaults.json) e atualizados [`settings.html`](../settings.html) e [`js/features/settings-data.js`](../js/features/settings-data.js):**
  - Nova seção **🛡️ Proteção Contra Reinstalação (Auto-Persistência)** na aba **Sistema** com botões para sincronizar imediatamente nos Favoritos (`#force-bookmark-sync-btn`) e exportar `user-defaults.json` (`#save-project-defaults-btn`) direto para a pasta sincronizada no OneDrive.
- **Atualizado [`background.js`](../background.js):**
  - `snapshotSettings()` e `restoreSettingsIfMissing()` agora incluem todas as chaves `icon:*` e `customIconsKeys` no backup local.

## Resultado, Limitações e Próximo Passo

- **Resultado:** Implementação concluída e integrada sem dependências externas adicionais.
- **Limitações:** A gravação direta em disco na pasta da extensão pelo navegador requer o clique no botão de download de `user-defaults.json` (restrição de segurança do sandbox de extensões Chrome), porém o backup via Chrome Bookmarks (`[InitialChrome_Config_Backup]`) ocorre de forma 100% silenciosa e automática a cada alteração.
- **Próximo passo:** Validação visual pelo usuário recarregando a extensão no Chrome.

