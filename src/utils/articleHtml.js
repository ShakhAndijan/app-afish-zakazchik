// Maqola matni backenddan "xavfsiz HTML" bo'lib keladi (GET /articles/{slug} → `html`). Ilova HTML dvigateli
// ishlatmaydi: faqat maqolada uchraydigan teglar (p, h2–h4, ul/ol/li, blockquote, strong/em, a, br) tahlil
// qilinadi, qolgan teglar tashlanadi (ichidagi matn qoladi).
//
// Natija — bloklar ro'yxati:
//   { type: 'p' | 'h2' | 'h3', runs }          runs = [{ text, bold?, italic?, href? }]
//   { type: 'ul' | 'ol', items: [runs, ...] }
//   { type: 'quote', paras: [runs, ...] }

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  laquo: '«',
  raquo: '»',
};

const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

const TOKEN = /<(\/?)([a-z][a-z0-9]*)([^>]*)>|([^<]+)|</gi;
const HEADINGS = { h1: 'h2', h2: 'h2', h3: 'h3', h4: 'h3', h5: 'h3', h6: 'h3' };

export function parseArticleHtml(html) {
  const blocks = [];
  let runs = null; // joriy blokning matn bo'laklari
  let kind = null; // 'p' | 'h2' | 'h3' | 'li'
  let list = null; // { type, items }
  let quote = null; // { paras }
  const style = { bold: 0, italic: 0, href: [] };

  const flush = () => {
    if (!runs) return;
    const trimmed = trimRuns(runs);
    runs = null;
    if (trimmed.length === 0) return;
    if (kind === 'li' && list) list.items.push(trimmed);
    else if (quote && kind === 'p') quote.paras.push(trimmed);
    else blocks.push({ type: kind === 'h2' || kind === 'h3' ? kind : 'p', runs: trimmed });
  };
  const open = (k) => {
    flush();
    kind = k;
    runs = [];
  };

  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(html ?? ''))) {
    const [, closing, rawTag, attrs, text] = m;
    if (text !== undefined) {
      const clean = decode(text.replace(/\s+/g, ' '));
      if (!runs) {
        if (!clean.trim()) continue;
        open('p'); // teg ichida bo'lmagan matn — alohida abzats
      }
      runs.push({
        text: clean,
        ...(style.bold > 0 && { bold: true }),
        ...(style.italic > 0 && { italic: true }),
        ...(style.href.length > 0 && { href: style.href[style.href.length - 1] }),
      });
      continue;
    }
    if (!rawTag) continue;

    const tag = rawTag.toLowerCase();
    const isClose = closing === '/';
    if (tag === 'p') {
      if (isClose) flush();
      else open('p');
    } else if (HEADINGS[tag]) {
      if (isClose) flush();
      else open(HEADINGS[tag]);
    } else if (tag === 'ul' || tag === 'ol') {
      flush();
      if (isClose) {
        if (list && list.items.length) blocks.push(list);
        list = null;
      } else {
        list = { type: tag, items: [] };
      }
    } else if (tag === 'li') {
      if (isClose) flush();
      else open('li');
    } else if (tag === 'blockquote') {
      flush();
      if (isClose) {
        if (quote && quote.paras.length) blocks.push(quote);
        quote = null;
      } else {
        quote = { type: 'quote', paras: [] };
      }
    } else if (tag === 'strong' || tag === 'b') {
      style.bold = Math.max(0, style.bold + (isClose ? -1 : 1));
    } else if (tag === 'em' || tag === 'i') {
      style.italic = Math.max(0, style.italic + (isClose ? -1 : 1));
    } else if (tag === 'a') {
      if (isClose) style.href.pop();
      else style.href.push(/href\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? null);
    } else if (tag === 'br' && runs) {
      runs.push({ text: '\n' });
    }
  }
  flush();
  return blocks;
}

// Chekkadagi bo'sh joylarni olib tashlaydi (teglar orasidagi probellar).
function trimRuns(runs) {
  const out = runs.filter((r) => r.text !== '');
  if (out.length === 0) return out;
  out[0] = { ...out[0], text: out[0].text.replace(/^\s+/, '') };
  const last = out.length - 1;
  out[last] = { ...out[last], text: out[last].text.replace(/\s+$/, '') };
  return out.filter((r) => r.text !== '');
}
