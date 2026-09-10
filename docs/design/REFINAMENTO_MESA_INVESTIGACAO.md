# Dossiê de Refinamento Visual // Mesa de Investigação (Stitch Pass)
> Documento Canônico de Avaliação Arquitetural de Variantes de Layout e Expressão de Gamificação Forense

---

## 1. Contexto Operacional & Metodologia

Em cumprimento ao procedimento estabelecido para a plataforma **QALearning**, pausamos a expansão funcional das trilhas para executar uma passada deliberada de refinamento visual e espacial utilizando o **Stitch MCP** nativo, sem desvios da identidade fundacional (*Bureau de Inspeção / Field Manual*, ADR-0005 e ADR-0012).

### Fases Concluídas do Processo:
1. **Fase 1 (Extração de Especificação Canônica)**: Inspeção minuciosa de tokens semânticos (`globals.css`), regras de layout e o catálogo vetorial mono-linha (`TechnicalIcons.tsx`). Criação de `docs/design/DESIGN.md` como especificação formal de 12 KB.
2. **Fase 2 (Registro do Design System no Stitch)**:
   - Projeto registrado no Stitch: `projects/639739593309785481` (*QALearning - Bureau de Inspecao*).
   - Design System homologado: `assets/14c6bc81cd224f1497fdbdbb7a459f31` (*QALearning Field Manual*), com paleta Noite Conífera (#081511, #10211B, #162C24, #DB6F38) e tipografia tripla (*Lora*, *Space Grotesk*, *DM Mono*) travadas.
3. **Fase 3 (Captura das Referências Atuais em Produção)**:
   - Captura de 7 visões de alta resolução salvas diretamente em `docs/design/referencias/`:
     - `mesa_investigacao_dark.png` (Mesa de Trabalho - Noite Conífera)
     - `mesa_investigacao_light.png` (Mesa de Trabalho - Cartão Kraft)
     - `workbench_inspecao_visual.png` (Trilha 01)
     - `workbench_automacao_python.png` (Trilha 03)
     - `workbench_codigo_fonte_caixa_branca.png` (Trilha 06)
     - `workbench_bug_report_form.png` (Trilha 02)
     - `workbench_viewport_mobile.png` (Trilha 14)
4. **Fase 4 (Geração de Tela-Base e Variantes no Stitch)**:
   - Geração da tela-base e exploração das 3 variantes sob o design system registrado.
   - **Correção Crítica de Resolução**: Identificou-se que as URLs padrão da CDN Google Usercontent (`lh3.googleusercontent.com/aida/...`) aplicam redução para miniatura de 512px por omissão de parâmetro de escala. Todas as imagens foram re-extraídas com o qualificador `=s0` de alta fidelidade descompactada e validadas via cabeçalho IHDR binário, confirmando resoluções nativas de desktop (2560px de largura).
   - **Purificação da Variante B**: Regeneração completa da Variante B eliminando métricas fictícias, eliminando jargões espúrios e ancorando cada campo exclusivamente nos dados reais do backend Django.

---

## 2. Acervo Canônico de Referências Geradas (Resolução Real Verificada)

Todas as imagens e arquivos HTML foram gerados, verificados e salvos diretamente no repositório em `docs/design/referencias/`:

| Arquivo de Referência | Identificador / Origem | Resolução Real Verificada | Tamanho | Foco Arquitetural |
| :--- | :--- | :--- | :--- | :--- |
| `mesa_investigacao_dark.png` | Produção Local (Next.js) | **1536 × 730** | 187 KB | Referência real atual: sidebar à esquerda, hero ao centro, frentes e ledger. |
| `stitch_base_mesa.png` | Stitch Base (`cef6b0f7...`) | **2560 × 3692** | 689 KB | Projeção canônica dos tokens do *Field Manual* em tela de console pericial. |
| `variante_mesa_a.png` | Stitch Variante A (`12d543c6...`) | **2560 × 2316** | 553 KB | **Top Command & Calibration Docket**: Odômetro de XP em régua de topo, cadência horizontal e foco vertical total no inquérito. |
| `variante_mesa_b.png` | Stitch Variante B Refinada (`065dc416...`) | **2560 × 4386** | 792 KB | **Asymmetric Ledger (65/35) com Dados Reais**: Quadro de homologações autoritativo na direita, sem métricas inventadas, régua de carreira canônica e selos reais. |
| `variante_mesa_c.png` | Stitch Variante C (`be8d96e3...`) | **2560 × 2668** | 890 KB | **Bancada Modular de Peritagem**: Abas de fichário físico no Dossiê Central, micro-contadores de entalhe (notches) e matriz ortogonal. |

---

## 3. Avaliação Crítica das Variantes e Reparo da Variante B

### 3.1 Reparos Críticos Realizados na Variante B (Alinhamento Estrito ao Backend)
Em resposta à revisão de arquitetura, a Variante B foi completamente purificada contra o modelo de dados real (`AnalystProfile`, `PracticeActivity`, `Badge`, `UserBadge`):

1. **Eliminação Integral de Métricas Fictícias**:
   - **Removido**: O bloco *"Eficiência Forense Vetorial"* (que exibia Cobertura 94%, Precisão 88%, Causa Raiz 99%, Comunicação 87%). Tais métricas não possuem correspondência em nenhum modelo do sistema.
   - **Substituído**: Pelo **Histórico Recente de Submissões**, que lê as instâncias reais de `PracticeActivity` (`QA-MAN-012` Aprovado 100%, `QA-AUT-003` Aprovado 85%, `QA-REG-005` Reprovado 40%).
2. **Eliminação de Jargão Técnico Vazio e Hashes Ilegíveis**:
   - **Removido**: A menção esdrúxula a *"±0.00ms SLA INTACTO"* na cadência de prática (cadência é contada estritamente em dias corridos) e os hashes SHA-256 artificiais nos badges.
   - **Substituído**: Pela leitura fidedigna do `StreakCalculationService`: sequência de `24 DIAS CONSECUTIVOS AUDITADOS`, grade semanal de presença e status da regra de tolerância semanal do backend: `Trava de Tolerância: Pronta` (ou `Disponível`).
3. **Identificação e Carreira Canônicas**:
   - **Matrícula Corrigida**: `QA::ID-842` (obedecendo à convenção oficial `QA::ID-XXXXXX` do `AnalystProfile`).
   - **Patente Oficial e Régua de Cota**: Título `AnalystProfile.LEVEL_TIERS` mapeado com precisão: `Analista de QA Jr. II (Nível 3)`, valor `1.420 / 2.000 XP (42% no patamar)`, exibindo os marcos formais de carreira gravados na régua: `[Trainee: 0]` | `[Jr I: 500]` | `[Jr II: 1.000]` | `[Pleno I: 2.000]` | `[Pleno II: 3.500]` | `[Especialista: 5.000]`.
4. **Quadro de Selos com Badges Reais**:
   - Utilização estrita dos selos que existem no catálogo de `Badge`:
     - *Bug Report Perfeito* (`PERFECT_BUG_REPORT` | Categoria: Relatório Técnico | Raridade: Notável | +50 XP | Concedido em: 10/09/2026).
     - *Primeira Automação Homologada* (`FIRST_AUTOMATION_HOMOLOGATED` | Categoria: Engenharia de Automação | Raridade: Notável | +75 XP | Concedido em: 08/09/2026).
     - *Constância Técnica* (`SEVEN_DAY_HABIT` | Categoria: Prática Contínua | Raridade: Padrão | +50 XP | Concedido em: 01/09/2026).

---

### 3.2 Comparativo Estrutural entre Variantes

#### 🔹 Variante A // Top Command & Mechanical Calibration Docket (2560 × 2316)
- **Estrutura**: Desloca toda a telemetria do inspetor para uma doca horizontal superior densa.
- **Vantagem**: Liberação de espaço vertical para o inquérito e frentes.
- **Desvantagem**: Distintivos na horizontal parecem chips de formulário e o botão primário perde o contexto dos oráculos.

#### 🔹 Variante B Refinada // Asymmetric Ledger 65/35 & Quadro de Homologações (2560 × 4386) ⭐ **(Direção Escolhida)**
- **Estrutura**: Ledger de duas colunas com 65% para o inquérito formal e 35% para o Quadro de Homologações.
- **Vantagem**: Transforma a barra lateral em uma autêntica chapa de credenciamento e perícia. Toda a informação exibida é 100% auditável e mapeada para o banco de dados real. Ancoragem firme do comando `[ENTER] ↵` imediatamente abaixo dos oráculos (§ 1.1 a § 1.3).
- **Ajuste Fino Recomendado**: Adotar as abas de arquivo da Variante C no cabeçalho do `CaseHeroDossier` para evitar que a coluna esquerda fique excessivamente longa.

#### 🔹 Variante C // Bancada Modular de Peritagem (2560 × 2668)
- **Estrutura**: Abas de fichário físico (*Mandado de Investigação*, *Protocolos de Ensaio*, *Cofre de Evidências*) no Dossiê Central e micro-contadores mecânicos (*notches*).
- **Vantagem**: A metáfora de pastas e abas chanfradas organiza a densidade de oráculos sem poluir visualmente.

---

## 4. Matriz Comparativa Final de Decisão

| Dimensão de Design | Produção Atual | Variante A | **Variante B Refinada** | Variante C | **Recomendação Híbrida Final** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Expressão de Gamificação** | ⚠️ Formulário genérico | ⚖️ Odômetro horizontal | 💎 **Excepcional (credencial chapa, marcos reais, selos autênticos)** | 🌟 Notches e abas | **Adotar Variante B Refinada** |
| **Integridade de Dados** | Dados reais | Dados sintéticos | 💎 **100% ancorado no backend Django (sem invenções)** | Dados sintéticos | **100% campos canônicos** |
| **Composição Espacial** | 3 colunas padrão | Top dock + 2 colunas | 2 colunas ledger 65% / 35% | Grade modular com abas | **Ledger 65/35 com abas de C** |
| **Hierarquia de Comando** | Botão central | Botão no topo | Base dos oráculos contratuais | Base dos oráculos contratuais | **Base dos oráculos contratuais** |
| **Resolução dos Artefatos** | 1536 × 730 | 2560 × 2316 | **2560 × 4386 (verificado IHDR)** | 2560 × 2668 | **Alta resolução nativa** |

---

## 5. Plano de Execução Técnica para a Branch `redesign/stitch-pass`

Aprovada esta etapa de alinhamento visual e arquitetural:
1. Criar e alternar para a branch `redesign/stitch-pass`.
2. **Refatorar `AnalystSidebar.tsx`**:
   - Chapa de credencial com matrícula `QA::ID-842` e patente `Analista de QA Jr. II (Nível 3)`.
   - Régua de cota micrométrica com os marcos canônicos `LEVEL_TIERS` (Trainee 0, Jr I 500, Jr II 1000, Pleno I 2000, Pleno II 3500, Especialista 5000).
   - Relógio mecânico de cadência com sequência em dias, grade semanal de 7 dias e status da Trava de Tolerância.
   - Galeria vertical de selos de homologação laqueados exibindo nome, categoria, raridade e data de concessão, sem hashes artificiais.
   - Histórico recente de submissões auditáveis.
3. **Refatorar `CaseHeroDossier.tsx`**:
   - Organizar mandado de inquérito, oráculos contratuais e histórico em abas de arquivo físico.
4. **Preservação Invariante**:
   - `TechnicalIcons.tsx` mono-linha de 1.4px sem emojis.
   - Temas autênticos Noite Conífera e Cartão Kraft.
   - 100% de aprovação na suíte de testes (Vitest + Django).