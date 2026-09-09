# ADR-0002: Isolamento dos Mini-Sites de Trilha via Sandboxed Iframe e postMessage

- **Data**: 2026-09-09
- **Status**: Aceito
- **Contexto da Decisão**: Seções 1, 2 e 8 do Prompt Mestre

### Contexto
O conceito central do QALearning é que cada trilha representa um **mini-site independente**, com sua própria identidade visual, propósito, paleta de cores e personalidade. O aluno deve ter a sensação real de estar navegando e testando um produto de software autêntico (ex: e-commerce, dashboard de métricas, console de API, mini-app bancário). 
Dois problemas críticos precisavam ser resolvidos:
1. **Isolamento de Estilos e Scripts**: Nenhum estilo CSS, font face, script global ou variável CSS do mini-site pode vazar para a interface do Hub, e vice-versa.
2. **Comunicação Controlada e Segura**: O Hub precisa ser notificado quando o aluno interage com elementos sob teste ou quando certos comportamentos/bugs são disparados no mini-site, sem quebrar a fronteira de segurança do navegador.

### Decisão
1. **Embed via `<iframe>` Sandboxed**:
   - Cada mini-site é construído como uma aplicação web independente servida pelo Django em rotas exclusivas (`/mini-sites/<trilha>/`).
   - No frontend do Hub (Next.js), o mini-site é embutido através de um `<iframe sandbox="allow-scripts allow-forms allow-same-origin">`.
   - O iframe provê isolamento nativo de DOM, contexto de renderização e CSS do navegador, impedindo qualquer vazamento ou conflito visual.
2. **Canal de Comunicação via `window.postMessage` Tipado**:
   - Comunicação estritamente restrita a um contrato de eventos versionado (`protocol: 'QA_LEARNING_V1'`).
   - Tanto o receptor (Hub) quanto o emissor (Mini-site) validam a propriedade `origin` da mensagem para impedir injeções ou mensagens forjadas de terceiros.
   - O payload transporta identificadores de eventos de bug, metadados de telemetria e o seed ativo da sessão.

### Alternativas Descartadas e Por Quê
- **Renderizar os mini-sites como componentes React dentro da mesma árvore DOM do Hub**: Descartada categoricamente. Provocaria colisão inevitável de seletores CSS, poluição de variáveis de tema, conflitos de bibliotecas JS e impediria simular recarregamento completo de página, quebra intencional de DOM ou falhas de rede no nível de documento.
- **Arquitetura de Micro-frontends via Module Federation**: Descartada por trazer complexidade excessiva de build e tooling sem oferecer o isolamento nativo de sandbox que o `<iframe>` já entrega por especificação web.
- **Comunicação exclusiva via Polling de Banco de Dados**: Descartada porque adicionaria latência e overhead de requisições ao backend para eventos que exigem feedback instantâneo na UI do laboratório.
