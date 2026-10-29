# Plano: Diagnóstico de Configurações, Correções Estruturais e Quick Settings Popover

- **Status:** `AI_PROPOSED`
- **Data:** 2026-10-29
- **Tarefas associadas:** `ACT-015`, `ACT-016` (`AGT-011`)

---

## 1. Diagnóstico das Configurações Atuais (`settings.html` e Módulos JS)

Durante a auditoria completa de `settings.html`, `js/settings-app.js`, `js/settings-handlers.js`, `js/app.js`, `js/modules.js` e `js/pomodoro.js`, foram identificados **6 problemas funcionais/arquiteturais** e mapeado o que já opera corretamente:

### 1.1. Problemas e Inconsistências Encontrados (`ACT-015`)

| # | Componente | Arquivo(s) Afetado(s) | Problema Identificado | Solução Técnica |
|---|---|---|---|---|
| **1** | **Wallpaper Local ("Pasta Local do PC")** | `settings.html`, `js/settings-app.js`, `js/modules.js` | O botão `#select-wallpaper-folder-btn` não possui `addEventListener` e `manageWallpaper` possui apenas um comentário legado (`script.js` inexistente). Escolher `"local"` quebra o papel de parede. | Substituir a opção quebrada por **"Imagem Local (Upload) ou URL Direta"** (`wallpaperSource: 'custom'`), permitindo enviar uma imagem do computador (salva em `chrome.storage.local` como DataURL) ou colar qualquer URL de imagem (`https://...`), mantendo compatibilidade caso o valor antigo `'local'` esteja salvo. |
| **2** | **Sobrescrita das Cores Nativas dos Temas** | `js/settings-handlers.js`, `js/app.js`, `js/settings-app.js` | `applyIconAppearance` e `applySectionAppearance` injetam `--icon-bg-color`, `--icon-border-color`, `--bookmark-font-color`, `--section-bg-color` e `--section-line-color` inline no `<body>` / `:root` em todo carregamento. Isso sobrescreve o efeito glassmorphism (`color-mix`) nativo dos 10 temas predefinidos em `css/style.css`. | Introduzir a flag `useCustomColors: false` por padrão (ou só aplicar cores inline quando o tema for `custom_builder`/personalizado ou quando `useCustomColors` estiver ativo). Quando um tema predefinido estiver ativo sem override manual, limpar as propriedades inline de cor para que o CSS nativo do tema brilhe com 100% de fidelidade. |
| **3** | **Tamanho dos Links Rápidos (`quickLinksSize`) sem Reatividade** | `js/app.js` | Alterar `#quick-links-size` em `settings.html` grava no storage, mas `setupSettingsObserver` em `js/app.js` não escuta mudanças em `quickLinksSize`, exigindo `F5` na Nova Aba. | Adicionar listener em `setupSettingsObserver` para atualizar `--quick-links-size` em tempo real no `:root`. |
| **4** | **Módulo Pomodoro (`pomodoroEnabled`, `pomodoroWork`, `pomodoroBreak`) sem Reatividade** | `js/app.js`, `js/pomodoro.js` | Ativar/desativar o Pomodoro ou alterar tempos em Configurações não atualiza o botão `#toggl-toggle-btn` nem o widget na Nova Aba aberta. | Exportar e chamar `initPomodoro()` / atualizar visibilidade de `#toggl-toggle-btn` e `#pomodoro-widget` dentro de `setupSettingsObserver` quando `pomodoroEnabled`, `pomodoroWork` ou `pomodoroBreak` mudarem. |
| **5** | **Aviso de Requisito do Acento Dinâmico (`dynamicAccent`)** | `settings.html`, `js/modules.js` | `applyDynamicAccent` depende de `data.color` retornado pela API oficial do Unsplash (com Access Key). Sem chave ou com imagem customizada, o usuário não sabia por que o acento dinâmico não mudava. | Adicionar extração automática de cor média via `<canvas>` (`extractDominantColorFromUrl`) para imagens customizadas/locais e exibir dica clara na UI. |
| **6** | **Limite do Slider `bookmarkMinWidth` (`50..150px`)** | `settings.html` | O valor padrão em `js/config.js` é `150px`, que era justamente o teto máximo do slider (`max="150"`), impedindo criar cartões mais largos. | Ampliar o intervalo de `#bookmark-min-width` para `min="80" max="260" step="10"` tanto em `settings.html` quanto no novo Quick Popover. |

