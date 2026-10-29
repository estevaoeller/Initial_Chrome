# Estado atual

Atualizado em: 2026-10-29
Atualizado por: Antigravity (Gemini 4 Argon (Medium))

## Em andamento

- Validação das correções estruturais nas Configurações (`ACT-015`) e do novo **Quick Settings Popover em 3 micro-abas** (`ACT-016`).

## Concluído recentemente

- **Diagnóstico de Configurações, Correções Estruturais e Quick Settings Popover (`ACT-015` e `ACT-016` / `AGT-011`):**
  - **Plano e Achados registrados na Wiki:** [`_wiki/plano-diagnostico-configs-e-quick-popover.md`](_wiki/plano-diagnostico-configs-e-quick-popover.md) indexado em [`_wiki/INDEX.md`](_wiki/INDEX.md).
  - **Correção dos 6 defeitos das Configurações (`ACT-015`):**
    1. Substituição da opção quebrada `"Pasta Local do PC"` por **Upload de Imagem do PC (`FileReader` + `chrome.storage.local`) ou URL Direta** (`wallpaperSource: 'custom'`).
    2. Preservação das cores e glassmorphism nativos dos 10 temas predefinidos (`useCustomColors: false` por padrão; só sobrescreve cores inline no `body` quando o usuário edita um color picker ou ativa a chave manual).
    3. Reatividade em tempo real para `quickLinksSize` (`applyQuickLinksSizeSetting`).
    4. Reatividade em tempo real para `pomodoroEnabled`, `pomodoroWork` e `pomodoroBreak` (`initPomodoro()` idempotente).
    5. Extração automática de cor dominante via `<canvas>` (`extractDominantColorFromUrl`) para o Acento Dinâmico em imagens locais/URL.
    6. Ampliação do slider de largura mínima do cartão (`#bookmark-min-width`) de `50..150px` para `80..260px`.
  - **Quick Settings Popover em 3 Micro-Abas na Nova Aba (`ACT-016`):**
    - `🎨 Aparência`: Temas, Estilo dos Cartões, Papel de Parede (Unsplash + botão `🔄 Trocar foto` / Upload de Imagem do PC / Cor Sólida), Blur (`0..24px`), Contraste e Modo Sólido.
    - `📐 Grade`: Lista vs. Colunas (`1..6`), Orientação do Ícone (`Ao Lado` / `Acima`), Tamanho dos Ícones (`16..64px`), Largura do Cartão (`80..260px`) e Espaço entre Grupos (`0..48px`).
    - `✨ Widgets`: Estilo do Relógio (`Analógico` / `Digital`) e switches ao vivo para `Tarefas`, `Citações`, `Feed RSS` e `Timer Pomodoro`.

## Bloqueios e pendências

- Nenhum no momento.

## Próximos passos

4. Testar na Nova Aba (`Ctrl+T`) o novo **Quick Settings Popover** com as 3 abas (`🎨 Aparência`, `📐 Grade` e `✨ Widgets`) e o upload de papel de parede personalizado.
5. Fazer commit e push para o GitHub após validação.

## Consulte quando necessário

- Índice de conhecimento: `_wiki/INDEX.md`
- Histórico: `history/`
