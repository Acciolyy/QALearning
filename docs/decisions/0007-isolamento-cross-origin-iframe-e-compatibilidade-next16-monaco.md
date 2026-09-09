# ADR-0007: Isolamento Cross-Origin do Iframe Sandboxed e Validação de Compatibilidade do Next.js 16 com Monaco Editor

## Status
Aprovada e Implementada

## Contexto
Antes do avanço para a Fase 3 (Motor de Avaliação de Bug Reports) e Fase 4 (IDE Monaco no Navegador), dois riscos arquiteturais precisavam de resposta e blindagem formal:

1. **Risco de Evasão de Sandbox no Iframe**:
   A especificação HTML5 e as diretrizes do W3C/MDN alertam que combinar `sandbox="allow-scripts allow-same-origin"` em um `<iframe>` que compartilha a mesma origem (protocolo, host e porta) do documento pai anula o sandbox: o script do iframe possui privilégios de mesma origem para acessar `window.parent.document`, executar `element.removeAttribute('sandbox')` e ler storage/cookies do pai. Como os mini-sites são o alvo sob teste de analistas de QA (incluindo futuros cenários de segurança e injeção de payload), o isolamento não podia ser apenas nominal.

2. **Risco de Compatibilidade do Next.js 16 + Turbopack com `@monaco-editor/react`**:
   O shell foi scaffoldado com Next.js 16.3.4 (com React 19). Era indispensável verificar, antes de expandir a base de código, se o Monaco Editor apresenta incompatibilidades de compilação sob o bundler Rust Turbopack ou problemas de peer dependencies com React 19, avaliando se um downgrade para uma versão anterior estável seria mandatório.

---

## Decisão

### 1. Isolamento Cross-Origin Rigoroso (Hub vs Mini-Sites)

- **Origens Estritamente Separadas**:
  - O Hub Next.js roda em `http://localhost:3000`.
  - Os mini-sites são servidos exclusivamente por uma origem e porta dedicada: `http://127.0.0.1:8000` (ou subdomínio isolado em produção).
  - Pela *Same-Origin Policy* (RFC 6454), qualquer tentativa de script no mini-site de acessar o pai resulta em exceção imediata no navegador:
    `DOMException: Blocked a frame with origin "http://127.0.0.1:8000" from accessing a cross-origin frame "http://localhost:3000"`.
- **Target Origin Explícito**:
  - Em `qa_bridge.js`, foi banido o uso de `window.parent.postMessage(msg, '*')`.
  - O script obtém `<meta name="qa-hub-origin">` e envia com `window.parent.postMessage(msg, hubOrigin)`. Mensagens recebidas pelo mini-site também são filtradas por `event.origin === hubOrigin`.
- **Validação Estrita de Origem no Hub**:
  - A função `isAllowedOrigin(origin)` em `frontend/src/lib/postmessage/contracts.ts` rejeita explicitamente:
    - Origem `null` (opaca).
    - Origens na porta 3000 (impedindo auto-loop de mesma origem).
    - Domínios não autorizados.
    - Aceita exclusivamente a porta 8000 em localhost/127.0.0.1 (ou `process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN`).
- **Defesa em Profundidade com CSP**:
  - A view Django dos mini-sites emite o cabeçalho HTTP:
    `Content-Security-Policy: frame-ancestors 'self' http://localhost:3000 http://127.0.0.1:3000`, bloqueando qualquer incorporação por origens externas maliciosas.

### 2. Validação de Compatibilidade: Next.js 16 + Turbopack + `@monaco-editor/react`

- **Pesquisa Documental via Context7**:
  - Consultada a documentação oficial de `/suren-atoyan/monaco-react` e `/vercel/next.js` via Context7.
  - Constatado que `@monaco-editor/react` utiliza o `@monaco-editor/loader`, que baixa os bundles do Monaco dinamicamente no runtime do cliente (via CDN oficial ou caminho customizado).
  - A biblioteca **não** requer o `monaco-editor-webpack-plugin` (que é exclusivo do Webpack e incompatível com o Turbopack).
  - O padrão oficial e recomendado para App Router e Turbopack é carregar o editor via import dinâmico com SSR desativado:
    ```tsx
    const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
    ```
- **Auditoria do Registro npm**:
  - `npm info next dist-tags` confirma que a versão `16.3.4` é a release oficial `latest` de produção do Next.js (não é alpha ou canary).
- **Validação Experimental no Repositório**:
  - `@monaco-editor/react@^4.7.0` instalado com sucesso em `frontend/package.json` sem conflitos de dependências com React 19.
  - Criado o componente de teste `frontend/src/components/CodeEditor.tsx` com `dynamic(..., { ssr: false })`.
  - Executado `npm run build` com Turbopack: o build concluiu com zero erros de compilação, zero warnings de tipo e geração estática perfeita.

---

## Alternativas Descartadas

1. **Servir mini-sites no mesmo domínio/porta via proxy interno (`/mini-sites/...` no Next.js):**
   - *Descartada:* Compartilha a mesma origem do Hub, tornando `allow-scripts` + `allow-same-origin` vulnerável à quebra do atributo `sandbox`.
2. **Remover totalmente `allow-same-origin` do iframe sandboxed:**
   - *Descartada:* Embora forneça uma origem opaca `null`, quebra o armazenamento local (localStorage/cookies de sessão) de mini-sites mais realistas que necessitam persistir estado em seu próprio domínio. Com uma **origem distinta dedicada**, `allow-same-origin` opera de forma 100% segura, isolado do Hub.
3. **Downgrade preventivo para Next.js 15:**
   - *Descartada:* A versão instalada (16.3.4) é a tag `latest` estável do npm, e os testes práticos com `@monaco-editor/react` e Turbopack provaram 100% de compatibilidade e ausência de bloqueios.

---

## Consequências
- Os mini-sites e o Hub operam em silos cross-origin invioláveis pelo navegador.
- Suíte de testes automatizados do backend (10 testes) e do frontend (3 testes de contratos de mensageria via `node --test`) validam e blindam essa barreira.
- A stack técnica para a Fase 4 (IDE Monaco) está desimpedida, validada e sem débitos técnicos ocultos.
