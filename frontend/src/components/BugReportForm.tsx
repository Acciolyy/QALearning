'use client';

import React, { useState } from 'react';
import { BugEvidence } from '../types/curriculum';
import { IconAuditShield, IconCheck, IconCheckboxSquare } from './TechnicalIcons';

export interface BugReportPayload {
  title: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';
  priority: 'high' | 'medium' | 'low';
  associated_code: string;
  technical_justification?: string;
  identified_vices?: string[];
}

interface BugReportFormProps {
  topicCode: string;
  evidences: BugEvidence[];
  isSubmitting: boolean;
  onSubmit: (report: BugReportPayload) => void;
}

export const BugReportForm: React.FC<BugReportFormProps> = ({
  topicCode,
  evidences,
  isSubmitting,
  onSubmit
}) => {
  const isAmbiguousAuditTopic = topicCode === 'QA-REP-031';

  const [title, setTitle] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [expected, setExpected] = useState<string>('');
  const [actual, setActual] = useState<string>('');
  const [severity, setSeverity] = useState<'blocker' | 'critical' | 'major' | 'minor' | 'trivial'>('major');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [associatedCode, setAssociatedCode] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [selectedVices, setSelectedVices] = useState<string[]>([]);

  // Pr?-preenche a partir de evid?ncia capturada
  const handleApplyEvidence = (ev: BugEvidence) => {
    setAssociatedCode(ev.code);
    if (!title) {
      setTitle(`[Checkout] Anomalia detectada em ${ev.element || 'elemento'}: ${ev.title}`);
    }
    if (!actual) {
      setActual(ev.title);
    }
    if (ev.severity && ['blocker', 'critical', 'major', 'minor', 'trivial'].includes(ev.severity)) {
      setSeverity(ev.severity as any);
    }
  };

  const toggleVice = (viceKey: string) => {
    setSelectedVices(prev =>
      prev.includes(viceKey) ? prev.filter(v => v !== viceKey) : [...prev, viceKey]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !steps.trim() || !expected.trim() || !actual.trim()) {
      alert('Por favor, preencha todos os campos obrigat?rios do Bug Report (T?tulo, Passos, Esperado e Obtido).');
      return;
    }

    onSubmit({
      title: title.trim(),
      steps_to_reproduce: steps.trim(),
      expected_result: expected.trim(),
      actual_result: actual.trim(),
      severity,
      priority,
      associated_code: associatedCode || (evidences[0]?.code || 'REP-DEF-001'),
      technical_justification: justification.trim(),
      identified_vices: isAmbiguousAuditTopic ? selectedVices : undefined
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        height: '100%',
        overflowY: 'auto',
        fontFamily: 'var(--font-sans)',
        fontSize: '12.5px'
      }}
    >
      {/* CABE?ALHO DO FORMUL?RIO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconAuditShield size={16} style={{ color: 'var(--copper-signature)' }} />
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Registro Formal de Incidente // Bug Report
          </h2>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px',
          color: 'var(--copper-signature)',
          backgroundColor: 'var(--copper-surface)',
          padding: '2px 6px',
          borderRadius: 'var(--radius-xs)'
        }}>
          Norma IEEE 829 / ISO 29119-3
        </span>
      </div>

      {/* CASO QA-REP-031: DOSSI? DO RELAT?RIO AMB?GUO RECEBIDO DE TERCEIROS */}
      {isAmbiguousAuditTopic && (
        <div style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          border: '1px dashed var(--copper-signature)',
          borderRadius: 'var(--radius-xs)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--copper-signature)',
            textTransform: 'uppercase'
          }}>
            Relat?rio de Terceiros Sob Auditoria (Legado Defeituoso)
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <div><strong>T?tulo Original:</strong> &quot;O sistema quebrou feio e n?o d? pra comprar&quot;</div>
            <div><strong>Passos:</strong> &quot;Fui pagar o neg?cio e deu erro bizarro na tela&quot;</div>
            <div><strong>Esperado vs Obtido:</strong> &quot;Devia funcionar / Deu pau total&quot;</div>
          </div>

          <div style={{ marginTop: '4px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              Assinale os v?cios t?cnicos identificados neste relat?rio:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { id: 'passos_vagos', label: 'Passos vagos / n?o at?micos' },
                { id: 'ambiente_ausente', label: 'Ambiente / SO / dados ausentes' },
                { id: 'resultado_esperado_indefinido', label: 'Resultado esperado opinativo' },
                { id: 'linguagem_subjetiva', label: 'Linguagem emotiva / informal' },
                { id: 'severidade_inflacionada', label: 'Severidade sem crit?rio' }
              ].map(item => (
                <label
                  key={item.id}
                  onClick={() => toggleVice(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: selectedVices.includes(item.id) ? 'var(--copper-signature)' : 'var(--text-secondary)'
                  }}
                >
                  <IconCheckboxSquare size={13} style={{ color: selectedVices.includes(item.id) ? 'var(--copper-signature)' : 'var(--border-strong)' }} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SELETOR DE EVID?NCIA CAPTURADA */}
      {evidences.length > 0 && (
        <div style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Evid?ncias Capturadas: <strong>{evidences.length} anomalia(s)</strong>
          </span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {evidences.slice(0, 3).map(ev => (
              <button
                key={ev.code}
                type="button"
                onClick={() => handleApplyEvidence(ev)}
                style={{
                  backgroundColor: associatedCode === ev.code ? 'var(--accent-command)' : 'var(--bg-surface)',
                  color: associatedCode === ev.code ? 'var(--accent-command-contrast)' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                + Usar {ev.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* T?TULO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          T?TULO T?CNICO *
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: [Checkout] Subtotal n?o recalcula ao aplicar cupom VAULT10 com frete Sedex"
          style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            padding: '7px 10px',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            outline: 'none'
          }}
        />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Padr?o: [M?dulo / Componente] Descri??o concisa da falha sem ju?zo de valor.
        </span>
      </div>

      {/* PASSOS PARA REPRODU??O */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          PASSOS PARA REPRODU??O (AT?MICOS E SEQUENCIAIS) *
        </label>
        <textarea
          rows={4}
          value={steps}
          onChange={e => setSteps(e.target.value)}
          placeholder="1. Acessar tela de checkout&#10;2. Inserir cupom 'VAULT10' no campo de desconto&#10;3. Selecionar op??o de frete 'Sedex'&#10;4. Clicar em 'Finalizar Pedido'"
          style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            padding: '7px 10px',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            lineHeight: 1.4,
            outline: 'none',
            resize: 'vertical'
          }}
        />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Aceita numera??o (1., 2.), h?fens (-), bullets ou quebras de linha com verbos de a??o no infinitivo ou imperativo.
        </span>
      </div>

      {/* RESULTADO ESPERADO VS OBTIDO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-pass)' }}>
            RESULTADO ESPERADO (OR?CULO) *
          </label>
          <textarea
            rows={3}
            value={expected}
            onChange={e => setExpected(e.target.value)}
            placeholder="O sistema deve abater 10% do subtotal e atualizar o resumo financeiro."
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '11.5px',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--status-bug)' }}>
            RESULTADO OBTIDO (ANOMALIA) *
          </label>
          <textarea
            rows={3}
            value={actual}
            onChange={e => setActual(e.target.value)}
            placeholder="O sistema exibe o desconto no resumo mas mant?m o valor total sem altera??o."
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '11.5px',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* SEVERIDADE, PRIORIDADE E C?DIGO DA ANOMALIA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            SEVERIDADE *
          </label>
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value as any)}
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              outline: 'none'
            }}
          >
            <option value="blocker">Blocker (Impede o fluxo)</option>
            <option value="critical">Critical (Perda financeira/dado)</option>
            <option value="major">Major (Funcionalidade chave)</option>
            <option value="minor">Minor (Contorno vi?vel)</option>
            <option value="trivial">Trivial (Cosm?tico)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            PRIORIDADE *
          </label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as any)}
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              outline: 'none'
            }}
          >
            <option value="high">Alta (Pr?xima release)</option>
            <option value="medium">M?dia (Fila de sprint)</option>
            <option value="low">Baixa (Backlog geral)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            C?DIGO DA ANOMALIA
          </label>
          <input
            type="text"
            value={associatedCode}
            onChange={e => setAssociatedCode(e.target.value)}
            placeholder="Ex: BUG-COP-001"
            style={{
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              outline: 'none'
            }}
          >
          </input>
        </div>
      </div>

      {/* JUSTIFICATIVA T?CNICA (OPCIONAL/RECOMENDADO) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          JUSTIFICATIVA T?CNICA / CAUSA RAIZ SUSPEITA
        </label>
        <textarea
          rows={2}
          value={justification}
          onChange={e => setJustification(e.target.value)}
          placeholder="Ex: O listener de evento 'change' no select de frete sobrescreve o estado global do cupom antes do c?lculo final."
          style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            padding: '6px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11.5px',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>

      {/* BOT?O DE SUBMISS?O */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent-command)',
            color: 'var(--accent-command-contrast)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isSubmitting ? 'wait' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'opacity 0.15s ease'
          }}
        >
          <IconCheck size={14} />
          <span>{isSubmitting ? 'Homologando no Bureau...' : 'Submeter Bug Report Formal'}</span>
        </button>
      </div>
    </form>
  );
};
