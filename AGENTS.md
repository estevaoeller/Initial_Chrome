# Protocolo de trabalho do projeto

## Leitura inicial

Antes de trabalhar, leia somente:

1. `PROJECT.md`;
2. `NOW.md`;
3. `TASKS.md`.

Não leia integralmente `wiki/`, `history/`, arquivos de dados ou outras pastas.
Consulte `wiki/INDEX.md` somente quando a tarefa exigir conhecimento adicional.
Pesquise o histórico apenas para localizar precedente, decisão, erro ou execução relevante.

## Execução

- Preserve arquivos originais.
- Não invente requisitos, fontes, resultados ou metadados.
- Diferencie fatos, inferências, sugestões e itens pendentes de validação.
- Faça alterações proporcionais à tarefa atual.
- Evite criar documentação sem utilidade futura concreta.
- Salve planos técnicos, arquiteturais e roadmaps de implementação em `wiki/` (ex: `wiki/plano-*.md`), indexando-os em `wiki/INDEX.md` e vinculando-os em `TASKS.md`.

## Organização adaptativa

A estrutura deve evoluir conforme as necessidades reais do projeto.

Ao identificar conhecimento durável:

1. verifique se cabe em uma página existente;
2. crie um arquivo apenas quando houver conteúdo concreto;
3. crie uma pasta quando houver pelo menos dois arquivos relacionados, crescimento previsível ou necessidade clara de separação;
4. atualize o índice correspondente;
5. evite estruturas profundas e pastas com um único arquivo.

Não reorganize grandes volumes sem necessidade clara. Registre no histórico mudanças estruturais relevantes.

## Atualização do estado

Após trabalho relevante:

- atualize `NOW.md` com estado, bloqueios e próximos passos;
- atualize as linhas afetadas de `TASKS.md`;
- atualize `wiki/INDEX.md` se criar conhecimento durável;
- crie registro curto em `history/` apenas quando houver valor de continuidade ou auditoria.

Não registre conversas triviais nem replique conteúdo já preservado em outro lugar.

## Rastreabilidade

Quando criar um registro histórico, informe, se disponível:

- solicitante;
- agente e versão;
- provedor;
- modelo configurado ou reportado;
- identificação da tarefa;
- arquivos criados ou alterados;
- resultado, limitações e próximo passo.

Use `unknown` quando não for possível confirmar. Nunca deduza ou invente o modelo.

## Validação humana

Use, quando aplicável:

- `AI_PROPOSED`;
- `REQUIRES_REVIEW`;
- `HUMAN_VALIDATED`;
- `REJECTED`;
- `SUPERSEDED`.

Uma tarefa concluída por um agente não está automaticamente validada por uma pessoa.
