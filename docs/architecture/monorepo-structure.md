# Arquitetura do Sistema e Estrutura do Monorepo

Este documento estabelece o modelo de integração, fronteiras de segurança e estrutura de diretórios do **QALearning**, conforme definido na Seção 8 do Prompt Mestre.

---

## 1. Visão Geral de Comunicação entre Componentes

```
                                  [ NAVEGADOR DO ALUNO ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
              [ HUB FRONTEND ]                              [ MINI-SITE IFRAME ]
              (Next.js / React)                             (App Django Isolada)
                       │                                           │
                       │ ◄─── postMessage (Eventos de Bug / Ações) ┘
                       │      (Contrato estrito: origin + payload tipado)
                       │
                       │ REST API (JWT / Session)
                       ▼
              [ HUB BACKEND ] ─────────────► [ BANCO DE DADOS ]
              (Django + DRF)                  (PostgreSQL 16)
              - Auth & Sessão                 - Usuários e Progresso
              - Currículo & Trilhas           - Catálogo de Comportamentos
              - Gamificação (XP/Badges)       - Histórico de Execuções
              - Bug Engine (Seed dinâmico)
                       │
                       │ REST API interna (HTTP/JSON)
                       ▼
              [ PISTON SANDBOX ]
              (Container Docker Piston)
              - Execução isolada de código
              - Timeouts estritos (máx 3s)
              - Sem acesso a rede externa
```

---

## 2. Estrutura de Diretórios do Monorepo

```
QALearning/
├── .gemini/
│   └── skills/                   # Skills aprovadas do projeto
├── docker/
│   ├── docker-compose.yml        # Orquestrador local WSL
│   ├── backend.Dockerfile        # Imagem Django (Python 3.12)
│   ├── frontend.Dockerfile       # Imagem Next.js (Node 20+)
│   └── postgres/
│       └── init.sql
├── backend/                      # Aplicação Django + DRF
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                   # Configurações globais Django
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── core/                 # Utilitários, middlewares de segurança
│   │   ├── users/                # Modelos de usuário, JWT, perfis
│   │   ├── curriculum/           # Trilhas, Módulos, Tópicos, Atividades
│   │   │   └── fixtures/         # Catálogos padrão de trilhas
│   │   ├── gamification/         # XP, Níveis, Badges de QA, Streaks
│   │   ├── bug_engine/           # Catálogo de comportamentos e sementes (seeds)
│   │   │   ├── services/         # Sorteador escopado com seed determinístico
│   │   │   └── data/             # JSON/YAML de comportamentos por tópico
│   │   ├── evaluation/           # Orquestração de submissões e testes via Piston
│   │   └── mini_sites/           # Mini-aplicações propositalmente falhas sob teste
│   │       ├── manual_vault/     # Trilha 1: App fictícia de e-commerce/gestão
│   │       ├── api_laboratory/   # Trilha 3: API REST com respostas e headers falhos
│   │       ├── form_chaos/       # Trilha 4: Mini-site com validações erráticas
│   │       ├── a11y_barriers/    # Trilha 12: Mini-site com violações de WCAG
│   │       └── ...
│   └── tests/                    # Testes automatizados do backend
├── frontend/                     # Hub Next.js 14+ (App Router)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Landing / Dashboard do Hub
│   │   │   ├── tracks/           # Mapa de Trilhas e Módulos
│   │   │   │   └── [trackSlug]/
│   │   │   └── lab/              # Workspace de Execução da Atividade
│   │   │       └── [topicSlug]/page.tsx
│   │   ├── components/           # Design System Anti-IA Slop
│   │   │   ├── ui/               # Botões, inputs, cards, tags, modais
│   │   │   ├── layout/           # Header, breadcrumbs, sidebar investigativa
│   │   │   └── telemetry/        # HUD de XP, badges, barras de progresso
│   │   ├── features/
│   │   │   ├── workspace/        # Container do Iframe + Split Pane
│   │   │   ├── code_runner/      # Monaco Editor + submissão Piston
│   │   │   └── investigation/    # Formulário de Bug Report e pistas progressivas
│   │   └── lib/
│   │       ├── api/              # Clientes de API DRF
│   │       └── postmessage/      # Contratos tipados de postMessage
│   └── tests/                    # Testes de frontend e E2E Playwright
├── docs/
│   ├── architecture/             # Especificações de arquitetura
│   └── decisions/                # ADRs (Architecture Decision Records)
└── prototypes/                   # Protótipos de design system e provas de conceito
```

---

## 3. Contrato de Comunicação: Hub ◄──► Mini-Sites via postMessage

Para manter isolamento absoluto de estilos e escopos, cada mini-site roda em um `<iframe>` com atributo `sandbox`:

```html
<iframe
  src="http://localhost:8000/mini-sites/manual-vault/?seed=104928"
  sandbox="allow-scripts allow-forms allow-same-origin"
  title="Produto sob Teste"
  class="lab-viewport-frame"
/>
```

### Protocolo de Mensagens Tipadas

```typescript
export interface QALearningEvent {
  protocol: 'QA_LEARNING_V1';
  origin: string;              // Validação estrita de domínio do backend
  topicSlug: string;           // Escopo atual
  sessionSeed: string;         // Semente ativa
  eventType: 'BUG_INTERACTION' | 'BEHAVIOR_TRIGGERED' | 'METRIC_RECORDED';
  payload: {
    behaviorId: string;        // ID do comportamento configurado no tópico
    targetElement?: string;    // Seletor ou identificador do componente
    userAction?: string;       // Ex: 'submit_empty_form', 'rapid_click'
    timestamp: number;
  };
}
```

---

## 4. Orquestração de Execução de Código (Piston)

1. O aluno escreve código na IDE embutida (Monaco Editor).
2. O Frontend submete o código para a API do Django (`POST /api/v1/evaluation/run/`).
3. O Django monta o pacote de verificação:
   - Código do aluno.
   - Harness/Testes ocultos de avaliação.
   - Parâmetros de execução (timeout de 3000ms, limite de 128MB de RAM).
4. O Django dispara a execução para o container do Piston (`POST http://piston:2000/api/v2/execute`).
5. O Piston executa em sandbox e devolve stdout/stderr e exitCode.
6. O Django analisa os testes aprovados e calcula o **percentual de acerto (não binário)** e seleciona a dica calibrada pelo nível de dificuldade do tópico.
7. O resultado é retornado ao aluno em tempo real.
