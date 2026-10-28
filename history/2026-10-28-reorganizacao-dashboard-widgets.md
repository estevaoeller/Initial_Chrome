---
date: 2026-10-28
execution_id: RUN-20261028-004
requested_by: estev
agent: Antigravity
agent_version: unknown
provider: Google DeepMind
model: Gemini 3.8 Flash (Medium)
tasks: [ACT-004, AGT-007]
validation: AI_PROPOSED
---

# Reorganização dos Widgets Superiores em Dashboard Modular

## Objetivo

Resolver a sobrecarga vertical no topo da tela causada pelo empilhamento individual dos widgets de Citação, Tarefas e Feed RSS, criando um Dashboard unificado em CSS Grid responsivo com botão discreto para recolher/expandir os widgets sob demanda.

## Feito

- **Reestruturação do DOM (`newtab.html`):**
  - Criação do container `widgets-dashboard-wrapper` envolvendo todos os widgets.
  - Inclusão do botão de controle `#toggle-widgets-btn` com ícone dinâmico (`▾`/`▸`) e texto indicativo.
  - Integração do `#rss-widget` para dentro de `#top-widgets-container` ao lado de `#quote-widget` e `#todo-widget`.
- **Layout Responsivo & Estética em CSS (`css/style.css`):**
  - Transformação de `#top-widgets-container` em `display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;`.
  - Equalização das alturas mínimas e comportamento de scroll interno suave para `.todo-list` e `.rss-list`.
  - Estilização em glassmorphism do botão pílula `.toggle-widgets-btn`.
  - Ajuste na media query para telas menores (`max-width: 768px`) empilhando os cards de forma limpa.
- **Controle Interativo & Persistência (`js/app.js`):**
  - Implementação de `initWidgetsDashboardToggle()` salvando e recuperando o estado `widgetsCollapsed` no `chrome.storage.local`.
  - Atualização de `updateWidgetVisibilities(settings)` para ocultar o wrapper por completo caso todos os três widgets estejam desativados nas preferências do usuário.
- **Testes & Documentação:**
  - Verificação de renderização e estado via `scratch/verify_dashboard.js`.
  - Atualização do `walkthrough.md`.
  - Atualização de `TASKS.md` (`ACT-004` concluído; `AGT-007` registrado) e `NOW.md`.

## Arquivos criados ou alterados

- `newtab.html` (alterado)
- `css/style.css` (alterado)
- `js/app.js` (alterado)
- `walkthrough.md` (alterado)
- `TASKS.md` (alterado)
- `NOW.md` (alterado)
- `history/2026-10-28-reorganizacao-dashboard-widgets.md` (criado)

## Resultado e limitações

- **Resultado:** Os favoritos agora têm máxima prioridade na tela. O usuário pode alternar entre exibir o dashboard modular equilibrado ou recolhê-lo com 1 clique para foco total nos marcadores.
- **Limitações:** A ordem dos widgets dentro do grid é fixa (Citação -> To-Do -> RSS), podendo no futuro ganhar drag & drop entre si.

## Próximo passo

- Implementar `ACT-006`: Atalhos de teclado `Alt+1..9` para alternar entre os Espaços da sidebar sem mouse.
