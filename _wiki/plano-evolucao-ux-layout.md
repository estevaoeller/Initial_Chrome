# Plano: Evolução de Layout, UX, Configurações, Cores e Navegabilidade

- **Status:** `HUMAN_VALIDATED`
- **Data:** 2026-10-29
- **Referências base:** [`referencias-e-inspiracoes.md`](referencias-e-inspiracoes.md) (*Aurora*, *SquarePage*, *Stackable*, *nightTab*, *Bonjourr*, *Tabliss*, *Toby*, *Homepage*, *Homarr*)

---

## 1. Visão Geral

Com a resolução inteligente de ícones (`DashboardIcons` + `Lock-on-First-Resolve`) e a persistência imortal (`[InitialChrome_Config_Backup]` + `user-defaults.json`) consolidadas, este plano estrutura a evolução da experiência de uso diário do **Initial Chrome** em **5 pilares**:

1. **Navegabilidade & Fluxo `Ctrl + T`** (Velocidade de acesso sem mouse)
2. **Layout & Densidade Visual** (Adaptação estética para diferentes volumes de links)
3. **Cores & Temas** (Paletas modernas consagradas e harmonia visual)
4. **Salvar & Configurações** (Ajustes em tempo real na própria Nova Aba e clareza de auto-save)
5. **UX & Produtividade** (Prevenção de cliques acidentais e ações em lote por grupo)

---

## 2. Detalhamento Técnico por Pilar

### Pilar 1 — Navegabilidade & Fluxo `Ctrl + T` (`ACT-010`)
- **Type-to-Search Instantâneo (inspirado em *Homepage* / *Raycast*):**
  - Na Nova Aba (`newtab.html`), se nenhum `<input>`/`<textarea>` estiver focado e nenhum modal estiver aberto, pressionar qualquer tecla alfanumérica simples (`a-z`, `0-9`, sem `Ctrl`/`Alt`/`Meta`) abre imediatamente o `SearchManager` (`#search-modal`) já preenchendo o caractere digitado no campo `#search-input` e filtrando os resultados em tempo real.
  - Fluxo resultante: **`Ctrl + T` → digita 2 letras → `Enter`** (abre o site em menos de 1 segundo).
- **Badges Numéricos de Atalho (`1..9`) nos Espaços da Sidebar (inspirado em *Toby* / *Arc*):**
  - Em `js/features/sidebar.js`, renderizar um pequeno badge (`1` a `9`) nos 9 primeiros Espaços da lista lateral, indicando visualmente o atalho `Alt+1..9` já existente.
- **Ação "Abrir Todos do Grupo" no Cabeçalho da Categoria (inspirado em *Toby*):**
  - Em `js/bookmark-renderer.js`, adicionar um botão discreto no cabeçalho `.bookmark-category-header` (`↗` com tooltip `"Abrir todos os links deste grupo"`) que abre os links da categoria em segundo plano (solicitando confirmação se houver mais de 8 links).

---

### Pilar 2 — Layout, Blur de Wallpaper & Estilo dos Cartões (`ACT-011`)
- **Controle de Desfoque do Papel de Parede (`wallpaperBlur: 0..24px` — inspirado em *Bonjourr* e *SquarePage*):**
  - Adicionar `wallpaperBlur: 0` em `js/config.js`.
  - Aplicar `backdrop-filter: blur(var(--wallpaper-blur, 0px))` em `#background-filter` (`css/style.css`), permitindo desfocar imagens movimentadas do Unsplash sem precisar escurecê-las excessivamente.
- **Três Modos de Estilo do Cartão (`cardStyle` — inspirado em *nightTab*, *Aurora* e *Homepage*):**
  - `card` *(Padrão)*: Cartão com borda, fundo translúcido e ícone + texto.
  - `frameless` *(Sem Moldura / Launchpad)*: Oculta o fundo e a borda do cartão, exibindo o ícone maior em destaque com o título centralizado abaixo (efeito flutuante limpo sobre o wallpaper).
  - `compact` *(Pílula Densa)*: Reduz altura e padding interno para caber muito mais favoritos na mesma tela sem rolagem.
- **Quick Links do Topo com Ícones Inteligentes (inspirado em *Bonjourr*):**
  - Atualizar `renderQuickLinks` em `js/modules.js` para incluir automaticamente o ícone resolvido pelo `icon-resolver.js` ao lado de cada link na `#quick-links-bar`.

---

### Pilar 3 — Cores & Novos Temas Consagrados (`ACT-012`)
- **Expansão de Presets de Temas em `css/style.css`, `js/theme-cache.js` e `settings.html`:**
  - Além de `dark`, `light`, `solar` e `minimal`, incluir 5 paletas consagradas com variáveis `--bg`, `--card`, `--text`, `--accent`, `--section-bg-color`, `--section-line-color`, `--icon-bg-color`, `--icon-border-color` e `--bookmark-font-color` perfeitamente harmonizadas:
    1. **Catppuccin Mocha** (`catppuccin`): Fundo `#1e1e2e`, Card `#313244`, Texto `#cdd6f4`, Accent `#cba6f7`.
    2. **Dracula** (`dracula`): Fundo `#282a36`, Card `#44475a`, Texto `#f8f8f2`, Accent `#bd93f9`.
    3. **Nord** (`nord`): Fundo `#2e3440`, Card `#3b4252`, Texto `#eceff4`, Accent `#88c0d0`.
    4. **Tokyo Night** (`tokyonight`): Fundo `#1a1b26`, Card `#24283b`, Texto `#c0caf5`, Accent `#7aa2f7`.
    5. **Rosé Pine** (`rosepine`): Fundo `#191724`, Card `#26233a`, Texto `#e0def4`, Accent `#ebbcba`.

---

### Pilar 4 — UX de Configurações, Auto-Save & Quick Popover (`ACT-013`)
- **Popover Rápido de Aparência na Nova Aba (`#quick-appearance-popover` — inspirado em *Bonjourr* e *Homarr*):**
  - Ao clicar no botão de Tema (`#theme-toggle-btn`) na barra de ações direita da Nova Aba, abrir um popover flutuante compacto com:
    - Seletor rápido de **Tema** (todos os 9 presets + temas customizados);
    - Alternador de **Estilo de Cartão** (`Cartão` | `Sem Moldura` | `Compacto`);
    - Slider de **Desfoque do Fundo (`Blur`)** e **Opacidade** ao vivo;
    - Alternador de **Trava de Layout (`Bloquear Arraste`)**;
    - Link direto para *"Todas as Configurações..."*.
- **Indicador Permanente de Auto-Save em `settings.html`:**
  - Exibir badge claro no topo/rodapé informando que todas as alterações são salvas automaticamente e sincronizadas nos Favoritos.

---

### Pilar 5 — Trava de Layout / Modo Navegação Segura (`ACT-014`)
- **Modo Trava de Edição (`lockLayout: false | true` — inspirado em *Homarr* e *nightTab*):**
  - Quando ativado, desabilita temporariamente o *SortableJS* (arraste de cartões e grupos) e oculta os botões de exclusão (`×`) nos cartões, permitindo clicar rápido sem risco de mover ou apagar um favorito por acidente.

