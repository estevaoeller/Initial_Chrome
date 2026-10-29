# Referência: Toby & Workona (Gestão Visual de Coleções, Sessões e Abas)

- **Links oficiais:** [gettoby.com](https://www.gettoby.com/) | [workona.com](https://workona.com/)
- **Categoria:** Gerenciadores de Espaços de Trabalho, Coleções e Sessões de Abas
- **Avaliado em:** 2026-10-29

---

## 1. Visão Geral e Proposta de Valor

**Toby** e **Workona** são voltados para produtividade intensa no navegador: organização de projetos em **Espaços (Workspaces)** e **Coleções (Grupos de Links)**, permitindo abrir um conjunto inteiro de ferramentas de trabalho com um único clique ou salvar rapidamente todas as abas abertas de uma pesquisa.

---

## 2. Funcionalidades Principais (Features)

- **Abrir Todos os Links de uma Coleção (`Open All Tabs`):**
  - Cada grupo/categoria possui um botão rápido no cabeçalho que abre todos os links daquela coleção de uma só vez (ideal para rotinas matinais, fechamento financeiro ou abertura de ferramentas de um projeto).
- **Salvar Sessão / Abas Abertas em um Grupo:**
  - Captura com 1 clique todas as abas abertas na janela atual do Chrome e cria uma nova coleção/grupo dentro do Espaço ativo.
- **Contadores e Indicadores Visuais nos Espaços:**
  - Mostra quantos itens ou coleções existem em cada Espaço na barra lateral, além de indicadores claros de atalho de teclado.
- **Busca Global Instantânea entre Espaços:**
  - Pesquisa unificada que encontra qualquer cartão independentemente do Espaço em que esteja guardado, exibindo o caminho (`Espaço > Grupo`).

---

## 3. O que se Destaca / Pontos Fortes (O que é bom)

- **Ação "Abrir Todos do Grupo" (1 clique):** Economiza 5 a 10 cliques diários quando um grupo representa uma rotina (ex.: "Rotina Diária", "Monitoramento", "Bancos").
- **Visibilidade de atalhos e contadores na Sidebar:** Deixar visível o número do Espaço (`1`, `2`, `3`...) educa a memória muscular do usuário para usar `Alt+1..9` sem precisar decorar a ordem.

---

## 4. O que já Temos Implementado no Initial Chrome

| Recurso Toby / Workona | Status no Initial Chrome | Observação |
|---|---|---|
| Espaços na Sidebar + Grupos em Grade | **Implementado** | Sincronizado diretamente com subpastas de `"Pagina Inicial"` |
| Busca Global com caminho `Espaço • Grupo` | **Implementado** | `SearchManager` (`js/features/search.js`) com filtro por Espaço e Command Palette (`>`) |
| Atalho `Alt+1..9` para alternar Espaços | **Implementado** | `ShortcutsManager.switchSpaceFlow` em `js/features/shortcuts.js` |
| Menu de contexto para adicionar aba atual à Inbox | **Implementado** | `background.js` adiciona página atual à pasta `📥 Inbox` de qualquer Espaço |

---

## 5. Oportunidades de Melhoria para o Initial Chrome (O que aproveitar)

1. **Botão "Abrir Todos os Links" no Cabeçalho de Cada Grupo:**
   - Adicionar uma ação discreta no header de cada categoria (`.bookmark-category-header`) para abrir todos os links do grupo em abas de segundo plano (com confirmação se houver muitos links).
2. **Badges Visuais (`1..9`) nos Espaços da Sidebar:**
   - Exibir o índice de atalho (`1`..`9`) de forma sutil ao lado do nome de cada Espaço na `#spaces-list`, tornando a navegação por teclado (`Alt+1..9`) intuitiva e visível.
3. **Comando "Capturar Abas Abertas da Janela" (Command Palette / Botão):**
   - Permitir salvar todas as abas abertas da janela atual do Chrome em um novo grupo dentro do Espaço ativo.

---

## 6. O que Não é Bom / Limitações / O que Evitar

- **Obrigatoriedade de login e conta na nuvem (Toby):** O Toby passou a exigir conta obrigatória para recursos básicos e limita a versão gratuita. Nossa arquitetura 100% local + Chrome Bookmarks + OneDrive (`user-defaults.json`) deve permanecer livre de contas externas.

