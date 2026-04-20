export interface QuickAddResult {
  title: string;
  labels?: string[];
  shop?: string;
  quantity?: number;
  assignee?: string;
  dueDate?: string;
  isPrivate?: boolean;
  linkedType?: 'task' | 'item';
  linkedTo?: string;
}

const DAY_MAP: Record<string, number> = {
  zo: 0, ma: 1, di: 2, wo: 3, do: 4, vr: 5, za: 6,
};

function resolveDate(input: string): string {
  const lower = input.toLowerCase();
  if (lower === 'vandaag') return new Date().toISOString().slice(0, 10);
  if (lower === 'morgen') {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10);
  }
  if (lower === 'overmorgen') {
    const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().slice(0, 10);
  }
  if (DAY_MAP[lower] !== undefined) {
    const d = new Date();
    const target = DAY_MAP[lower];
    const current = d.getDay();
    let diff = target - current;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  // DD-MM
  if (/^\d{2}-\d{2}$/.test(input)) {
    const [dd, mm] = input.split('-');
    return `${new Date().getFullYear()}-${mm}-${dd}`;
  }
  return input;
}

function extractQuoted(text: string, prefix: string): { values: string[]; remaining: string } {
  const values: string[] = [];
  let remaining = text;
  // Quoted: prefix"multi word"
  const quotedRe = new RegExp(`${prefix.replace('$', '\\$')}"([^"]+)"`, 'g');
  remaining = remaining.replace(quotedRe, (_, v) => { values.push(v); return ''; });
  // Unquoted: prefix word
  const wordRe = new RegExp(`${prefix.replace('$', '\\$')}(\\S+)`, 'g');
  remaining = remaining.replace(wordRe, (_, v) => { values.push(v); return ''; });
  return { values, remaining };
}

export function parseQuickAdd(input: string): QuickAddResult {
  let text = input.trim();
  const result: QuickAddResult = { title: '' };

  // isPrivate
  if (text.startsWith('!!')) {
    result.isPrivate = true;
    text = text.slice(2).trim();
  }

  // linked ~task:id or ~item:id
  text = text.replace(/~(task|item):(\S+)/g, (_, type, id) => {
    result.linkedType = type as 'task' | 'item';
    result.linkedTo = id;
    return '';
  });

  // labels #
  const labelsResult = extractQuoted(text, '#');
  if (labelsResult.values.length) result.labels = labelsResult.values;
  text = labelsResult.remaining;

  // shop $
  const shopResult = extractQuoted(text, '$');
  if (shopResult.values.length) result.shop = shopResult.values[0];
  text = shopResult.remaining;

  // quantity *N
  text = text.replace(/\*(\d+)/g, (_, n) => { result.quantity = parseInt(n, 10); return ''; });

  // assignee @word
  text = text.replace(/@(\S+)/g, (_, name) => { result.assignee = name; return ''; });

  // due date //date
  text = text.replace(/\/\/(\S+)/g, (_, date) => { result.dueDate = resolveDate(date); return ''; });

  result.title = text.replace(/\s+/g, ' ').trim();
  return result;
}
