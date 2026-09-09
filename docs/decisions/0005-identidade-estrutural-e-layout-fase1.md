# ADR-0005: Identidade Estrutural, Densidade e Ritmo de Página para a Fase 1

- **Data**: 2026-09-09
- **Status**: Aceito
- **Contexto da Decisão**: Seções 2, 3 e 10 do Prompt Mestre

### Contexto
Na Fase 0, as três explorações visuais de Design System (Opções A, B e C) compartilharam o mesmo layout base para permitir comparação direta e isolada de variáveis cromáticas (paletas clara e escura), tipografia e comportamento de microinterações.
Conforme apontado na revisão do autor, identidade visual genuína não é apenas uma troca de cores e fontes ("skinning"): exige **identidade estrutural**, ou seja, hierarquia de informação distinta, densidade calibrada para o perfil do usuário de QA e um ritmo espacial próprio (espaçamento, assimetria intencional, ritmo de leitura analítica).

### Decisão
Estabelecer como requisito mandatório para a **Fase 1 (Shell de Navegação Hub → Trilha → Módulo → Tópico)** o desenvolvimento de layouts com diferenciação estrutural real:
1. **Metáfora Espacial de Investigação**:
   - A navegação entre Hub e Trilhas não usará uma grade genérica e uniforme de "cards idênticos de 12px com sombra suave".
   - O Hub adotará uma disposição tipo **Mesa de Investigação / Mapa de Telemetria**, onde trilhas possuem pesos visuais, densidades e agrupamentos distintos conforme o estágio e complexidade.
2. **Ritmo e Densidade Tipográfica**:
   - Variação deliberada de densidade: áreas de visualização de código/telemetria terão alta densidade informacional (monoespaçada compacta, filetes nítidos, réguas métricas); áreas de cenário didático terão ritmo editorial pausado e legível (largura de coluna limitada a <80 caracteres).
3. **Comportamento Estrutural do Modo Escuro**:
   - O modo escuro manterá pigmentos e superfícies autênticos (como o verde conífero profundo da Opção C ou ardósia petróleo da Opção A), com elevação e profundidade comunicadas por filetes de contorno e superfícies com matizes próprios, nunca por sombras pretas difusas padrão.

### Alternativas Descartadas e Por Quê
- **Manter templates de layout genéricos apenas trocando tokens CSS**: Descartada categoricamente. Fere as regras anti-"IA slop" da Seção 2 e resulta na clássica aparência de gerador automático de templates.
- **Divergir a estrutura já na Fase 0**: Descartada na etapa de exploração de tokens para garantir que o autor avaliasse a atmosfera cromática e contraste em condições idênticas de teste, concentrando a variação de wireframes na Fase 1.
