# ADR-0012: Redesign Composicional da Mesa de Investigação (Field Manual / Bureau de Inspeção)

- **Data**: 2026-09-09
- **Status**: Aceito
- **Contexto da Decisão**: Seção 2 (Anti-IA Slop), ADR-0005 (Identidade Estrutural) e Pausa Pré-Fase 6

### Contexto
Durante a execução das Fases 1 a 5, o sistema implementou com sucesso a fundação arquitetural de ponta a ponta (cross-origin postMessage, harness sandboxed Piston, engine de avaliação não-binária e gamificação com streak de presença). Os tokens do Design System (Lora, Space Grotesk, DM Mono, paleta conífera, cobre oxidado `#DB6F38` e papel kraft) foram aplicados corretamente.

Entretanto, uma revisão técnica externa apontou que a **composição espacial** das telas ainda preservava os vícios de layouts gerados automaticamente ("AI UI"):
1. **Forma única repetida**: todos os blocos eram retângulos idênticos de borda 1px e cantos arredondados empilhados verticalmente com a mesma distância (16px), quebrando a promessa da ADR-0005 de densidade variável e agrupamento assimétrico.
2. **Emojis como ícones**: presença de emojis (`📊`, `🏅`, `⚙️`, `🔒`, `🔍`, `⚡`, `🛡️`), violando o requisito da Seção 2 de iconografia própria/customizada.
3. **Hierarquia achatada nos botões**: a ação primária da tela ("Iniciar Investigação no Laboratório") possuía o mesmo peso visual que os botões de linha ("Investigar"), gerando repetição visual de botões de destaque laranja sem distinção funcional.
4. **Coluna lateral sem estrutura**: seis blocos isolados de largura idêntica empilhados sem agrupamento semântico de identidade, trabalho ativo e utilitários.
5. **Espaçamento uniforme**: ausência de proximidade semântica entre elementos fortemente correlacionados e respiro entre seções de naturezas distintas.

### Decisão
Executar a reformulação composicional da **Mesa de Investigação** antes de expandir para as demais 14 trilhas da Fase 6, estabelecendo as seguintes convenções definitivas:

1. **Composição Assimétrica no Dossiê do Caso (`CaseHeroDossier.tsx`)**:
   - Layout bipartido sob moldura de prancha técnica com régua de cabeçalho de auditoria (`DOSSIÊ #QA-MAN-012`).
   - Coluna esquerda prioriza o título editorial e o escopo narrativo com tipografia Lora, culminando na **Ação Primária Imponente** da tela.
   - Coluna direita apresenta a **Folha de Critérios de Aceite** em superfície rebaixada (`var(--bg-surface-sunken)`), com parágrafos técnicos (`§ 1.1`, `§ 1.2`), metadados de oráculo e microbarra segmentada de evidências confirmadas.

2. **Hierarquia Estrita de Botões & Atalho [ENTER] ↵ Funcional**:
   - **Ação Primária (Nível 1)**: Barra de comando imponente (altura 48px, contraste pleno `var(--accent-command)`, tracking técnico e atalho `[ENTER] ↵`). O atalho possui listener de teclado global real (`keydown`), devidamente protegido contra disparo quando inputs, selects, textareas ou modais estiverem com foco.
   - **Ações Secundárias (Nível 2)**: Modais de confirmação e ações de workbench com contorno e fundo sunken.
   - **Ações Terciárias / De Linha (Nível 3)**: Na tabela de tópicos (`ModuleFrentes.tsx`), os botões de linha tornam-se gatilhos ghost discretos (`[ Inspecionar → ]`) em DM Mono com moldura sutil no hover, eliminando a concorrência visual com o CTA principal.

3. **Frentes de Investigação em Folio Operacional (`ModuleFrentes.tsx`)**:
   - Substituição de cards isolados por uma pasta/folio contínuo com abas indexadas (`FRENTE 01`, `FRENTE 02`, `FRENTE 03`).
   - A frente ativa expande-se em uma prancha de inspeção com borda de cobre oxidado e tabela tabular de alta densidade (`ORD`, `ALVO`, `CRITÉRIO`, `ESTADO`, `AÇÃO`). Frentes inativas permanecem compactadas como fichas de arquivo.

4. **Coluna Lateral Estruturada em 3 Camadas Semânticas (`AnalystSidebar.tsx`)**:
   - **Camada 1 (Identidade & Hábito)**: Documento único de credencial ("Caderneta do Inspetor"), unindo crachá do analista, matrícula, barra métrica de progresso de nível e o painel de cadência diária (streak) com indicador de tolerância semanal.
   - **Camada 2 (Trabalho Ativo)**: Dossiê de Evidências em formato de folha contínua de registro (ledger sheet) com filete de alerta (`var(--status-bug)`) e Rotas Operacionais ligadas por um trilho vertical com nós de ancoragem.
   - **Camada 3 (Utilitários & Arquivo)**: Prateleira horizontal técnica de rodapé com acesso à Matriz de Competências, Dossiê de Distintivos e Ajustes do Analista.

5. **Eliminação Integral de Emojis (`TechnicalIcons.tsx`)**:
   - Criação de biblioteca de glifos técnicos vetoriais mono-linha (1.4px stroke, escala modular, sem preenchimento, estilo prancha de desenho industrial): `IconMatrix`, `IconBadge`, `IconSettings`, `IconViewfinder`, `IconTerminalPrompt`, `IconAuditShield`, `IconFault`, `IconCadencePulse`, `IconSecurityLatch`, `IconArrowRight`.
   - Limpeza total de emojis tanto na Mesa de Investigação quanto nas abas e botões do Workbench de laboratório.

6. **Proximidade Semântica e Ritmo Espacial**:
   - Elementos fortemente correlacionados (código + valor + barra) utilizam espaçamento compacto de 4px a 8px.
   - Seções de naturezas distintas utilizam respiro generoso de 24px a 36px.

### Consequências
- A Mesa de Investigação adquire identidade visual genuinamente autoral e forense ("Bureau de Inspeção"), superando o teste anti-IA-slop da Seção 2.
- O padrão estabelecido nesta tela torna-se a referência formal e estrutural para a replicação das 14 trilhas na Fase 6.
