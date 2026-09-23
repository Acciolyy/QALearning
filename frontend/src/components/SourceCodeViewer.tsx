'use client';

import React, { useState, useEffect } from 'react';
import { MINI_SITES_ORIGIN } from '../lib/config';
import { IconCodeInspector } from './TechnicalIcons';

interface SourceCodeData {
  file_name: string;
  function_name: string;
  language: string;
  code: string;
  cyclomatic_complexity: number;
  decision_points: number[];
  total_branches: number;
  target_criterion: string;
  topic_code: string;
  seed: string;
}

interface SourceCodeViewerProps {
  topicCode: string;
  sessionSeed: string;
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({
  topicCode,
  sessionSeed
}) => {
  const [data, setData] = useState<SourceCodeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const cleanSeed = sessionSeed.replace('#', '');
    fetch(`${MINI_SITES_ORIGIN}/mini-sites/source-code/?topic=${topicCode}&seed=${cleanSeed}`)
      .then(res => {
        if (!res.ok) throw new Error(`Falha ao carregar código-fonte (${res.status})`);
        return res.json();
      })
      .then(json => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(String(err));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [topicCode, sessionSeed]);

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        Desofuscando e inspecionando código-fonte estrutural...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--status-bug-bg)',
        border: '1px solid var(--status-bug)',
        color: 'var(--status-bug)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        borderRadius: 'var(--radius-xs)'
      }}>
        Erro ao carregar código-fonte estrutural: {error || 'Dados indisponíveis'}
      </div>
    );
  }

  const lines = data.code.split('\n');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-surface-sunken)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden'
    }}>
      {/* HEADER DO ARQUIVO E MÉTRICAS DE COMPLEXIDADE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11.5px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconCodeInspector size={14} style={{ color: 'var(--copper-signature)' }} />
          <strong style={{ color: 'var(--text-primary)' }}>{data.file_name}</strong>
          <span style={{ color: 'var(--text-muted)' }}>::</span>
          <span style={{ color: 'var(--copper-signature)' }}>{data.function_name}()</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            backgroundColor: 'var(--copper-surface)',
            border: '1px solid var(--copper-border)',
            color: 'var(--copper-signature)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 700
          }}>
            V(G) = {data.cyclomatic_complexity}
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)'
          }}>
            {data.total_branches} Ramos / Decisões
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--status-pass)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)'
          }}>
            {data.target_criterion}
          </div>
        </div>
      </div>

      {/* ÁREA DE CÓDIGO COM LINHAS E PONTOS DE DECISÃO */}
      <div style={{
        flexGrow: 1,
        overflow: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '11.5px',
        lineHeight: 1.6,
        padding: '8px 0',
        backgroundColor: '#0a100d'
      }}>
        {lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const isDecisionPoint = data.decision_points.includes(lineNum);

          return (
            <div
              key={lineNum}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                backgroundColor: isDecisionPoint ? 'rgba(219, 111, 56, 0.12)' : 'transparent',
                borderLeft: isDecisionPoint ? '3px solid var(--copper-signature)' : '3px solid transparent',
                padding: '1px 12px 1px 6px',
                transition: 'background-color 0.1s ease'
              }}
            >
              {/* NÚMERO DA LINHA */}
              <div style={{
                width: '38px',
                textAlign: 'right',
                marginRight: '12px',
                color: isDecisionPoint ? 'var(--copper-signature)' : '#4d6458',
                userSelect: 'none',
                fontWeight: isDecisionPoint ? 700 : 400
              }}>
                {lineNum}
              </div>

              {/* INDICADOR DE DECISÃO SE APLICÁVEL */}
              {isDecisionPoint ? (
                <span style={{
                  fontSize: '9px',
                  backgroundColor: 'var(--copper-signature)',
                  color: '#FFFFFF',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  marginRight: '8px',
                  userSelect: 'none',
                  fontWeight: 700
                }}>
                  DECISÃO
                </span>
              ) : null}

              {/* CONTEÚDO DA LINHA */}
              <div style={{
                color: isDecisionPoint ? '#F5E8DC' : '#B8C9C0',
                whiteSpace: 'pre',
                flexGrow: 1
              }}>
                {lineText || ' '}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