---

## 2. Expansão do Quick Settings Popover na Nova Aba (`ACT-016`)

Para evitar que o usuário precise abrir a janela popup de `settings.html` para ajustes cotidianos, o `#quick-appearance-popover` na Nova Aba (`newtab.html`) será expandido para um **Quick Settings Popover em 3 micro-abas** com preview 100% ao vivo:

### Aba 1: `🎨 Aparência`
- **Tema:** Grade de swatches dos 10 temas predefinidos.
- **Estilo dos Cartões:** Segmented control (`Card` | `Frameless` | `Compact`).
- **Fundo (Wallpaper):** Segmented control (`Unsplash` | `Imagem/URL` | `Cor do Tema`) + botão rápido `🔄 Trocar foto` (quando Unsplash) ou botão `📁 Escolher Imagem / URL` (quando Imagem/URL).
- **Sliders de Fundo:** `Desfoque (Blur 0..24px)` e `Filtro Escuro (0..90%)`.
- **Modo Sólido:** Toggle rápido para desligar transparência de vidro (`solidSurfaces`).

### Aba 2: `📐 Grade & Cartões`
- **Disposição dos Grupos:** Segmented control (`Lista` | `Colunas`) + seletor rápido `1..6 colunas` quando em modo Colunas.
- **Orientação do Cartão:** Segmented control (`➡️ Lado a Lado` | `⬇️ Ícone Acima`).
- **Tamanho dos Ícones:** Slider ao vivo (`16px..64px`).
- **Largura dos Cartões:** Slider ao vivo (`80px..260px`).
- **Espaço entre Grupos:** Slider ao vivo (`0px..48px`).

### Aba 3: `✨ Widgets`
- **Toggles Rápidos (Switch):**
  - `📋 Tarefas (To-Do List)` (`todoEnabled`)
  - `💬 Citações Motivacionais` (`quotesEnabled`)
  - `📰 Feed RSS` (`rssEnabled`)
  - `⏱️ Timer Pomodoro / Toggl` (`pomodoroEnabled`)
- **Estilo do Relógio:** Segmented control (`Analógico` | `Digital`).

### Rodapé Unificado do Popover
- Indicador `⚡ Salvo automaticamente` + botão discreto `⚙️ Configurações Avançadas...` (para Backup JSON, Chaves de API, Links Rápidos e Theme Builder).

---

## 3. Arquivos a Modificar

1. `js/config.js`: Ajustar defaults (`useCustomColors: false`, `customWallpaperUrl: ''`).
2. `js/settings-handlers.js`: Respeitar as cores nativas do tema em `applyIconAppearance` e `applySectionAppearance` (aplicando apenas variáveis dimensionais `--icon-border-radius` e `--section-padding` quando `useCustomColors` for `false` e o tema pertencer a `THEME_LIST` / `auto`).
3. `js/modules.js`: Suporte completo a `wallpaperSource: 'custom'` (ou `'local'` legado) lendo `customWallpaperData` (`chrome.storage.local`) ou `customWallpaperUrl` (`extensionSettings`).
4. `newtab.html`, `css/style.css` e `js/app.js`: Estrutura, estilos e lógica das 3 micro-abas do Quick Settings Popover + reatividade completa de `quickLinksSize`, `pomodoroEnabled`, `wallpaperSource`, `iconSize`, `bookmarkMinWidth`, `categoryGap`, `layoutMode`, `columnCount`, `iconLayout`, `clockStyle` e toggles de widgets.
5. `settings.html` e `js/settings-app.js`: Substituição da "Pasta Local" quebrada pelo seletor real de **Imagem do PC (Upload) ou URL Direta**, toggle opcional `useCustomColors` ("Personalizar cores manualmente"), e ampliação do slider `#bookmark-min-width` (`80..260px`).
