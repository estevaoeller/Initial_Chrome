# Tarefas

## Atividades do projeto

| ID | Atividade | Responsável | Status | Prazo | Próximo passo |
|---|---|---|---|---|---|
| ACT-001 | Priorizar e selecionar oportunidades de melhoria | estev | DONE | — | Prioridades definidas (P0, P1, P2) |
| ACT-002 | Implementar cache no widget de clima (Open-Meteo) | Antigravity | DONE | — | Cache local com TTL de 45 min e Stale-While-Revalidate em `modules.js` |
| ACT-003 | Criar Empty State para Espaços sem marcadores | Antigravity | DONE | — | Painel glassmorphism com CTA para criar primeiro grupo em `bookmark-renderer.js` |
| ACT-004 | Reorganizar layout de widgets superiores (Dashboard modular) | Antigravity | DONE | — | Grid responsivo de widgets com recolhimento e persistência |
| ACT-005 | Prevenir estouro de cota do Chrome Sync no To-Do list | Antigravity | DONE | — | Botão limpar concluídas, contadores dinâmicos e captura de erros de cota |
| ACT-006 | Atalhos numéricos `Alt+1..9` para alternar Espaços | Antigravity | DONE | — | Já implementado em `js/features/shortcuts.js` (`switchSpaceFlow`) |
| ACT-007 | Modularizar arquivo monolítico `css/style.css` (~3.340 linhas) | Antigravity | DONE | — | Dividido em 6 módulos temáticos em `css/modules/` + barrel `css/style.css` ([plano](wiki/plano-modularizacao-css.md)) |
| ACT-008 | Resolução inteligente de ícones (DashboardIcons Auto-Detect + Catálogo Visual + Lock Cache) | Antigravity | DONE | — | Implementado em `js/icon-resolver.js`, `js/bookmark-renderer.js` e `js/features/edit-modal.js` ([plano](wiki/plano-icones-e-persistencia.md)) |
| ACT-009 | Persistência imortal de ícones e configurações contra reinstalação | Antigravity | DONE | — | Auto-backup em `[InitialChrome_Config_Backup]` nos Favoritos + `user-defaults.json` local ([plano](wiki/plano-icones-e-persistencia.md)) |
| ACT-010 | Navegabilidade `Ctrl+T`: Type-to-Search instantâneo, badges `1..9` na Sidebar e "Abrir todos do grupo" | Antigravity | DONE | — | Implementado em `js/features/search.js`, `js/features/sidebar.js` e `js/bookmark-renderer.js` ([plano](wiki/plano-evolucao-ux-layout.md)) |
| ACT-011 | Layout & Densidade: Slider de Blur no Wallpaper (`0..24px`), Estilos de Cartão (`card` / `frameless` / `compact`) e Quick Links com ícones | Antigravity | DONE | — | Implementado em `js/settings-handlers.js`, `js/features/quick-links.js` e `css/style.css` ([plano](wiki/plano-evolucao-ux-layout.md)) |
| ACT-012 | Cores & Temas: Adicionar paletas Catppuccin Mocha, Dracula, Nord, Tokyo Night e Rosé Pine com alto contraste | Antigravity | DONE | — | Implementado em `css/style.css`, `css/tokens.css`, `js/modules.js`, `js/features/theme-builder.js` e `settings.html` ([plano](wiki/plano-evolucao-ux-layout.md)) |
| ACT-013 | UX de Configs: Popover Rápido de Aparência na Nova Aba + Indicador de Auto-Save | Antigravity | DONE | — | Implementado em `newtab.html`, `js/app.js`, `settings.html` e `js/settings-app.js` ([plano](wiki/plano-evolucao-ux-layout.md)) |
| ACT-014 | Modo Trava de Layout (`Lock Mode`) contra arraste acidental de cartões | Antigravity | DONE | — | Implementado em `newtab.html`, `js/app.js`, `js/bookmark-renderer.js` e `css/style.css` ([plano](wiki/plano-evolucao-ux-layout.md)) |
| ACT-015 | Correção dos 6 problemas nas Configurações (Wallpaper Upload/URL, Preservação de Cores de Temas, Reatividade Pomodoro/QuickLinks e limites de sliders) | Antigravity | DONE | — | Implementado em `js/settings-handlers.js`, `js/modules.js`, `js/pomodoro.js`, `settings.html` e `js/settings-app.js` ([plano](wiki/plano-diagnostico-configs-e-quick-popover.md)) |
| ACT-016 | Expandir Quick Popover na Nova Aba em 3 micro-abas (`Aparência`, `Grade & Cartões` e `Widgets`) | Antigravity | DONE | — | Implementado em `newtab.html`, `js/app.js` e `css/style.css` ([plano](wiki/plano-diagnostico-configs-e-quick-popover.md)) |
| ACT-017 | Pesquisa e benchmark futuro de novas funcionalidades de produtividade e gestão de sessão (ex.: salvar abas abertas da janela em um grupo estilo Toby/Stackable) | A definir | BACKLOG | — | Aguardar priorização futura ([referências](wiki/referencias-e-inspiracoes.md)) |

