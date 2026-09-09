import json
from django.shortcuts import render, get_object_or_404
from django.views.decorators.clickjacking import xframe_options_exempt
from apps.curriculum.models import Topic
from apps.bug_engine.services import BugState

@xframe_options_exempt
def vault_commerce_checkout_view(request):
    """
    Mini-site: Vault Commerce Checkout Seguro.
    Laboratório interativo para investigação de fronteiras, sanitização de inputs
    e integridade de pedidos sob inspeção de QA.
    """
    seed = request.GET.get('seed', '481029')
    topic_code = request.GET.get('topic', 'QA-MAN-012')

    try:
        topic = Topic.objects.get(code=topic_code)
    except Topic.DoesNotExist:
        # Fallback para o primeiro tópico disponível
        topic = Topic.objects.first()

    bug_state = BugState(topic=topic, session_seed=seed, sample_size=2)
    active_codes = list(bug_state.active_codes)

    context = {
        'topic': topic,
        'seed': seed,
        'bug_state': bug_state,
        'active_bug_codes_json': json.dumps(active_codes),
        'active_behaviors': bug_state.active_behaviors,
    }

    return render(request, 'mini_sites/vault_commerce_checkout.html', context)
