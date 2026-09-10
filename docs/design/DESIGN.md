# QALearning Design System // Field Manual & Bureau de Inspeção
> Especificação Canônica de Identidade Visual, Composição Espacial e Vocabulário de Interface

---

## 1. Princípios e Fundamentos de Identidade

Este Design System estabelece as diretrizes visuais para a plataforma **QALearning**, um ambiente de ensino prático de Garantia da Qualidade (QA) e Engenharia de Testes de Software.

A identidade é inspirada na metáfora do **Bureau de Inspeção / Field Manual** (ADR-0005 e ADR-0012). O usuário atua como um analista/auditor forense examinando sistemas, códigos e telemetrias.

### Regras Mandatórias de Estilo (Anti-Padrões Proibidos)
1. **Zero Emojis e Zero Ícones Genéricos**: Fica terminantemente proibido o uso de emojis (📱, 💻, ⚡, 🏅, 🔒, etc.) ou conjuntos de ícones genéricos/preenchidos. Toda a iconografia segue o padrão mono-linha vetorial técnico com traço de 1.4px.
2. **Zero Sombras Difusas e Zero Glassmorphism**: Não são admitidas sombras difusas pretas, cartões flutuantes ou efeitos de vidro fosco (glassmorphism). A elevação e a hierarquia espacial são comunicadas exclusivamente por **filetes estruturais de 1px** e alternância calibrada de superfícies claras/escuras.
3. **Micro-Chanfros Técnicos**: Os cantos dos recipientes utilizam micro-raios rígidos (`2px` a `5px`). Bordas arredondadas orgânicas (12px, 16px, 24px) são proibidas.
4. **Densidade Calibrada**: Alternância deliberada entre áreas de alta densidade tabular (telemetria, logs, matrizes, código-fonte) e áreas editoriais de ritmo pausado (dossiês de caso com colunas < 80 caracteres).
5. **Gamificação Forense**: Elementos de progressão (XP, nível, cadência/streak, distintivos) devem ter aparência de **chapas gravadas, selos de auditoria, carimbos mecânicos de homologação e credenciais técnicas**. Proibido qualquer elemento lúdico infantil (confete, mascotes, medalhas de desenho animado).

---

## 2. Paleta de Cores & Tokens Semânticos

A plataforma opera com dois modos autênticos: **Noite Conífera** (Tema Escuro Primário) e **Cartão Kraft** (Tema Claro Técnico).

### Tema Escuro // Noite Conífera (`[data-mode="dark"]`)
Ambiente de imersão profunda baseado em verdes coníferos minerais e cobre oxidado incandescente.

| Token | Valor Hex | Papel Semântico |
| :--- | :--- | :--- |
| `--bg-app` | `#081511` | Fundo base geral da aplicação; mesa de trabalho conífera profunda |
| `--bg-surface` | `#10211B` | Superfície primária de módulos, pranchas de trabalho e janelas |
| `--bg-surface-raised` | `#162C24` | Superfície elevada para cartões de dossiê ativos e cabeçalhos |
| `--bg-surface-sunken` | `#050D0A` | Superfície rebaixada para editores de código, visores e oráculos |
| `--border-subtle` | `#1C382E` | Filete de 1px para divisões internas e réguas secundárias |
| `--border-strong` | `#2D5446` | Borda estrutural de pranchas, janelas e contornos de agrupamento |
| `--border-focus` | `#DB6F38` | Destaque e foco ativo em cobre oxidado |
| `--text-primary` | `#F3EFE6` | Tinta pergaminho clara para títulos principais e código de alto contraste |
| `--text-secondary` | `#A0B6AA` | Cinza-conífero balanceado para corpo de texto, explicações e oráculos |
| `--text-muted` | `#677F73` | Metadados, numeração de linhas, índices secundários e carimbos inativos |
| `--accent-command` | `#DB6F38` | Cobre oxidado vibrante para comando primário de autoridade |
| `--accent-command-hover` | `#E88350` | Variação hover do comando de ação |
| `--accent-command-contrast`| `#081511` | Texto escuro sobre o fundo cobre de alto contraste |
| `--copper-signature` | `#DB6F38` | Cobre oxidado institucional para selos, abas e marcas de homologação |
| `--copper-signature-hover` | `#E88350` | Variação hover da marca de cobre |
| `--copper-signature-contrast`| `#081511` | Contraste de assinatura |
| `--status-investigating` | `#E59837` | Âmbar de investigação ativa (Background: `#261A09`) |
| `--status-pass` | `#38A370` | Verde esmeralda de homologação/oráculo atendido (Background: `#0B2519`) |
| `--status-bug` | `#E04E48` | Carmesim técnico de anomalia/falha detectada (Background: `#290F11`) |

