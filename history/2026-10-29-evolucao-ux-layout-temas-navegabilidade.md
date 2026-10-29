# Registro Histórico — Benchmark na Wiki e Evolução de UX, Layout, Temas e Navegabilidade

- **Data:** 2026-10-29
- **Solicitante:** estev
- **Agente e versão:** Antigravity
- **Provedor:** Google DeepMind
- **Modelo configurado ou reportado:** Gemini 4 Argon (Medium)
- **Identificação da tarefa:** `ACT-010`, `ACT-011`, `ACT-012`, `ACT-013`, `ACT-014`, `AGT-009`, `AGT-010`
- **Status de validação:** `HUMAN_VALIDATED`

## Contexto e Objetivo

Após consolidar os ícones inteligentes e a persistência imortal (`ACT-008` e `ACT-009`) e confirmar a decisão arquitetural de manter o projeto como Extensão Chrome (devido ao uso intenso do atalho `Ctrl + T`), foi realizado um estudo comparativo das principais extensões de Nova Aba e dashboards auto-hospedados (**nightTab**, **Bonjourr**, **Tabliss**, **Toby**, **Workona**, **Homepage**, **Homarr** e **Glance**). Os achados foram documentados em `_wiki/referencias/` e desdobrados em 5 pacotes de evolução implementados integralmente.

## Arquivos Criados ou Alterados

### Documentação e Memória (`_wiki/`, `NOW.md`, `TASKS.md`)
- `_wiki/referencias/nighttab.md` (Criado)
- `_wiki/referencias/bonjourr.md` (Criado)
- `_wiki/referencias/toby.md` (Criado)
- `_wiki/referencias/homepage-homarr-glance.md` (Criado)
- `_wiki/plano-evolucao-ux-layout.md` (Criado)
- `_wiki/referencias-e-inspiracoes.md` (Atualizado com matriz comparativa)
- `_wiki/INDEX.md` (Atualizado)
- `NOW.md` e `TASKS.md` (Atualizados)

### Código-Fonte da Extensão
- `js/config.js`: Adicionados `wallpaperBlur: 0`, `cardStyle: 'card'` e `lockLayout: false` em `DEFAULT_SETTINGS`.
- `js/theme-cache.js`: Restauração instantânea (zero-FOUC) das classes `card-style-*` e `layout-locked` via `localStorage`.
- `js/settings-handlers.js`: Correção em `applyIconSizeSetting` para preservar SVGs do DashboardIcons; adição de `applyWallpaperBlurSetting`, `applyCardStyleSetting`, `applyLockLayoutSetting` e suporte a `backdrop-filter: blur(...)` em `applyBackgroundFilter`.
- `js/modules.js`: Exportação de `THEME_LIST` e `THEME_PALETTES` unificados com 5 novos temas (*Catppuccin Mocha*, *Dracula*, *Nord*, *Tokyo Night*, *Rosé Pine*).
- `js/features/quick-links.js`: Renderização automática de ícones via `resolveIconUrls` + `attachIconCascade` na barra superior de Quick Links.
- `js/features/search.js`: *Type-to-Search* instantâneo na Nova Aba ao pressionar teclas alfanuméricas ou `>`, abrindo o modal já filtrado.
- `js/features/sidebar.js`: Badges visuais `1..9` (`Alt+1..9`) nos Espaços e respeito ao `layout-locked`.
- `js/bookmark-renderer.js`: Contador de links `.group-count-badge`, botão `.group-open-all-btn` (*"Abrir todos"*) nos cabeçalhos de grupo e bloqueio de arraste SortableJS quando `layout-locked` está ativo.
- `newtab.html` e `js/app.js`: Botão `#lock-layout-btn` (`Alt+L`) na barra lateral direita e Popover Rápido de Aparência (`#quick-appearance-popover`) no botão de tema com preview em tempo real e salvamento imediato.
- `settings.html`, `js/settings-app.js` e `js/features/theme-builder.js`: Controles sincronizados de tema, estilo de cartão, desfoque do fundo, trava de layout e indicador visual de salvamento automático (*Auto-Save*).
- `css/style.css`: Variáveis CSS dos 5 novos temas, estilos dos modos `card-style-frameless` e `card-style-compact`, regras do `body.layout-locked`, estilos do Popover Rápido de Aparência, badges e botões de grupo.

## Resultado e Próximos Passos

- **Resultado:** Todos os 5 pacotes (`ACT-010` a `ACT-014`) foram implementados preservando zero dependências externas adicionais e 0ms de FOUC no carregamento.
- **Próximo passo:** Validação visual e funcional pelo usuário no Chrome e subsequente commit/push para o repositório remoto.

