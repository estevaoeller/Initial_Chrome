# Referência: Homepage (`gethomepage`), Homarr & Glance (Dashboards Modernos)

- **Links oficiais:** [gethomepage.dev](https://gethomepage.dev/) | [homarr.dev](https://homarr.dev/) | [github.com/glanceapp/glance](https://github.com/glanceapp/glance)
- **Categoria:** Dashboards Self-Hosted e Centros de Comando Pessoais
- **Avaliado em:** 2026-10-29

---

## 1. Visão Geral e Proposta de Valor

**Homepage (`gethomepage.dev`)**, **Homarr** e **Glance** representam o estado da arte em painéis de controle e páginas iniciais para desenvolvedores e entusiastas de produtividade. Inclusive, a biblioteca **DashboardIcons** (`@walkxcode/dashboard-icons`) que integramos ao Initial Chrome nasceu nesse ecossistema (mantida pela comunidade do Homarr/Homepage).

---

## 2. Funcionalidades Principais (Features)

- **Type-to-Search Instantâneo (Zero-Shortcut Search — *Homepage*):**
  - Ao abrir o dashboard, você não precisa clicar na caixa de busca nem apertar `Ctrl+K`: basta começar a digitar qualquer letra no teclado e a barra de busca assume o foco automaticamente já filtrando os serviços; apertar `Enter` abre o primeiro resultado.
- **Modo Edição Separado do Modo Uso (*Homarr*):**
  - No Homarr, o painel fica "travado" por padrão para cliques rápidos. Um botão de cadeado/edição no canto ativa o arraste de cartões e botões de configuração, evitando bagunçar o layout sem querer.
- **Configuração Declarativa Portátil (*Homepage* & *Glance*):**
  - Todo o estado do painel pode ser versionado em um arquivo no repositório Git, garantindo que o ambiente seja 100% reprodutível em qualquer máquina.
- **Integração Nativa com DashboardIcons:**
  - Ícones vetoriais padronizados para milhares de serviços web e aplicações.

---

## 3. O que se Destaca / Pontos Fortes (O que é bom)

- **Fluxo `Ctrl + T` → Digitar → `Enter` (Type-to-Search):**
  - Para quem usa bastante o `Ctrl + T`, eliminar a etapa intermediária de apertar `/` ou `Alt+K` antes de digitar o nome de um favorito reduz o tempo de acesso a qualquer link para menos de 1 segundo.
- **Trava de Edição (*Edit Lock*):**
  - Separa claramente o momento de *usar o dashboard* (99% das vezes) do momento de *organizar o dashboard* (1% das vezes).

---

## 4. O que já Temos Implementado no Initial Chrome

| Recurso Homepage / Homarr / Glance | Status no Initial Chrome | Observação |
|---|---|---|
| Integração com DashboardIcons | **Implementado** | Auto-detecção por domínio/nome + catálogo visual + cache de travamento (`Lock-on-First-Resolve`) |
| Estado portátil no repositório | **Implementado** | Arquivo `user-defaults.json` na raiz do projeto + backup oculto nos Favoritos |
| Busca rápida com navegação por setas e `Enter` | **Implementado** | Modal de busca (`/` ou `Alt+K`) e Command Palette (`>`) |
| Painel de widgets (RSS, Clima, To-Do, Citação) | **Implementado** | Grid modular recolhível no topo da página |

---

## 5. Oportunidades de Melhoria para o Initial Chrome (O que aproveitar)

1. **Type-to-Search Direto na Nova Aba:**
   - Capturar qualquer tecla alfanumérica (`a-z`, `0-9`) digitada na Nova Aba (quando nenhum input estiver focado e sem `Ctrl`/`Alt`) para abrir o modal de busca instantaneamente já com o caractere digitado.
2. **Modo Trava de Layout (Lock/Unlock Drag & Drop):**
   - Permitir travar o arraste de cartões/grupos e ocultar os botões de excluir (`×`) quando o usuário quiser apenas navegar com segurança e limpeza visual.

---

## 6. O que Não é Bom / Limitações / O que Evitar

- **Dependência de servidor Docker rodando 24/7:** Homepage, Homarr e Glance exigem um servidor local ou container Docker ativo para funcionar. O Initial Chrome entrega a mesma experiência visual e velocidade rodando 100% nativo dentro do Chrome no `Ctrl + T`, sem gastar RAM com containers em segundo plano.