### Tema Claro // Cartão Kraft (`[data-mode="light"]`)
Inspirado em fichas de arquivo técnico e papel de relatório industrial.

| Token | Valor Hex | Papel Semântico |
| :--- | :--- | :--- |
| `--bg-app` | `#F2EFE9` | Fundo base kraft quente texturizado |
| `--bg-surface` | `#FAF8F4` | Papel técnico limpo para folhas e pranchas |
| `--bg-surface-raised` | `#FFFFFF` | Superfície elevada para cards de destaque |
| `--bg-surface-sunken` | `#E5E1D7` | Superfície rebaixada para tabelas, oráculos e consoles |
| `--border-subtle` | `#D5D0C3` | Filetes de 1px de separação sutil |
| `--border-strong` | `#A8A191` | Borda estrutural nítida |
| `--border-focus` | `#1B3F34` | Foco em verde conífero profundo |
| `--text-primary` | `#1C231F` | Tinta conífera quase preta para leitura rigorosa |
| `--text-secondary` | `#515B55` | Cinza mineral para descrições analíticas |
| `--text-muted` | `#79847D` | Metadados e legendas discretas |
| `--accent-command` | `#1B3F34` | Verde conífero profundo para CTA de autoridade |
| `--accent-command-hover` | `#122B23` | Hover conífero profundo |
| `--accent-command-contrast`| `#FAF8F4` | Texto claro sobre botão conífero |
| `--copper-signature` | `#A35817` | Terracota/cobre envelhecido para carimbos e selos |
| `--copper-signature-hover` | `#8C470E` | Hover de terracota |
| `--copper-signature-contrast`| `#FFFFFF` | Contraste de assinatura |
| `--status-investigating` | `#A35817` | Âmbar/cobre de investigação (Background: `#FBF2EB`) |
| `--status-pass` | `#246B46` | Verde esmeralda técnico de aprovação (Background: `#EEF7F2`) |
| `--status-bug` | `#8C292B` | Carmesim sóbrio de defeito (Background: `#FDF1F1`) |

---

## 3. Sistema Tipográfico

O sistema combina três famílias tipográficas com propósitos intencionais:

### 1. Família Display & Dossiê: `Lora` (Serif)
* **Font-Family**: `'Lora', Georgia, serif`
* **Pesos**: `500` (Medium), `600` (Semi-Bold), `700` (Bold), Itálico `400/500`
* **Aplicação**: Títulos de dossiês de caso, cabeçalhos de prancha, narrativas de investigação e citações de oráculos técnicos.
* **Intenção**: Transmite autoridade institucional, rigor forense e o peso de um manual de campo histórico.

