# ADR-0001: Arquitetura Monorepo e Stack Tecnológica

- **Data**: 2026-09-09
- **Status**: Aceito
- **Contexto da Decisão**: Seção 8 do Prompt Mestre

### Contexto
O projeto **QALearning** é um HUB gamificado de estudos práticos para profissionais e estudantes de Quality Assurance. Diferente de plataformas teóricas ou de algoritmos puros, ele requer:
1. Um backend robusto para gerenciar autenticação, progresso, catálogo pedagógico de trilhas/módulos/tópicos, regras de gamificação (XP, badges, streaks) e banco estruturado de comportamentos de bugs.
2. Um frontend interativo, rápido e altamente responsivo capaz de renderizar dashboards, visualização espacial de trilhas, shell de laboratório com iframe sandboxed e uma IDE embutida de código (Monaco Editor).
3. Capacidade de rodar localmente no ambiente do autor (WSL Ubuntu 24.04) com reprodutibilidade através de contêineres Docker.

### Decisão
Adotamos uma estrutura de **Monorepo** orquestrado via **Docker Compose** composto por:
- **Backend**: Python 3.12 + Django 5 + Django REST Framework (DRF). O Django foi escolhido pelo seu ORM maduro, facilidade de gerenciar múltiplos apps integrados (incluindo as mini-aplicações sob teste), segurança integrada e DRF para endpoints RESTful claros e tipáveis.
- **Frontend**: Next.js 14+ (App Router) + React + TypeScript. Oferece controle estrito de renderização, performance de roteamento e facilidade de integração com o `@monaco-editor/react`.
- **Banco de Dados**: PostgreSQL 16 como banco relacional unificado.
- **Orquestração de Desenvolvimento**: Docker Compose com serviços dedicados para backend, frontend, banco e motor de sandbox Piston.

### Alternativas Descartadas e Por Quê
- **Node.js / Express ou NestJS monolítico**: Descartado porque o autor possui sólida experiência e produtividade sênior em Python/Django, e o Django oferece um ecossistema pronto e altamente confiável para modelagem relacional, admin de conteúdo didático e regras de domínio complexas sem necessidade de montar ORM/Auth do zero.
- **FastAPI monolítico**: Descartado porque, embora seja performático para APIs assíncronas, o DRF oferece serializadores consolidados, permissões granulares e o Django Admin nativo, que acelera a curadoria do catálogo pedagógico.
- **Next.js Fullstack exclusivo (com Server Actions / Prisma)**: Descartado porque não permite desacoplar os mini-sites de teste em apps com comportamentos de servidor independentes (como simulação de headers HTTP reais, erros 500 intencionais e cookies de sessão isolados).
- **Repositórios separados (Polyrepo)**: Descartado porque o monorepo simplifica o versionamento atômico de contratos de API, schemas de eventos de bug e o setup via `docker compose up` em ambiente local no WSL.
