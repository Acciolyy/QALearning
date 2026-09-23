'use client';

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Sistema de Ícones Técnicos Field Manual (Bureau de Inspeção)
 * Geometria vetorial nítida (1.4px stroke, sem preenchimento, escala modular).
 */

export const IconMatrix: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="12" height="12" rx="1" />
    <line x1="8" y1="2" x2="8" y2="14" strokeDasharray="1.5 1.5" />
    <line x1="2" y1="8" x2="14" y2="8" strokeDasharray="1.5 1.5" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconBadge: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <polygon points="8,1.5 13,4 14.5,9.5 11,14 5,14 1.5,9.5 3,4" />
    <polyline points="5.5 8 7.2 9.7 10.5 6.2" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <line x1="2" y1="4" x2="14" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="14" y2="12" />
    <rect x="4" y="2.5" width="3" height="3" fill="var(--bg-surface)" stroke="currentColor" />
    <rect x="9" y="6.5" width="3" height="3" fill="var(--bg-surface)" stroke="currentColor" />
    <rect x="5.5" y="10.5" width="3" height="3" fill="var(--bg-surface)" stroke="currentColor" />
  </svg>
);

export const IconViewfinder: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <path d="M2 5V2.5H5" />
    <path d="M11 2.5H14V5" />
    <path d="M14 11V13.5H11" />
    <path d="M5 13.5H2V11" />
    <circle cx="8" cy="8" r="1.5" />
    <line x1="8" y1="4.5" x2="8" y2="5.5" />
    <line x1="8" y1="10.5" x2="8" y2="11.5" />
    <line x1="4.5" y1="8" x2="5.5" y2="8" />
    <line x1="10.5" y1="8" x2="11.5" y2="8" />
  </svg>
);

export const IconTerminalPrompt: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
    <polyline points="4.5 6 7 8 4.5 10" />
    <line x1="8.5" y1="10" x2="11.5" y2="10" />
  </svg>
);

export const IconAuditShield: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <path d="M8 1.5L2.5 3.8V8C2.5 11.5 5 14 8 14.8C11 14 13.5 11.5 13.5 8V3.8L8 1.5Z" />
    <polyline points="5.5 8 7.2 9.5 10.5 6.5" />
  </svg>
);

export const IconFault: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="4" width="8" height="8" rx="1.5" />
    <path d="M6 2V4M10 2V4M6 12V14M10 12V14M2 6H4M2 10H4M12 6H14M12 10H14" />
    <line x1="6.5" y1="6.5" x2="9.5" y2="9.5" />
    <line x1="9.5" y1="6.5" x2="6.5" y2="9.5" />
  </svg>
);

export const IconCadencePulse: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <polyline points="1.5 8.5 4.5 8.5 6 4 8 12.5 10 7 11.5 8.5 14.5 8.5" />
    <circle cx="8" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLock: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="7" width="10" height="7.5" rx="1" />
    <path d="M5 7V4.5C5 2.8 6.3 1.5 8 1.5C9.7 1.5 11 2.8 11 4.5V7" />
    <circle cx="8" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <line x1="2.5" y1="8" x2="13.5" y2="8" />
    <polyline points="9.5 4 13.5 8 9.5 12" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 14, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <polyline points="2.5 7 5.5 10 11.5 4" />
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ size = 14, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <line x1="3" y1="3" x2="11" y2="11" />
    <line x1="11" y1="3" x2="3" y2="11" />
  </svg>
);

export const IconSecurityLatch: React.FC<IconProps> = IconLock;

export const IconDeviceMobile: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="1.5" width="8" height="13" rx="1.5" />
    <line x1="7" y1="3" x2="9" y2="3" />
    <circle cx="8" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDeviceTablet: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="2.5" y="2" width="11" height="12" rx="1.5" />
    <circle cx="8" cy="12" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDeviceDesktop: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="1.5" y="2" width="13" height="9" rx="1" />
    <line x1="5.5" y1="14" x2="10.5" y2="14" />
    <line x1="8" y1="11" x2="8" y2="14" />
  </svg>
);

