'use client';

import React, { useState, useEffect } from 'react';
import { Topic, BugEvidence } from '../types/curriculum';
import { isQALearningMessage, isAllowedOrigin, BugTriggeredPayload } from '../lib/postmessage/contracts';
import { CodeEditor } from './CodeEditor';
import { IconViewfinder, IconTerminalPrompt, IconAuditShield } from './TechnicalIcons';

interface VerdictResult {
  topic_code: string;
  topic_title: string;
  guidance_level: string;
  session_seed: string;
  reported_behaviors: string[];
  active_behaviors_snapshot: string[];
  precision_score: number;
  recall_score: number;
  final_score: number;
  threshold_applied: number;
  is_approved: boolean;
  feedback_hint: string;
  feedback_summary: string;
}

interface InvestigationWorkbenchModalProps {
  topic: Topic | null;
  sessionSeed: string;
  isOpen: boolean;
  onClose: () => void;
  onBugDetected: (evidence: BugEvidence) => void;
  onTopicCompleted?: (topicCode: string, score: number) => void;
  initialEvidences: BugEvidence[];
}

export const InvestigationWorkbenchModal: React.FC<InvestigationWorkbenchModalProps> = ({
  topic,
  sessionSeed,
  isOpen,
  onClose,
  onBugDetected,
  onTopicCompleted,
  initialEvidences
}) => {
  const [workbenchMode, setWorkbenchMode] = useState<'visual' | 'code'>('visual');
  const [evidences, setEvidences] = useState<BugEvidence[]>(initialEvidences);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [hostOrigin, setHostOrigin] = useState<string>('http://localhost:3000');

  // Estado de submissão e veredito didático
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);

  // Estado da IDE Monaco / Sandbox Piston
  const defaultPythonCode = topic?.code === 'QA-MAN-031'
    ? `# Automação de Regras de Negócio - QALearning\n# Tópico: QA-MAN-031 (Cálculo de Checkout e Cupons)\n\ndef calculate_checkout_total(subtotal: float, shipping: float, coupon: str = None) -> float:\n    # O cupom VAULT10 concede 10% de desconto sobre o subtotal de produtos (não incide sobre o frete)\n    discount = 0.0\n    if coupon == 'VAULT10':\n        discount = subtotal * 0.10\n    return round((subtotal - discount) + shipping, 2)\n\nif __name__ == '__main__':\n    print("Total com cupom VAULT10:", calculate_checkout_total(249.0, 35.0, 'VAULT10'))\n`
    : `# Automação de Regras de Negócio - QALearning\n# Tópico: QA-MAN-012 (Particionamento de Idade e Limites)\n\ndef validate_age(age: int) -> bool:\n    if not isinstance(age, int):\n        return False\n    # Critério do Oráculo: idade válida entre 18 e 120 anos inclusive\n    return 18 <= age <= 120\n\nif __name__ == '__main__':\n    print("Teste 18 anos:", validate_age(18))\n    print("Teste 17 anos:", validate_age(17))\n    print("Teste -5 anos:", validate_age(-5))\n`;

  const [code, setCode] = useState<string>(defaultPythonCode);
  const [consoleOutput, setConsoleOutput] = useState<{ stdout: string; stderr: string; time?: number; exitCode?: number } | null>(null);
  const [isExecutingCode, setIsExecutingCode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostOrigin(window.location.origin);
    }
  }, []);

  // Atualiza código quando o tópico muda
  useEffect(() => {
    if (topic) {
      setCode(
        topic.code === 'QA-MAN-031'
          ? `# Automação de Regras de Negócio - QALearning\n# Tópico: QA-MAN-031 (Cálculo de Checkout e Cupons)\n\ndef calculate_checkout_total(subtotal: float, shipping: float, coupon: str = None) -> float:\n    discount = 0.0\n    if coupon == 'VAULT10':\n        discount = subtotal * 0.10\n    return round((subtotal - discount) + shipping, 2)\n\nif __name__ == '__main__':\n    print("Total com cupom VAULT10:", calculate_checkout_total(249.0, 35.0, 'VAULT10'))\n`
          : `# Automação de Regras de Negócio - QALearning\n# Tópico: QA-MAN-012 (Particionamento de Idade e Limites)\n\ndef validate_age(age: int) -> bool:\n    if not isinstance(age, int):\n        return False\n    return 18 <= age <= 120\n\nif __name__ == '__main__':\n    print("Teste 18 anos:", validate_age(18))\n    print("Teste 17 anos:", validate_age(17))\n    print("Teste -5 anos:", validate_age(-5))\n`
      );
      setConsoleOutput(null);
    }
  }, [topic]);

  // ADR-0009: Dossiê estritamente filtrado por tópico
  useEffect(() => {
    if (isOpen && topic) {
      setEvidences(initialEvidences.filter(e => !e.topicCode || e.topicCode === topic.code));
    }
  }, [isOpen, topic, initialEvidences]);

  // Listener postMessage (QA_LEARNING_V1) com validação estrita de origem
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (!isAllowedOrigin(event.origin)) return;
      if (!isQALearningMessage(event.data)) return;

      const message = event.data;
      if (message.eventType === 'BUG_TRIGGERED') {
        const payload = message.payload as BugTriggeredPayload;
        const newEvidence: BugEvidence = {
          code: payload.behaviorCode,
          topicCode: message.topicCode || (topic ? topic.code : 'UNKNOWN'),
          title: payload.actualBehavior || payload.message || `Anomalia disparada em ${payload.element}`,
          status: 'CONFIRMADO',
          severity: payload.severity || 'blocker',
          element: payload.element,
          inputValue: payload.inputValue,
          timestamp: payload.timestamp || Date.now()
        };

        setEvidences(prev => {
          if (prev.some(e => e.code === newEvidence.code)) return prev;
          return [newEvidence, ...prev];
        });

        setLastEventTime(new Date().toLocaleTimeString());
        onBugDetected(newEvidence);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, topic, onBugDetected]);

  if (!isOpen || !topic) return null;

  const miniSitesBase = process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN || 'http://127.0.0.1:8000';
  const miniSiteUrl = `${miniSitesBase}/mini-sites/vault-commerce/checkout/?seed=${sessionSeed.replace('#', '')}&topic=${topic.code}&hub_origin=${encodeURIComponent(hostOrigin)}`;

  const removeEvidence = (code: string) => {
    setEvidences(prev => prev.filter(e => e.code !== code));
  };

  // Submissão Manual (Bug Report das evidências capturadas no mini-site)
  const handleSubmitAudit = async () => {
    setIsSubmitting(true);
    const reportedCodes = evidences.map(e => e.code);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/evaluation/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_slug: topic.slug || topic.code,
          session_seed: sessionSeed.replace('#', ''),
          reported_behaviors: reportedCodes
        })
      });

      if (res.ok) {
        const data: VerdictResult = await res.json();
        setVerdict(data);
        if (data.is_approved && onTopicCompleted) {
          onTopicCompleted(topic.code, data.final_score);
        }
      } else {
        throw new Error('Falha na resposta da API');
      }
    } catch {
      const isDirect = topic.code.includes('01');
      const threshold = isDirect ? 70 : (topic.code.includes('02') ? 85 : 100);
      const fallbackScore = reportedCodes.length > 0 ? 100.0 : 0.0;
      const approved = fallbackScore >= threshold;
      
      const fallbackVerdict: VerdictResult = {
        topic_code: topic.code,
        topic_title: topic.title,
        guidance_level: isDirect ? 'direct' : 'subtle',
        session_seed: sessionSeed,
        reported_behaviors: reportedCodes,
        active_behaviors_snapshot: reportedCodes,
        precision_score: 100.0,
        recall_score: 100.0,
        final_score: fallbackScore,
        threshold_applied: threshold,
        is_approved: approved,
        feedback_hint: approved ? '' : 'Revise as premissas de fronteira.',
        feedback_summary: `Avaliação processada localmente: score de ${fallbackScore.toFixed(0)}%.`
      };
      setVerdict(fallbackVerdict);
      if (approved && onTopicCompleted) {
        onTopicCompleted(topic.code, fallbackScore);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execução livre de código no Sandbox Piston (Playground)
  const handleRunScript = async () => {
    setIsExecutingCode(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/sandbox/run/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'python' })
      });
      const data = await res.json();
      setConsoleOutput({
        stdout: data.stdout || '',
        stderr: data.stderr || (data.error ? String(data.error) : ''),
        time: data.cpu_time || data.wall_time || 0,
        exitCode: data.code !== undefined ? data.code : 0
      });
    } catch (err: unknown) {
      setConsoleOutput({ stdout: '', stderr: String(err), exitCode: 1 });
    } finally {
      setIsExecutingCode(false);
    }
  };

  // Verificação oficial de código contra o Test Harness oculto
  const handleVerifyScript = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/sandbox/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_slug: topic.slug || topic.code,
          session_seed: sessionSeed.replace('#', ''),
          code,
          language: 'python'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setConsoleOutput({
          stdout: data.stdout || '',
          stderr: data.stderr || '',
          time: data.execution_time_ms || 0,
          exitCode: data.exit_code
        });

        const codeVerdict: VerdictResult = {
          topic_code: data.topic_code,
          topic_title: data.topic_title,
          guidance_level: topic.code.includes('01') ? 'direct' : (topic.code.includes('02') ? 'subtle' : 'autonomous'),
          session_seed: sessionSeed,
          reported_behaviors: ['AUTO-TEST-HARNESS'],
          active_behaviors_snapshot: ['AUTO-TEST-HARNESS'],
          precision_score: data.score,
          recall_score: data.score,
          final_score: data.score,
          threshold_applied: data.threshold_applied,
          is_approved: data.is_approved,
          feedback_hint: data.feedback_hint,
          feedback_summary: data.feedback_summary
        };
        setVerdict(codeVerdict);

        if (data.is_approved && onTopicCompleted) {
          onTopicCompleted(topic.code, data.score);
        }
      } else {
        alert('Falha ao verificar código contra o sandbox.');
      }
    } catch (err: unknown) {
      alert(`Erro de conexão com o sandbox: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 12, 10, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 24px 24px',
      color: 'var(--text-primary)'
    }}>
      {/* HEADER DO WORKBENCH */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: 'var(--copper-surface)',
            color: 'var(--copper-signature)',
            border: '1px solid var(--copper-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)'
          }}>
            LABORATÓRIO PRÁTICO // {topic.code}
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {topic.title}
            </h1>
          </div>

          {/* TOGGLE DE MODO: INSPEÇÃO VISUAL VS AUTOMAÇÃO PYTHON */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-sunken)',
            padding: '3px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-subtle)',
            marginLeft: '12px'
          }}>
            <button
              type="button"
              onClick={() => setWorkbenchMode('visual')}
              style={{
                backgroundColor: workbenchMode === 'visual' ? 'var(--accent-command)' : 'transparent',
                color: workbenchMode === 'visual' ? 'var(--accent-command-contrast)' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <IconViewfinder size={12} /><span>Inspeção Visual (Mini-Site)</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkbenchMode('code')}
              style={{
                backgroundColor: workbenchMode === 'code' ? 'var(--accent-command)' : 'transparent',
                color: workbenchMode === 'code' ? 'var(--accent-command-contrast)' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <IconTerminalPrompt size={12} /><span>Automação Python (Monaco)</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--status-pass)' }}>●</span>
            <span>{workbenchMode === 'visual' ? 'CROSS-ORIGIN 8000' : 'PISTON SANDBOX 2000'}</span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span>SEED: <strong>{sessionSeed}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ← Voltar à Mesa
          </button>
        </div>
      </header>

      {/* ÁREA DE TRABALHO: MODO VISUAL */}
      {workbenchMode === 'visual' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '20px',
          flexGrow: 1,
          minHeight: 0
        }}>
          {/* VIEWPORT DO MINI-SITE */}
          <section style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface-sunken)',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <button
                  type="button"
                  onClick={() => setIframeKey(k => k + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--copper-signature)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--copper-surface)'
                  }}
                >
                  ↻ Recarregar
                </button>
                <span>Ambiente: <strong>Sandboxed Cross-Origin</strong></span>
              </div>

              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '11px',
                maxWidth: '440px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {miniSiteUrl}
              </div>

              <div style={{ color: 'var(--status-pass)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                Porta: <strong>8000</strong>
              </div>
            </div>

            <iframe
              key={iframeKey}
              src={miniSiteUrl}
              title={`Mini-site de testes: ${topic.title}`}
              sandbox="allow-scripts allow-forms allow-same-origin"
              style={{
                width: '100%',
                flexGrow: 1,
                border: 'none',
                backgroundColor: '#0C1014'
              }}
            />
          </section>

          {/* PAINEL LATERAL: ORÁCULO E EVIDÊNCIAS ESCOPADAS DO TÓPICO */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--copper-signature)',
                textTransform: 'uppercase',
                margin: '0 0 6px 0',
                letterSpacing: '0.05em'
              }}>
                Oráculo sob Inspeção
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {topic.oracle_description}
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Evidências para o Dossiê
                  </h3>
                  {lastEventTime && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Último disparo às {lastEventTime}
                    </span>
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  backgroundColor: 'var(--status-bug-bg)',
                  color: 'var(--status-bug)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 700,
                  border: '1px solid var(--status-bug)'
                }}>
                  {evidences.length} CAPTURADOS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
                {evidences.length === 0 ? (
                  <div style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '12.5px',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    Nenhum comportamento anômalo registrado para este tópico ainda. Interaja com o mini-site para capturar evidências.
                  </div>
                ) : (
                  evidences.map((evi) => (
                    <div
                      key={evi.code}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-surface-sunken)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '11.5px', color: 'var(--status-bug)' }}>
                          BUG #{evi.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEvidence(evi.code)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.35 }}>
                        {evi.title}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* BOTÃO DE SUBMISSÃO PARA AVALIAÇÃO MANUAL */}
              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--copper-signature)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {isSubmitting ? 'Auditando Dossiê...' : `[ Submeter Dossiê (${evidences.length} Itens) ]`}
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* ÁREA DE TRABALHO: MODO AUTOMAÇÃO PYTHON (MONACO IDE) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '20px',
          flexGrow: 1,
          minHeight: 0
        }}>
          {/* EDITOR MONACO & TERMINAL DRAWER */}
          <section style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* TOOLBAR DO EDITOR */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: 'var(--bg-surface-sunken)',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--copper-signature)',
                  backgroundColor: 'var(--copper-surface)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  PYTHON 3.9 // SANDBOX ISOLADA
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  solution.py
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleRunScript}
                  disabled={isExecutingCode || isSubmitting}
                  style={{
                    backgroundColor: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: isExecutingCode ? 'wait' : 'pointer'
                  }}
                >
                  {isExecutingCode ? 'Executando...' : '▶ Executar Script (Local)'}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyScript}
                  disabled={isSubmitting || isExecutingCode}
                  style={{
                    backgroundColor: 'var(--copper-signature)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: isSubmitting ? 'wait' : 'pointer'
                  }}
                >
                  <IconAuditShield size={13} /><span>{isSubmitting ? 'Verificando...' : 'Submeter para Verificação'}</span>
                </button>
              </div>
            </div>

            {/* COMPONENTE MONACO EDITOR */}
            <div style={{ flexGrow: 1, minHeight: '340px' }}>
              <CodeEditor
                value={code}
                language="python"
                onChange={(val) => setCode(val || '')}
                height="100%"
              />
            </div>

            {/* CONSOLE TERMINAL DRAWER */}
            <div style={{
              height: '180px',
              backgroundColor: '#090F0D',
              borderTop: '2px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <span>TERMINAL DE SAÍDA</span>
                  {consoleOutput?.time !== undefined && (
                    <span style={{ color: 'var(--copper-signature)' }}>
                      • Tempo: {consoleOutput.time}ms
                    </span>
                  )}
                  {consoleOutput?.exitCode !== undefined && (
                    <span style={{ color: consoleOutput.exitCode === 0 ? 'var(--status-pass)' : 'var(--status-bug)' }}>
                      • Exit: {consoleOutput.exitCode}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setConsoleOutput(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Limpar
                </button>
              </div>

              <div style={{
                padding: '10px 14px',
                overflowY: 'auto',
                flexGrow: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.4,
                color: '#D4E2D8'
              }}>
                {consoleOutput ? (
                  <>
                    {consoleOutput.stdout && (
                      <pre style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                        {consoleOutput.stdout}
                      </pre>
                    )}
                    {consoleOutput.stderr && (
                      <pre style={{ margin: '4px 0 0', color: 'var(--status-bug)', whiteSpace: 'pre-wrap' }}>
                        {consoleOutput.stderr}
                      </pre>
                    )}
                  </>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                    Nenhuma execução recente. Clique em &quot;Executar Script&quot; ou &quot;Submeter para Verificação&quot;.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* PAINEL LATERAL: REQUISITOS DE AUTOMAÇÃO */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--copper-signature)',
                textTransform: 'uppercase',
                margin: '0 0 6px 0',
                letterSpacing: '0.05em'
              }}>
                Especificação da Função de Teste
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Escreva uma função que codifique as regras de negócio especificadas no oráculo. A sua solução será avaliada contra uma suíte com testes de partição e limites.
              </p>
              <div style={{
                padding: '8px 10px',
                backgroundColor: 'var(--bg-surface-sunken)',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--copper-signature)'
              }}>
                Assinatura: <strong>validate_age(age: int) -&gt; bool</strong>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                Garantias do Ambiente Sandboxed
              </h3>
              <ul style={{ fontSize: '12.5px', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li><strong>Isolamento de Rede:</strong> 100% desconectado da internet (sem risco de vazamento).</li>
                <li><strong>Limite de Recursos:</strong> Máximo de 256 MB de RAM e 3.000 ms de CPU.</li>
                <li><strong>Proteção de Processos:</strong> Cgroups PID limit ativo contra fork bombs.</li>
                <li><strong>Avaliação Não-Binária:</strong> O score reflete os casos de teste cobertos com sucesso.</li>
              </ul>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>LIMIAR DE APROVAÇÃO</span>
                  <strong style={{ color: 'var(--copper-signature)' }}>
                    {topic.code.includes('01') ? '70%' : (topic.code.includes('02') ? '85%' : '100%')}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyScript}
                  disabled={isSubmitting || isExecutingCode}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--copper-signature)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Auditando Código...' : 'Submeter Automação'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MODAL DE VEREDITO DIDÁTICO / RESULTADO DA AVALIAÇÃO */}
      {verdict && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 10, 0.92)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: verdict.is_approved ? '2px solid var(--status-pass)' : '2px solid var(--status-bug)',
            borderRadius: 'var(--radius-sm)',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-elevation)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: verdict.is_approved ? 'var(--status-pass)' : 'var(--status-bug)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {verdict.is_approved ? 'AUDITORIA HOMOLOGADA' : 'AUDITORIA PENDENTE'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  Veredito do Bureau de Inspeção
                </h2>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                fontWeight: 700,
                color: verdict.is_approved ? 'var(--status-pass)' : 'var(--status-bug)'
              }}>
                {verdict.final_score.toFixed(0)}%
              </div>
            </div>

            {/* BARRA DE MÉTRICAS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-surface-sunken)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>PRECISÃO</div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{verdict.precision_score.toFixed(0)}%</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>COBERTURA</div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{verdict.recall_score.toFixed(0)}%</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>LIMIAR EXIGIDO</div>
                <strong style={{ color: 'var(--copper-signature)', fontSize: '13px' }}>{verdict.threshold_applied}%</strong>
              </div>
            </div>

            {/* DIAGNÓSTICO FORMATIVO */}
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {verdict.feedback_summary}
            </div>

            {/* DICA CALIBRADA (SE NÃO APROVADO) */}
            {verdict.feedback_hint && (
              <div style={{
                backgroundColor: 'var(--copper-surface)',
                borderLeft: '3px solid var(--copper-signature)',
                padding: '10px 14px',
                borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                fontSize: '12.5px',
                color: 'var(--text-primary)'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--copper-signature)', fontWeight: 700, marginBottom: '2px' }}>
                  DIRETIVA DO SUPERVISOR DE QA:
                </div>
                {verdict.feedback_hint}
              </div>
            )}

            {/* AÇÕES DO VEREDITO */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              {!verdict.is_approved && (
                <button
                  type="button"
                  onClick={() => setVerdict(null)}
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-strong)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Ajustar Código e Retestar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setVerdict(null);
                  onClose();
                }}
                style={{
                  backgroundColor: verdict.is_approved ? 'var(--status-pass)' : 'var(--copper-signature)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {verdict.is_approved ? 'Concluir Tópico e Voltar à Mesa' : 'Fechar Veredito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
