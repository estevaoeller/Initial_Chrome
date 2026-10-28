# Estado atual

Atualizado em: 2026-10-28
Atualizado por: Antigravity (Gemini 4 Argon (Medium))

## Em andamento

- Validação das funcionalidades recém-implementadas (`ACT-008` e `ACT-009`).

## Concluído recentemente

- **Ícones Inteligentes + Catálogo Visual (`ACT-008`):**
  - Motor de inferência automática de slugs do **DashboardIcons** por domínio e título (`js/icon-resolver.js`) com fallback em cascata (DashboardIcons SVG → SimpleIcons → Google Favicon 128px → SVG local).
  - Seletor global de fonte padrão de ícones nas configurações (`DashboardIcons` ativo por padrão em `js/config.js` e `settings.html`).
  - Galeria visual clicável de sugestões de ícones (`#icon-suggestions-grid`) e badge de detecção automática (`#auto-detected-badge`) no modal de edição (`newtab.html`, `js/features/edit-modal.js`, `css/style.css`).
- **Persistência Imortal contra Reinstalação (`ACT-009`):**
  - Espelhamento automático de `extensionSettings`, todos os ícones customizados (`icon:*`), `quickLinks` e `customThemes` em um marcador oculto (`[InitialChrome_Config_Backup]`) dentro da pasta raiz `"Pagina Inicial"` do Chrome Bookmarks (`js/modules.js`).
  - Suporte a arquivo semente local `user-defaults.json` na pasta raiz do projeto (sincronizada no OneDrive) com restauração automática na inicialização (`restoreFromPersistentSourcesIfNeeded` em `js/modules.js` e `js/app.js`).
  - Ampliação do snapshot local em `background.js` para incluir `icon:*` e `customIconsKeys`.
  - Painel **Proteção Contra Reinstalação (Auto-Persistência)** na aba Sistema de `settings.html` com botões de sincronização imediata e exportação de `user-defaults.json`.
- Verificação de que `ACT-006` (atalhos `Alt+1..9` para alternar Espaços) já se encontra implementada em `js/features/shortcuts.js`.

## Bloqueios e pendências

- Nenhum no momento.

## Próximos passos

1. Recarregar a extensão no Chrome (`chrome://extensions`) para validar os novos ícones automáticos do DashboardIcons, a galeria visual no modal de edição e a sincronização automática nos Favoritos.
2. Opcionalmente clicar em **"Salvar Padrão na Pasta (`user-defaults.json`)"** em Configurações → Sistema para atualizar o arquivo `user-defaults.json` da pasta OneDrive com seus ícones atuais.

## Consulte quando necessário

- Índice de conhecimento: `_wiki/INDEX.md`
- Histórico: `history/`
