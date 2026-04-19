import { parse, HTMLElement, Node, NodeType } from 'node-html-parser';

export type PDFRun = { text: string; bold?: boolean; italic?: boolean };

export type PDFNode =
  | {
      type: 'cover';
      brand: string;
      tag: string;
      label: string;
      title: string;
      sub: string;
      meta: Array<{ label: string; value: string }>;
    }
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'paragraph'; runs: PDFRun[] }
  | { type: 'list'; ordered: boolean; items: PDFRun[][] }
  | {
      type: 'table';
      headers: string[];
      rows: Array<{ cells: string[]; variant?: 'normal' | 'pricing-row' | 'pricing-total' }>;
    }
  | { type: 'blockquote'; text: string };

function parseRuns(el: HTMLElement): PDFRun[] {
  const runs: PDFRun[] = [];
  const walk = (node: Node, bold: boolean, italic: boolean) => {
    if (node.nodeType === NodeType.TEXT_NODE) {
      const t = node.rawText.replace(/\s+/g, ' ');
      if (t) runs.push({ text: decodeEntities(t), bold: bold || undefined, italic: italic || undefined });
      return;
    }
    if (node instanceof HTMLElement) {
      const tag = node.tagName?.toLowerCase();
      const b = bold || tag === 'strong' || tag === 'b';
      const i = italic || tag === 'em' || tag === 'i';
      if (tag === 'br') {
        runs.push({ text: '\n' });
        return;
      }
      for (const child of node.childNodes) walk(child, b, i);
    }
  };
  for (const child of el.childNodes) walk(child, false, false);
  // Merge adjacent runs with same styling
  const merged: PDFRun[] = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && !!last.bold === !!r.bold && !!last.italic === !!r.italic) {
      last.text += r.text;
    } else {
      merged.push({ ...r });
    }
  }
  return merged.filter((r) => r.text.length > 0);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…');
}

function textOf(el: HTMLElement): string {
  return decodeEntities(el.text || '').replace(/\s+/g, ' ').trim();
}

function parseCover(el: HTMLElement): PDFNode {
  const q = (cls: string): string => {
    const node = el.querySelector(`.${cls}`);
    return node ? textOf(node as HTMLElement) : '';
  };
  const metaEl = el.querySelector('.cover-meta');
  const meta: Array<{ label: string; value: string }> = [];
  if (metaEl) {
    const pNodes = (metaEl as HTMLElement).querySelectorAll('p');
    for (const p of pNodes) {
      const html = (p as HTMLElement).innerHTML;
      const parts = html.split(/<br\s*\/?>/i);
      const labelMatch = parts[0].match(/<strong>(.*?)<\/strong>/i);
      const label = labelMatch ? decodeEntities(labelMatch[1].replace(/:$/, '')) : '';
      const valueParts = parts
        .slice(label ? 1 : 0)
        .map((p) => decodeEntities(p.replace(/<[^>]+>/g, '').trim()))
        .filter((x) => x.length > 0);
      const value = valueParts.join('\n');
      if (label || value) meta.push({ label, value });
    }
  }
  return {
    type: 'cover',
    brand: q('cover-brand'),
    tag: q('cover-tag'),
    label: q('cover-label'),
    title: q('cover-title'),
    sub: q('cover-sub'),
    meta,
  };
}

function parseTable(el: HTMLElement): PDFNode {
  const headers: string[] = [];
  const headCells = el.querySelectorAll('thead th, thead td');
  if (headCells.length > 0) {
    for (const c of headCells) headers.push(textOf(c as HTMLElement));
  } else {
    // Fallback: first row as header
    const firstRow = el.querySelector('tr');
    if (firstRow) {
      const ths = (firstRow as HTMLElement).querySelectorAll('th');
      if (ths.length > 0) for (const c of ths) headers.push(textOf(c as HTMLElement));
    }
  }

  const rows: Array<{ cells: string[]; variant?: 'normal' | 'pricing-row' | 'pricing-total' }> = [];
  const bodyRows = el.querySelectorAll('tbody tr');
  const trsToUse = bodyRows.length > 0 ? bodyRows : el.querySelectorAll('tr');
  for (const tr of trsToUse) {
    const tds = (tr as HTMLElement).querySelectorAll('td');
    if (tds.length === 0) continue;
    const cells = tds.map((c) => textOf(c as HTMLElement));
    const cls = (tr as HTMLElement).classNames || '';
    let variant: 'normal' | 'pricing-row' | 'pricing-total' = 'normal';
    if (cls.includes('pricing-total')) variant = 'pricing-total';
    else if (cls.includes('pricing-row')) variant = 'pricing-row';
    rows.push({ cells, variant });
  }

  return { type: 'table', headers, rows };
}

export function parseHTMLToPDFNodes(html: string): PDFNode[] {
  const cleaned = html
    .replace(/```html/gi, '')
    .replace(/```/g, '')
    .trim();
  const root = parse(`<div id="__root">${cleaned}</div>`);
  const wrapper = root.querySelector('#__root');
  if (!wrapper) return [];

  const nodes: PDFNode[] = [];

  const processChild = (child: Node) => {
    if (!(child instanceof HTMLElement)) return;
    const tag = child.tagName?.toLowerCase();
    const classes = child.classNames || '';

    if (tag === 'div' && classes.includes('cover')) {
      nodes.push(parseCover(child));
      return;
    }
    if (tag === 'div') {
      // Flatten div wrappers
      for (const c of child.childNodes) processChild(c);
      return;
    }
    if (tag === 'h1') {
      nodes.push({ type: 'h1', text: textOf(child) });
      return;
    }
    if (tag === 'h2') {
      nodes.push({ type: 'h2', text: textOf(child) });
      return;
    }
    if (tag === 'h3') {
      nodes.push({ type: 'h3', text: textOf(child) });
      return;
    }
    if (tag === 'h4') {
      nodes.push({ type: 'h4', text: textOf(child) });
      return;
    }
    if (tag === 'p') {
      const runs = parseRuns(child);
      if (runs.length > 0) nodes.push({ type: 'paragraph', runs });
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items: PDFRun[][] = [];
      const lis = child.querySelectorAll(':scope > li');
      const liNodes = lis.length > 0 ? lis : child.querySelectorAll('li');
      for (const li of liNodes) items.push(parseRuns(li as HTMLElement));
      if (items.length > 0) nodes.push({ type: 'list', ordered: tag === 'ol', items });
      return;
    }
    if (tag === 'table') {
      nodes.push(parseTable(child));
      return;
    }
    if (tag === 'blockquote') {
      nodes.push({ type: 'blockquote', text: textOf(child) });
      return;
    }
  };

  for (const child of wrapper.childNodes) processChild(child);
  return nodes;
}
