import sys
from django.core.management.base import BaseCommand
from apps.bug_engine.loader import CatalogLoader

class Command(BaseCommand):
    help = 'Carrega e valida todos os catálogos declarativos de comportamentos e oráculos em YAML'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dir',
            type=str,
            help='Caminho opcional para diretório customizado de catálogos'
        )

    def handle(self, *args, **options):
        custom_dir = options.get('dir')
        self.stdout.write(self.style.NOTICE("Iniciando auditoria e carregamento de catálogos YAML..."))

        results = CatalogLoader.load_all(custom_dir)

        self.stdout.write(f"Arquivos processados: {results['files_processed']}")
        self.stdout.write(f"Tópicos atualizados com oráculos: {results['topics_updated']}")
        self.stdout.write(f"Comportamentos escopados sincronizados: {results['behaviors_synced']}")

        if results["errors"]:
            self.stdout.write(self.style.ERROR(f"\n{len(results['errors'])} erro(s) encontrado(s):"))
            for err in results["errors"]:
                self.stdout.write(self.style.ERROR(f"  - {err}"))
            sys.exit(1)
        else:
            self.stdout.write(self.style.SUCCESS("\nTodos os catálogos validados e sincronizados com sucesso."))
