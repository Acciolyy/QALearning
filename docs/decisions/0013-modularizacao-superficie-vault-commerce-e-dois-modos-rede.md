# ADR-0013: Modularização da Superfície Vault Commerce e Arquitetura de Rede em Dois Modos

- **Data**: 2026-09-10
- **Status**: Aceito
- **Contexto da Decisão**: Seção 4 (Trilhas de QA), Seção 8 (Segurança do Sandbox) e Pausa da Fase 6

### Contexto
Com o avanço para a Fase 6 (expansão curricular), surgiram duas restrições arquiteturais críticas:
1. **Contenção de Rede vs Trilhas 03 (API) e 08 (E2E)**: O sandbox Piston foi configurado e blindado na Fase 4 com `PISTON_DISABLE_NETWORKING=true`, comprovado por bateria de testes hostis que bloqueia qualquer tentativa de conexão externa. As Trilhas 03 (scripts Python com `httpx`/`requests`) e 08 (scripts Playwright contra o DOM) pressupõem comunicação de rede com as superfícies de teste. Se liberada indiscriminadamente, a rede expõe o ambiente host a riscos de exfiltração ou ataques.
2. **Sobrecarga do Template do Mini-Site**: O template `vault_commerce_checkout.html` já ultrapassava 20KB. Acumular comportamentos de acessibilidade (WCAG), testes funcionais, caixas branca/preta, mobile e relatórios em um único arquivo tornaria o template monolítico frágil e ininteligível.

### Decisão

#### 1. Arquitetura de Rede em Dois Modos (Trilhas 03 e 08 Bloqueadas)
- As Trilhas 03 e 08 são formalmente congeladas até a implementação da infraestrutura de rede em etapa dedicada:
  - **Modo Exploratório (Hub-driven)**: Para testes manuais/exploratórios de API, a interface do Cliente REST embutido executa as chamadas HTTP a partir do backend/frontend do Hub Next.js (origem controlada), sem transitar pelo sandbox Piston. Cobre os módulos iniciais da Trilha 03 com risco zero.
  - **Modo Automação (Rede Docker Isolada)**: Para scripts de automação (Python na Trilha 03 e Playwright na Trilha 08), será criada uma rede Docker interna isolada (`bridge` privada) permitindo tráfego estritamente entre o container do runner e o container da superfície-alvo (Vault Core API ou mini-site). Qualquer rota padrão (default gateway) para a internet ou DNS público será removida. Um teste hostil automatizado comprovará que qualquer requisição para IP externo à subnet interna falha com timeout imediato.
  - **Browser Headless Dedicado (Trilha 08)**: O Chromium/Playwright rodará em um container dedicado e separado do Piston, evitando inchaço do motor de avaliação e vazamento de permissões.

#### 2. Modularização da Superfície Vault Commerce
- A lógica de injeção de comportamentos do mini-site Vault Commerce é desacoplada do HTML base:
  - `templates/mini_sites/vault_commerce_checkout.html`: Mantém a estrutura de marcação limpa e os estilos essenciais.
  - `static/mini_sites/behaviors/`:
    - `input_validation.js`: Regras de negócio, fronteiras e integridade de tipos (Trilhas 00, 01, 04).
    - `state_machine.js`: Transições de estado de pedido, cancelamento e concorrência (Trilhas 01, 04, 05).
    - `a11y_barriers.js`: Injeção determinística de violações WCAG baseadas na semente (Trilha 12).
    - `reporting_dossier.js`: Telemetria de reprodução e metadados forenses para redação de defeitos (Trilha 02).
- Cada script modular escuta eventos nativos do DOM e utiliza a interface padronizada `window.QABridge.reportBug()` para comunicação segura via postMessage com o Hub.

### Consequências
- A superfície do Vault Commerce permanece modular, auditável e extensível para 9 trilhas sem acúmulo de código espaguete.
- O sandbox Piston permanece hermeticamente isolado enquanto a arquitetura de rede em dois modos é implementada em etapa própria.
