---
name: project-memory
version: 3.0.0
description: Mantém memória operacional portátil e progressiva em projetos, com núcleo mínimo, wiki adaptativa e histórico sob demanda.
---

# Project Memory

Use esta skill quando o projeto adotar os arquivos `PROJECT.md`, `NOW.md`, `TASKS.md`, `_wiki/INDEX.md` e `history/`.

## Objetivo

Preservar continuidade entre pessoas e agentes sem carregar todo o histórico no contexto.

## Procedimento

### Início

1. Leia `AGENTS.md`.
2. Leia somente `PROJECT.md`, `NOW.md` e `TASKS.md`.
3. Não faça varredura integral do projeto.
4. Consulte `_wiki/INDEX.md` e o histórico apenas quando a tarefa exigir.

### Durante o trabalho

- mantenha fatos, sugestões e validações separados;
- preserve originais;
- crie documentação somente quando houver valor futuro;
- permita que a taxonomia surja conforme o projeto evolui;
- não invente agente, versão, provedor ou modelo.

### Encerramento relevante

- atualize `NOW.md`;
- atualize `TASKS.md`;
- atualize o índice se houver novo conhecimento durável;
- registre histórico somente quando útil para continuidade, auditoria, decisão ou solução de erro.

## Organização adaptativa

Crie pasta nova apenas quando houver dois ou mais arquivos relacionados, crescimento previsível ou separação necessária. Evite pastas profundas e categorias vazias.

## Validação

Conteúdo de IA pode ser marcado como `AI_PROPOSED` ou `REQUIRES_REVIEW`. Somente uma pessoa pode promovê-lo a `HUMAN_VALIDATED`.
