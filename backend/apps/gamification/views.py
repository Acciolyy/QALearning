from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.curriculum.models import Track, Topic
from .models import AnalystProfile, Badge, UserBadge, PracticeActivity
from .services import GamificationService, StreakCalculationService
from .serializers import (
    AnalystProfileSerializer,
    StreakSummarySerializer,
    BadgeSerializer,
    UserBadgeSerializer,
    SkillTreeNodeSerializer
)

def get_current_user(request) -> User:
    if request.user and request.user.is_authenticated:
        return request.user
    # Fallback para ambiente local de desenvolvimento
    user, _ = User.objects.get_or_create(
        username='thiago',
        defaults={'first_name': 'Thiago', 'last_name': 'Accioly', 'email': 'thiago@qalearning.internal'}
    )
    return user

class ProfileAPIView(APIView):
    """
    Retorna o perfil do analista logado com XP, nível de carreira e status do streak.
    """
    def get(self, request):
        user = get_current_user(request)
        profile = GamificationService.get_or_create_profile(user)
        serializer = AnalystProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ToggleStreakAPIView(APIView):
    """
    Permite ao aluno ligar ou desligar completamente o mecanismo de sequência de prática.
    Quando desligado, o streak não é computado e é omitido da interface.
    """
    def post(self, request):
        user = get_current_user(request)
        profile = GamificationService.get_or_create_profile(user)
        
        # Pode passar explicitamente {"enabled": false} ou apenas dar toggle
        if 'enabled' in request.data:
            profile.streak_enabled = bool(request.data['enabled'])
        else:
            profile.streak_enabled = not profile.streak_enabled
        profile.save()

        return Response({
            'streak_enabled': profile.streak_enabled,
            'message': 'Sequência de prática habilitada' if profile.streak_enabled else 'Sequência de prática desabilitada com sucesso.'
        }, status=status.HTTP_200_OK)

class StreakAPIView(APIView):
    """
    Retorna a sequência global e a sequência específica de uma trilha (se solicitada).
    """
    def get(self, request):
        user = get_current_user(request)
        profile = GamificationService.get_or_create_profile(user)

        if not profile.streak_enabled:
            return Response({
                'enabled': False,
                'message': 'Sequência de prática desabilitada nas configurações do analista.'
            }, status=status.HTTP_200_OK)

        track_id = request.query_params.get('track')
        track = None
        if track_id:
            track = Track.objects.filter(id=track_id).first() or Track.objects.filter(number=track_id).first()

        global_streak = StreakCalculationService.calculate_streak(user=user)
        track_streak = StreakCalculationService.calculate_streak(user=user, track=track) if track else None

        return Response({
            'enabled': True,
            'global_streak': global_streak,
            'track_streak': track_streak
        }, status=status.HTTP_200_OK)

class BadgesAPIView(APIView):
    """
    Retorna todos os distintivos disponíveis no catálogo e os selos conquistados pelo analista.
    """
    def get(self, request):
        user = get_current_user(request)
        all_badges = Badge.objects.all()
        user_awards = UserBadge.objects.filter(user=user).select_related('badge')
        awarded_codes = {ub.badge.code: ub for ub in user_awards}

        catalog = []
        for b in all_badges:
            is_unlocked = b.code in awarded_codes
            award_info = awarded_codes.get(b.code)
            catalog.append({
                'id': b.id,
                'code': b.code,
                'name': b.name,
                'category': b.category,
                'description': b.description,
                'icon_symbol': b.icon_symbol,
                'rarity': b.rarity,
                'xp_reward': b.xp_reward,
                'is_unlocked': is_unlocked,
                'awarded_at': award_info.awarded_at.isoformat() if award_info else None,
                'evidence': award_info.evidence_context if award_info else None
            })

        return Response({
            'total_badges': len(catalog),
            'unlocked_count': len(user_awards),
            'badges': catalog
        }, status=status.HTTP_200_OK)

class SkillTreeAPIView(APIView):
    """
    Retorna a matriz de competências das 15 trilhas com nós e status de homologação.
    """
    def get(self, request):
        user = get_current_user(request)
        tracks = Track.objects.all().order_by('number')

        nodes = []
        for t in tracks:
            # Conta tópicos totais e aprovados
            topics = Topic.objects.filter(module__track=t)
            total_topics = topics.count()
            
            # Submissões aprovadas do usuário nesta trilha
            approved_topic_ids = set(
                PracticeActivity.objects.filter(user=user, track=t, is_approved=True)
                .values_list('topic_id', flat=True)
            )
            completed_topics = len(approved_topic_ids)

            # Determina status visual estilo Bureau de Inspeção
            if t.number == 1:
                if completed_topics >= total_topics and total_topics > 0:
                    node_status = 'HOMOLOGADO'
                else:
                    node_status = 'ATIVA'
            elif t.number <= 3:
                node_status = 'DISPONIVEL'
            else:
                node_status = 'BLOQUEADO'

            nodes.append({
                'track_id': t.id,
                'track_number': t.number,
                'name': t.name,
                'slug': t.slug,
                'category': t.category,
                'total_topics': total_topics,
                'completed_topics': completed_topics,
                'earned_xp': completed_topics * 75,
                'status': node_status
            })

        return Response({'tracks': nodes}, status=status.HTTP_200_OK)
