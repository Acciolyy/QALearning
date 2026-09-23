from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Executa o seed completo do banco de dados (trilhas, catálogos declarativos YAML e gamificação)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== [1/3] Semeando Catálogo de Trilhas, Módulos e Tópicos ==="))
        call_command('seed_tracks')

        self.stdout.write(self.style.NOTICE("\n=== [2/3] Carregando Catálogos YAML de Behaviors e Oráculos ==="))
        call_command('load_catalogs')

        self.stdout.write(self.style.NOTICE("\n=== [3/3] Semeando Gamificação, Badges e Perfil Inicial ==="))
        call_command('seed_gamification')

        self.stdout.write(self.style.SUCCESS("\n✔ Banco de dados semeado com sucesso! Todas as 15 trilhas, catálogos e gamificação estão prontos."))
