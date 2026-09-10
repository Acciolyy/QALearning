# ADR-0014: Mecanismo de Avaliação Estruturada e Determinística para Bug Reports (Trilha 02)

- **Data**: 2026-09-10
- **Status**: Proposto (Aguardando Aprovação Prévia)
- **Contexto da Decisão**: Seção 4 (Trilha 02: Bug Reports), Seção 6 (Motor de Avaliação Não-Binário) e ADR-0008

### Contexto
O `EvaluationService` implementado na Fase 3 compara conjuntos discretos de anomalias (`reported_behaviors` vs `active_behaviors_snapshot`). Esse modelo funciona com precisão matemática para trilhas de inspeção comportamental e caça a bugs ("encontre o defeito ativo").

Porém, a **Trilha 02 (Bug Reports)** possui um objetivo pedagógico essencialmente formativo: ensinar o analista a **documentar defeitos de forma acionável para engenharia**. Isso abrange:
- Redação de títulos objetivos e técnicos sem ruído ou adjetivação emocional.
- Isolamento dos passos mínimos necessários para reproduzir a falha.
- Discriminação formal entre Resultado Esperado (oráculo) e Resultado Obtido (comportamento anômalo).
- Calibração precisa entre Severidade (impacto sistêmico/arquitetural) e Prioridade (urgência de negócio para o release).
- Correção e triagem de relatórios incompletos ou ambíguos gerados por terceiros.

Avaliar texto livre aberto via modelos de linguagem (LLMs) estocásticos viola diretamente os princípios de **reprodutibilidade e auditabilidade determinística** do QALearning (mesma seed e submissão devem produzir o mesmo score).

### Decisão Proposta
Adotar um modelo híbrido e 100% determinístico baseado em **Rubrica Estruturada Objetiva** combinada com **Múltipla Escolha Justificada**:

#### 1. Interface de Submissão Estruturada (O Formulário de Bug Report)
Em vez de uma caixa única de texto livre amorfo, o Workbench da Trilha 02 apresenta o template formal de bug report da indústria (padrão IEEE 829 / Jira técnico):
- `title`: Título resumido da anomalia.
- `reproduction_steps`: Lista ordenada e numerada de ações atômicas do usuário.
- `expected_result`: O comportamento oracular especificado.
- `actual_result`: O desvio anômalo observado.
- `severity`: Seletor categorizado (`blocker`, `critical`, `major`, `minor`).
- `priority`: Seletor de urgência (`P1 - Imediata`, `P2 - Próxima Sprint`, `P3 - Backlog Regular`).
- `justification`: Campo textual livre onde o aluno fundamenta sua decisão (material de auto-reflexão que fica registrado no dossiê, sem gerar pontuação numérica arbitrária).

#### 2. Rubrica de Pontuação Ponderada (Score 0 a 100%)
O `BugReportEvaluationEngine` avalia a submissão por meio de regras auditáveis e determinísticas:

| Dimensão da Rubrica | Critério Objetivo de Verificação | Peso |
| :--- | :--- | :--- |
| **1. Clareza do Título (`title_clarity`)** | Contém o componente/elemento afetado e o comportamento anômalo; comprimento substantivo (20–120 caracteres); ausência de ruídos e adjetivos vagos proibidos (*"não funciona"*, *"bug horroroso"*, *"quebrou tudo"*, *"urgente"*). | 20% |
| **2. Reprodutibilidade dos Passos (`steps_quality`)** | Passos estruturados e sequenciais ($\ge 2$ passos); início com verbos de ação imperativos/infinitivos (*"acessar"*, *"digitar"*, *"clicar"*, *"preencher"*, *"submeter"*); menção aos dados ou valores de teste utilizados. | 30% |
| **3. Contraste Oracular (`expected_vs_actual`)** | Ambos os campos preenchidos com extensão substancial ($\ge 15$ caracteres); os textos de esperado e obtido são distintos entre si; o resultado obtido reflete o defeito ativo da semente. | 30% |
| **4. Calibração de Severidade (`severity_alignment`)** | Comparação direta da severidade assinalada com a severidade nominal do defeito ativo associado. Concordância exata: 100% dos pontos da dimensão; desvio de um nível (ex: critical vs major): 50%; desvio oposto grosseiro (ex: blocker classificado como minor): 0%. | 20% |

#### 3. Exercícios de Triagem e Correção (QA-REP-031)
Para o tópico de auditoria de relatórios de terceiros, o aluno recebe um bug report simulado "tóxico" (incompleto, ambíguo ou grosseiramente classificado) e deve assinalar via múltipla escolha justificada quais são os vícios daquele relatório (ex: *ausência de versão*, *passos não isolados*, *confusão entre esperado e obtido*) e reescrevê-lo dentro da rubrica estruturada.

### Consequências
- A avaliação de bug reports mantém-se **100% determinística, testável e auditável**, sem depender de APIs externas nem introduzir latência de IA.
- Ensina ao aluno a disciplina de preencher dados estruturados, reproduzindo com fidelidade a rotina real de QA em ferramentas de engenharia de software.
- Compatível integralmente com a régua de corte existente (70% no módulo direto, 85% no módulo sutil e 100% no autônomo).
