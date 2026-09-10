# ADR-0016: Gravação Direta em UTF-8 e Proibição de Pipes de Shell entre Ambientes

- **Data**: 2026-09-10
- **Status**: Aceito
- **Contexto da Decisão**: Eliminação definitiva da corrupção de encoding em textos técnicos e didáticos; blindagem de processo contra rebaixamento de charset no ambiente híbrido Windows/WSL.

### Contexto
Durante a edição de componentes e interfaces na plataforma, identificou-se que palavras em português contendo caracteres acentuados (`decisão`, `código`, `à esquerda`, `lógicas`, `submissão`) tiveram seus caracteres não-ASCII convertidos silenciosamente no caractere ASCII 63 (`?`).

A causa raiz foi o fluxo de transporte textual intermediário: passar blocos de código ou texto através de pipelines do PowerShell para o WSL (`@'...'@ | wsl ...`). Nesses cenários, o pipeline do terminal utiliza codificações de console legadas (ASCII/Windows-1252), corrompendo irreversivelmente caracteres multibyte UTF-8. Numa plataforma de ensino de Engenharia de Software e QA, a exibição de textos degradados e a aceitação acrítica de evidências visuais corrompidas representam um falso positivo inaceitável.

### Decisão
1. **Gravação Direta com Encoding UTF-8 Explícito**:
   - Toda e qualquer criação ou edição de arquivos de código-fonte (`.ts`, `.tsx`, `.js`, `.py`), configurações (`.json`, `.yaml`), templates (`.html`) ou documentação (`.md`) deve ser realizada por canal direto com especificação compulsória de `encoding='utf-8'`.
   - Modificações automatizadas devem invocar primitivas de I/O de arquivo com charset explícito (`open(path, 'w', encoding='utf-8')` ou APIs de escrita dedicadas do ambiente/IDE).

2. **Proibição Terminante de Pipes de Shell entre Windows e WSL**:
   - É estritamente proibido passar conteúdo de arquivo através de redirecionamentos de stdin/stdout em linha de comando (`| wsl`, `echo "..." | wsl bash`, heredocs embutidos no PowerShell).
   - Scripts auxiliares de edição devem residir fisicamente em disco antes de serem executados pelo interpretador nativo, eliminando qualquer translado de texto não-escapado via console.

3. **Invariante Validada em Suíte Automatizada**:
   - A integridade de encoding deixa de ser uma verificação manual e torna-se um teste automatizado obrigatório em ambas as frentes do monorepo:
     - **Frontend**: Integrado ao `npm test` via `src/lib/workbench/encoding.test.mjs`.
     - **Backend**: Integrado ao `manage.py test` via `CurriculumAndBugEngineTestCase.test_utf8_encoding_integrity`.
   - O teste rejeita peremptoriamente qualquer arquivo contendo o padrão de corrupção (`[a-zA-Z]\?[a-zA-Z]`, `\b[A-Z]+\?[A-Z]+\b`, `\?[a-z]{2,}`), falhando o build antes que o defeito chegue à interface gráfica.

### Consequências
- A classe do problema é eliminada estruturalmente, impedindo regressões em sessões futuras de desenvolvimento e manutenção.
- O pipeline de integração contínua (CI) e os testes locais passam a barrar qualquer arquivo que sofra alteração com charset divergente.
