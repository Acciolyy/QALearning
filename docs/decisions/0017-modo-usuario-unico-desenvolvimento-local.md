# ADR-0017: Modo de Usuário Único Deliberado para Desenvolvimento Local

- **Data**: 2026-09-14
- **Status**: Aceito
- **Contexto da Decisão**: Operação e prototipação local da bancada forense e motor de avaliação sem sobrecarga de fluxos de autenticação/login durante o ciclo de desenvolvimento.

### Contexto
Durante o desenvolvimento das mecânicas centrais da plataforma (bancada de testes de caixa preta e branca, oráculos de teste, motor pedagógico de avaliação não-binária e gamificação forense), o foco técnico prioritário tem sido a integridade comportamental, contratos de PostMessage e isolamento de execução no sandbox.

Para viabilizar a prototipação ágil e o uso local imediato da bancada sem fricção de telas de login ou gerenciamento de tokens, o backend foi estruturado em modo de usuário único: a função auxiliar `get_current_user(request)` resolve estritamente para um perfil de desenvolvimento local persistente (`username='thiago'`).

Entretanto, documentações anteriores e docstrings induziam a interpretação equivocada de que haveria uma camada de autenticação ativa e garantias de isolamento de segurança multiusuário baseadas em `request.user`. Nenhuma autenticação formal (sessões de login ou JWT) está ativa no momento.

### Decisão
1. **Declaração Explícita de Modo de Usuário Único Local**:
   - Fica registrado formalmente que a plataforma opera atualmente em modo de usuário único para desenvolvimento local.
   - Qualquer requisição HTTP, contenha ou não credenciais, opera sobre o perfil do usuário local fixo (`username='thiago'`).
   - Requisições `GET` são estritamente idempotentes e livres de efeitos colaterais de escrita; inicializações de estado pertencem à camada de serviço (`GamificationService.get_or_create_profile`).

2. **Condição Mandatória para Implantação Multiusuário**:
   - Antes de qualquer deploy em ambiente compartilhado, homologação ou produção com múltiplos alunos/analistas, é estritamente obrigatório:
     1. Implementar a camada formal de autenticação (ex: Django SessionAuthentication com CSRF ou Token/JWT).
     2. Aplicar `permission_classes = [IsAuthenticated]` em todas as rotas da API de perfil, progresso e bancada.
     3. Eliminar o fallback de usuário estático em `get_current_user`, rejeitando requisições anônimas com `HTTP 401 Unauthorized`.
     4. Amarrar todas as consultas e mutações de `AnalystProfile` e `PracticeActivity` estritamente ao `request.user` autenticado.

3. **Veracidade Documental e Docstrings**:
   - É terminantemente proibido documentar intenções futuras ou modelos de segurança ideais como se fossem garantias do código atual. Docstrings devem retratar fidedignamente o comportamento do código em execução.

### Consequências
- A equipe e os avaliadores têm clareza transparente das premissas do sistema na fase atual.
- Elimina-se o risco de falsa sensação de segurança ou vazamento acidental em deploys antecipados.
