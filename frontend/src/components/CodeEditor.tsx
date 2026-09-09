'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '300px',
      backgroundColor: 'var(--bg-surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xs)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px'
    }}>
      Carregando editor de código Monaco...
    </div>
  ),
});

interface CodeEditorProps {
  value?: string;
  language?: string;
  onChange?: (val: string | undefined) => void;
  height?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value = '// Escreva seus testes em TypeScript/Playwright\n',
  language = 'typescript',
  onChange,
  height = '320px'
}) => {
  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xs)',
      overflow: 'hidden'
    }}>
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};
