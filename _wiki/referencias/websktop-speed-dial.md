# Referência: Websktop Speed Dial

- **Link oficial:** [Chrome Web Store - Websktop Speed Dial](https://chromewebstore.google.com/detail/websktop-speed-dial/hmhoefiijgfmodaajchjhehjhpjhekib)
- **Plataforma base:** [websktop.com](https://websktop.com)
- **Categoria:** Speed Dial / Área de Trabalho Baseada na Web / Colaboração em Nuvem
- **Avaliado em:** 2026-10-28

---

## 1. Visão Geral e Proposta de Valor

O **Websktop Speed Dial** combina a velocidade de um discador rápido de links (*speed dial*) com um ambiente de trabalho virtual armazenado na nuvem. O seu diferencial mais relevante é permitir a criação de múltiplos "Websktops" compartilháveis, possibilitando que equipes ou grupos compartilhem coleções inteiras de favoritos curados.

---

## 2. Funcionalidades Principais (Features)

- **Múltiplos Ambientes (Websktops):** Criação de áreas de trabalho temáticas independentes com seus próprios links e temas.
- **Compartilhamento e Colaboração:** Recursos sociais e colaborativos para compartilhar coleções de links públicos ou privados com outras pessoas.
- **Interações de Desktop:** Suporte a copiar, colar e arrastar links entre posições da grade.
- **Customização de Ícones e Papéis de Parede:** Upload de imagens e escolha de cores para personalização individual dos cartões de atalho.

---

## 3. O que se Destaca / Pontos Fortes (O que é bom)

- **Compartilhamento de coleções com terceiros:** É um recurso excelente para onboarding de novas contratações em empresas, grupos de estudo ou projetos colaborativos que precisam dos mesmos 20 links de referência.
- **Transição fluida entre ambientes:** Trocar de um "Websktop" de trabalho para um pessoal com facilidade.
- **Visual Speed Dial clássico:** Blocos bem dimensionados com logotipos legíveis.

---

## 4. O que já Temos Implementado no Initial Chrome

| Recurso Websktop | Status no Initial Chrome | Observação |
|---|---|---|
| Múltiplos ambientes / Websktops | **Implementado** | Atendido com os **Espaços (Spaces)** locais, com atalhos `Alt+1..9` e sincronização nos favoritos |
| Customização de ícones | **Implementado (Superior)** | Motor automático com DashboardIcons, SimpleIcons, Google Favicons e upload de ícones customizados |
| Backup e portabilidade | **Implementado** | Exportação/Importação em formato JSON, arquivo semente `user-defaults.json` local e espelhamento em favoritos |

---

## 5. Oportunidades de Melhoria para o Initial Chrome (O que aproveitar)

1. **Compartilhamento Fácil de Espaços (Exportar Espaço Específico):**
   - Permitir exportar apenas um **Espaço** individual (ex: apenas o Espaço "Dev" ou "Design") em um arquivo JSON leve ou texto copiado para o clipboard, facilitando compartilhar um conjunto de links com um colega.
2. **Atalhos de Teclado no Speed Dial (Copiar / Colar Marcador):**
   - Implementar atalhos `Ctrl+C` e `Ctrl+V` sobre cartões selecionados para duplicar ou mover links entre categorias com extrema rapidez.

---

## 6. O que Não é Bom / Limitações / O que Evitar

- **Dependência de Servidor Externo (Cloud Dependency):** O Websktop carrega o conteúdo a partir de um servidor remoto (`websktop.com`). Se a conexão cair, a internet oscilar ou o serviço terceirizado ficar fora do ar, a nova aba fica inacessível ou lenta.
- **Risco de Privacidade:** Enviar todo o histórico e a base de marcadores do usuário para servidores proprietários fere o princípio de soberania de dados. O Initial Chrome deve manter sua filosofia estritamente local e sem telemetria.
- **Exigência de Criação de Conta:** Obriga o usuário a cadastrar email e senha para desbloquear recursos essenciais.

