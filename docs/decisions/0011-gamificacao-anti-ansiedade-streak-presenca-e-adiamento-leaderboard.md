# ADR-0011: Gamificação Anti-Ansiedade — Sequência de Prática por Presença, Tolerância Móvel e Adiamento Consciente do Leaderboard

## Status
Aprovada

## Data
2026-09-09

## Contexto
A Seção 7 do Prompt Mestre do QALearning estabelece as diretrizes de gamificação da plataforma:
- Progressão de carreira por XP e níveis com identidade de campo (*Bureau de Inspeção / Field Manual*).
- Distintivos e selos vinculados a comportamentos reais de controle de qualidade.
- Sequência de prática (*streak*) sem notificações passivo-agressivas ou pressão psicológica.
- Leaderboard opcional e desligável, focado em progresso pessoal e sem ansiedade competitiva.

O **Adendo à Seção 7** detalhou formalmente as regras de funcionamento do streak, sua métrica orientadora, a tolerância a dias perdidos, o duplo escopo e a decisão estratégica sobre rankings.

---

## Decisões

### 1. Princípio Orientador: Streak Mede Presença, Não Desempenho
- **Separação de Papéis:** Pontuação (*score*) e experiência (*XP*) já quantificam o desempenho técnico e a acurácia do analista. O streak mede exclusivamente a **constância de hábito e presença deliberada**.
- **Valorização do Erro Construtivo:** Qualquer submissão formal no dia — seja ela aprovada com 100% ou reprovada com 0% — conta como prática legítima para o streak. Um analista travado em um tópico complexo que tenta, formula hipóteses e falha está praticando QA de verdade.
- **Prevenção do Efeito "Logou e Ganhou":** Apenas abrir a aplicação, navegar pela Mesa de Investigação ou carregar um laboratório **não** conta como prática. É indispensável ter submetido uma auditoria manual (`/api/v1/evaluation/submit/`) ou um código no sandbox (`/api/v1/sandbox/verify/`).
- **Playground Livre Não Pontua:** Execuções exploratórias no playground (`/api/v1/sandbox/run/`) não contam como submissão de streak.

### 2. Tolerância Móvel de 1 Dia por Semana Corrida (Janela de 7 Dias)
- O analista dispõe de **1 dia de tolerância a cada janela deslizante de 7 dias corridos** (`[t-6, t]`).
- Pular um único dia dentro dessa janela mantém a sequência ativa; pular um segundo dia dentro do mesmo intervalo móvel quebra a sequência.
- **Recomposição Orgânica:** A tolerância se recompõe naturalmente à medida que o dia pulado fica para trás da janela móvel de 7 dias. Não constitui "vidas", "escudos acumuláveis" nem mercadoria comprável.
- **Exibição Neutra:** A interface sinaliza de forma discreta quando a tolerância da janela já foi utilizada (`[Tolerância semanal utilizada]` vs `[Tolerância semanal disponível]`), sem cores estridentes, sirenes ou badges de emergência.

### 3. Fuso Horário Determinado pela Configuração Local (`America/Sao_Paulo`)
- A fronteira do que constitui "hoje" é determinada estritamente pelo fuso horário local configurado no backend Django (`TIME_ZONE = 'America/Sao_Paulo'`).
- O registro de `PracticeActivity.date` converte o timestamp UTC para o horário local de São Paulo no momento do salvamento. Uma submissão efetuada às 23:45 em São Paulo (equivalente a 02:45 UTC do dia seguinte) é atribuída ao dia civil corrente do aluno, prevenindo discrepâncias e frustrações de contagem.

### 4. Escopo Duplo: Sequência Global e Sequência por Trilha
- **Sequência Global:** Derivada de qualquer submissão formal efetuada em qualquer trilha da plataforma. Mede o hábito geral de estudo.
- **Sequência por Trilha:** Considera unicamente as submissões realizadas dentro da trilha ativa sob investigação. Mede profundidade e foco.
- Ambos os escopos aplicam a mesma regra de tolerância de 1 dia em 7 de forma totalmente independente.

### 5. Adiamento Deliberado do Leaderboard (Decisão Consciente)
- **Não Construção na Fase 5:** Nenhuma interface de leaderboard ou endpoint de comparação competitiva entre estudantes foi construída nesta fase.
- **Justificativa Pedagógica:** Um ranking baseado em streak recompensa primordialmente a disponibilidade de tempo livre e a ausência de imprevistos na rotina pessoal, e não o mérito técnico. Transformar um dia de descanso em perda de colocação pública colide frontalmente com o princípio anti-ansiedade do projeto.
- **Diretriz para o Futuro:** Os dados de submissão foram modelados com usuário, tópico e data, permitindo rankings futuros caso o autor decida ativá-los. Se um dia for implementado, o leaderboard deverá priorizar **XP** (trabalho técnico efetivamente homologado) e nunca streak, sendo sempre estritamente opcional e desligável nas configurações.

### 6. Tom da Interface e Direito ao Desligamento Total
- **Comunicação Neutra:** Nenhuma notificação, modal ou texto utiliza linguagem de culpa ("não quebre sua sequência!", "você vai perder seu progresso!"). Quebrar um streak é um evento normal: a interface exibe o valor novo e o recorde histórico sem lamentações.
- **Desativação Total:** O aluno pode desativar o mecanismo de streak a qualquer momento no painel de configurações. Ao ser desligado (`streak_enabled = False`), o widget é **completamente removido da interface** (sem deixar placeholders ou espaços vazios) e a API omite os cálculos de streak.

---

## Consequências
- **Aderência aos Princípios do QALearning:** Gamificação sóbria, elegante e focada no desenvolvimento profissional do analista, sem truques predatórios de retenção.
- **Confiabilidade Temporal:** O uso do fuso de São Paulo blinda o cálculo contra variações de servidores e transições de meia-noite.
- **Extensibilidade Futura:** A separação limpa entre `PracticeActivity`, `AnalystProfile` e `StreakCalculationService` viabiliza métricas de engajamento saudáveis para turmas e trilhas individuais.
