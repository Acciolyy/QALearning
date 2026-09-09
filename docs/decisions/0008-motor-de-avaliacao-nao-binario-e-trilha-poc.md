# ADR-0008: Motor de Avaliação Não-Binário, Tratamento de Aplicação Nominal (Zero Bugs) e Trilha PoC de Testes Manuais

## Status
Aprovada

## Data
2026-09-09

## Contexto
Na Fase 3 da implementação do QALearning, consolidamos a primeira trilha vertical completa de ponta a ponta (**Trilha 01: Testes Manuais** — `QA-MAN`), servindo como prova de conceito (PoC) arquitetural e pedagógica para as demais 14 trilhas da plataforma.

Três desafios centrais de modelagem e design instrucional exigiram formalização arquitetural:
1. **Avaliação Formativa Não-Binária vs. Binária:** Em QA profissional, um analista raramente acerta 100% ou erra 100%. Avaliações puramente binárias (pass/fail bruto) punem pequenos descuidos de documentação ou estimulam chute. É essencial recompensar tanto a **cobertura/rechamada (Recall)** — encontrar os bugs existentes — quanto a **precisão (Precision)** — não reportar comportamentos legítimos como anomalias (falsos positivos).
2. **Cenário de Aplicação Nominal (Zero Bugs Ativos):** Devido à geração determinística de bugs escopados via semente PRNG (`ScopedSeedService`), existe a probabilidade matemática de uma semente sortear zero bugs ativos. Matematicamente, o cálculo ingênuo de cobertura ($Hits / TotalBugs$) resultaria em divisão por zero (`ZeroDivisionError`). Pedagogicamente, saber identificar que um sistema está operando estritamente conforme o oráculo e **não levantar falsos alarmes** é uma das habilidades mais vitais de um QA sênior. Tratar isso como falha do motor violaria o realismo do treinamento.
3. **Ambiguidade de Limiares e Alinhamento com Níveis de Auxílio:** O prompt mestre estabelece 3 níveis pedagógicos graduais: *Direct*, *Subtle* e *Autonomous*. O critério de aprovação precisava ser explicitamente calibrado em função dessa progressão, eliminando ambiguidades.
4. **Conformidade Curricular da PoC (Seção 4 do Prompt):** O currículo padrão exige entre 2 e 4 tópicos por módulo. Uma estrutura inicial de módulo final com apenas 1 tópico violaria a especificação de PoC replicável.

---

## Decisões

### 1. Fórmula de Score Não-Binário com Ponderação Recall/Precision
A avaliação calcula métricas clássicas de inspeção ponderadas:
$$\text{Recall} = \frac{|\text{Hits}|}{|\text{ActiveBugs}|} \times 100$$
$$\text{Precision} = \frac{|\text{Hits}|}{|\text{Reported}|} \times 100$$
$$\text{Score Final} = 0.6 \times \text{Recall} + 0.4 \times \text{Precision}$$

- **Recall (60% do peso):** Garante incentivo primário para esgotar o roteiro de testes e não deixar anomalias críticas escaparem para produção.
- **Precision (40% do peso):** Pune severamente "spam de reports" e acusações sem fundamento técnico, forçando o aluno a confrontar os critérios do oráculo antes de submeter.

### 2. Tratamento Explícito do Cenário de Zero Bugs (Aplicação Nominal)
Quando uma rodada determinística ativa 0 comportamentos defeituosos:
- **Aluno submete 0 reports:**
  - $\text{Recall} = 100.0\%$, $\text{Precision} = 100.0\%$, $\text{Score} = 100.0\%$.
  - `is_approved = True`.
  - Feedback didático elogiando o discernimento de não inventar falsos positivos e atestar a conformidade nominal do sistema.
- **Aluno submete 1 ou mais reports:**
  - $\text{Recall} = 0.0\%$, $\text{Precision} = 0.0\%$, $\text{Score} = 0.0\%$.
  - `is_approved = False`.
  - Feedback formativo alertando sobre o impacto operacional de falsos alarmes na engenharia.

### 3. Escada Graduada de Limiares de Aprovação
O limiar de aprovação é estritamente atrelado ao nível de auxílio (`GuidanceLevel`) do módulo:
| Módulo | Nível de Auxílio | Limiar Mínimo (`final_score`) | Política de Feedback Didático |
|---|---|---|---|
| **Módulo 01: Fundamentos** | `direct` | $\ge 70.0\%$ | Pista direta (`hint_direct`) indicando o componente/seletor problemático omitido. |
| **Módulo 02: Integridade e Estados** | `subtle` | $\ge 85.0\%$ | Pista sutil (`hint_subtle`) sugerindo a técnica (ex: limites, concorrência, idempotência). |
| **Módulo 03: Regressão** | `autonomous` | $100.0\%$ | Nenhuma pista fornecida; exige conformidade industrial total para aprovação. |

Em qualquer caso de reprovação com múltiplas omissões, o motor fornece **exatamente uma dica calibrada por tentativa**, estimulando o raciocínio investigativo sem expor a resposta.

### 4. Estrutura Curricular Conforme (7 Tópicos em 3 Módulos)
A Trilha 01 foi estruturada com 7 tópicos, satisfazendo o intervalo de 2–4 tópicos por módulo:
- **Módulo 01 — Fundamentos da Investigação de Software (Direct, $\ge 70\%$):**
  1. `QA-MAN-011`: Roteiro Exploratório Guiado em Cadastro (`form#registration`)
  2. `QA-MAN-012`: Particionamento de Equivalência e Fronteiras (`input#user-age`)
  3. `QA-MAN-013`: Validação de Máscaras e Formatação de Documento (`input#tax-id`)
- **Módulo 02 — Integridade de Dados e Máquina de Estados (Subtle, $\ge 85\%$):**
  4. `QA-MAN-021`: Concorrência e Idempotência no Checkout (`button#btn-checkout`)
  5. `QA-MAN-022`: Máquina de Estados e Transições Proibidas (`session#gateway`)
- **Módulo 03 — Auditoria Autônoma de Regressão (Autonomous, $100\%$):**
  6. `QA-MAN-031`: Auditoria de Regressão: Cálculo e Descontos (`input#coupon-code`)
  7. `QA-MAN-032`: Auditoria de Regressão: Fluxo e Estados de Sessão (`window.history`)

---

## Consequências

### Positivas
- **Robustez Numérica:** Eliminação absoluta de `ZeroDivisionError` ou estados inconsistentes em sementes de baixa entropia de bugs.
- **Formação de QA Real:** Ensina a disciplina de saber atestar "sistema OK" sem neurose de falso alarme.
- **Clareza de Requisitos:** O aluno e o avaliador possuem regras transparentes de aprovação e métricas auditáveis.
- **Replicabilidade:** A arquitetura do app `apps.evaluation` e seus contratos TypeScript desacoplados estão prontos para consumo nas 14 trilhas subsequentes.

### Alternativas Descartadas
- *Avaliação Binária (Todos os bugs ou nada):* Descartada por frustrar o aluno no Módulo 1 e não refletir o dia a dia profissional de relatórios parciais com reteste.
- *Limiar Único Fixo de 70% para toda a plataforma:* Descartada porque o Módulo 3 pretende atestar autonomia sênior de release; aprovar uma regressão com 30% de bugs soltos em produção é inaceitável.
- *Forçar sementes a sempre terem $\ge 1$ bug:* Descartada porque privaria o sistema de um dos testes psicológicos e técnicos mais valiosos de QA (a validação de ausência de defeito).
