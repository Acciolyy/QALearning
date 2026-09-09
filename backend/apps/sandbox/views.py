from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.curriculum.models import Topic
from .serializers import RunCodeInputSerializer, VerifyCodeInputSerializer, CodeSubmissionDetailSerializer
from .services import CodeEvaluationService

class RunCodeAPIView(APIView):
    """
    Execução livre de scripts do aluno no sandbox Piston.
    Retorna stdout, stderr, tempo e código de saída sem nota oficial.
    """
    def post(self, request):
        serializer = RunCodeInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']
        language = serializer.validated_data.get('language', 'python')
        result = CodeEvaluationService.run_free_script(code=code, language=language)
        return Response(result, status=status.HTTP_200_OK)

class VerifyCodeAPIView(APIView):
    """
    Submissão oficial de código para verificação contra a suíte de testes ocultos.
    Retorna métricas não-binárias, limiar e feedback didático com dica escalonada.
    """
    def post(self, request):
        serializer = VerifyCodeInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        topic_slug = serializer.validated_data['topic_slug']
        session_seed = serializer.validated_data.get('session_seed', '481029')
        code = serializer.validated_data['code']
        language = serializer.validated_data.get('language', 'python')

        topic = Topic.objects.filter(slug=topic_slug).first() or Topic.objects.filter(code=topic_slug).first()
        if not topic:
            return Response({'error': f"Tópico '{topic_slug}' não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        submission = CodeEvaluationService.verify_solution(
            topic=topic,
            session_seed=session_seed,
            student_code=code,
            language=language
        )

        out_serializer = CodeSubmissionDetailSerializer(submission)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)
