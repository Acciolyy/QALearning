# QALearning Frontend

Interface do usuário do QALearning baseada em Next.js (App Router, Turbopack) e design system Bureau de Inspeção Forense.

## Desenvolvimento Local

```bash
# Iniciar o servidor de desenvolvimento na porta 3000
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para interagir com a aplicação.

---

## Suíte de Testes e Requisitos de Execução

A suíte de testes oficial do frontend é executada via Node.js test runner nativo:

```bash
npm test
```

Os testes cobrem três camadas críticas:
1. **Contratos PostMessage (`src/lib/postmessage/contracts.test.mjs`)**:
   Validação da segurança da ponte de comunicação com mini-sites (ADR-0008 e ADR-0009).
2. **Integridade de Encoding UTF-8 (`src/lib/workbench/encoding.test.mjs`)**:
   Scanner estrito de encoding em todos os arquivos de código-fonte (ADR-0016).
3. **Smoke Test de Runtime & Hidratação (`src/lib/workbench/smoke.test.mjs`)**:
   Teste com Playwright headless que carrega a aplicação, monitora erros de console, valida o ciclo de hidratação React sob o locale `pt-BR` e assegura que o Dev Overlay do Next.js (`nextjs-portal`) está livre de issues.

### Dependência de Servidor do Smoke Test

> [!IMPORTANT]
> O teste `smoke.test.mjs` valida a hidratação e o Dev Overlay do Next.js em runtime real.
> Por esse motivo, ele **exige que o servidor de desenvolvimento esteja em execução**:
> ```bash
> npm run dev
> ```
> Se o servidor não estiver ativo em `http://localhost:3000/`, o teste falha com uma mensagem de diagnóstico clara apontando a dependência não atendida, em vez de falhas genéricas de rede.
