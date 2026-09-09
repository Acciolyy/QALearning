# ADR-0006: Catálogos Declarativos de Bugs em YAML, Injeção por Seed e Telemetria postMessage

## Status
Aprovada e Implementada (Fase 2)

## Contexto
Para formar analistas de QA com discernimento técnico e rigor metodológico, a plataforma precisa apresentar cenários com defeitos realistas, reprodutíveis e pedagogicamente delimitados. 
Três desafios técnicos centrais precisavam ser resolvidos:
1. **Separação de Conteúdo e Código**: Autores de trilhas e designers de QA precisam catalogar critérios de aceite (oráculos) e desvios de comportamento sem depender de migrações manuais de banco ou código espaguete no backend.
2. **Determinismo Pedagógico e Escopo Inviolável**: Uma sessão de testes iniciada com a semente `#481029` no tópico `QA-MAN-012` precisa sortear exatamente os mesmos defeitos a cada execução, sem jamais permitir vazamento de comportamentos de outros tópicos.
3. **Telemetria Segura Entre Ambientes**: O mini-site roda em um iframe sandboxed isolado e precisa comunicar eventos de interação e disparo de anomalias para a Mesa de Investigação sem ferir as restrições de mesma origem (SOP) e sem permitir vetor de injeção XSS/CSRF.

## Decisão

### 1. Catálogos Declarativos em YAML
- Definida a estrutura hierárquica `backend/apps/bug_engine/catalogs/<trilha>/<modulo>/<topico>.yaml`.
- Cada arquivo descreve os critérios formais do oráculo (`acceptance_criteria`) e o conjunto de `candidate_behaviors` (código, severidade, trigger CSS, comportamento esperado vs observado, pistas graduais direta e sutil).
- Implementado o `CatalogLoader` e comando de gestão `python manage.py load_catalogs` com validação de esquema estrita em tempo de build/CI.

### 2. Motor Determinístico `ScopedSeedService` e Helper `BugState`
- A semente de sessão (ex: `#481029`) é convertida via hashing determinístico em semente para o gerador pseudoaleatório `random.Random(seed)`.
- A fronteira de escopo é absoluta: o candidato inicial é restrito por query a `topic=topic, is_defect=True`.
- O helper `BugState` é disponibilizado no contexto do mini-site, permitindo verificações limpas como `bug_state.is_active('VAL-AGE-001')`.

### 3. Protocolo de Telemetria `QA_LEARNING_V1`
- Script leve `qa_bridge.js` embutido nos mini-sites que consome metadados `<meta name="qa-topic-code">` e `<meta name="qa-session-seed">`.
- Disparo de mensagens estruturadas para o Hub:
  ```json
  {
    "protocol": "QA_LEARNING_V1",
    "topicCode": "QA-MAN-012",
    "sessionSeed": "481029",
    "eventType": "BUG_TRIGGERED",
    "payload": {
      "behaviorCode": "VAL-AGE-001",
      "element": "input#user-age",
      "action": "submit_form",
      "inputValue": "17",
      "timestamp": 1725920000000
    }
  }
  ```
- No Hub Next.js, contratos TypeScript tipados em `lib/postmessage/contracts.ts` e validação estrita de origem (`isAllowedOrigin`) garantem proteção e atualização instantânea do Bug Ledger.

## Alternativas Descartadas

1. **Fixtures em JSON/Python direto nas migrações:**
   - *Descartada:* Dificulta revisão por pares, polui o histórico de banco e impede auditoria declarativa rápida por revisores pedagógicos.
2. **Aleatoriedade não-semeada (bugs dinâmicos aleatórios a cada F5):**
   - *Descartada:* Invalida o aprendizado de Bug Reports (que exige passos de reprodução determinísticos e confiáveis).
3. **Inspeção direta de DOM cross-frame (`contentWindow.document`):**
   - *Descartada:* Bloqueada por políticas de segurança de navegadores modernos em iframes sandboxed e frágil a refatorações de markup.

## Consequências
- **Positivas:**
  - Garantia de 100% de isolamento entre tópicos e reprodutibilidade perfeita por semente.
  - Catálogos legíveis em YAML versionados em Git.
  - Bug Ledger da Mesa de Investigação reage em tempo real às ações do estudante no mini-site.
  - Suíte de 10 testes automatizados no backend e tipagem estrita no frontend com Next.js 16.
