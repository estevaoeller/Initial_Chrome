# Referência: Stackable (Bookmark and Tab Manager)

- **Link oficial:** [Chrome Web Store - Stackable](https://chromewebstore.google.com/detail/stackable-bookmark-and-ta/coonllecklpiahhjkmnjidiaccefopli)
- **Categoria:** Gerenciador de Abas e Marcadores / Central de Fluxos de Trabalho
- **Avaliado em:** 2026-10-28

---

## 1. Visão Geral e Proposta de Valor

O **Stackable** é voltado para usuários avançados que sofrem com excesso de abas abertas e acúmulo desordenado de links. Em vez de uma página inicial meramente decorativa, ele atua como um painel de comando operacional que une gerenciamento de abas ativas e organização de marcadores em cartões ("Stacks") e espaços de trabalho ("Spaces").

---

## 2. Funcionalidades Principais (Features)

- **Estrutura de Spaces e Stacks:** Criação de múltiplos espaços de contexto (ex: Trabalho, Pesquisa, Pessoal) contendo pilhas verticais/listas de cartões ("Stacks").
- **Coleta e Limpeza de Abas Abertas:** Capacidade de capturar todas as abas abertas de uma janela e empilhá-las em um Stack temático com um único clique.
- **Drag-and-Drop Completo:** Reordenação intuitiva de cartões, abas e links entre pilhas e espaços.
- **Visualização em Listas Densas:** Foco em produtividade de alta densidade informativa, exibindo títulos completos, URLs e estados.

---

## 3. O que se Destaca / Pontos Fortes (O que é bom)

- **Separação por Espaços de Trabalho (Spaces):** Muito eficiente para alternar entre diferentes projetos sem misturar favoritos de lazer com ferramentas corporativas.
- **Gestão contra o acúmulo de abas (Tab Hoarding):** Facilita "descarregar" a mente ao fechar 20 abas de uma pesquisa e salvá-las como um grupo reutilizável na aba inicial.
- **Estrutura de Listas e Stacks:** Para quem prefere visualização em lista vertical textual em vez de apenas grades de ícones, melhora a legibilidade de links longos ou documentações técnicas.

---

## 4. O que já Temos Implementado no Initial Chrome

| Recurso Stackable | Status no Initial Chrome | Observação |
|---|---|---|
| Espaços de trabalho (Spaces) | **Implementado** | Criação dinâmica de Espaços sincronizados com pastas raiz nos Favoritos do Chrome |
| Alternância de Espaços | **Implementado (Superior)** | Atalhos rápidos `Alt+1..9` e seleção fluida na barra superior |
| Reordenação Drag & Drop | **Implementado** | Biblioteca SortableJS integrada para reordenar marcadores e categorias livremente |
| Layout em Lista Vertical | **Implementado** | Alternador de layout (Masonry Grid vs Lista Vertical) nas configurações de exibição |

---

## 5. Oportunidades de Melhoria para o Initial Chrome (O que aproveitar)

1. **Recurso "Salvar Abas Abertas como Categoria":**
   - Permitir que o usuário, ao clicar em um botão ou atalho, salve todas as abas abertas na janela atual como uma nova categoria ou grupo de bookmarks dentro do Espaço ativo (usando a API `chrome.tabs.query`).
2. **Densidade de Exibição Compacta:**
   - Aprimorar o modo de lista vertical existente para permitir uma visualização ultra-compacta, ideal para listas grandes de documentação de desenvolvimento.

---

## 6. O que Não é Bom / Limitações / O que Evitar

- **Complexidade visual e sensação de "tarefa":** O excesso de botões, pilhas e gerenciamento de abas pode fazer a página inicial parecer uma planilha de trabalho pesada em vez de um ponto de partida agradável.
- **Desempenho com grandes volumes:** Extensões que manipulam abas e marcadores ao mesmo tempo tendem a consumir muita memória e gerar lentidão ao abrir novas guias.
- **Estética pouco personalizável:** Costuma ter menos ênfase em papéis de parede elegantes, temas imersivos e transições suaves.

