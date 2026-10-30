# Índice de conhecimento

Este arquivo é o ponto de entrada para conhecimento durável do projeto.

Não crie categorias antecipadamente. Acrescente links quando páginas reais forem criadas.

## Páginas disponíveis

- [Oportunidades de Melhoria da Página Inicial](oportunidades-melhoria.md) — Diagnóstico técnico e catálogo de melhorias de performance, UX, produtividade e código (`HUMAN_VALIDATED`).
- [Plano: Ícones Inteligentes e Persistência Definitiva de Dados](plano-icones-e-persistencia.md) — Arquitetura e implementação do resolvedor automático de DashboardIcons com catálogo visual, travamento em 0ms (`Lock-on-First-Resolve`) e backup automático em `chrome.bookmarks` + `user-defaults.json` (`HUMAN_VALIDATED`).
- [Plano: Evolução de Layout, UX, Configurações, Cores e Navegabilidade](plano-evolucao-ux-layout.md) — Roadmap técnico em 5 pilares (Navegabilidade `Ctrl+T`, Layout/Blur/Frameless, Novos Temas, Popover Rápido de Aparência e Trava de Layout) derivado do benchmark de mercado (`HUMAN_VALIDATED`).
- [Plano: Diagnóstico de Configurações, Correções Estruturais e Quick Settings Popover](plano-diagnostico-configs-e-quick-popover.md) — Auditoria completa de `settings.html`, correção dos 6 problemas detectados (Wallpaper local/URL, preservação de cores nativas dos temas, reatividade em tempo real) e expansão do Quick Popover em 3 micro-abas (`HUMAN_VALIDATED`).
- [Plano: Modularização da Arquitetura CSS (`ACT-007`)](plano-modularizacao-css.md) — Arquitetura proposta para dividir o monólito `css/style.css` (~3.340 linhas) em 7 módulos temáticos sem regressão de especificidade (`AI_PROPOSED`).
- [Referências e Inspirações de Design e Produto](referencias-e-inspiracoes.md) — Hub central de referências de mercado, benchmarks comparativos e ideias de UX/produto (`HUMAN_VALIDATED`):
  - [Aurora: Productive and cozy new tab](referencias/aurora.md)
  - [SquarePage](referencias/squarepage.md)
  - [Google New Tab (Padrão do Chrome)](referencias/google-new-tab.md)
  - [Stackable - Bookmark and Tab Manager](referencias/stackable.md)
  - [Super Bookmark Desktop](referencias/super-bookmark-desktop.md)
  - [Websktop Speed Dial](referencias/websktop-speed-dial.md)
  - [nightTab - Power-User Grid & Customization Master](referencias/nighttab.md)
  - [Bonjourr & Tabliss - Minimalismo Estético, Blur e Quick Settings](referencias/bonjourr.md)
  - [Toby & Workona - Gestão Visual de Coleções, Sessões e Abas](referencias/toby.md)
  - [Homepage, Homarr & Glance - Dashboards Modernos e Type-to-Search](referencias/homepage-homarr-glance.md)

## Regra de organização

- prefira atualizar uma página existente;
- crie página nova quando o assunto tiver valor futuro próprio;
- salve planos técnicos e roadmaps de implementação na wiki (ex: `plano-*.md`) e vincule-os no `TASKS.md`;
- crie pasta apenas quando houver agrupamento real ou crescimento previsível;
- mantenha este índice curto e navegável.
