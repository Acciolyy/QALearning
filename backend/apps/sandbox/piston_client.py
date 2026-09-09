import json
import urllib.request
import urllib.error
from django.conf import settings

class PistonClient:
    """
    Cliente HTTP de alta performance para o motor sandboxed Piston.
    Executa jobs com isolamento hermético de rede e limites estritos de CPU/RAM.
    """
    BASE_URL = getattr(settings, 'PISTON_URL', 'http://127.0.0.1:2000')

    @classmethod
    def execute(
        cls,
        code: str,
        language: str = 'python',
        version: str = '3.9.4',
        filename: str = 'solution.py',
        extra_files: list = None,
        stdin: str = '',
        args: list = None,
        run_timeout: int = 3000,
        memory_limit: int = 268435456 # 256MB
    ) -> dict:
        files = [{'name': filename, 'content': code}]
        if extra_files:
            files.extend(extra_files)

        payload = {
            'language': language,
            'version': version,
            'files': files,
            'stdin': stdin,
            'args': args or [],
            'run_timeout': run_timeout,
            'run_cpu_time': run_timeout,
            'run_memory_limit': memory_limit
        }

        url = f"{cls.BASE_URL}/api/v2/execute"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                run_data = data.get('run', {})
                return {
                    'success': True,
                    'stdout': run_data.get('stdout', ''),
                    'stderr': run_data.get('stderr', ''),
                    'code': run_data.get('code'),
                    'signal': run_data.get('signal'),
                    'status': run_data.get('status'),
                    'cpu_time': run_data.get('cpu_time'),
                    'wall_time': run_data.get('wall_time'),
                    'memory': run_data.get('memory')
                }
        except urllib.error.HTTPError as e:
            err_content = e.read().decode('utf-8')
            return {
                'success': False,
                'error': f"HTTP {e.code}: {err_content}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
