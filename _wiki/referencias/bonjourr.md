# Referência: Bonjourr & Tabliss (Minimalismo Estético, Blur e Quick Settings)

- **Links oficiais:** [Bonjourr.fr](https://bonjourr.fr/) | [Tabliss.io](https://tabliss.io/)
- **Categoria:** Startpages Minimalistas Open-Source / Estética iOS & Fotografia
- **Avaliado em:** 2026-10-29

---

## 1. Visão Geral e Proposta de Valor

**Bonjourr** e **Tabliss** são as duas principais referências open-source em estética limpa, velocidade de abertura no `Ctrl + T` e integração harmoniosa com papéis de parede fotográficos (Unsplash). O **Bonjourr** inspira-se na linguagem visual do iOS/macOS (vidro fosco, ícones arredondados, tipografia refinada), enquanto o **Tabliss** foca em modularidade e controle de contraste sobre imagens de fundo.

---

## 2. Funcionalidades Principais (Features)

- **Controle de Desfoque (*Blur*) e Escurecimento do Wallpaper:**
  - Sliders independentes para **Intensidade do Desfoque (`px`)** e **Opacidade do Filtro**, garantindo que qualquer foto de fundo nunca prejudique a leitura dos textos e ícones.
- **Quick Links Superiores com Ícones:**
  - Barra de acesso rápido para os sites mais vitais com ícones vetoriais nítidos e rótulos opcionais.
- **Painel de Configuração Lateral (Live Settings Drawer):**
  - As configurações abrem como uma gaveta/popover sobre a própria página inicial, permitindo ajustar o desfoque, o relógio ou o tema vendo a página real mudar ao fundo em tempo real.
- **Saudação e Relógio Minimalistas:**
  - Tipografia leve com transição suave e zero poluição visual.

---

## 3. O que se Destaca / Pontos Fortes (O que é bom)

- **Desfoque de Fundo (`Backdrop Blur` no Wallpaper):** Transforma qualquer fotografia movimentada do Unsplash em um fundo atmosférico elegante onde os cartões de favoritos saltam aos olhos.
- **Zero fricção para pequenos ajustes visuais:** O usuário não precisa abrir uma outra página/aba (`settings.html`) e clicar em "Salvar" apenas para deixar o fundo um pouco mais escuro ou trocar o tema.
- **Performance extrema no `Ctrl + T`:** Carregamento instantâneo com zero bloqueio de renderização.

---

## 4. O que já Temos Implementado no Initial Chrome

| Recurso Bonjourr / Tabliss | Status no Initial Chrome | Observação |
|---|---|---|
| Integração com Unsplash + Fotos Locais | **Implementado** | Suporte a temas do Unsplash, API key própria e pasta local |
| Filtro de cor e opacidade sobre o fundo | **Implementado** | Variáveis `--filter-color` e `--filter-opacity` em `#background-filter` |
| Relógio Analógico/Digital + Saudação + Clima | **Implementado** | Presentes no `#top-header` com cache local de clima |
| Quick Links no topo (`#quick-links-bar`) | **Parcial** | Hoje exibe apenas links de texto simples, sem ícones |

---

## 5. Oportunidades de Melhoria para o Initial Chrome (O que aproveitar)

1. **Slider de Desfoque do Papel de Parede (`wallpaperBlur`):**
   - Adicionar controle de `0px` a `24px` aplicado diretamente ao `#background-filter` (`backdrop-filter: blur(...)`), combinando com a opacidade já existente.
2. **Ícones Inteligentes na Barra de Quick Links (`#quick-links-bar`):**
   - Usar nosso novo `icon-resolver.js` para exibir automaticamente o ícone do DashboardIcons ao lado de cada link na barra rápida superior, transformando-a em um verdadeiro *Top Dock*.
3. **Popover Rápido de Aparência na Nova Aba:**
   - Permitir ajustar Tema, Blur do Wallpaper e Estilo dos Cartões diretamente pela barra de ações direita da Nova Aba, com visualização em tempo real.

---

## 6. O que Não é Bom / Limitações / O que Evitar

- **Organização fraca para muitos links:** Nem Bonjourr nem Tabliss lidam bem com dezenas de favoritos organizados em múltiplos contextos de trabalho (eles não têm o conceito de **Espaços + Categorias** que temos no Initial Chrome).

