# ADR-0003: Motor de Execução de Código Sandboxed com Piston

- **Data**: 2026-09-09
- **Status**: Aceito
- **Contexto da Decisão**: Seções 6 e 8 do Prompt Mestre

### Contexto
Módulos de teste de automação (Playwright, Selenium), testes unitários, scripts de validação em Python/JavaScript e consultas SQL exigem que o aluno escreva e execute código real dentro da plataforma. Esse código precisa:
1. Ser executado em um ambiente estritamente isolado (sandbox), prevenindo acesso não autorizado ao sistema de arquivos do servidor, redes internas ou exaustão de recursos de máquina (fork bombs, loops infinitos, memory leaks).
2. Fornecer retorno de stdout, stderr e exit code em milissegundos para validação contra suites de testes ocultos.
3. Permitir orquestração local no ambiente WSL do autor sem depender de infraestruturas pagas ou serviços externos na nuvem.

### Decisão
Adotamos o **Piston** (motor de execução de código sandboxed open-source) self-hosted via contêiner Docker:
- O Piston é executado em serviço Docker dedicado (`piston:2000`) dentro da rede interna do Docker Compose, sem exposição de porta externa e sem permissão de acesso à internet.
- Cada requisição de execução é despachada pelo backend Django (`POST http://piston:2000/api/v2/execute`), que anexa o código do aluno e o harness de teste de verificação.
- Restrições estritas configuradas por execução:
  - Timeout máximo de CPU: 3000ms.
  - Limite de memória: 128 MB a 256 MB por processo.
  - Isolamento de PID e namespaces Linux.
- O Django processa a saída, calcula o **percentual de acerto (avaliação não binária)** e entrega feedback pedagógico proporcional ao nível de dificuldade do tópico.

### Alternativas Descartadas e Por Quê
- **`subprocess.run` direto no container do Django**: Descartada por alto risco de segurança e instabilidade. Um loop infinito ou alocação excessiva de memória no código do aluno derrubaria o backend da aplicação.
- **AWS Lambda / Cloud Code Runners (Judge0 Cloud, Piston público)**: Descartada para manter o projeto 100% autossuficiente e funcional offline/localmente no WSL, sem custo recorrente e sem latência de requisições externas.
- **Execução puramente client-side via WebAssembly (Pyodide)**: Embora o Pyodide possa ser avaliado futuramente como otimização client-side secundária para Python básico, ele não suporta nativamente runners completos de automação com browsers simulados, nem dialetos de banco SQL complexos, além de exigir o download de suites de teste ocultas para o navegador do aluno, quebrando a integridade da correção pedagógica.
