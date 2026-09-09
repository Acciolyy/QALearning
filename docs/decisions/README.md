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
