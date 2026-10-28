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
| ACT-007 | Modularizar arquivo monolítico `css/style.css` (2.200+ linhas) | A definir | BACKLOG | — | Segmentar estilos em módulos temáticos |
| ACT-008 | Resolução inteligente de ícones (DashboardIcons Auto-Detect + Catálogo Visual) | Antigravity | DONE | — | Implementado em `js/icon-resolver.js`, `js/bookmark-renderer.js` e `js/features/edit-modal.js` ([plano](_wiki/plano-icones-e-persistencia.md)) |
| ACT-009 | Persistência imortal de ícones e configurações contra reinstalação | Antigravity | DONE | — | Auto-backup em `[InitialChrome_Config_Backup]` nos Favoritos + `user-defaults.json` local ([plano](_wiki/plano-icones-e-persistencia.md)) |

## Fila dos agentes

| ID | Solicitação | Solicitado por | Agente | Modelo | Status da execução | Validação | Evidência |
|---|---|---|---|---|---|---|---|
| AGT-001 | Instalação e adaptação do Project Memory v3 | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`history/2026-10-28-instalacao-project-memory.md`](history/2026-10-28-instalacao-project-memory.md) |
| AGT-002 | Diagnóstico e registro de oportunidades de melhoria na memória | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | AI_PROPOSED | [`_wiki/oportunidades-melhoria.md`](_wiki/oportunidades-melhoria.md) |
| AGT-003 | Consolidação da memória histórica, decisões e referências | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | AI_PROPOSED | [`history/`](history/), [`_wiki/`](_wiki/) |
| AGT-004 | Padronização e formalização de planos na wiki | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | HUMAN_VALIDATED | [`AGENTS.md`](AGENTS.md), [`_wiki/INDEX.md`](_wiki/INDEX.md) |
| AGT-005 | Implementação de cache de clima e gestão de cota do To-Do | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | AI_PROPOSED | [`walkthrough.md`](file:///C:/Users/estev/.gemini/antigravity-ide/brain/eadbea7f-b2e8-4929-bffa-26e06055d985/walkthrough.md), [`js/modules.js`](js/modules.js), [`js/features/todo.js`](js/features/todo.js) |
| AGT-006 | Implementação do Empty State acolhedor para Espaços vazios | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | AI_PROPOSED | [`js/bookmark-renderer.js`](js/bookmark-renderer.js), [`css/style.css`](css/style.css) |
| AGT-007 | Reorganização dos widgets superiores em Dashboard modular | estev | Antigravity | Gemini 3.8 Flash (Medium) | DONE | AI_PROPOSED | [`newtab.html`](newtab.html), [`css/style.css`](css/style.css), [`js/app.js`](js/app.js) |
| AGT-008 | Implementação de Ícones Inteligentes (DashboardIcons) e Persistência Imortal (Bookmarks + Pasta Local) | estev | Antigravity | Gemini 4 Argon (Medium) | DONE | AI_PROPOSED | [`_wiki/plano-icones-e-persistencia.md`](_wiki/plano-icones-e-persistencia.md), [`js/icon-resolver.js`](js/icon-resolver.js), [`js/modules.js`](js/modules.js), [`history/2026-10-28-icones-inteligentes-e-persistencia.md`](history/2026-10-28-icones-inteligentes-e-persistencia.md) |

## Status de execução

`BACKLOG`, `READY`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`, `CANCELLED`.

## Status de validação

`AI_PROPOSED`, `REQUIRES_REVIEW`, `HUMAN_VALIDATED`, `REJECTED`, `SUPERSEDED`.
