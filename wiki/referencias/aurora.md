# Referência: Aurora (Productive and cozy new tab)

- **Link oficial:** [Chrome Web Store - Aurora](https://chromewebstore.google.com/detail/aurora-productive-and-coz/lcjggfamlfhhaggffljddjjlcgidknhg)
- **Categoria:** Nova Guia / Dashboard Acolhedor de Produtividade
- **Avaliado em:** 2026-10-28

---

## 1. Visão Geral e Proposta de Valor

O **Aurora** busca equilibrar estética acolhedora ("cozy") com produtividade prática. Em vez de focar apenas em minimalismo estrito ou em listas densas, adota um layout com painel lateral fixo à esquerda para utilitários de sistema e tempo, combinando com uma área central dividida em páginas temáticas de marcadores.

---

## 2. Funcionalidades Principais (Features)

- **Barra Lateral de Navegação Interna:** Atalhos diretos para páginas nativas do Chrome (`chrome://*`).
- **Painel Lateral Esquerdo de Produtividade:**
  - Relógio digital com data.
  - Widget de clima/tempo com previsão local.
  - Widget de calendário com atalho para o Google Calendar.
- **Páginas Temáticas:** Abas ou seções para segmentar favoritos (`Home`, `Tech`, `Rest`, etc.).
- **Aparência dos Ícones:** Ícones sem moldura (frameless) com títulos descritivos posicionados abaixo.
- **Armazenamento Local:** Não exige login nem armazena marcadores em servidores proprietários na nuvem.

---

## 3. O que se Destaca / Pontos Fortes (O que é bom)

- **Acesso rápido a páginas internas do Chrome:** Acesso com um clique a Favoritos (`chrome://bookmarks/`), Histórico (`chrome://history/`), Downloads, Senhas e Extensões economiza múltiplos cliques no menu de três pontos do navegador.
- **Ícones minimalistas e limpos:** Remover fundos de cartões pesados e molduras deixa a página visualmente leve e respirável, mantendo a atenção no wallpaper e nos logos dos serviços.
- **Integração de calendário:** Link direto e fácil acesso à agenda do dia.
- **Respeito à privacidade:** Persistência local e foco no navegador do próprio usuário.

---

## 4. O que já Temos Implementado no Initial Chrome

| Recurso Aurora | Status no Initial Chrome | Observação |
|---|---|---|
| Páginas / Abas temáticas | **Implementado** | Atendido via **Espaços (Spaces)** com atalhos rápidos `Alt+1..9` |
| Relógio e Clima | **Implementado** | Presentes no Dashboard modular superior com cache inteligente de 45 min |
| Persistência local | **Implementado** | Sincronizado nativamente no `chrome.bookmarks`, com backup imortal e `user-defaults.json` local |
| Ícones automáticos | **Implementado** | Resolução inteligente via DashboardIcons, SimpleIcons e Favicons |

---

## 5. Oportunidades de Melhoria para o Initial Chrome (O que aproveitar)

1. **Dock ou barra retrátil de URLs internas do Chrome:**
   - Criar uma barra flutuante ou itens na barra superior/lateral para abrir rapidamente:
     - `chrome://bookmarks/`
     - `chrome://history/`
     - `chrome://downloads/`
     - `chrome://extensions/`
     - `chrome://password-manager/`
2. **Widget ou link para Google Calendar:**
   - Adicionar ao Dashboard um botão de acesso rápido à agenda e, futuramente, visualização de próximos eventos.
3. **Modo de exibição sem frame (Minimalist Icons):**
   - Oferecer uma opção nas configurações de aparência para remover a borda/fundo dos cartões de marcadores, exibindo apenas o ícone SVG flutuante com texto logo abaixo.

---

## 6. O que Não é Bom / Limitações / O que Evitar

- **Espaço útil reduzido pelo painel fixo:** A barra lateral permanente consome espaço horizontal considerável, o que prejudica telas menores ou janelas divididas lado a lado.
- **Pouca profundidade na busca:** Falta uma busca fuzzy avançada estilo Command Palette (`Alt+K` / `/`), que no Initial Chrome permite achar qualquer bookmark instantaneamente por digitação.
- **Sem customização profunda de dados:** Falta suporte a ordenação avançada por drag & drop livre entre categorias aninhadas.

