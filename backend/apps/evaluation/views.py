from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.curriculum.models import Topic
from .serializers import SubmissionInputSerializer, SubmissionDetailSerializer
from .services import EvaluationService

class SubmissionAPIView(APIView):
    """
    Submete a lista de anomalias encontradas na sessão de testes para avaliação
    pelo motor pedagógico não-binário do Hub.
    """
    def post(self, request):
        input_serializer = SubmissionInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        topic_slug = input_serializer.validated_data['topic_slug']
        session_seed = input_serializer.validated_data['session_seed']
        reported_behaviors = input_serializer.validated_data['reported_behaviors']

        # Busca por slug ou por code
        topic = Topic.objects.filter(slug=topic_slug).first() or Topic.objects.filter(code=topic_slug).first()
        if not topic:
            return Response(
                {"error": f"Tópico '{topic_slug}' não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        submission = EvaluationService.evaluate_submission(
            topic=topic,
            session_seed=session_seed,
            reported_codes=reported_behaviors
        )

        output_serializer = SubmissionDetailSerializer(submission)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
