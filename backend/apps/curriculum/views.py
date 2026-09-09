from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Track, Topic
from .serializers import TrackListSerializer, TrackDetailSerializer, TopicDetailSerializer
from apps.bug_engine.services import ScopedSeedService

class TrackListAPIView(generics.ListAPIView):
    """Retorna todas as trilhas ordenadas por número."""
    queryset = Track.objects.all().prefetch_related('modules')
    serializer_class = TrackListSerializer

class TrackDetailAPIView(generics.RetrieveAPIView):
    """Retorna os detalhes de uma trilha específica com seus módulos e tópicos."""
    queryset = Track.objects.all().prefetch_related('modules__topics')
    serializer_class = TrackDetailSerializer
    lookup_field = 'slug'

class TopicDetailAPIView(APIView):
    """
    Retorna o briefing do tópico e os comportamentos escopados ativados
    pela semente determinística (seed) da sessão.
    """
    def get(self, request, slug):
        topic = get_object_or_404(Topic.objects.prefetch_related('activities'), slug=slug)
        session_seed = request.query_params.get('seed', 'default-seed-100')

        # Resolução determinística e estritamente escopada ao tópico
        active_behaviors = ScopedSeedService.get_active_behaviors_for_session(
            topic=topic,
            session_seed=session_seed,
            sample_size=2
        )

        serializer = TopicDetailSerializer(
            topic,
            context={'active_behaviors': active_behaviors, 'request': request}
        )

        return Response({
            'session_seed': session_seed,
            'topic': serializer.data
        }, status=status.HTTP_200_OK)
