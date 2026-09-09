# ADR-0004: Banco Estruturado de Comportamentos Dinâmicos Escopados e Reprodutibilidade via Seed

- **Data**: 2026-09-09
- **Status**: Aceito
- **Contexto da Decisão**: Seções 4 e 5 do Prompt Mestre

### Contexto
Para evitar que o aprendizado se torne uma mera decoreba de respostas pré-definidas, o comportamento dos mini-sites precisa ter variação dinâmica a cada tentativa do aluno. Contudo, essa dinamicidade enfrenta dois desafios fundamentais:
1. **Risco de Vazamento de Escopo Pedagógico**: Uma aleatoriedade irrestrita poderia introduzir comportamentos de tópicos avançados em módulos introdutórios (ex: falhas de concorrência ou injeção de payload em uma atividade sobre campos obrigatórios básicos de formulário).
2. **Reprodutibilidade em QA**: Um dos pilares do ensino de testes é a reprodutibilidade. Um bug só é acionável e documentável se o autor e a equipe puderem reproduzi-lo exatamente com os mesmos passos e dados.

### Decisão
Implementar um sistema de **Comportamentos Dinâmicos Escopados por Tópico com Sementes Determinísticas (Seeds)**:
1. **Catálogo Estruturado em Arquivos de Dados**:
   - Cada tópico possui seu próprio arquivo de catálogo (ex: `curriculum/<trilha>/<modulo>/<topico>/behaviors.json` ou YAML).
   - O catálogo define apenas comportamentos estritamente pertencentes àquele escopo didático, com metadados como: ID do bug, severidade esperada, critérios de aceite violados, dicas contextuais e pesos de sorteio.
2. **Geração Baseada em Semente (`session_seed`)**:
   - No início de cada tentativa/sessão de laboratório, o backend gera ou recebe um `session_seed` (número inteiro ou hash determinístico).
   - O gerador de variantes do Django utiliza um gerador pseudo-aleatório inicializado com esse seed (`random.Random(seed)`), sorteando um subconjunto restrito de variantes ativas.
   - Qualquer sessão reiniciada com o mesmo seed apresentará exatamente os mesmos comportamentos e falhas.
3. **Didática do Bug Report**:
   - O seed fica visível e copiável na interface do laboratório, sendo campo obrigatório ou sugerido ao redigir o Bug Report para simular a rastreabilidade profissional exigida no mercado de QA.

### Alternativas Descartadas e Por Quê
- **Bugs hardcoded em blocos `if/else` espalhados no código do mini-site**: Descartada por inviabilizar manutenção, dificultar a visualização do escopo didático e tornar complexa a expansão para novas variações.
- **Aleatoriedade não determinística (sem seed)**: Descartada porque impediria o debug interno, a validação de respostas pelo sistema de correção e a capacidade pedagógica de ensinar reprodutibilidade real aos alunos.
- **Catálogo Global de Bugs compartilhado por todas as trilhas**: Descartada porque violaria o pilar da Seção 4 e 5: bugs pertencem exclusivamente ao tópico/módulo sob estudo.
