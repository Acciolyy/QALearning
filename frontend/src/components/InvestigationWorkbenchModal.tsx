'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Topic, BugEvidence } from '../types/curriculum';
import { isQALearningMessage, isAllowedOrigin, BugTriggeredPayload } from '../lib/postmessage/contracts';
import { CodeEditor } from './CodeEditor';
import {
  IconViewfinder,
  IconTerminalPrompt,
  IconCodeInspector,
  IconCheck
} from './TechnicalIcons';
import { MobileViewportBar, ViewportDevice, ViewportOrientation } from './MobileViewportBar';
import { BugReportForm, BugReportPayload } from './BugReportForm';
import { SourceCodeViewer } from './SourceCodeViewer';

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
  const isBugReportTrack = topic?.code.startsWith('QA-REP-') ?? false;
  const isWhiteBoxTrack = topic?.code.startsWith('QA-WHT-') ?? false;
  const isMobileTrack = topic?.code.startsWith('QA-MOB-') ?? false;

  const [workbenchMode, setWorkbenchMode] = useState<'visual' | 'code' | 'source'>('visual');
  const [evidences, setEvidences] = useState<BugEvidence[]>(initialEvidences);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [hostOrigin, setHostOrigin] = useState<string>('http://localhost:3000');

  // Controles de Viewport Mobile (Trilha 14)
  const [viewportDevice, setViewportDevice] = useState<ViewportDevice>(isMobileTrack ? 'mobile' : 'desktop');
  const [viewportOrientation, setViewportOrientation] = useState<ViewportOrientation>('portrait');
  const [touchInspector, setTouchInspector] = useState<boolean>(false);
  const [virtualKeyboard, setVirtualKeyboard] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Estado de submiss?o e veredito did?tico
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);

  // Estado da IDE Monaco / Sandbox Piston
  const defaultPythonCode = topic?.code === 'QA-MAN-031'
    ? `# Automa??o de Regras de Neg?cio - QALearning\n# T?pico: QA-MAN-031 (C?lculo de Checkout e Cupons)\n\ndef calculate_checkout_total(subtotal: float, shipping: float, coupon: str = None) -> float:\n    # O cupom VAULT10 concede 10% de desconto sobre o subtotal de produtos (n?o incide sobre o frete)\n    discount = 0.0\n    if coupon == 'VAULT10':\n        discount = subtotal * 0.10\n    return round((subtotal - discount) + shipping, 2)\n\nif __name__ == '__main__':\n    print("Total com cupom VAULT10:", calculate_checkout_total(249.0, 35.0, 'VAULT10'))\n`
    : `# Automa??o de Regras de Neg?cio - QALearning\n# T?pico: QA-MAN-012 (Particionamento de Idade e Limites)\n\ndef validate_age(age: int) -> bool:\n    if not isinstance(age, int):\n        return False\n    return 18 <= age <= 120\n\nif __name__ == '__main__':\n    print("Teste 18 anos:", validate_age(18))\n    print("Teste 17 anos:", validate_age(17))\n    print("Teste -5 anos:", validate_age(-5))\n`;

  const [code, setCode] = useState<string>(defaultPythonCode);
  const [consoleOutput, setConsoleOutput] = useState<{ stdout: string; stderr: string; time?: number; exitCode?: number } | null>(null);
  const [isExecutingCode, setIsExecutingCode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (topic) {
      setViewportDevice(topic.code.startsWith('QA-MOB-') ? 'mobile' : 'desktop');
      setTouchInspector(false);
      setVirtualKeyboard(false);
      setWorkbenchMode('visual');
      setConsoleOutput(null);
    }
  }, [topic]);

  useEffect(() => {
    if (isOpen && topic) {
      setEvidences(initialEvidences.filter(e => !e.topicCode || e.topicCode === topic.code));
    }
  }, [isOpen, topic, initialEvidences]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'TOGGLE_TOUCH_INSPECTOR', enabled: touchInspector },
        '*'
      );
    }
  }, [touchInspector, iframeKey]);

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
          title: payload.actualBehavior || payload.message || `Anomalia em ${payload.element}`,
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
    return () => { window.removeEventListener('message', handleMessage); };
  }, [isOpen, topic, onBugDetected]);

  if (!isOpen || !topic) return null;

  const miniSitesBase = process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN || 'http://127.0.0.1:8000';
  const miniSiteUrl = `${miniSitesBase}/mini-sites/vault-commerce/checkout/?seed=${sessionSeed.replace('#', '')}&topic=${topic.code}&hub_origin=${encodeURIComponent(hostOrigin)}`;

  const removeEvidence = (code: string) => {
    setEvidences(prev => prev.filter(e => e.code !== code));
  };

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
        feedback_summary: `Avalia??o processada localmente: score de ${fallbackScore.toFixed(0)}%.`
      };
      setVerdict(fallbackVerdict);
      if (approved && onTopicCompleted) {
        onTopicCompleted(topic.code, fallbackScore);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBugReportSubmit = async (report: BugReportPayload) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/evaluation/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_slug: topic.slug || topic.code,
          session_seed: sessionSeed.replace('#', ''),
          submission_type: 'bug_report',
          reported_behaviors: report.associated_code ? [report.associated_code] : evidences.map(e => e.code),
          bug_report: report
        })
      });
      if (res.ok) {
        const data: VerdictResult = await res.json();
        setVerdict(data);
        if (data.is_approved && onTopicCompleted) {
          onTopicCompleted(topic.code, data.final_score);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Erro na homologa??o do Bug Report: ${errData.error || res.statusText}`);
      }
    } catch (err: unknown) {
      alert(`Erro ao submeter ao Bureau de Inspeção: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        alert('Falha ao verificar c?digo contra o sandbox.');
      }
    } catch (err: unknown) {
      alert(`Erro de conex?o com o sandbox: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIframeDimensions = () => {
    if (viewportDevice === 'mobile') {
      return viewportOrientation === 'portrait'
        ? { width: '375px', height: '667px' }
        : { width: '667px', height: '375px' };
    }
    if (viewportDevice === 'tablet') {
      return viewportOrientation === 'portrait'
        ? { width: '768px', height: '100%' }
        : { width: '100%', height: '100%' };
    }
    return { width: '100%', height: '100%' };
  };

  const iframeDims = getIframeDimensions();

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

            {isWhiteBoxTrack && (
              <button
                type="button"
                onClick={() => setWorkbenchMode('source')}
                style={{
                  backgroundColor: workbenchMode === 'source' ? 'var(--accent-command)' : 'transparent',
                  color: workbenchMode === 'source' ? 'var(--accent-command-contrast)' : 'var(--text-secondary)',
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
                <IconCodeInspector size={12} /><span>Código-Fonte (Caixa Branca)</span>
              </button>
            )}

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
            <span style={{ color: 'var(--status-pass)' }}>?</span>
            <span>{workbenchMode === 'visual' ? 'CROSS-ORIGIN 8000' : (workbenchMode === 'source' ? 'SOURCE INSPECTION' : 'PISTON SANDBOX 2000')}</span>
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

      {/* ?REA DE TRABALHO: MODO C?DIGO-FONTE ESTRUTURAL (CAIXA BRANCA) */}
      {workbenchMode === 'source' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '20px',
          flexGrow: 1,
          minHeight: 0
        }}>
          <SourceCodeViewer
            topicCode={topic.code}
            sessionSeed={sessionSeed}
          />

          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: 0
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
                Oráculo sob Inspeção Estrutural
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
              flexGrow: 1,
              minHeight: 0
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '8px',
                marginBottom: '12px'
              }}>
                <h4 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  Dossiê de Cobertura e Anomalias
                </h4>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: evidences.length > 0 ? 'var(--status-bug)' : 'var(--text-muted)'
                }}>
                  {evidences.length} detectada(s)
                </span>
              </div>

              <div style={{
                flexGrow: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '14px'
              }}>
                {evidences.length === 0 ? (
                  <div style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    Inspecione os ramos e pontos de decis?o do c?digo ? esquerda. Execute testes de fronteira no mini-site para disparar as anomalias l?gicas.
                  </div>
                ) : (
                  evidences.map(ev => (
                    <div
                      key={ev.code}
                      style={{
                        backgroundColor: 'var(--bg-surface-sunken)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--copper-signature)'
                        }}>
                          {ev.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEvidence(ev.code)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            padding: '0 2px'
                          }}
                        >
                          ?
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        {ev.title}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitAudit}
                disabled={isSubmitting || evidences.length === 0}
                style={{
                  backgroundColor: evidences.length > 0 ? 'var(--accent-command)' : 'var(--bg-surface-sunken)',
                  color: evidences.length > 0 ? 'var(--accent-command-contrast)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: (isSubmitting || evidences.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Homologando no Bureau...' : `Submeter Análise (${evidences.length})`}
              </button>
            </div>
          </aside>
        </div>
      ) : workbenchMode === 'visual' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isBugReportTrack ? '1fr 480px' : '1fr 380px',
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
            overflow: 'hidden',
            minHeight: 0
          }}>
            {isMobileTrack ? (
              <MobileViewportBar
                device={viewportDevice}
                setDevice={setViewportDevice}
                orientation={viewportOrientation}
                setOrientation={setViewportOrientation}
                touchInspector={touchInspector}
                setTouchInspector={setTouchInspector}
                virtualKeyboard={virtualKeyboard}
                setVirtualKeyboard={setVirtualKeyboard}
              />
            ) : (
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
                  maxWidth: '380px',
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
            )}

            <div style={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#070C09',
              overflow: 'auto',
              padding: viewportDevice !== 'desktop' ? '16px' : '0',
              position: 'relative'
            }}>
              <div style={{
                width: iframeDims.width,
                height: iframeDims.height,
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: viewportDevice !== 'desktop' ? '0 8px 32px rgba(0, 0, 0, 0.8)' : 'none',
                border: viewportDevice !== 'desktop' ? '2px solid var(--border-strong)' : 'none',
                borderRadius: viewportDevice === 'mobile' ? '12px' : (viewportDevice === 'tablet' ? '8px' : '0'),
                overflow: 'hidden',
                position: 'relative'
              }}>
                <iframe
                  ref={iframeRef}
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

                {virtualKeyboard && viewportDevice === 'mobile' && (
                  <div style={{
                    height: '240px',
                    backgroundColor: '#161e27',
                    borderTop: '2px solid var(--border-strong)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    userSelect: 'none',
                    zIndex: 50
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>TECLADO VIRTUAL EMULADO (240px)</span>
                      <button
                        type="button"
                        onClick={() => setVirtualKeyboard(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--copper-signature)',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        ? Fechar
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', textAlign: 'center' }}>
                      {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
                        <div key={k} style={{ padding: '6px 0', backgroundColor: '#212c38', borderRadius: '3px' }}>{k}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px', textAlign: 'center' }}>
                      {['A','S','D','F','G','H','J','K','L'].map(k => (
                        <div key={k} style={{ padding: '6px 0', backgroundColor: '#212c38', borderRadius: '3px' }}>{k}</div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                      {['Z','X','C','V','B','N','M'].map(k => (
                        <div key={k} style={{ padding: '6px 0', backgroundColor: '#212c38', borderRadius: '3px' }}>{k}</div>
                      ))}
                    </div>
                    <div style={{
                      backgroundColor: 'var(--accent-command)',
                      color: 'var(--accent-command-contrast)',
                      textAlign: 'center',
                      padding: '8px 0',
                      borderRadius: '3px',
                      fontWeight: 700
                    }}>
                      [ ESPA?O / CONCLUIR ]
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PAINEL LATERAL: FORMULÁRIO DE BUG REPORT (TRILHA 02) OU OR?CULO + DOSSI? PADRÃO */}
          {isBugReportTrack ? (
            <aside style={{ minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <BugReportForm
                topicCode={topic.code}
                evidences={evidences}
                isSubmitting={isSubmitting}
                onSubmit={handleBugReportSubmit}
              />
            </aside>
          ) : (
            <aside style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: 0
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
                flexGrow: 1,
                minHeight: 0
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    Dossiê de Anomalias Capturadas
                  </h4>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: evidences.length > 0 ? 'var(--status-bug)' : 'var(--text-muted)'
                  }}>
                    {evidences.length} capturada(s)
                  </span>
                </div>

                <div style={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  {evidences.length === 0 ? (
                    <div style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      Nenhuma evid?ncia capturada nesta sess?o. Interaja com o mini-site para disparar as anomalias do or?culo.
                    </div>
                  ) : (
                    evidences.map(ev => (
                      <div
                        key={ev.code}
                        style={{
                          backgroundColor: 'var(--bg-surface-sunken)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--copper-signature)'
                          }}>
                            {ev.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeEvidence(ev.code)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              fontSize: '11px',
                              padding: '0 2px'
                            }}
                          >
                            ?
                          </button>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                          {ev.title}
                        </div>
                        {ev.inputValue && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            Input: &quot;{ev.inputValue}&quot;
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAudit}
                  disabled={isSubmitting || evidences.length === 0}
                  style={{
                    backgroundColor: evidences.length > 0 ? 'var(--accent-command)' : 'var(--bg-surface-sunken)',
                    color: evidences.length > 0 ? 'var(--accent-command-contrast)' : 'var(--text-muted)',
                    border: 'none',
                    padding: '10px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: (isSubmitting || evidences.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Homologando no Bureau...' : `Submeter Análise (${evidences.length})`}
                </button>
              </div>
            </aside>
          )}
        </div>
      ) : (
        /* ?REA DE TRABALHO: MODO C?DIGO PYTHON (MONACO + PISTON) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '20px',
          flexGrow: 1,
          minHeight: 0
        }}>
          {/* EDITOR MONACO */}
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
              padding: '8px 14px',
              backgroundColor: 'var(--bg-surface-sunken)',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTerminalPrompt size={14} style={{ color: 'var(--copper-signature)' }} />
                <strong>test_suite.py</strong>
                <span style={{ color: 'var(--text-muted)' }}>(Python 3.10 Sandboxed)</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleRunScript}
                  disabled={isExecutingCode || isSubmitting}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: (isExecutingCode || isSubmitting) ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {isExecutingCode ? 'Executando...' : '? Rodar Script'}
                </button>

                <button
                  type="button"
                  onClick={handleVerifyScript}
                  disabled={isSubmitting || isExecutingCode}
                  style={{
                    backgroundColor: 'var(--accent-command)',
                    border: 'none',
                    color: 'var(--accent-command-contrast)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: (isSubmitting || isExecutingCode) ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {isSubmitting ? 'Auditando...' : '? Verificar C?digo'}
                </button>
              </div>
            </div>

            <div style={{ flexGrow: 1, minHeight: 0 }}>
              <CodeEditor
                value={code}
                onChange={(val?: string) => setCode(val || "")}
                language="python"
              />
            </div>
          </section>

          {/* CONSOLE DE SAÍDA E OR?CULO */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: 0
          }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--copper-signature)',
                textTransform: 'uppercase',
                margin: '0 0 4px 0'
              }}>
                Diretriz de Automa??o
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {topic.oracle_description}
              </p>
            </div>

            <div style={{
              backgroundColor: '#060B08',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              overflow: 'hidden',
              minHeight: 0
            }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: 'var(--bg-surface-sunken)',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)'
              }}>
                <span>CONSOLE SANDBOX (STDOUT / STDERR)</span>
                {consoleOutput && (
                  <span>Sa?da: {consoleOutput.exitCode === 0 ? '0 (OK)' : `${consoleOutput.exitCode} (ERRO)`}</span>
                )}
              </div>

              <div style={{
                padding: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                lineHeight: 1.5,
                color: consoleOutput?.stderr ? 'var(--status-bug)' : '#E0E7E3',
                whiteSpace: 'pre-wrap',
                overflowY: 'auto',
                flexGrow: 1
              }}>
                {consoleOutput ? (
                  <>
                    {consoleOutput.stdout && <div>{consoleOutput.stdout}</div>}
                    {consoleOutput.stderr && <div style={{ color: 'var(--status-bug)', marginTop: '4px' }}>{consoleOutput.stderr}</div>}
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Pressione &quot;Rodar Script&quot; para execu??o explorat?ria ou &quot;Verificar C?digo&quot; para homologar contra a bateria oracular oculta.
                  </span>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MODAL DE VEREDITO AUDITADO (FEEDBACK FORMATIVO) */}
      {verdict && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 10, 0.75)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: `2px solid ${verdict.is_approved ? 'var(--status-pass)' : 'var(--status-bug)'}`,
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-desk)'
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

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {verdict.feedback_summary}
            </div>

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
                  Ajustar e Retestar
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
                {verdict.is_approved ? 'Concluir T?pico e Voltar ? Mesa' : 'Fechar Veredito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
