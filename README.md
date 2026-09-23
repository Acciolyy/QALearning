# QALearning — Bureau de Inspeção Forense e Ensino de QA

Plataforma integrada de ensino prático de Garantia da Qualidade (QA) e Engenharia de Testes de Software baseada em investigação forense de bugs reais. O sistema combina uma visão panorâmica de especialização técnica (15 trilhas temáticas, incluindo testes manuais, automação E2E, contratos de API e acessibilidade WCAG), mini-sites deliberadamente defeituosos servidos em domínios isolados, um motor sandboxed de execução de código para scripts de teste com isolamento hermético de rede (Piston) e um sistema de oráculos declarativos com gamificação e telemetria de auditoria em tempo real.

---

## Índice

1. [Pré-requisitos e Versões Testadas](#pré-requisitos-e-versões-testadas)
2. [Portas e Arquitetura de Serviços](#portas-e-arquitetura-de-serviços)
3. [Passo a Passo de Instalação (Setup do Zero)](#passo-a-passo-de-instalação-setup-do-zero)
   - [Passo 1: Motor Sandbox Piston (Docker)](#passo-1-motor-sandbox-piston-docker)
   - [Passo 2: Backend Django (API e Mini-sites)](#passo-2-backend-django-api-e-mini-sites)
   - [Passo 3: Frontend Next.js (Hub e Mesa de Investigação)](#passo-3-frontend-nextjs-hub-e-mesa-de-investigação)
4. [Semeando o Banco de Dados (Seed Inicial)](#semeando-o-banco-de-dados-seed-inicial)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Execução das Suítes de Teste](#execução-das-suítes-de-teste)
7. [Solução de Problemas Comuns (Troubleshooting)](#solução-de-problemas-comuns-troubleshooting)

---

## Pré-requisitos e Versões Testadas

Para subir e executar a aplicação sem falhas, certifique-se de que sua máquina atenda às seguintes versões mínimas testadas e homologadas:

| Ferramenta | Versão Mínima Testada | Versão Recomendada | Gestor de Versão Utilizado |
| :--- | :--- | :--- | :--- |
| **Python** | `3.12.0` | `3.12.3` | `venv` / Sistema |
| **Node.js** | `20.0.0` | `24.14.1` | `mise` (ou `nvm` / `asdf`) |
| **npm** | `10.0.0` | `11.0.0`+ | Incluso com Node |
| **Docker Engine** | `24.0.0` | `29.1.3`+ | Docker Desktop / Linux Engine |
| **WSL 2 / Linux** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS | WSL2 (se estiver no Windows) |

> [!IMPORTANT]
> **Compatibilidade cgroups v2 no Docker:** O motor sandboxed Piston requer a flag `--privileged` no container para criar cgroups internos com isolamento de memória e CPU quando o host utiliza Linux com cgroups v2.

---

## Portas e Arquitetura de Serviços

A aplicação opera através de três serviços desacoplados. Cada porta possui um papel estrito no ecossistema:

| Porta | Serviço | Descrição | O que quebra se estiver FORA do ar? |
| :---: | :--- | :--- | :--- |
| **`3000`** | **Hub & Mesa de Investigação** (Next.js) | Interface visual do aluno: catálogo das 15 trilhas, dossiês, visualizadores de código e workbench de testes. | O usuário não consegue acessar nenhuma interface gráfica no navegador (`Connection Refused`). |
| **`8000`** | **API REST & Mini-Sites Forenses** (Django) | API dos catálogos, oráculos de validação, perfil e os mini-sites deliberadamente vulneráveis (ex: Vault Commerce Checkout em iframe). | **Quebra generalizada:** o Hub e as Mesas não carregam dados de trilhas/perfil; os alvos de teste (mini-sites em iframe) ficam em branco; oráculos de submissão falham com erro de rede. |
| **`2000`** | **Motor Sandboxed Piston** (Container Docker) | Motor isolado que recebe scripts de teste em Python enviados pelo aluno, executa em sandbox estéril sem rede e afere o resultado. | A aba de **Automação** e a **Verificação de Sandbox** falham ao compilar/rodar código (`HTTP 500 / Erro de comunicação com Sandbox`). |

---

## Passo a Passo de Instalação (Setup do Zero)

Siga rigorosamente a ordem dos passos abaixo:

```
[1. Piston na porta 2000] ➔ [2. Backend Django na porta 8000] ➔ [3. Frontend Next.js na porta 3000]
```

### Passo 1: Motor Sandbox Piston (Docker)

1. Baixe e suba o container oficial do Piston com:
   - Volume nomeado `-v piston_data:/piston` (indispensável: o entrypoint da imagem executa `chown -R piston:piston /piston`, que falha sem a montagem do volume, além de persistir os runtimes instalados);
   - Isolamento de rede para processos internos (`PISTON_DISABLE_NETWORKING=true`);
   - Modo privilegiado (`--privileged`, obrigatório para cgroups v2):

```bash
docker run -d \
  --name piston \
  --privileged \
  -p 2000:2000 \
  -v piston_data:/piston \
  -e PISTON_DISABLE_NETWORKING=true \
  -e PISTON_RUN_MEMORY_LIMIT=268435456 \
  --restart always \
  ghcr.io/engineer-man/piston
```

2. **Aguarde 3 a 5 segundos** para o serviço Node interno do Piston inicializar.

3. **Obrigatório — Instalar o runtime Python no Piston:**
Por padrão, a imagem base do Piston vem sem pacotes de linguagens instalados. Para que a bancada de automação de testes execute scripts em Python (versão `3.9.4` esperada pelo cliente da sandbox), envie a requisição de instalação de pacote:

```bash
curl -s -X POST http://127.0.0.1:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language": "python", "version": "3.9.4"}'
```

4. Verifique se o runtime foi ativado com sucesso:

```bash
curl -s http://127.0.0.1:2000/api/v2/runtimes
```
*Saída esperada:* `[{"language":"python","version":"3.9.4","aliases":["py","py3","python3"]}]`

---

### Passo 2: Backend Django (API e Mini-sites)

1. No diretório raiz do projeto, crie o ambiente virtual Python e ative-o:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Instale as dependências Python do backend:

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

3. Configure o arquivo de ambiente (opcional em desenvolvimento, pois todos os valores possuem fallback local):

```bash
cp backend/.env.example backend/.env
```

4. Execute as migrações estruturais do banco de dados SQLite:

```bash
python backend/manage.py migrate
```

5. **Popule o catálogo completo de dados:**
Execute o comando de seed unificado que cria as 15 trilhas com seus respectivos estados oficiais, carrega os 55 catálogos declarativos em YAML com 106 comportamentos/oráculos e o perfil do analista:

```bash
python backend/manage.py seed_all
```

6. Inicie o servidor da API e dos mini-sites na porta `8000`:

```bash
python backend/manage.py runserver 127.0.0.1:8000
```

---

### Passo 3: Frontend Next.js (Hub e Mesa de Investigação)

1. Em outro terminal, navegue até a pasta `frontend/`:

```bash
cd frontend
```

2. Certifique-se de estar utilizando Node.js `24.14.1` (via `mise`, `nvm` ou instalação global):

```bash
node --version
# v24.14.1
```

3. Instale as dependências do projeto:

```bash
npm install
```

4. Instale os navegadores gerenciados pelo Playwright (necessários para os testes automatizados):

```bash
npx playwright install chromium
```

5. Configure as variáveis de ambiente (opcional em dev):

```bash
cp .env.example .env.local
```

6. Inicie o servidor de desenvolvimento na porta `3000`:

```bash
npm run dev
```

7. Abra o navegador em [http://localhost:3000](http://localhost:3000). Você verá a **Visão Panorâmica de Trilhas (Hub)** com as 15 trilhas catalogadas e prontas para investigação.

---

## Semeando o Banco de Dados (Seed Inicial)

O banco de dados SQLite (`backend/db.sqlite3`) pode ser reconstruído ou reiniciado a qualquer momento com garantia de estado determinístico.

### Comando Unificado: `seed_all`

O comando customizado `seed_all` orquestra as três etapas obrigatórias na sequência estrita de integridade referencial:

```bash
python backend/manage.py seed_all
```

#### O que este comando executa internamente:
1. **`seed_tracks`**: Cadastra as **15 Trilhas Forenses** (Fundamentos, Testes Manuais, Bug Reports, Testes de API, Testes de Funcionalidade, Regressão, Caixa Branca, Caixa Preta, Automação E2E, Testes Unitários, CI/CD, Performance, Acessibilidade WCAG, Segurança e Mobile Testing), definindo seus estados oficiais:
   - **Disponível**: Trilhas 00, 01, 02, 04, 05, 06, 07, 12 e 14.
   - **Congelada (ADR-0013)**: Trilhas 03 (Testes de API) e 08 (Automação E2E).
   - **Em Construção**: Trilhas 09, 10, 11 e 13.
2. **`load_catalogs`**: Varre os 55 arquivos YAML em `backend/catalogs/`, valida oráculos de aceitação e sincroniza 106 comportamentos forenses catalogados com os tópicos correspondentes.
3. **`seed_gamification`**: Registra as insígnias e badges de auditoria técnica (Precisão, Automação, Investigação, Heurística) e configura o perfil inicial do analista.

---

## Variáveis de Ambiente

Ambos os projetos funcionam "out-of-the-box" para desenvolvimento local, sem necessidade de configuração prévia de `.env`. Para cenários customizados ou produção, os seguintes arquivos `.env.example` estão disponíveis:

### Backend (`backend/.env.example`)
| Variável | Padrão Local | Descrição |
| :--- | :--- | :--- |
| `DJANGO_SECRET_KEY` | *(insecure dev key)* | Chave de assinatura criptográfica do Django. |
| `DJANGO_DEBUG` | `True` | Ativa modo depuração e detalhamento de erros. |
| `PISTON_URL` | `http://127.0.0.1:2000` | Endpoint do motor sandboxed Piston. |

### Frontend (`frontend/.env.example`)
| Variável | Padrão Local | Descrição |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | URL base consumida pelo cliente para acessar a API REST do Django. |
| `NEXT_PUBLIC_MINI_SITES_ORIGIN` | `http://127.0.0.1:8000` | Origem estritamente permitida para o protocolo seguro de mensagens `postMessage` (ADR-0008). |

---

## Execução das Suítes de Teste

O projeto possui validação cruzada entre backend Django, contratos de postMessage, integridade de encoding UTF-8, compilação de tipos TypeScript e testes end-to-end com Playwright.

### 1. Testes do Backend Django (50 testes)
> [!NOTE]
> O container Piston deve estar rodando na porta `2000` para a suíte do app `sandbox`.

```bash
python backend/manage.py test apps
```
*Saída esperada: `Ran 50 tests in ~4s ... OK`*

### 2. Testes do Frontend e Smoke Tests Playwright (11 testes)
> [!IMPORTANT]
> **Dependência do Servidor de Desenvolvimento:** Os testes de integração e smoke tests de runtime utilizam Playwright em modo headless e **exigem que o servidor Next.js esteja ativo em `http://localhost:3000` (`npm run dev`)** e a API em `http://127.0.0.1:8000`.

Em um terminal separado:
```bash
cd frontend
npm test
```
*Suíte executada:*
- Validação de contratos seguros e restrição de portas (`contracts.test.mjs`)
- Sanitização de input e integridade de encoding UTF-8 irrestrito (`encoding.test.mjs`)
- Persistência global do tema claro/escuro através de navegação client-side e F5 (`persistence.test.mjs`)
- Smoke tests de carregamento, ausência de erros de console/hidratação no Hub, Mesa, tela 404 própria e interdição técnica ADR-0013 (`smoke.test.mjs`)

### 3. Verificação Estática de Tipagem (TypeScript)
```bash
cd frontend
npx tsc --noEmit
```
*Saída esperada: código 0, sem nenhum erro de tipagem.*

### 4. Build de Produção do Frontend
```bash
cd frontend
npm run build
```

---

## Solução de Problemas Comuns (Troubleshooting)

### 1. Erro `chown: cannot access '/piston': No such file or directory`
- **Causa:** O container Piston foi iniciado sem a montagem de volume para `/piston`.
- **Solução:** Remova o container com `docker rm -f piston` e recrie-o incluindo `-v piston_data:/piston`.

### 2. Erro `Connection Refused` em `http://127.0.0.1:2000`
- **Causa:** O container Piston não foi iniciado no Docker ou a porta `2000` está ocupada.
- **Solução:** Rode `docker ps` para verificar se o container `piston` está `Up`. Se não estiver, execute `docker start piston`.

### 3. Erro `Piston language 'python' version '3.9.4' not installed`
- **Causa:** O container Piston foi criado, mas o runtime Python não foi instalado via API de pacotes.
- **Solução:** Execute o comando de instalação de pacote:
  `curl -s -X POST http://127.0.0.1:2000/api/v2/packages -H "Content-Type: application/json" -d '{"language": "python", "version": "3.9.4"}'`

### 4. `npm test` falha com `fetch failed` ou `ERR_CONNECTION_REFUSED`
- **Causa:** Os smoke tests tentaram auditar `http://localhost:3000` sem o servidor de desenvolvimento ativo.
- **Solução:** Suba o frontend em outro terminal com `cd frontend && npm run dev` antes de disparar `npm test`.

### 5. Mismatch de Hidratação ou Flash de Tema
- **Causa:** Cache local desatualizado ou manipulação de tema fora do `ThemeProvider`.
- **Solução:** O tema é inicializado de forma bloqueante no `<head>` do `layout.tsx` através da chave `qalearning-theme` do `localStorage`. Limpe o `localStorage` no DevTools (`localStorage.clear()`) para restaurar o padrão escuro (*Noite Conífera*).