### 2. Família de Interface & Navegação: `Space Grotesk` (Sans-Serif)
* **Font-Family**: `'Space Grotesk', sans-serif`
* **Pesos**: `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold)
* **Aplicação**: Rótulos de campos, cabeçalhos de tabela, botões, credencial do analista, menus de navegação e textos gerais de instrução.
* **Intenção**: Geometria industrial, precisão suíça e excelente legibilidade em telas técnicas.

### 3. Família de Telemetria, Dados & Código: `DM Mono` (Monospace)
* **Font-Family**: `'DM Mono', monospace`
* **Pesos**: `400` (Regular), `500` (Medium)
* **Aplicação**: Códigos de identificação (`QA-MAN-012`, `VAL-AGE-001`), métricas de complexidade (`V(G) = 5`), atalhos de teclado (`[ENTER] ↵`, `[ESPAÇO]`), números de linha, oráculos de dados, valores hexadecimais e contadores numéricos.
* **Intenção**: Ritmo mecânico de teleimpressora e alinhamento tabular perfeito de dados.

### Escala Tipográfica Padronizada
* **Micro / Tag**: 10px a 11px, caixa alta, tracking `+0.08em` a `+0.12em` (`DM Mono` / `Space Grotesk`).
* **Metadado / Caption**: 12px a 12.5px, line-height 1.4 (`Space Grotesk` / `DM Mono`).
* **Corpo Analítico**: 13.5px a 14.5px, line-height 1.5 (`Space Grotesk`).
* **Subtítulo / Comando**: 15px a 16px, line-height 1.4 (`Space Grotesk` 600 / `Lora` 500).
* **Título de Seção**: 18px a 22px, line-height 1.3 (`Lora` 600).
* **Título Imponente de Dossiê**: 24px a 28px, line-height 1.25 (`Lora` 700).

---

## 4. Convenções Estruturais e Composição de Layout

### A. Geometria e Superfícies
* **Raio de Borda (Micro-Chanfros)**:
  * `--radius-xs: 2px` (tags, atalhos, badges de linha, botões compactos)
  * `--radius-sm: 3px` (cartões de dossiê, tabelas, caixas de oráculo)
  * `--radius-md: 5px` (janelas modais e painéis estruturais)
* **Filetes Estruturais**: Todos os recipientes utilizam `1px solid var(--border-subtle)` ou `1px solid var(--border-strong)`. Nunca sombras projetadas para contornar elementos.

### B. Hierarquia de Ações em 3 Níveis
1. **Comando Primário (Nível 1)**:
   * Barra de comando robusta (altura 44px–48px), preenchimento total com `var(--accent-command)`, tipografia `Space Grotesk` com tracking técnico e atalho explícito integrado (`[ENTER] ↵`).
2. **Ações Secundárias (Nível 2)**:
   * Botões de apoio com contorno de 1px `var(--border-strong)`, fundo em superfície rebaixada `var(--bg-surface-sunken)` e texto em `var(--text-secondary)`.
3. **Gatilhos Terciários de Linha (Nível 3)**:
   * Botões de linha em tabelas ou listas (`[ Inspecionar → ]`), estilo ghost sem fundo, delimitados por colchetes em `DM Mono` e moldura sutil sob hover.

---

## 5. Iconografia Técnica Vetorial (`TechnicalIcons.tsx`)

Todos os ícones são construídos em SVG nativo, com traço de `1.4px` a `1.5px`, `fill="none"`, `stroke="currentColor"`, pontas e junções arredondadas (`strokeLinecap="round" strokeLinejoin="round"`).

### Vocabulário de Glifos Disponíveis
* `IconMatrix`: Grade de auditoria 3x3 de competências.
* `IconBadge`: Selo hexagonal com laço de condecoração.
* `IconSettings`: Engrenagem mecânica calibrada.
* `IconViewfinder`: Mira telescópica de inspeção de alvos.
* `IconTerminalPrompt`: Terminal de comando (`>_`).
* `IconAuditShield`: Escudo com régua de verificação.
* `IconFault`: Circuito de anomalia com corte transversal.
* `IconCadencePulse`: Pulso de telemetria com nó de constância.
* `IconLock` / `IconSecurityLatch`: Cadeado mecânico de trava de segurança.
* `IconArrowRight`: Flecha direcional técnica precisa.
* `IconCheck`: Tique de homologação com ângulos geométricos.
* `IconClose`: Cruz de encerramento sem espessura pesada.
* `IconDeviceMobile` / `IconDeviceTablet` / `IconDeviceDesktop`: Silhuetas ortogonais de viewport com botões home vetoriais.
* `IconOrientation`: Setas de rotação ortogonal retrato/paisagem.
* `IconKeyboard`: Teclado com réguas de teclas físicas.
* `IconCheckboxSquare`: Caixa de checagem técnica.
* `IconCrosshairTouch`: Mira de medição de área de toque (touch target).
* `IconCodeInspector`: Colchetes angulares de inspeção de código-fonte (`</>`).

---

## 6. Vocabulário Visual da Gamificação (Field Manual)

A progressão e o reconhecimento do aluno devem expressar **autoridade, verificação e mérito forense**, fugindo categoricamente de infantilização ou casualização:

1. **Credencial do Analista (Crachá de Identidade)**:
   * Formato de passe ou credencial laminada com número de matrícula (`MATRÍCULA: #QA-8419`).
   * Medidor de nível e XP inspirado em réguas de calibração micrométricas, com valores expressos em `DM Mono` (`1.420 / 2.000 XP`).
2. **Cadência de Prática (Streak de Constância)**:
   * Marcador de presença diária estilizado como cronógrafo mecânico ou registro de ponto industrial.
   * Indicador de tolerância semanal como trava mecânica (`Trava de Tolerância: Pronta / Em Uso`), sem chamas ou foguinhos lúdicos.
3. **Distintivos e Selos de Homologação**:
   * Distintivos em forma de carimbos circulares, octogonais ou selos de cera/cobre industriais.
   * Metadados gravados com data ISO e número de lote de auditoria (`✓ HOMOLOGADO [10/09/2026]`).
4. **Matriz de Competências**:
   * Ficha de radar ou grade de proficiência em 4 eixos analíticos (*Cobertura de Requisitos*, *Precisão Oracular*, *Isolamento de Causa Raiz*, *Comunicação de Defeito*).
   * Percentuais expressos com linhas de cota técnica e divisões em `1px`.
