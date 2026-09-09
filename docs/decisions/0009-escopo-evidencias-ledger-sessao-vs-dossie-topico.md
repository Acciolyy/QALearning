# ADR-0009: Escopo de Evidências — Caderno de Campo da Sessão vs. Dossiê Focado por Tópico

## Status
Aprovada

## Data
2026-09-09

## Contexto
Durante os testes de ponta a ponta da Fase 3 na Trilha 01 (*Testes Manuais*), observou-se que o Bug Ledger acumulava evidências entre tópicos distintos da mesma sessão — por exemplo, a falha `#SAN-WSP-004` (descoberta no Tópico 011 de cadastro) aparecia na lista de evidências junto com `#VAL-AGE-002` (do Tópico 012 de validação de idade).

Isso gerou uma questão central de arquitetura de dados e design instrucional para as 15 trilhas da plataforma:
- Deve o aluno gerenciar um "dossiê único contínuo", sendo obrigado a filtrar manualmente (via botão `✕`) quais bugs pertencem ao caso sob submissão?
- Ou deve o sistema segregar o escopo, limpando/filtrando o dossiê ao abrir o laboratório de um tópico específico?

### Análise de Trade-offs
1. **Dossiê Único Contínuo sem Filtro:**
   - *Risco:* No motor de avaliação (`EvaluationService`), a precisão é $\text{Hits} / \text{Reported}$. Se o aluno deixa bugs legítimos de tópicos anteriores no dossiê, o backend do tópico corrente os classificará como **falsos positivos**, pois não pertencem aos comportamentos ativos (`active_codes`) daquele caso. O aluno é injustamente penalizado por ter acertado no exercício anterior.
   - *Fricção Cognitiva:* Obriga o aluno a fazer "faxina manual" repetitiva a cada novo laboratório, um esforço estéril que não agrega aprendizado real de QA.
2. **Reset Total a Cada Tópico:**
   - *Perda:* Apagar tudo ao mudar de tópico destrói a sensação de progressão e acúmulo de patrimônio pericial ao longo da sessão de estudos.

---

## Decisão

Adota-se o **Modelo de Escopo Duplo de Evidências**, separando com clareza a perspectiva da **Carreira/Sessão** da perspectiva do **Caso Pericial em Julgamento**:

### 1. Caderno Geral de Campo (Mesa de Investigação / Sidebar)
- **Escopo:** Global e cumulativo da sessão (`sessionSeed`).
- **Função:** Atua como o caderno de anotações do analista. Cada anomalia disparada via telemetria `postMessage` (`BUG_TRIGGERED`) é registrada permanentemente no ledger geral da sessão.
- **Feedback:** Alimenta o contador de evidências confirmadas e a sensação de conquista acumulada do analista (ex: "3 anomalias catalogadas nesta sessão").

### 2. Dossiê da Auditoria (Workbench / Submissão de Avaliação)
- **Escopo:** Estritamente filtrado por tópico (`topic.code`).
- **Função:** Contém exclusivamente as anomalias pertencentes ao escopo sob inspeção.
  - Cada objeto `BugEvidence` armazena explicitamente o atributo `topicCode: string`.
  - Ao abrir o laboratório (`InvestigationWorkbenchModal`), o dossiê exibe apenas `evidences.filter(e => e.topicCode === topic.code)`.
  - Eventos de telemetria despachados dentro do laboratório recebem o `topicCode` corrente do mini-site.
  - A submissão pericial (`POST /api/v1/evaluation/submit/`) envia apenas os códigos desse dossiê filtrado.

---

## Consequências

### Positivas
- **Imunidade a Falsos Positivos Cruzados:** O cálculo de precisão do `EvaluationService` avalia exclusivamente as ações pertinentes ao tópico em teste, sem contaminação de exercícios anteriores.
- **Ergonomia e Foco:** O aluno entra no laboratório pronto para investigar, sem precisar limpar registros antigos.
- **Coerência com a Prática Profissional:** No mercado de QA, tickets e suítes de teste são vinculados a histórias/módulos específicos, enquanto o inventário de bugs do projeto reside no sistema central de rastreamento.
- **Padrão Replicável:** Arquitetura homogênea para as 15 trilhas (manuais, automação, APIs, performance, segurança, etc.).

### Alternativas Descartadas
- *Exigir exclusão manual de bugs anteriores:* Descartada por introduzir atrito sem ganho didático e distorcer a fórmula de precisão.
- *Reset total do ledger na mesa principal:* Descartada por esvaziar visualmente a Mesa de Investigação após cada homologação.
