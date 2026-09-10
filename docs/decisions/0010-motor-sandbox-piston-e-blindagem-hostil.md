# ADR-0010: Motor de Execução Sandboxed com Piston, Isolamento Hermético de Rede e Blindagem contra Código Hostil

## Status
Aprovada

## Data
2026-09-09

## Contexto
Na Fase 4 do QALearning, introduzimos a execução de código arbitrário escrito pelo aluno diretamente no navegador (Monaco Editor). Ao contrário de testes estáticos, o aluno pode submeter scripts que, por imperícia ou intenção maliciosa, tentem:
1. Exaurir tempo de CPU da máquina servidora via loops infinitos.
2. Esgotar a memória RAM do host via alocações descontroladas.
3. Derrubar o sistema operacional via ataques de negação de serviço por proliferação de processos (*fork bombs*).
4. Ler credenciais, variáveis de ambiente ou arquivos do host (`/etc/shadow`, `/proc/1/environ`).
5. Alterar ou gravar arquivos fora do escopo do exercício (tentativas de escrita no sistema de arquivos raiz).
6. Abrir conexões de rede externas (C2, port scanning, spam, exfiltração de dados).

Para garantir que a plataforma opere com segurança industrial mesmo rodando localmente no WSL do desenvolvedor, a arquitetura do motor sandboxed exigiu isolamento de rede comprovado e uma suíte rigorosa de testes de código hostil.

---

## Decisões

### 1. Concessão Arquitetural: Contêiner Privilegiado (`--privileged`) e Mitigação por Binding Loopback
O contêiner Piston (`ghcr.io/engineer-man/piston`) é executado com a flag `--privileged`.
- **Justificativa Técnica (Concessão Necessária, não descuido):** No ambiente de desenvolvimento WSL2 / Docker Desktop, a gestão granular de subárvores de cgroups v2 (`/sys/fs/cgroup/isolate`) e namespaces de PID/IPC requer privilégios elevados para que o daemon do Piston possa inicializar os controladores `+cpu +memory +pids +io` sem ser barrado pelo Docker hospedeiro.
- **Mitigação Estrita Local:** Esta concessão é mitigada exclusivamente pelo fato de a porta do container estar amarrada estritamente ao loopback local (`127.0.0.1:2000`), sendo inacessível pela rede externa ou por interfaces públicas. Apenas o backend Django local possui acesso a este endpoint.
- **Revisão Mandatória para Produção:** Caso o projeto venha a ser migrado para ambiente de produção, staging multiusuário ou servidores em nuvem, o uso de `--privileged` **deve ser obrigatoriamente revisitado**. A arquitetura de produção deverá substituir essa concessão por delegação nativa de cgroups no systemd host com capabilities restritas (`CAP_SYS_ADMIN` restrito ou `no-new-privileges`), ou pela adoção de microVMs isoladas (ex: Firecracker, gVisor ou Kata Containers).

### 2. Isolamento Hermético de Rede Obrigatório (`PISTON_DISABLE_NETWORKING=true`)
A ausência de rede não é uma premissa passiva; é configurada explicitamente no contêiner:
- Flag de ambiente: `PISTON_DISABLE_NETWORKING=true`.
- No isolador de processos, as chamadas a sockets externos (`connect()`) são bloqueadas a nível de kernel com `[Errno 101] Network is unreachable`.
- **Comprovação Automatizada:** Scripts que tentam invocar `urllib.request` ou `socket.connect` falham invariavelmente sem tocar na interface externa.

### 3. Foco Pedagógico em Validação de Regras de Negócio em Python
Para a Trilha 01 e os módulos de fundamentos de lógica/automação:
- O código do aluno é executado em Python puro (`python 3.9.4`), avaliando funções de domínio, particionamento de equivalência, regras de cálculo e sanitização.
- Desacopla-se a complexidade de navegadores headless no contêiner nesta fase, reservando o Playwright em contêiner dedicado para a Trilha 08 (E2E).

### 4. Limites Rígidos de Recursos por Execução
- **CPU Time / Wall Time:** Máximo de 2.000 ms (abortado com `SIGKILL` e status `TO`).
- **Memória RAM:** Limite de 256 MB (`PISTON_RUN_MEMORY_LIMIT=268435456`).
- **Número Máximo de Processos:** Limite estrito de 64 PIDs (`max_process_count: 64`).
- **Sistema de Arquivos:** Montado como read-only nos diretórios do sistema operacional do container.

### 5. Sanitização Pedagógica de Saída do Endpoint de Verificação (`/api/v1/sandbox/verify/`)
O test harness oculto roda no mesmo processo da solução do aluno para avaliar casos de teste e fronteiras.
- Conforme a Seção 6 do prompt mestre ("a resposta exata nunca é entregue ao aluno"), o endpoint `/api/v1/sandbox/verify/` nunca devolve `stdout` ou `stderr` brutos contendo tracebacks, nomes de funções do harness, lambdas de teste ou valores esperados pelo oráculo.
- Em caso de falha de teste ou exceção no código do aluno, o harness captura os erros silenciosamente e o backend devolve estritamente: `score`, `status`, resumo pedagógico e dica contextual escalonada pelo nível de auxílio (*Direct*, *Subtle*, *Autonomous*).

---

## Resultados da Validação Experimental de Código Hostil

A suíte executada em `scratch/test_hostile_codes.py` e integrada aos testes do Django (`apps.sandbox.tests`) comprovou a contenção em 100% dos vetores de ataque:
| Vetor de Ataque | Código Testado | Resposta do Sandbox | Veredito |
|---|---|---|---|
| **Conexão de Rede Externa** | `socket.connect(('1.1.1.1', 80))` | `OSError: [Errno 101] Network is unreachable` | **Bloqueado (Rede Inacessível)** |
| **Loop Infinito** | `while True: pass` | Interrompido em 2.001ms com `Signal: SIGKILL, Status: TO` | **Bloqueado (Timeout)** |
| **Exaustão de Memória** | `bytearray(500 * 1024 * 1024)` | Processo eliminado com `Killed (RE)` ao atingir 256MB | **Bloqueado (OOM Killer)** |
| **Fork Bomb** | `for i in range(200): os.fork()` | `BlockingIOError: [Errno 11] Resource temporarily unavailable` + `SIGKILL` | **Bloqueado (Cgroups PID Limit)** |
| **Leitura de Arquivo Host** | `open('/etc/shadow')` | `PermissionError: [Errno 13] Permission denied` | **Bloqueado (Permissão)** |
| **Escrita no Host** | `open('/etc/malicious_entry', 'w')` | `OSError: [Errno 30] Read-only file system` | **Bloqueado (FS Read-Only)** |
| **Vazamento de Test Harness** | Submissão com exceção/falha | Resposta sanitizada sem tracebacks ou código interno | **Blindado (Conformidade Pedagógica)** |

---

## Consequências
- **Segurança Operacional Absoluta:** O servidor hospedeiro e o Hub web permanecem imunes a execuções adversárias submetidas por estudantes.
- **Proteção da Propriedade Intelectual e Desafio:** O aluno é guiado por dicas graduadas sem possibilidade de engenharia reversa do gabarito através de inspeção de tracebacks HTTP.
- **Determinismo na Correção:** O motor `CodeEvaluationService` opera de forma previsível e auditável em qualquer plataforma WSL2/Linux.
