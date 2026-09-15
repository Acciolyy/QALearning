# Architecture Decision Records (ADRs)

Este repositório documenta decisões técnicas e de design relevantes adotadas no projeto **QALearning**.

## Formato Padrão

Cada ADR segue um formato conciso e objetivo:

\\\markdown
# ADR-XXXX: [Título Curto da Decisão]

- **Data**: YYYY-MM-DD
- **Status**: [Proposto | Aceito | Substituído por ADR-YYYY]

### Contexto
Qual é o problema, restrição ou necessidade técnica/design que estamos resolvendo?

### Decisão
O que foi decidido e como será implementado?

### Alternativas Descartadas e Por Quê
- **Alternativa A**: Motivo do descarte.
- **Alternativa B**: Motivo do descarte.
\\\

## Critérios de Autonomia
- **Decisões autônomas (baixo risco / reversíveis)**: Convenções de nomenclatura, estruturação interna de pastas, escolha de bibliotecas utilitárias/ícones, componentes de UI e refinamentos de QA.
- **Decisões com consulta prévia (alto risco / irreversíveis)**: Mudanças estruturais de framework central, quebra de contratos fundamentais de arquitetura ou pivotamento de stack após grande volume de código construído.
- [ADR-0016: Gravação Direta em UTF-8 e Proibição de Pipes de Shell entre Ambientes](0016-gravacao-direta-utf8-e-proibicao-pipes-shell.md)
- [ADR-0017: Modo de Usuário Único Deliberado para Desenvolvimento Local](0017-modo-usuario-unico-desenvolvimento-local.md)
