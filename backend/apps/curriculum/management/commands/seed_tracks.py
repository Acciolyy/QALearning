from django.core.management.base import BaseCommand
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel

class Command(BaseCommand):
    help = 'Popula a estrutura completa das 15 trilhas de QA e módulos/tópicos das Trilhas 00, 01 e 12'

    def handle(self, *args, **options):
        self.stdout.write("Semeando catálogo de trilhas de QA...")

        tracks_data = [
            (0, "Fundamentos de QA", "fundamentos-qa", TrackCategory.FOUNDATIONS, "Onboarding guiado, anatomia web e oráculos de teste.", "/mini-sites/vault-commerce/checkout/"),
            (1, "Testes Manuais", "testes-manuais", TrackCategory.FOUNDATIONS, "Exploratório, oráculos e heurísticas de teste.", "/mini-sites/vault-commerce/checkout/"),
            (2, "Bug Reports", "bug-reports", TrackCategory.FOUNDATIONS, "Escrita técnica de relatórios, severidade x prioridade e reprodução.", "/mini-sites/vault-commerce/checkout/"),
            (3, "Testes de API", "testes-api", TrackCategory.PROTOCOLS, "REST, status codes, contratos e validação de payloads.", "/mini-sites/faulty-api/"),
            (4, "Testes de Funcionalidade", "testes-funcionalidade", TrackCategory.FOUNDATIONS, "Fluxos de negócio ponta a ponta no produto fictício.", "/mini-sites/vault-commerce/checkout/"),
            (5, "Testes de Regressão", "testes-regressao", TrackCategory.FOUNDATIONS, "Comparação de comportamento e hotfixes entre versões.", "/mini-sites/vault-commerce/checkout/"),
            (6, "Caixa Branca", "caixa-branca", TrackCategory.STRUCTURE, "Caminhos lógicos, branches e cobertura estrutural de código.", "/mini-sites/vault-commerce/checkout/"),
            (7, "Caixa Preta", "caixa-preta", TrackCategory.STRUCTURE, "Auditoria puramente comportamental sem acesso ao código-fonte.", "/mini-sites/vault-commerce/checkout/"),
            (8, "Testes Automatizados E2E", "testes-automatizados-e2e", TrackCategory.AUTOMATION, "Scripts Playwright em IDE embutida contra o mini-site.", "/mini-sites/vault-commerce/checkout/"),
            (9, "Testes Unitários", "testes-unitarios", TrackCategory.STRUCTURE, "Captura de falhas lógicas sutis em funções de regras de negócio.", "/mini-sites/unit-arena/"),
            (10, "CI/CD para QA", "cicd-para-qa", TrackCategory.AUTOMATION, "Pipelines, gates de qualidade, YAML e testes flaky.", "/mini-sites/pipeline-sim/"),
            (11, "Testes de Performance", "testes-performance", TrackCategory.SPECIALTIES, "Telemetria de latência, throughput e gargalos sob carga.", "/mini-sites/perf-dashboard/"),
            (12, "Testes de Acessibilidade (WCAG)", "testes-acessibilidade-wcag", TrackCategory.SPECIALTIES, "Barreiras reais de teclado, contraste e semântica ARIA.", "/mini-sites/vault-commerce/checkout/"),
            (13, "Testes de Segurança (Nível QA)", "testes-seguranca", TrackCategory.PROTOCOLS, "Sanitização de inputs, vazamento de dados sensíveis e permissões.", "/mini-sites/sec-vault/"),
            (14, "Mobile Testing", "mobile-testing", TrackCategory.SPECIALTIES, "Contexto responsivo, interrupções de rede e particularidades touch.", "/mini-sites/vault-commerce/checkout/"),
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

        # =====================================================================
        # TRILHA 00: FUNDAMENTOS DE QA (fundamentos-qa)
        # =====================================================================
        track_00 = Track.objects.get(number=0)

        # MÓDULO 1 (Pistas Diretas // >= 70%)
        mod00_1, _ = Module.objects.update_or_create(
            track=track_00,
            number=1,
            defaults={
                'title': 'Anatomia de Aplicações Web e Formulários',
                'guidance_level': GuidanceLevel.DIRECT,
                'description': 'Reconhecimento visual do DOM, campos obrigatórios e integridade básica de tipos.',
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod00_1,
            code="QA-ONB-011",
            defaults={
                'title': 'Reconhecimento de Elementos DOM e Campos Obrigatórios',
                'slug': 'reconhecimento-dom-checkout',
                'target_element': 'input#user-name',
                'oracle_description': 'Todos os campos marcados com asterisco (*) no checkout devem ser obrigatórios e exigir preenchimento substantivo.',
                'investigation_scope': 'Investigue o comportamento do formulário ao submeter campos em branco ou compostos apenas por espaços.',
                'xp_reward': 50,
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod00_1,
            code="QA-ONB-012",
            defaults={
                'title': 'Validação de Tipos de Dados em Formulários',
                'slug': 'validacao-tipos-dados',
                'target_element': 'input#user-age',
                'oracle_description': 'Campos quantitativos como idade devem aceitar apenas números inteiros positivos e respeitar a maioridade.',
                'investigation_scope': 'Audite se o campo de idade bloqueia entradas alfanuméricas e idades abaixo de 18 anos.',
                'xp_reward': 55,
                'order': 2
            }
        )

        # MÓDULO 2 (Pistas Sutis // >= 85%)
        mod00_2, _ = Module.objects.update_or_create(
            track=track_00,
            number=2,
            defaults={
                'title': 'O que é um Bug & Oráculos de Teste',
                'guidance_level': GuidanceLevel.SUBTLE,
                'description': 'Diferenciação entre comportamento especificado e anomalia com pistas sutis.',
                'order': 2
            }
        )
        Topic.objects.update_or_create(
            module=mod00_2,
            code="QA-ONB-021",
            defaults={
                'title': 'Identificação de Desvio Comportamental vs Especificação',
                'slug': 'desvio-comportamental-especificacao',
                'target_element': 'input#coupon-code',
                'oracle_description': 'O desconto de cupom promocional deve incidir exclusivamente sobre os produtos, nunca sobre o frete.',
                'investigation_scope': 'Aplique o cupom VAULT10 e compare a dedução esperada contra o valor calculado pelo sistema.',
                'xp_reward': 65,
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod00_2,
            code="QA-ONB-022",
            defaults={
                'title': 'Oráculos Implícitos vs Explícitos em Fluxos de Usuário',
                'slug': 'oraculos-implicitos-explicitos',
                'target_element': 'select#payment-method',
                'oracle_description': 'Estados terminais como CANCELADO devem ser imutáveis sem reiniciar um novo processo de checkout.',
                'investigation_scope': 'Simule o cancelamento do pedido e verifique se a troca da forma de pagamento reativa a cobrança.',
                'xp_reward': 70,
                'order': 2
            }
        )

        # MÓDULO 3 (Autonomia // 100%)
        mod00_3, _ = Module.objects.update_or_create(
            track=track_00,
            number=3,
            defaults={
                'title': 'Auditoria Básica Autônoma',
                'guidance_level': GuidanceLevel.AUTONOMOUS,
                'description': 'Auditoria independente do fluxo transacional do checkout sem assistência contextual.',
                'order': 3
            }
        )
        Topic.objects.update_or_create(
            module=mod00_3,
            code="QA-ONB-031",
            defaults={
                'title': 'Inspeção de Integridade no Carrinho de Compras',
                'slug': 'inspecao-integridade-carrinho',
                'target_element': 'button#submit-order',
                'oracle_description': 'Cliques concorrentes rápidos no botão de confirmação não podem duplicar transações nem envios de formulário.',
                'investigation_scope': 'Execute testes de duplo clique na finalização e audite a consistência de cobrança.',
                'xp_reward': 85,
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod00_3,
            code="QA-ONB-032",
            defaults={
                'title': 'Mapeamento Sistemático de Não-Conformidades',
                'slug': 'mapeamento-nao-conformidades',
                'target_element': 'form#checkout-form',
                'oracle_description': 'Mapeamento forense completo de todas as falhas ativas na release sem pistas.',
                'investigation_scope': 'Realize auditoria exploratória exaustiva de todo o formulário de ponta a ponta.',
                'xp_reward': 100,
                'order': 2
            }
        )

        # =====================================================================
        # TRILHA 01: TESTES MANUAIS (testes-manuais) - JÁ EXISTENTE
        # =====================================================================
        track_manual = Track.objects.get(number=1)
        mod1, _ = Module.objects.update_or_create(
            track=track_manual, number=1,
            defaults={'title': 'Fundamentos e Roteiros Exploratórios', 'guidance_level': GuidanceLevel.DIRECT, 'description': 'Mapeamento inicial de anomalias com pistas contextuais diretas.', 'order': 1}
        )
        mod2, _ = Module.objects.update_or_create(
            track=track_manual, number=2,
            defaults={'title': 'Integridade de Dados e Máquina de Estados', 'guidance_level': GuidanceLevel.SUBTLE, 'description': 'Particionamento de equivalência, concorrência e transições de estado com pistas sutis.', 'order': 2}
        )
        mod3, _ = Module.objects.update_or_create(
            track=track_manual, number=3,
            defaults={'title': 'Auditoria Autônoma de Regressão', 'guidance_level': GuidanceLevel.AUTONOMOUS, 'description': 'Auditoria de ponta a ponta sem pistas — autonomia total do analista.', 'order': 3}
        )
        Topic.objects.update_or_create(module=mod1, code="QA-MAN-011", defaults={'title': 'Roteiro Exploratório em Cadastro', 'slug': 'roteiro-exploratorio-cadastro', 'target_element': 'form#registration-form', 'oracle_description': 'Todos os campos com asterisco são obrigatórios e devem exigir preenchimento substantivo.', 'investigation_scope': 'Investigue o comportamento do formulário ao submeter campos em branco ou compostos exclusivamente por espaços.', 'xp_reward': 60, 'order': 1})
        Topic.objects.update_or_create(module=mod1, code="QA-MAN-012", defaults={'title': 'Limites e Particionamento de Idade', 'slug': 'limites-idade-cadastro', 'target_element': 'input#user-age', 'oracle_description': 'Idade mínima 18 anos, máxima 120 anos. Fora desse intervalo deve bloquear com mensagem acessível.', 'investigation_scope': 'Audite os valores limite no campo de idade sob valores: 17, 18, 120 e números negativos.', 'xp_reward': 75, 'order': 2})
        Topic.objects.update_or_create(module=mod1, code="QA-MAN-013", defaults={'title': 'Máscaras de Entrada e Formatação', 'slug': 'mascaras-entrada-formatacao', 'target_element': 'input#tax-id', 'oracle_description': 'O campo deve aceitar apenas dígitos numéricos e sanitizar pontuações coladas via clipboard.', 'investigation_scope': 'Teste a colagem de textos alfanuméricos e caracteres de controle no campo de documento.', 'xp_reward': 80, 'order': 3})
        Topic.objects.update_or_create(module=mod2, code="QA-MAN-021", defaults={'title': 'Concorrência e Duplo Envio no Checkout', 'slug': 'concorrencia-duplo-envio', 'target_element': 'button#submit-order', 'oracle_description': 'O botão de finalizar deve ser desabilitado imediatamente após o clique, garantindo idempotência e prevenindo cobrança dupla.', 'investigation_scope': 'Investigue o comportamento do gateway e geração de pedidos sob múltiplos cliques rápidos na submissão.', 'xp_reward': 90, 'order': 1})
        Topic.objects.update_or_create(module=mod2, code="QA-MAN-022", defaults={'title': 'Máquina de Estados e Transições de Pedido', 'slug': 'maquina-estados-pedido', 'target_element': 'select#payment-method', 'oracle_description': 'Transições de estado devem respeitar o ciclo de vida: pendente -> pago | cancelado. Um pedido cancelado nunca pode retornar para aprovado sem novo checkout.', 'investigation_scope': 'Teste a alteração do método de pagamento após simulação de falha ou cancelamento na etapa de conciliação.', 'xp_reward': 95, 'order': 2})
        Topic.objects.update_or_create(module=mod3, code="QA-MAN-031", defaults={'title': 'Regressão de Cálculo e Valores no Checkout', 'slug': 'regressao-calculo-valores', 'target_element': 'aside.order-summary', 'oracle_description': 'A aplicação de cupons, descontos promocionais e fretes por região deve manter a integridade matemática exata em qualquer combinação de itens.', 'investigation_scope': 'Audite a consistência do somatório final sob diferentes métodos de frete e códigos promocionais na release V2.1.', 'xp_reward': 120, 'order': 1})
        Topic.objects.update_or_create(module=mod3, code="QA-MAN-032", defaults={'title': 'Regressão de Fluxos e Máquina de Estados', 'slug': 'regressao-fluxos-estados', 'target_element': 'body', 'oracle_description': 'A navegação pelo histórico do navegador (Voltar/Avançar) não pode quebrar a integridade da sessão nem gerar duplicidade de transações.', 'investigation_scope': 'Realize testes de navegação errática, expiração de sessão e reenvio de cabeçalhos após a conclusão do pedido.', 'xp_reward': 130, 'order': 2})

        # =====================================================================
        # TRILHA 12: TESTES DE ACESSIBILIDADE WCAG (testes-acessibilidade-wcag)
        # =====================================================================
        track_12 = Track.objects.get(number=12)

        # MÓDULO 1 (Operabilidade e Teclado · direct · 70%)
        mod12_1, _ = Module.objects.update_or_create(
            track=track_12,
            number=1,
            defaults={
                'title': 'Operabilidade e Navegação por Teclado (WCAG Princípio 2)',
                'guidance_level': GuidanceLevel.DIRECT,
                'description': 'Indicadores visuais de foco, ordem sequencial e armadilhas de teclado.',
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod12_1,
            code="QA-A11-011",
            defaults={
                'title': 'Navegação por Teclado e Foco Visível (WCAG 2.4.7)',
                'slug': 'navegacao-teclado-foco-visivel',
                'target_element': 'input#user-name',
                'oracle_description': 'Qualquer controle operacional deve ter um indicador de foco visível com contraste >= 3:1 (WCAG 2.4.7 AA).',
                'investigation_scope': 'Navegue usando exclusivamente a tecla Tab e audite a visibilidade do indicador de foco nos inputs.',
                'xp_reward': 70,
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod12_1,
            code="QA-A11-012",
            defaults={
                'title': 'Armadilhas de Foco e Ordem Lógica de Tabulação (WCAG 2.4.3)',
                'slug': 'armadilhas-foco-ordem-logica',
                'target_element': 'input#coupon-code',
                'oracle_description': 'A ordem de foco sequencial deve ser contínua e sem armadilhas que retenham o usuário (WCAG 2.1.2 e 2.4.3).',
                'investigation_scope': 'Teste a transição de foco entre a caixa de cupom e o botão de aplicação sem utilizar o mouse.',
                'xp_reward': 80,
                'order': 2
            }
        )

        # MÓDULO 2 (Perceptibilidade e ARIA · subtle · 85%)
        mod12_2, _ = Module.objects.update_or_create(
            track=track_12,
            number=2,
            defaults={
                'title': 'Perceptibilidade e Compreensibilidade (WCAG Princípios 1 e 3)',
                'guidance_level': GuidanceLevel.SUBTLE,
                'description': 'Contraste mínimo de texto (1.4.3), semântica de formulários e associação de mensagens de erro (3.3.1).',
                'order': 2
            }
        )
        Topic.objects.update_or_create(
            module=mod12_2,
            code="QA-A11-021",
            defaults={
                'title': 'Relação de Contraste Mínimo de Cores (WCAG 1.4.3)',
                'slug': 'contraste-minimo-cores',
                'target_element': 'p.field-hint',
                'oracle_description': 'Textos normais devem possuir relação de contraste de pelo menos 4.5:1 contra o fundo para conformidade AA.',
                'investigation_scope': 'Meça a relação de contraste das legendas e avisos informativos sob o checkout.',
                'xp_reward': 85,
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod12_2,
            code="QA-A11-022",
            defaults={
                'title': 'Rótulos de Campos e Mensagens Acessíveis (WCAG 3.3.1 e 4.1.2)',
                'slug': 'rotulos-campos-mensagens-acessiveis',
                'target_element': 'input#tax-id',
                'oracle_description': 'Todos os inputs devem ter Accessible Name associado e erros vinculados via aria-describedby.',
                'investigation_scope': 'Inspecione a árvore de acessibilidade do documento e valide os atributos ARIA nos erros de submissão.',
                'xp_reward': 90,
                'order': 2
            }
        )

        # MÓDULO 3 (Auditoria WCAG 2.1 AA Autônoma · 100%)
        mod12_3, _ = Module.objects.update_or_create(
            track=track_12,
            number=3,
            defaults={
                'title': 'Auditoria WCAG 2.1 AA Autônoma',
                'guidance_level': GuidanceLevel.AUTONOMOUS,
                'description': 'Auditoria independente e homologação forense de acessibilidade sob a norma WCAG 2.1 AA.',
                'order': 3
            }
        )
        Topic.objects.update_or_create(
            module=mod12_3,
            code="QA-A11-031",
            defaults={
                'title': 'Auditoria de Barreiras Críticas no Pagamento',
                'slug': 'auditoria-barreiras-criticas-pagamento',
                'target_element': 'section#payment-section',
                'oracle_description': 'Mapeamento autônomo e completo de todas as barreiras impeditivas no processo de compra.',
                'investigation_scope': 'Audite teclado, contraste e semântica assistiva em todo o fluxo de pagamento.',
                'xp_reward': 110,
                'order': 1
            }
        )
        Topic.objects.update_or_create(
            module=mod12_3,
            code="QA-A11-032",
            defaults={
                'title': 'Homologação Forense de Conformidade WCAG 2.1 AA',
                'slug': 'homologacao-forense-wcag',
                'target_element': 'main',
                'oracle_description': 'Homologação técnica final do checkout com 100% de precisão antes da liberação em produção.',
                'investigation_scope': 'Realize auditoria autônoma de conformidade WCAG sem pistas e com zero falsos alarmes.',
                'xp_reward': 130,
                'order': 2
            }
        )

        self.stdout.write(self.style.SUCCESS("Catálogo das Trilhas 00, 01 e 12 semeado com sucesso no banco de dados!"))
