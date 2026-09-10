import json
from django.shortcuts import render
from django.views.decorators.clickjacking import xframe_options_exempt
from apps.curriculum.models import Topic
from apps.bug_engine.services import BugState

@xframe_options_exempt
def vault_commerce_checkout_view(request):
    """
    Mini-site: Vault Commerce Checkout Seguro.
    Laboratório interativo para investigação de fronteiras, sanitização de inputs
    e integridade de pedidos sob inspeção de QA.

    Isolamento Cross-Origin:
    Servido em porta/origem dedicada (ex: http://127.0.0.1:8000), distinta do Hub
    Next.js (http://localhost:3000).
    A política CSP restringe frame-ancestors estritamente ao Hub autorizado.
    """
    seed = request.GET.get('seed', '481029')
    topic_code = request.GET.get('topic', 'QA-MAN-012')
    hub_origin = request.GET.get('hub_origin', 'http://localhost:3000')

    try:
        topic = Topic.objects.get(code=topic_code)
    except Topic.DoesNotExist:
        topic = Topic.objects.first()

    bug_state = BugState(topic=topic, session_seed=seed, sample_size=2)
    active_codes = list(bug_state.active_codes)

    context = {
        'topic': topic,
        'seed': seed,
        'hub_origin': hub_origin,
        'bug_state': bug_state,
        'active_bug_codes_json': json.dumps(active_codes),
        'active_behaviors': bug_state.active_behaviors,
    }

    response = render(request, 'mini_sites/vault_commerce_checkout.html', context)
    # Defesa em profundidade: restringe frame-ancestors exclusivamente à origem autorizada do Hub
    response['Content-Security-Policy'] = f"frame-ancestors 'self' {hub_origin} http://localhost:3000 http://127.0.0.1:3000"
    return response

from django.http import JsonResponse
from .source_code_service import get_deinstrumented_effective_source

def source_code_inspection_view(request):
    """
    Endpoint seguro para visualizador de código de Caixa Branca (Trilha 06).
    Retorna o código-fonte de-instrumentado da função sob teste,
    sem tags de bug nem identificadores que revelem a semente (ADR-0015).
    """
    topic_code = request.GET.get('topic', 'QA-WHT-011')
    seed = request.GET.get('seed', '481029')

    try:
        topic = Topic.objects.get(code=topic_code)
    except Topic.DoesNotExist:
        topic = Topic.objects.first()

    bug_state = BugState(topic=topic, session_seed=seed, sample_size=2)
    active_codes = set(bug_state.active_codes)

    data = get_deinstrumented_effective_source(topic.code, active_codes)
    data['topic_code'] = topic.code
    data['seed'] = seed
    return JsonResponse(data)
