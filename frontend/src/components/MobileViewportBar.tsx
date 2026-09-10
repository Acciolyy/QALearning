'use client';

import React from 'react';
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceDesktop,
  IconOrientation,
  IconKeyboard,
  IconCrosshairTouch
} from './TechnicalIcons';

export type ViewportDevice = 'desktop' | 'mobile' | 'tablet';
export type ViewportOrientation = 'portrait' | 'landscape';

interface MobileViewportBarProps {
  device: ViewportDevice;
  setDevice: (d: ViewportDevice) => void;
  orientation: ViewportOrientation;
  setOrientation: (o: ViewportOrientation | ((prev: ViewportOrientation) => ViewportOrientation)) => void;
  touchInspector: boolean;
  setTouchInspector: (val: boolean | ((prev: boolean) => boolean)) => void;
  virtualKeyboard: boolean;
  setVirtualKeyboard: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const MobileViewportBar: React.FC<MobileViewportBarProps> = ({
  device,
  setDevice,
  orientation,
  setOrientation,
  touchInspector,
  setTouchInspector,
  virtualKeyboard,
  setVirtualKeyboard
}) => {
  const getDimensions = () => {
    if (device === 'mobile') {
      return orientation === 'portrait' ? '375 ? 667 px' : '667 ? 375 px';
    }
    if (device === 'tablet') {
      return orientation === 'portrait' ? '768 ? 1024 px' : '1024 ? 768 px';
    }
    return '100% (Responsivo)';
  };

  const toggleOrientation = () => {
    setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 12px',
      backgroundColor: 'var(--bg-surface-sunken)',
      borderBottom: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      {/* SELETOR DE DISPOSITIVOS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: 'var(--text-muted)', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          DISPOSITIVO:
        </span>
        <button
          type="button"
          onClick={() => setDevice('mobile')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: device === 'mobile' ? 'var(--accent-command)' : 'var(--bg-surface)',
            color: device === 'mobile' ? 'var(--accent-command-contrast)' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '11px'
          }}
          title="Viewport Mobile Compacto (375px)"
        >
          <IconDeviceMobile size={13} />
          <span>Mobile (375px)</span>
        </button>

        <button
          type="button"
          onClick={() => setDevice('tablet')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: device === 'tablet' ? 'var(--accent-command)' : 'var(--bg-surface)',
            color: device === 'tablet' ? 'var(--accent-command-contrast)' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '11px'
          }}
          title="Viewport Tablet Médio (768px)"
        >
          <IconDeviceTablet size={13} />
          <span>Tablet (768px)</span>
        </button>

        <button
          type="button"
          onClick={() => setDevice('desktop')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: device === 'desktop' ? 'var(--accent-command)' : 'var(--bg-surface)',
            color: device === 'desktop' ? 'var(--accent-command-contrast)' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '11px'
          }}
          title="Viewport Desktop Responsivo (100%)"
        >
          <IconDeviceDesktop size={13} />
          <span>Desktop (100%)</span>
        </button>
      </div>

      {/* CONTROLES DE EMULA??O */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {device !== 'desktop' && (
          <button
            type="button"
            onClick={toggleOrientation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: '11px'
            }}
            title="Alternar Orientação Retrato / Paisagem"
          >
            <IconOrientation size={13} />
            <span>{orientation === 'portrait' ? 'Retrato' : 'Paisagem'}</span>
          </button>
        )}

        {device === 'mobile' && (
          <button
            type="button"
            onClick={() => setVirtualKeyboard(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: virtualKeyboard ? 'var(--copper-surface)' : 'var(--bg-surface)',
              color: virtualKeyboard ? 'var(--copper-signature)' : 'var(--text-secondary)',
              border: virtualKeyboard ? '1px solid var(--copper-signature)' : '1px solid var(--border-subtle)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: virtualKeyboard ? 600 : 400
            }}
            title="Simular Teclado Virtual de Entrada (240px)"
          >
            <IconKeyboard size={13} />
            <span>Teclado: {virtualKeyboard ? 'Ativo' : 'Oculto'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setTouchInspector(prev => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: touchInspector ? 'var(--copper-surface)' : 'var(--bg-surface)',
            color: touchInspector ? 'var(--copper-signature)' : 'var(--text-secondary)',
            border: touchInspector ? '1px solid var(--copper-signature)' : '1px solid var(--border-subtle)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: touchInspector ? 600 : 400
          }}
          title="Inspecionar Touch Targets (Área Mínima 44x44px)"
        >
          <IconCrosshairTouch size={13} />
          <span>Touch Target (&ge; 44px): {touchInspector ? 'Ligado' : 'Desligado'}</span>
        </button>

        <div style={{
          marginLeft: '4px',
          padding: '2px 6px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          color: 'var(--copper-signature)',
          fontWeight: 700
        }}>
          {getDimensions()}
        </div>
      </div>
    </div>
  );
};
