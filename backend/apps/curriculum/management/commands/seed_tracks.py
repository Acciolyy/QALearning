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

        # =========================================================================
        # TRILHA 04: TESTES DE FUNCIONALIDADE (testes-funcionalidade)
        # =========================================================================
        t4 = Track.objects.get(number=4)
        mod4_1, _ = Module.objects.update_or_create(
            track=t4, number=1,
            defaults={
                "title": "Regras de Negócio de Carrinho e Descontos",
                "guidance_level": GuidanceLevel.DIRECT,
                "description": "Validação funcional de cupons, acúmulo de descontos e cálculo de frete por região.",
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod4_1, code="QA-FNC-011",
            defaults={
                "title": "Regras de Acúmulo de Cupons e Descontos",
                "slug": "regras-acumulo-cupons-descontos",
                "target_element": "input#coupon-code",
                "oracle_description": "Cupons promocionais não são cumulativos e exigem código em caixa alta ou validação normalizada.",
                "investigation_scope": "Audite a aplicação de cupons combinados e garanta que não haja desconto duplicado indevido.",
                "xp_reward": 70,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod4_1, code="QA-FNC-012",
            defaults={
                "title": "Cálculo de Frete Escalonado por Região",
                "slug": "calculo-frete-escalonado",
                "target_element": "select#shipping-method",
                "oracle_description": "Frete grátis apenas para pedidos acima de R$ 300; opções expressas devem recalcular o total imediatamente.",
                "investigation_scope": "Verifique a alteração de modalidade de frete e integridade da soma do total geral.",
                "xp_reward": 75,
                "order": 2
            }
        )

        mod4_2, _ = Module.objects.update_or_create(
            track=t4, number=2,
            defaults={
                "title": "Fluxos de Pagamento e Idempotência de Transação",
                "guidance_level": GuidanceLevel.SUBTLE,
                "description": "Comportamentos funcionais em transição de meios de pagamento e garantia de não-duplicação.",
                "order": 2
            }
        )
        Topic.objects.update_or_create(
            module=mod4_2, code="QA-FNC-021",
            defaults={
                "title": "Idempotência e Confirmação de Transação",
                "slug": "idempotencia-confirmacao-transacao",
                "target_element": "button#submit-order",
                "oracle_description": "A submissão de um pedido deve ser estritamente idempotente, gerando uma única cobrança no gateway.",
                "investigation_scope": "Simule submissões repetidas e verifique se o sistema previne transações duplicadas concorrentes.",
                "xp_reward": 90,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod4_2, code="QA-FNC-022",
            defaults={
                "title": "Transições de Meios de Pagamento e Revalidação",
                "slug": "transicoes-pagamento-revalidacao",
                "target_element": "select#payment-method",
                "oracle_description": "Ao alterar a forma de pagamento, dados e campos condicionais devem ser revalidados e limpos.",
                "investigation_scope": "Alterne entre Pix, Cartão e Boleto e observe a integridade dos campos específicos de cada método.",
                "xp_reward": 95,
                "order": 2
            }
        )

        mod4_3, _ = Module.objects.update_or_create(
            track=t4, number=3,
            defaults={
                "title": "Auditoria de Jornada de Checkout Ponta a Ponta",
                "guidance_level": GuidanceLevel.AUTONOMOUS,
                "description": "Auditoria autônoma de fluxos complexos de faturamento sem pistas guiadas.",
                "order": 3
            }
        )
        Topic.objects.update_or_create(
            module=mod4_3, code="QA-FNC-031",
            defaults={
                "title": "Auditoria Holística de Checkout e Resumo Contábil",
                "slug": "auditoria-holistica-checkout-contabil",
                "target_element": "aside.card",
                "oracle_description": "A soma final de faturamento deve conferir com precisão matemática em todos os cenários de combinação.",
                "investigation_scope": "Execute a jornada completa de compra variando cupons, fretes e formas de pagamento sem pistas.",
                "xp_reward": 120,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod4_3, code="QA-FNC-032",
            defaults={
                "title": "Homologação de Regras Finais de Faturamento",
                "slug": "homologacao-regras-faturamento",
                "target_element": "form#checkout-form",
                "oracle_description": "O checkout deve emitir token único de pedido e barrar finalização com dados fiscais corrompidos.",
                "investigation_scope": "Homologue o fechamento do carrinho sob condições extremas de dados de faturamento.",
                "xp_reward": 130,
                "order": 2
            }
        )

        # =========================================================================
        # TRILHA 05: TESTES DE REGRESSÃO (testes-regressao)
        # =========================================================================
        t5 = Track.objects.get(number=5)
        mod5_1, _ = Module.objects.update_or_create(
            track=t5, number=1,
            defaults={
                "title": "Verificação de Hotfixes e Efeitos Colaterais",
                "guidance_level": GuidanceLevel.DIRECT,
                "description": "Auditoria focada em confirmar se correções de defeitos não reintroduziram falhas legadas.",
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod5_1, code="QA-REG-011",
            defaults={
                "title": "Validação de Hotfix no Cálculo de Frete",
                "slug": "validacao-hotfix-calculo-frete",
                "target_element": "select#shipping-method",
                "oracle_description": "O hotfix aplicado não pode reintroduzir taxa fixa que ignora o endereço ou zera o subtotal.",
                "investigation_scope": "Verifique se a correção de frete da release V2.1 preservou os dados preenchidos pelo usuário.",
                "xp_reward": 70,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod5_1, code="QA-REG-012",
            defaults={
                "title": "Regressão em Máscaras e Formatação de Documento",
                "slug": "regressao-mascaras-documento",
                "target_element": "input#tax-id",
                "oracle_description": "A máscara de formatação de documento deve permitir backspace sem apagar múltiplos caracteres ou duplicar pontos.",
                "investigation_scope": "Audite digitação, backspace e colagem de documento para detectar regressão na rotina de higienização.",
                "xp_reward": 75,
                "order": 2
            }
        )

        mod5_2, _ = Module.objects.update_or_create(
            track=t5, number=2,
            defaults={
                "title": "Regressão em Fluxos Multietapas e Estado",
                "guidance_level": GuidanceLevel.SUBTLE,
                "description": "Identificação de regressões sutis em navegação histórica de carrinho e sessões de compra.",
                "order": 2
            }
        )
        Topic.objects.update_or_create(
            module=mod5_2, code="QA-REG-021",
            defaults={
                "title": "Integridade de Estado entre Navegação de Histórico",
                "slug": "integridade-estado-navegacao-historico",
                "target_element": "button#history-back-sim",
                "oracle_description": "Voltar pelo histórico do navegador após confirmação de pedido não pode reabrir o mesmo carrinho como pendente.",
                "investigation_scope": "Simule o retorno de página após aprovação de pedido e confira a integridade do estado da sessão.",
                "xp_reward": 90,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod5_2, code="QA-REG-022",
            defaults={
                "title": "Compatibilidade de Sessão e Cupons Legados",
                "slug": "compatibilidade-sessao-cupons-legados",
                "target_element": "input#coupon-code",
                "oracle_description": "Cupons de campanhas anteriores não devem corromper o cálculo gerando NaN ou valores negativos.",
                "investigation_scope": "Teste códigos de cupom da release legada e confira se a mensagem de erro é informativa e segura.",
                "xp_reward": 95,
                "order": 2
            }
        )

        mod5_3, _ = Module.objects.update_or_create(
            track=t5, number=3,
            defaults={
                "title": "Auditoria Completa de Regressão V2.1",
                "guidance_level": GuidanceLevel.AUTONOMOUS,
                "description": "Bateria autônoma de regressão forense sobre toda a superfície de checkout.",
                "order": 3
            }
        )
        Topic.objects.update_or_create(
            module=mod5_3, code="QA-REG-031",
            defaults={
                "title": "Teste de Regressão Global em Resumo de Pedido",
                "slug": "regressao-global-resumo-pedido",
                "target_element": "aside.card",
                "oracle_description": "Regras de arredondamento de centavos e taxas adicionais devem manter coerência com o extrato contábil.",
                "investigation_scope": "Audite o resumo de valores sob combinações múltiplas sem apoio de pistas visuais.",
                "xp_reward": 120,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod5_3, code="QA-REG-032",
            defaults={
                "title": "Homologação de Não-Regressão em Checkout Crítico",
                "slug": "homologacao-nao-regressao-checkout",
                "target_element": "form#checkout-form",
                "oracle_description": "Nenhum dos 5 bugs críticos das releases anteriores pode se manifestar na versão candidata a release.",
                "investigation_scope": "Execute a homologação final de regressão autônoma no checkout do Vault Commerce.",
                "xp_reward": 130,
                "order": 2
            }
        )

        # =========================================================================
        # TRILHA 07: CAIXA PRETA (caixa-preta)
        # =========================================================================
        t7 = Track.objects.get(number=7)
        mod7_1, _ = Module.objects.update_or_create(
            track=t7, number=1,
            defaults={
                "title": "Particionamento de Equivalência e Análise de Limites",
                "guidance_level": GuidanceLevel.DIRECT,
                "description": "Técnicas clássicas de caixa preta baseadas estritamente na especificação de entradas e saídas.",
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod7_1, code="QA-BLK-011",
            defaults={
                "title": "Particionamento de Classes de Entrada em Dados Pessoais",
                "slug": "particionamento-classes-dados-pessoais",
                "target_element": "input#user-name",
                "oracle_description": "Classes válidas aceitas; classes inválidas (símbolos, números ou espaços puros) barradas.",
                "investigation_scope": "Isole as classes de equivalência do campo Nome e identifique desvios de validação observável.",
                "xp_reward": 70,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod7_1, code="QA-BLK-012",
            defaults={
                "title": "Análise de Valores-Limite (BVA) em Idade e Quantidades",
                "slug": "analise-valores-limite-idade",
                "target_element": "input#user-age",
                "oracle_description": "Fronteiras exatas 17/18 e 120/121 devem ser respeitadas rigorosamente sem exceção.",
                "investigation_scope": "Teste os limites inferior e superior do campo de idade sob a técnica de Boundary Value Analysis.",
                "xp_reward": 75,
                "order": 2
            }
        )

        mod7_2, _ = Module.objects.update_or_create(
            track=t7, number=2,
            defaults={
                "title": "Tabelas de Decisão e Transição de Estados",
                "guidance_level": GuidanceLevel.SUBTLE,
                "description": "Mapeamento de combinações complexas de condições lógicas sem acesso ao código-fonte.",
                "order": 2
            }
        )
        Topic.objects.update_or_create(
            module=mod7_2, code="QA-BLK-021",
            defaults={
                "title": "Tabela de Decisão em Regras de Desconto e Frete",
                "slug": "tabela-decisao-desconto-frete",
                "target_element": "input#coupon-code",
                "oracle_description": "Cada regra da tabela de decisão deve produzir o efeito oracular previsto.",
                "investigation_scope": "Construa a matriz de decisão observável e confronte cada cenário contra a saída do mini-site.",
                "xp_reward": 90,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod7_2, code="QA-BLK-022",
            defaults={
                "title": "Teste de Transição de Estados Puramente Observável",
                "slug": "transicao-estados-observavel",
                "target_element": "select#payment-method",
                "oracle_description": "Transições ilegais de estados de pedido observáveis devem ser bloqueadas com feedback consistente.",
                "investigation_scope": "Mapeie os estados observáveis e tente forçar transições não permitidas.",
                "xp_reward": 95,
                "order": 2
            }
        )

        mod7_3, _ = Module.objects.update_or_create(
            track=t7, number=3,
            defaults={
                "title": "Teste de Ataque Baseado em Erros e Heurísticas",
                "guidance_level": GuidanceLevel.AUTONOMOUS,
                "description": "Investigação autônoma orientada por suposição de erros (Error Guessing) e heurísticas empíricas.",
                "order": 3
            }
        )
        Topic.objects.update_or_create(
            module=mod7_3, code="QA-BLK-031",
            defaults={
                "title": "Suposição de Erros (Error Guessing) no Checkout",
                "slug": "suposicao-erros-checkout",
                "target_element": "form#checkout-form",
                "oracle_description": "O sistema deve ser resiliente a ações erráticas, cliques múltiplos e dados atípicos do usuário.",
                "investigation_scope": "Aplique suposição de falhas típicas de front-end para revelar defeitos ocultos sem pistas.",
                "xp_reward": 120,
                "order": 1
            }
        )
        Topic.objects.update_or_create(
            module=mod7_3, code="QA-BLK-032",
            defaults={
                "title": "Auditoria Comportamental Autônoma Caixa Preta",
                "slug": "auditoria-comportamental-autonoma",
                "target_element": "form#checkout-form",
                "oracle_description": "A conformidade total com a especificação funcional de caixa preta deve ser demonstrada com nota 100%.",
                "investigation_scope": "Realize a homologação autônoma de caixa preta cobrindo todas as frentes comportamentais.",
                "xp_reward": 130,
                "order": 2
            }
        )

        self.stdout.write(self.style.SUCCESS("Catálogo das Trilhas 00, 01, 04, 05, 07 e 12 semeado com sucesso no banco de dados!"))
