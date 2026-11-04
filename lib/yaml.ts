/** Минимальный парсер YAML-подобных метаданных (key: value / списки). */
export function parseSimpleYaml(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let currentKey: string | null = null;
  const listBuffer: string[] = [];

  const flush = () => {
    if (currentKey && listBuffer.length) {
      out[currentKey] = [...listBuffer];
      listBuffer.length = 0;
    }
  };

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const itemMatch = line.match(/^\s*-\s+(.*)$/);
    if (itemMatch && currentKey) {
      listBuffer.push(itemMatch[1].replace(/^["']|["']$/g, '').trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    flush();
    currentKey = kv[1];
    const value = kv[2].replace(/^["']|["']$/g, '').trim();
    if (value === '') {
      out[currentKey] = [];
    } else if (value.startsWith('[')) {
      out[currentKey] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((v) => v.replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
      currentKey = null;
    } else {
      out[currentKey] = value;
      currentKey = null;
    }
  }
  flush();
  return out;
}