export const IconOrientation: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <path d="M2.5 8A5.5 5.5 0 0 1 12 4.5" />
    <polyline points="9.5 2 12.5 4.5 9.5 7" />
    <path d="M13.5 8A5.5 5.5 0 0 1 4 11.5" />
    <polyline points="6.5 14 3.5 11.5 6.5 9" />
  </svg>
);

export const IconKeyboard: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
    <line x1="4" y1="6.5" x2="5" y2="6.5" />
    <line x1="7.5" y1="6.5" x2="8.5" y2="6.5" />
    <line x1="11" y1="6.5" x2="12" y2="6.5" />
    <line x1="5.5" y1="9.5" x2="10.5" y2="9.5" />
  </svg>
);

export const IconCheckboxSquare: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="12" height="12" rx="1.5" />
    <polyline points="4.5 8 7 10.5 11.5 5.5" />
  </svg>
);

export const IconCrosshairTouch: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="5" />
    <line x1="8" y1="1" x2="8" y2="4" />
    <line x1="8" y1="12" x2="8" y2="15" />
    <line x1="1" y1="8" x2="4" y2="8" />
    <line x1="12" y1="8" x2="15" y2="8" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCodeInspector: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <polyline points="5 4.5 1.5 8 5 11.5" />
    <polyline points="11 4.5 14.5 8 11 11.5" />
    <line x1="9.5" y1="3" x2="6.5" y2="13" />
  </svg>
);


export const IconChronometer: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <circle cx="8" cy="9" r="5.5" />
    <line x1="8" y1="9" x2="10.5" y2="7" />
    <line x1="8" y1="1.5" x2="8" y2="3.5" />
    <line x1="6.5" y1="1.5" x2="9.5" y2="1.5" />
  </svg>
);

export const IconHistoryAudit: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <path d="M2.5 8A5.5 5.5 0 1 1 4.2 11.8" />
    <polyline points="2.5 4.5 2.5 8 6 8" />
    <polyline points="8 5.5 8 8 10 9.5" />
  </svg>
);

export const IconCertificate: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <rect x="2.5" y="2" width="11" height="12" rx="1" />
    <line x1="5" y1="5" x2="11" y2="5" />
    <line x1="5" y1="7.5" x2="11" y2="7.5" />
    <line x1="5" y1="10" x2="8" y2="10" />
    <circle cx="10.5" cy="10.5" r="1.5" />
  </svg>
);
export const IconBolt: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <polygon points="9 1.5 3.5 9 8 9 7 14.5 12.5 7 8 7 9 1.5" />
  </svg>
);

export const IconMedal: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <circle cx="8" cy="10.5" r="4" />
    <polyline points="5.5 7 3.5 2 7 3.5 8 2 9 3.5 12.5 2 10.5 7" />
    <circle cx="8" cy="10.5" r="1.5" />
  </svg>
);

export const IconDocumentAudit: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <path d="M3 2.5C3 1.95 3.45 1.5 4 1.5H9.5L13 5V13.5C13 14.05 12.55 14.5 12 14.5H4C3.45 14.5 3 14.05 3 13.5V2.5Z" />
    <polyline points="9.5 1.5 9.5 5 13 5" />
    <line x1="5.5" y1="8" x2="10.5" y2="8" />
    <line x1="5.5" y1="11" x2="9" y2="11" />
  </svg>
);

export const IconScale: React.FC<IconProps> = ({ size = 16, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    <line x1="8" y1="2" x2="8" y2="14" />
    <line x1="2.5" y1="5" x2="13.5" y2="5" />
    <polyline points="2.5 5 4.5 9 1 9 2.5 5" />
    <polyline points="13.5 5 15 9 11.5 9 13.5 5" />
    <line x1="5.5" y1="14" x2="10.5" y2="14" />
  </svg>
);
