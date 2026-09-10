# ADR-0015: Blindagem de Semente contra Inspeção em DevTools no Mini-Site

- **Data**: 2026-09-10
- **Status**: Aceito
- **Contexto da Decisão**: Seção 4 (Caixa Branca e Trilhas Técnicas) e Feedback de Validação do Batch 2

### Contexto
Na implementação inicial do mini-site Vault Commerce, a lista de códigos de defeitos ativos (active_bug_codes) era exposta diretamente no escopo global do documento (window.__ACTIVE_BUG_CODES__ = [...]) para permitir que os scripts em behaviors/ verificassem se uma anomalia deveria ser disparada.

Porém, alunos das trilhas técnicas — e em particular da Trilha 06 (Caixa Branca) — utilizam as ferramentas de desenvolvedor do navegador (DevTools). Executar console.log(window.__ACTIVE_BUG_CODES__) no Console expunha a totalidade dos defeitos ativados pela semente, contornando o desafio analítico e quebrando a progressão pedagógica da plataforma.

### Decisão
1. **Extinção de Variáveis Globais de Bugs**:
   - window.__ACTIVE_BUG_CODES__, window.activeBugCodes e window.isBugActive são terminantemente banidos do objeto window e do escopo global do documento.
2. **Encapsulamento em Closure Privada (IIFE)**:
   - A inicialização do mini-site armazena os códigos em uma Set local dentro de uma Função Imediata (IIFE).
   - A comunicação com os módulos de comportamento (input_validation.js, state_machine.js, a11y_barriers.js, mobile_responsive.js) ocorre por meio de um registro efêmero de subscrição (__registerQAInit).
   - Durante o evento DOMContentLoaded, o oráculo interno distribui a função de verificação isBugActive(code) para os módulos e em seguida executa delete window.__registerQAInit, destruindo qualquer elo no escopo global.
3. **Impossibilidade de Enumeração pelo DevTools**:
   - Uma consulta no DevTools por window.__ACTIVE_BUG_CODES__ retorna rigorosamente undefined.
   - Nenhuma função ou propriedade global permite listar ou iterar sobre os defeitos ativos da semente.
4. **Verificação Automatizada**:
   - Teste automatizado (test_no_global_bug_codes_leak) valida tanto estaticamente quanto contratualmente a ausência de propriedades reveladoras no escopo global.

### Consequências
- A progressão pedagógica é preservada mesmo contra inspeção ativa em DevTools.
- A comunicação entre o mini-site e os módulos de comportamento permanece desacoplada e performática.
