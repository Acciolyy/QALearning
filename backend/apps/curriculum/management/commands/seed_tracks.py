from django.core.management.base import BaseCommand
from apps.curriculum.models import Track, Module, Topic, Activity, TrackCategory, GuidanceLevel, ActivityType
from apps.bug_engine.models import ScopedBehavior, BugSeverity

class Command(BaseCommand):
    help = "Popula o catálogo oficial de Trilhas, Módulos e Tópicos de QA definidos na Seção 4"

    def handle(self, *args, **options):
        self.stdout.write("Semeando catálogo de Trilhas de QA...")

        tracks_data = [
            (0, "Fundamentos de QA", "fundamentos-qa", TrackCategory.FOUNDATIONS, "Onboarding inicial: vocabulário, mentalidade investigativa e ciclo de vida de bugs.", "/mini-sites/onboarding-lab/"),
            (1, "Testes Manuais", "testes-manuais", TrackCategory.FOUNDATIONS, "Técnicas exploratórias, casos de teste e análise de fronteiras.", "/mini-sites/manual-vault/"),
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

        mod1, _ = Module.objects.update_or_create(
            track=track_manual,
            number=1,
            defaults={
                'title': 'Fundamentos e Roteiros Exploratórios',
                'guidance_level': GuidanceLevel.DIRECT,
                'description': 'Mapeamento inicial de anomalias com pistas contextuais diretas.'
            }
        )

        mod2, _ = Module.objects.update_or_create(
            track=track_manual,
            number=2,
            defaults={
                'title': 'Análise de Fronteiras e Tipos de Dados',
                'guidance_level': GuidanceLevel.SUBTLE,
                'description': 'Particionamento de equivalência e valores limítrofes com pistas sutis.'
            }
        )

        mod3, _ = Module.objects.update_or_create(
            track=track_manual,
            number=3,
            defaults={
                'title': 'Auditoria Autônoma de Regressão',
                'guidance_level': GuidanceLevel.AUTONOMOUS,
                'description': 'Auditoria de ponta a ponta sem pistas — autonomia total do analista.'
            }
        )

        # Tópicos do Módulo 1
        t1, _ = Topic.objects.update_or_create(
            module=mod1,
            code="QA-MAN-011",
            defaults={
                'title': 'Roteiro Exploratório em Cadastro de Usuário',
                'slug': 'roteiro-exploratorio-cadastro',
                'target_element': 'form#registration-form',
                'oracle_description': 'Todos os campos com asterisco são obrigatórios e devem exibir mensagem amigável.',
                'investigation_scope': 'Investigue o comportamento do formulário ao submeter campos em branco ou parcialmente preenchidos.',
                'xp_reward': 60,
                'order': 1
            }
        )

        t2, _ = Topic.objects.update_or_create(
            module=mod1,
            code="QA-MAN-012",
            defaults={
                'title': 'Limites e Particionamento de Idade',
                'slug': 'limites-idade-cadastro',
                'target_element': 'input#user-age',
                'oracle_description': 'Idade mínima 18 anos, máxima 120 anos. Valores fora desse intervalo devem ser rejeitados.',
                'investigation_scope': 'Audite os valores limite no campo de idade sob valores: 17, 18, 120 e números negativos.',
                'xp_reward': 75,
                'order': 2
            }
        )

        t3, _ = Topic.objects.update_or_create(
            module=mod1,
            code="QA-MAN-013",
            defaults={
                'title': 'Máscaras de Entrada e Sanitização de Caracteres',
                'slug': 'mascaras-entrada-sanitizacao',
                'target_element': 'input#tax-id',
                'oracle_description': 'O campo deve aceitar apenas dígitos numéricos e sanitizar pontuações coladas via clipboard.',
                'investigation_scope': 'Teste a colagem de textos alfanuméricos e caracteres de controle no campo de documento.',
                'xp_reward': 80,
                'order': 3
            }
        )

        # Semeando Comportamentos Escopados do Tópico 02 (Limites de Idade)
        behaviors_data = [
            ("VAL-AGE-001", "Idade 17 anos aceita sem bloqueio", "O sistema permite que menores de 18 anos avancem para o checkout sem solicitar responsável.", BugSeverity.BLOCKER, 10),
            ("VAL-AGE-002", "Idade negativa aceita (-5 anos)", "O input aceita valores negativos e calcula desconto indevido de idade.", BugSeverity.CRITICAL, 10),
            ("VAL-AGE-003", "Idade 121 aceita silenciosamente", "Valores acima de 120 anos não disparam validação de oráculo de negócio.", BugSeverity.MAJOR, 8),
            ("VAL-AGE-004", "Mensagem de erro de idade não acessível", "O erro é injetado sem role='alert' ou aria-live para leitores de tela.", BugSeverity.MINOR, 5),
        ]

        for b_code, b_title, b_desc, b_sev, b_wt in behaviors_data:
            ScopedBehavior.objects.update_or_create(
                topic=t2,
                code=b_code,
                defaults={
                    'title': b_title,
                    'description': b_desc,
                    'severity': b_sev,
                    'weight': b_wt,
                    'is_defect': True
                }
            )

        self.stdout.write(self.style.SUCCESS("Catálogo inicial de QA e comportamentos escopados semeados com sucesso!"))
