# Initial Chrome — Página Inicial Personalizada

Extensão para Google Chrome (Manifest V3) que substitui a nova guia padrão (`Ctrl+T`) por um dashboard rápido, altamente personalizável e focado em produtividade. Organiza seus favoritos em **Espaços (Spaces)** e categorias, oferece busca instantânea **Type-to-Search**, painel **Quick Settings** ao vivo e integra um Timer Pomodoro diretamente ao **Toggl Track**.

---

## ✨ Funcionalidades Principais

### 📂 Espaços, Grupos e Navegabilidade (`Ctrl+T`)
- **Espaços Múltiplos com Atalhos (`Alt+1..9`)**: Separe contextos (ex: 🏠 Home, 💼 Trabalho, 📚 Estudos) com badges visuais de atalho na barra lateral.
- **Abrir Todos do Grupo**: Botão dedicado no cabeçalho de cada categoria para abrir todos os links do grupo de uma só vez, além de contador de itens e recolhimento individual.
- **Organização Drag & Drop + Modo Trava (`🔒 Lock Mode`)**: Reordene cartões, grupos e espaços com SortableJS e ative o cadeado na barra direita para impedir arrastes acidentais no uso diário.
- **Menu de Contexto Customizado**: Clique com o botão direito em qualquer cartão para editar, abrir em nova aba/janela anônima, mover entre grupos ou excluir.

### 🔍 Busca Fuzzy & Type-to-Search
- **Type-to-Search Instantâneo**: Basta abrir uma nova guia (`Ctrl+T`) e começar a digitar qualquer letra para abrir e filtrar os favoritos imediatamente.
- **Command Palette (`>`)**: Digite `>` na busca para executar comandos rápidos (alternar tema, ativar Modo Zen, abrir configurações, criar novo link).
- **Filtros por Espaço & Breadcrumbs**: Veja o caminho completo (`📁 Espaço › Grupo • URL`) com destaque visual dos termos buscados.

### 🎨 Personalização Visual & Quick Settings Popover
- **Quick Settings na Nova Aba (`🎨`)**: Painel flutuante com **3 micro-abas** (*Aparência*, *Grade* e *Widgets*) para ajustar tema, estilo de cartão, wallpaper, desfoque, colunas, tamanho de ícones e widgets com preview em tempo real.
- **9 Temas Nativos de Alto Contraste + Theme Builder**: Presets **Escuro**, **Claro**, **Solar**, **Minimalista**, **Catppuccin Mocha**, **Dracula**, **Nord**, **Tokyo Night** e **Rosé Pine**, além de criador de temas próprios.
- **3 Estilos de Cartão**:
  - `🃏 Cartão`: Bloco glassmorphism com borda e superfície translúcida.
  - `✨ Sem Moldura (Frameless)`: Ícones flutuantes estilo Launchpad/macOS.
  - `💊 Compacto`: Pílulas horizontais de alta densidade.
- **Ícones Inteligentes com Cache `0ms`**: Auto-detecção de mais de 140 marcas via **DashboardIcons** e **SimpleIcons**, catálogo visual interativo no modal de edição e trava automática de URL (*Lock-on-First-Resolve*).

### 🖼️ Papel de Parede & Efeitos de Superfície
- **Múltiplas Fontes**: Fotos rotativas do **Unsplash**, **Upload de Imagem do PC** (`chrome.storage.local`), **URL Direta** ou **Cor Sólida do Tema**.
- **Slider de Desfoque (`Blur 0..24px`) & Contraste**: Ajuste fino da nitidez e escurecimento do fundo para leitura perfeita.
- **Acento Dinâmico (`Dynamic Accent`)**: Extrai automaticamente a cor dominante do papel de parede (via API do Unsplash ou `<canvas>` local).

### ⏱️ Dashboard de Produtividade
- **Widgets Superiores Recolhíveis**: Lista de Tarefas (**To-Do** com gestão inteligente de cota), **Citações Motivacionais** e **Feed de Notícias RSS**.
- **Timer Pomodoro + Toggl Track**: Cronômetro de foco e pausa sincronizado em tempo real com sua conta do Toggl Track.

### 💾 Persistência Imortal & Backup
- **Tripla Camada de Persistência**:
  1. `chrome.storage.sync` (sincronização na conta Google).
  2. Auto-backup invisível na árvore nativa de Favoritos (`Outros favoritos › [InitialChrome_Config_Backup]`), sobrevivendo até à desinstalação da extensão.
  3. Arquivo [`user-defaults.json`](user-defaults.json) versionável + Exportação/Importação manual em JSON.

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|---|---|
| **Qualquer letra/número** | Abre a busca automaticamente (*Type-to-Search*) |
| **`Alt + K`** ou **`/`** | Abre / Fecha o modal de busca |
| **`>` (na busca)** | Ativa o modo de Comandos Rápidos (*Command Palette*) |
| **`Alt + 1..9`** | Alterna diretamente para o Espaço `1` a `9` |
| **`Alt + N`** | Abre o modal para criar um novo favorito |
| **`Alt + Z`** | Alterna o **Modo Zen** (oculta painéis e exibe apenas fundo + relógio) |
| **`?`** | Exibe a lista completa de atalhos de teclado |

---

## 🛠️ Instalação

1. Clone ou baixe este repositório em seu computador.
2. Abra `chrome://extensions/` no Google Chrome.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** (*Load unpacked*) e selecione a pasta deste projeto.
5. Pressione `Ctrl + T` para abrir sua nova Página Inicial Personalizada.

---

## 🚀 Scripts Úteis

- `npm install`: Instala as dependências de desenvolvimento (ESLint, Prettier, Jest).
- `npm test`: Executa os testes automatizados com Jest.
- `npm run lint`: Valida a formatação e qualidade estática do código.
- `npm run build`: Atualiza a versão e metadados de release no `manifest.json`.
- `powershell -ExecutionPolicy Bypass -File scripts/sync-github-wiki.ps1`: Sincroniza a pasta [`wiki/`](wiki/INDEX.md) com a **GitHub Wiki** oficial do repositório.
