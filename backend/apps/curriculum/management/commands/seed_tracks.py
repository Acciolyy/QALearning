from django.core.management.base import BaseCommand
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.bug_engine.models import ScopedBehavior, BugSeverity

class Command(BaseCommand):
    help = 'Semeia as 15 trilhas de QA e os 3 módulos da Trilha 01 (Testes Manuais) com 7 tópicos'

    def handle(self, *args, **options):
        self.stdout.write("Semeando catálogo de Trilhas de QA...")

        tracks_data = [
            (0, "Fundamentos de QA", "fundamentos-qa", TrackCategory.FOUNDATIONS, "Onboarding inicial: vocabulário, mentalidade investigativa e ciclo de vida de bugs.", "/mini-sites/onboarding-lab/"),
            (1, "Testes Manuais", "testes-manuais", TrackCategory.FOUNDATIONS, "Técnicas exploratórias, casos de teste e análise de fronteiras.", "/mini-sites/vault-commerce/checkout/"),
            (2, "Bug Reports", "bug-reports", TrackCategory.FOUNDATIONS, "Documentação precisa, severidade x prioridade e reprodução mínima.", "/mini-sites/bug-dossier/"),
            (3, "Testes de API", "testes-api", TrackCategory.PROTOCOLS, "REST, status codes, validação de payload, contratos e headers.", "/mini-sites/faulty-api/"),
            (4, "Testes de Funcionalidade", "testes-funcionalidade", TrackCategory.FOUNDATIONS, "Fluxos de negócio ponta a ponta e máquina de estados.", "/mini-sites/biz-flows/"),
            (5, "Testes de Regressão", "testes-regressao", TrackCategory.FOUNDATIONS, "Comparação de comportamento entre versões de software.", "/mini-sites/regression-diff/"),
            (6, "Caixa Branca", "caixa-branca", TrackCategory.STRUCTURE, "Cobertura de caminhos lógicos com visualização do código-fonte.", "/mini-sites/white-box/"),
            (7, "Caixa Preta", "caixa-preta", TrackCategory.STRUCTURE, "Auditoria estrita de comportamento externo sem acesso ao código.", "/mini-sites/black-box/"),
            (8, "Testes Automatizados E2E", "testes-automatizados-e2e", TrackCategory.AUTOMATION, "Playwright na IDE embutida executado contra o mini-site.", "/mini-sites/automation-gym/"),
            (9, "Testes Unitários", "testes-unitarios", TrackCategory.STRUCTURE, "Captura de falhas sutis em funções lógicas isoladas.", "/mini-sites/unit-arena/"),
            (10, "CI/CD para QA", "cicd-para-qa", TrackCategory.AUTOMATION, "Pipelines, gates de qualidade, testes flaky e relatórios de execução.", "/mini-sites/pipeline-sim/"),
            (11, "Testes de Performance", "testes-performance", TrackCategory.SPECIALTIES, "Telemetria de latência, vazamento de memória e carga concorrente.", "/mini-sites/perf-dashboard/"),
            (12, "Testes de Acessibilidade (WCAG)", "testes-acessibilidade-wcag", TrackCategory.SPECIALTIES, "Identificação de barreiras reais de foco, contraste e navegação por teclado.", "/mini-sites/a11y-barriers/"),
            (13, "Testes de Segurança (Nível QA)", "testes-seguranca", TrackCategory.PROTOCOLS, "Sanitização de inputs, vazamento de dados sensíveis e permissões.", "/mini-sites/sec-vault/"),
            (14, "Mobile Testing", "mobile-testing", TrackCategory.SPECIALTIES, "Contexto responsivo, interrupções de rede e particularidades touch.", "/mini-sites/mobile-view/"),
        ]

        for num, name, slug, cat, desc, route in tracks_data:
            track, created = Track.objects.update_or_create(
                number=num,
                defaults={
                    'name': name,
                    'slug': slug,
                    'category': cat,
                    'description': desc,
                    'mini_site_route': route,
                    'order': num
                }
            )
            status = "Criada" if created else "Atualizada"
            self.stdout.write(f"  [{status}] Trilha {num:02d}: {name}")

        # Semeando Módulos e Tópicos da Trilha 01 (Testes Manuais)
        track_manual = Track.objects.get(number=1)

        # MÓDULO 01 (Pistas Diretas // Limiar: >= 70%)
        mod1, _ = Module.objects.update_or_create(
            track=track_manual,
            number=1,
            defaults={
                'title': 'Fundamentos e Roteiros Exploratórios',
                'guidance_level': GuidanceLevel.DIRECT,
                'description': 'Mapeamento inicial de anomalias com pistas contextuais diretas.',
                'order': 1
            }
        )

        # MÓDULO 02 (Pistas Sutis // Limiar: >= 85%)
        mod2, _ = Module.objects.update_or_create(
            track=track_manual,
            number=2,
            defaults={
                'title': 'Integridade de Dados e Máquina de Estados',
                'guidance_level': GuidanceLevel.SUBTLE,
                'description': 'Particionamento de equivalência, concorrência e transições de estado com pistas sutis.',
                'order': 2
            }
        )

        # MÓDULO 03 (Autonomia Real // Limiar: 100%)
        mod3, _ = Module.objects.update_or_create(
            track=track_manual,
            number=3,
            defaults={
                'title': 'Auditoria Autônoma de Regressão',
                'guidance_level': GuidanceLevel.AUTONOMOUS,
                'description': 'Auditoria de ponta a ponta sem pistas — autonomia total do analista.',
                'order': 3
            }
        )

        # -------------------------------------------------------------
        # Tópicos do Módulo 1 (3 Tópicos)
        # -------------------------------------------------------------
        Topic.objects.update_or_create(
            module=mod1,
            code="QA-MAN-011",
            defaults={
                'title': 'Roteiro Exploratório em Cadastro',
                'slug': 'roteiro-exploratorio-cadastro',
                'target_element': 'form#registration-form',
                'oracle_description': 'Todos os campos com asterisco são obrigatórios e devem exigir preenchimento substantivo.',
                'investigation_scope': 'Investigue o comportamento do formulário ao submeter campos em branco ou compostos exclusivamente por espaços.',
                'xp_reward': 60,
                'order': 1
            }
        )

        Topic.objects.update_or_create(
            module=mod1,
            code="QA-MAN-012",
            defaults={
                'title': 'Limites e Particionamento de Idade',
                'slug': 'limites-idade-cadastro',
                'target_element': 'input#user-age',
                'oracle_description': 'Idade mínima 18 anos, máxima 120 anos. Fora desse intervalo deve bloquear com mensagem acessível.',
                'investigation_scope': 'Audite os valores limite no campo de idade sob valores: 17, 18, 120 e números negativos.',
                'xp_reward': 75,
                'order': 2
            }
        )

        Topic.objects.update_or_create(
            module=mod1,
            code="QA-MAN-013",
            defaults={
                'title': 'Máscaras de Entrada e Formatação',
                'slug': 'mascaras-entrada-formatacao',
                'target_element': 'input#tax-id',
                'oracle_description': 'O campo deve aceitar apenas dígitos numéricos e sanitizar pontuações coladas via clipboard.',
                'investigation_scope': 'Teste a colagem de textos alfanuméricos e caracteres de controle no campo de documento.',
                'xp_reward': 80,
                'order': 3
            }
        )

        # -------------------------------------------------------------
        # Tópicos do Módulo 2 (2 Tópicos)
        # -------------------------------------------------------------
        Topic.objects.update_or_create(
            module=mod2,
            code="QA-MAN-021",
            defaults={
                'title': 'Concorrência e Duplo Envio no Checkout',
                'slug': 'concorrencia-duplo-envio',
                'target_element': 'button#submit-order',
                'oracle_description': 'O botão de finalizar deve ser desabilitado imediatamente após o clique, garantindo idempotência e prevenindo cobrança dupla.',
                'investigation_scope': 'Investigue o comportamento do gateway e geração de pedidos sob múltiplos cliques rápidos na submissão.',
                'xp_reward': 90,
                'order': 1
            }
        )

        Topic.objects.update_or_create(
            module=mod2,
            code="QA-MAN-022",
            defaults={
                'title': 'Máquina de Estados e Transições de Pedido',
                'slug': 'maquina-estados-pedido',
                'target_element': 'select#payment-method',
                'oracle_description': 'Transições de estado devem respeitar o ciclo de vida: pendente -> pago | cancelado. Um pedido cancelado nunca pode retornar para aprovado sem novo checkout.',
                'investigation_scope': 'Teste a alteração do método de pagamento após simulação de falha ou cancelamento na etapa de conciliação.',
                'xp_reward': 95,
                'order': 2
            }
        )

        # -------------------------------------------------------------
        # Tópicos do Módulo 3 (2 Tópicos)
        # -------------------------------------------------------------
        Topic.objects.update_or_create(
            module=mod3,
            code="QA-MAN-031",
            defaults={
                'title': 'Regressão de Cálculo e Valores no Checkout',
                'slug': 'regressao-calculo-valores',
                'target_element': 'aside.order-summary',
                'oracle_description': 'A aplicação de cupons, descontos promocionais e fretes por região deve manter a integridade matemática exata em qualquer combinação de itens.',
                'investigation_scope': 'Audite a consistência do somatório final sob diferentes métodos de frete e códigos promocionais na release V2.1.',
                'xp_reward': 120,
                'order': 1
            }
        )

        Topic.objects.update_or_create(
            module=mod3,
            code="QA-MAN-032",
            defaults={
                'title': 'Regressão de Fluxos e Máquina de Estados',
                'slug': 'regressao-fluxos-estados',
                'target_element': 'body',
                'oracle_description': 'A navegação pelo histórico do navegador (Voltar/Avançar) não pode quebrar a integridade da sessão nem gerar duplicidade de transações.',
                'investigation_scope': 'Realize testes de navegação errática, expiração de sessão e reenvio de cabeçalhos após a conclusão do pedido.',
                'xp_reward': 130,
                'order': 2
            }
        )

        self.stdout.write(self.style.SUCCESS("Catálogo completo de 15 trilhas e 7 tópicos da Trilha 01 semeados com sucesso!"))