## Fila dos agentes

| ID | Solicitação | Solicitado por | Agente | Modelo | Status da execução | Validação | Evidência |
|---|---|---|---|---|---|---|---|
| AGT-001 | Instalação e adaptação do Project Memory v3 | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`history/2026-10-28-instalacao-project-memory.md`](history/2026-10-28-instalacao-project-memory.md) |
| AGT-002 | Diagnóstico e registro de oportunidades de melhoria na memória | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`wiki/oportunidades-melhoria.md`](wiki/oportunidades-melhoria.md) |
| AGT-003 | Consolidação da memória histórica, decisões e referências | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`history/`](history/), [`wiki/`](wiki/) |
| AGT-004 | Padronização e formalização de planos na wiki | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`AGENTS.md`](AGENTS.md), [`wiki/INDEX.md`](wiki/INDEX.md) |
| AGT-005 | Implementação de cache de clima e gestão de cota do To-Do | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`walkthrough.md`](file:///C:/Users/estev/.gemini/antigravity-ide/brain/eadbea7f-b2e8-4929-bffa-26e06055d985/walkthrough.md), [`js/modules.js`](js/modules.js), [`js/features/todo.js`](js/features/todo.js) |
| AGT-006 | Implementação do Empty State acolhedor para Espaços vazios | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`js/bookmark-renderer.js`](js/bookmark-renderer.js), [`css/style.css`](css/style.css) |
| AGT-007 | Reorganização dos widgets superiores em Dashboard modular | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`newtab.html`](newtab.html), [`css/style.css`](css/style.css), [`js/app.js`](js/app.js) |
| AGT-008 | Implementação de Ícones Inteligentes (DashboardIcons + Lock Cache) e Persistência Imortal | estev | Antigravity | Gemini 4 Argon (Medium) | DONE | HUMAN_VALIDATED | [`wiki/plano-icones-e-persistencia.md`](wiki/plano-icones-e-persistencia.md), [`js/icon-resolver.js`](js/icon-resolver.js), [`js/modules.js`](js/modules.js), [`history/2026-10-28-icones-inteligentes-e-persistencia.md`](history/2026-10-28-icones-inteligentes-e-persistencia.md) |
| AGT-009 | Benchmark de extensões/dashboards na Wiki e plano de evolução (Layout, UX, Cores, Configs, Navegabilidade) | estev | Antigravity | Gemini 4 Argon (Medium) | DONE | HUMAN_VALIDATED | [`wiki/referencias-e-inspiracoes.md`](wiki/referencias-e-inspiracoes.md), [`wiki/plano-evolucao-ux-layout.md`](wiki/plano-evolucao-ux-layout.md) |
| AGT-010 | Implementação dos 5 pacotes de evolução (`ACT-010` a `ACT-014`: Navegabilidade, Layout, Temas, Quick Popover e Lock Mode) | estev | Antigravity | Gemini 4 Argon (Medium) | DONE | HUMAN_VALIDATED | [`history/2026-10-29-evolucao-ux-layout-temas-navegabilidade.md`](history/2026-10-29-evolucao-ux-layout-temas-navegabilidade.md), [`walkthrough.md`](file:///C:/Users/estev/.gemini/antigravity/brain/97701578-d609-474f-adba-a10b8f1934c9/walkthrough.md) |
| AGT-011 | Diagnóstico completo das Configurações, correção dos 6 defeitos e expansão do Quick Settings Popover em 3 micro-abas | estev | Antigravity | Gemini 4 Argon (Medium) | DONE | HUMAN_VALIDATED | [`wiki/plano-diagnostico-configs-e-quick-popover.md`](wiki/plano-diagnostico-configs-e-quick-popover.md), [`history/2026-10-29-diagnostico-configs-e-quick-popover.md`](history/2026-10-29-diagnostico-configs-e-quick-popover.md) |
| AGT-012 | Higiene documental (`_wiki/` → `wiki/`), saneamento de merge, atualização do `README.md`/`PROJECT.md` e modularização completa do CSS (`ACT-007`) | estev | Antigravity | Gemini 4 Argon (Medium) | DONE | AI_PROPOSED | [`wiki/plano-modularizacao-css.md`](wiki/plano-modularizacao-css.md), [`css/modules/`](css/modules/), [`README.md`](README.md) |

## Status de execução

`BACKLOG`, `READY`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`, `CANCELLED`.

## Status de validação

`AI_PROPOSED`, `REQUIRES_REVIEW`, `HUMAN_VALIDATED`, `REJECTED`, `SUPERSEDED`.
