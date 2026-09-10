import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, '../../');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '__pycache__'].includes(file)) {
        walkDir(filePath, fileList);
      }
    } else if (['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'].some(ext => file.endsWith(ext))) {
      // Exclui o próprio arquivo de teste de integridade
      if (!file.includes('encoding.test')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

test('ADR-0016: Integridade irrestrita de encoding UTF-8 em todos os arquivos do frontend', () => {
  const allFiles = walkDir(srcRoot);
  assert.ok(allFiles.length > 0, 'Deveria encontrar arquivos para inspeção em src/');

  const corruptions = [];

  for (const filePath of allFiles) {
    const relPath = path.relative(srcRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // 1. Letra seguida de ? e outra letra (ex: decis + ? + o, c + ? + digo)
      const matchLetterQ = line.match(/[a-zA-Z\u00C0-\u00FF]\?[a-zA-Z\u00C0-\u00FF]/g);
      if (matchLetterQ) {
        corruptions.push({ file: relPath, line: idx + 1, pattern: matchLetterQ, text: line.trim() });
        return;
      }

      // 2. Palavra com ? e letras maiúsculas (ex: ESPA + ? + O)
      const matchUpperQ = line.match(/\b[A-Z\u00C0-\u00FF]+\?[A-Z\u00C0-\u00FF]+\b/g);
      if (matchUpperQ) {
        corruptions.push({ file: relPath, line: idx + 1, pattern: matchUpperQ, text: line.trim() });
        return;
      }

      // 3. ? no início de palavra com pelo menos 2 letras (ex: ? + rea)
      // Exclui parâmetros de query string URL (?seed=, ?topic=, etc.)
      const matchLeadingQ = line.match(/\?[a-zA-Z\u00C0-\u00FF]{2,}/g);
      if (matchLeadingQ) {
        const filtered = matchLeadingQ.filter(m => !['?seed', '?topic', '?delete', '?v=', '?t=', '?id=', '?name=', '?code='].some(q => m.startsWith(q)));
        if (filtered.length > 0) {
          corruptions.push({ file: relPath, line: idx + 1, pattern: filtered, text: line.trim() });
          return;
        }
      }

      // 4. ? isolado cercado por espaços dentro de strings ou comentários (ex: " ? esquerda", " ? mesa")
      // Ignora código TypeScript puro / ternários fora de literais
      if (/["'`].*\s\?\s[a-zA-Z\u00C0-\u00FF].*["'`]|\/\/\s*.*\s\?\s[a-zA-Z\u00C0-\u00FF]/.test(line)) {
        corruptions.push({ file: relPath, line: idx + 1, pattern: [' ? '], text: line.trim() });
      }
    });
  }

  assert.equal(
    corruptions.length,
    0,
    `Detectada corrupção de encoding UTF-8 em ${corruptions.length} linha(s):\n` +
      corruptions.map(c => `  ${c.file}:${c.line} [${c.pattern}] -> "${c.text.slice(0, 80)}"`).join('\n')
  );
});
