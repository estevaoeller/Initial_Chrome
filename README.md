# Página Inicial Personalizada

Esta extensão do Chrome substitui a nova guia padrão por uma página inicial altamente personalizável, premium e focada em produtividade. Ela permite organizar seus favoritos em diferentes **Espaços (Spaces)** e categorias, gerenciar links rápidos e integrar um Timer de Foco diretamente ao **Toggl Track**.

---

## ✨ Funcionalidades

### 📂 Espaços e Favoritos (Spaces)
- **Espaços Múltiplos**: Crie contextos separados (ex: 🏠 Home, 💼 Trabalho, 📚 Estudos) com ícones personalizados.
- **Categorias e Subpastas**: Organize seus links em grupos dentro de cada espaço.
- **Sincronização Nativa**: Seus favoritos são salvos diretamente na estrutura de bookmarks do Chrome, o que significa que o Chrome Sync cuida do backup e sincronização dos seus links automaticamente.
- **Organização por Drag & Drop**: Arraste e solte cartões e até categorias inteiras para reordená-las usando a biblioteca SortableJS.

### 🔍 Sistema de Busca de Bookmarks
- **Busca Fuzzy Ultrarrápida**: Procure por nome ou URL em toda a sua base de favoritos.
- **Filtro Dinâmico por Espaço**: Filtre os resultados exibindo apenas marcadores de um Espaço específico (ex: "Trabalho").
- **Destaque Visual (Highlight)**: Termos que correspondem à pesquisa são visualmente realçados na interface.
- **Caminho de Navegação (Breadcrumbs)**: Exibe a estrutura completa do link (ex: `📁 Espaço › Grupo • URL`).
- **Preservação de Ícones**: Mostra os ícones customizados (SimpleIcons, Devicons, etc.) diretamente na listagem de resultados.
- **Navegação Eficiente por Teclado**: Use setas para mover a seleção e `Enter` para abrir.

### 🎨 Customização Avançada
- **Tema Base**: Suporte a múltiplos presets de temas: Claro, Escuro, Solar e Minimalista.
- **Controle Fino de Layout**: Alterne entre layout de lista vertical ou colunas inteligentes (Masonry).
- **Aparência dos Cartões**: Ajuste de forma dinâmica o tamanho do ícone, padding interno, gap entre texto e ícone, largura mínima do cartão, arredondamento da borda e cores (fundo, bordas, fontes).
- **Tipografia Personalizável**: Altere a família da fonte, tamanho e cor dos títulos.
- **Ícones Inteligentes**: Escolha automaticamente o Favicon oficial do site ou selecione ícones direto de galerias unificadas (**SimpleIcons**, **TechIcons**, **DashboardIcons**) ou URLs personalizadas.

### ⏱️ Produtividade e Foco
- **Timer Pomodoro**: Módulo de foco integrado para cronometrar ciclos de trabalho e pausas diretamente na aba (desabilitado por padrão nas configurações).
- **Integração com o Toggl Track**: Sincronize seu cronômetro com sua conta do Toggl. Ao iniciar o Pomodoro na aba, uma entrada de tempo correspondente (com projeto e descrição) é aberta no Toggl em tempo real.

### 🖼️ Fundo Dinâmico
- **Wallpapers Rotativos**: Suporte a papéis de parede rotativos do Unsplash (via API oficial com filtro de tema ou busca geral).
- **Filtro de Sobreposição**: Controle de cor e opacidade do filtro escuro aplicado sobre a imagem de fundo para garantir o contraste ideal do texto.

### 💾 Sistema de Backup e Sincronização Seamless
- **Persistência na Nuvem**: Suas configurações de estilos e ícones customizados são salvas no `chrome.storage.sync`. Isso garante que tudo se mantenha sincronizado na sua conta do Google e sobreviva de forma transparente a reinstalações ou atualizações da extensão.
- **Exportação/Importação JSON**: Exporte um arquivo de backup completo com todas as suas configurações em um clique.

---

## ⌨️ Atalhos de Teclado (Busca)

- **`Alt+K`**: Abre / Fecha o modal de busca.
- **`/` (Barra)**: Abre o modal de busca (quando nenhum outro campo de texto estiver em foco).
- **`↑` e `↓`**: Navega entre os resultados da busca.
- **`Enter`**: Abre o bookmark selecionado.
- **`Esc`**: Fecha o modal de busca.

---

## 🛠️ Instalação

1. Baixe ou clone este repositório em seu computador.
2. Abra `chrome://extensions/` no Chrome.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** (Load unpacked) e selecione a pasta deste projeto.
5. Abra uma nova guia para visualizar sua Página Inicial Personalizada.

---

## 🚀 Scripts de Desenvolvimento

No diretório do projeto, você pode executar:

- `npm install`: Instala as dependências de desenvolvimento (ESLint, Prettier, Jest).
- `npm test`: Executa os testes unitários da lógica dos Bookmarks usando o Jest.
- `npm run lint`: Valida o estilo de código do projeto de forma estática.
- `npm run build`: Atualiza a versão patch e gera automaticamente no `manifest.json` a descrição contendo a data, hora e versão finalizada do release.
