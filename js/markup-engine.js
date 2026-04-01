(function (global) {
  const ESCAPED_TILDE_PLACEHOLDER = '%%ESCAPED_TILDE%%';

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applySpecialSpacing(text) {
    return String(text)
      .replace(/\\~/g, ESCAPED_TILDE_PLACEHOLDER)
      .replace(/~/g, '\u00A0')
      .replace(new RegExp(ESCAPED_TILDE_PLACEHOLDER, 'g'), '~');
  }

  function normalizeMarkup(text) {
    let out = String(text || '').replace(/\r\n?/g, '\n');

    out = out.replace(/§/g, '\n\n');
    out = out.replace(/([:.!?…])\s+(#{1,3})([^\s#][^\n]*)/g, '$1\n\n$2 $3');
    out = out.replace(/(^|\n)(#{1,3})([^\s#][^\n]*)/g, '$1$2 $3');

    return out;
  }

  function parseInline(line) {
    const subsectionTokens = [];

    let prepared = String(line || '').replace(/\$([^|$]+)\|([^$]+)\$/g, (_, label, key) => {
      const idx = subsectionTokens.push({ label, key }) - 1;
      return `%%SUBSECTION_${idx}%%`;
    });

    prepared = applySpecialSpacing(prepared);

    let out = escapeHtml(prepared);

    out = out.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" loading="lazy" />');
    out = out.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
    out = out.replace(/`(.+?)`/g, '<code>$1</code>');

    out = out.replace(/%%SUBSECTION_(\d+)%%/g, (_, idx) => {
      const token = subsectionTokens[Number(idx)];
      if (!token) return '';
      return `<button type="button" class="inline-link" data-subsection="${escapeHtml(token.key)}" aria-expanded="false">${escapeHtml(applySpecialSpacing(token.label))}</button>`;
    });

    return out;
  }

  function renderSingle(markup) {
    const source = normalizeMarkup(markup);
    const lines = source.split('\n');

    const html = [];
    let paragraphBuffer = [];
    let listBuffer = [];

    function flushParagraph() {
      if (!paragraphBuffer.length) return;
      const text = paragraphBuffer.join(' ').trim();
      if (text) {
        html.push(`<p>${parseInline(text)}</p>`);
      }
      paragraphBuffer = [];
    }

    function flushList() {
      if (!listBuffer.length) return;
      html.push('<ul>');
      listBuffer.forEach((item) => {
        html.push(`<li>${parseInline(item)}</li>`);
      });
      html.push('</ul>');
      listBuffer = [];
    }

    lines.forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        flushList();
        return;
      }

      if (line.startsWith('### ')) {
        flushParagraph();
        flushList();
        html.push(`<h4>${parseInline(line.slice(4).trim())}</h4>`);
        return;
      }

      if (line.startsWith('## ')) {
        flushParagraph();
        flushList();
        html.push(`<h3>${parseInline(line.slice(3).trim())}</h3>`);
        return;
      }

      if (line.startsWith('# ')) {
        flushParagraph();
        flushList();
        html.push(`<h2>${parseInline(line.slice(2).trim())}</h2>`);
        return;
      }

      if (/^[-*]\s+/.test(line)) {
        flushParagraph();
        listBuffer.push(line.replace(/^[-*]\s+/, '').trim());
        return;
      }

      if (/^\d+\.\s+/.test(line)) {
        flushParagraph();
        flushList();
        html.push(`<p>${parseInline(line)}</p>`);
        return;
      }

      flushList();
      paragraphBuffer.push(line);
    });

    flushParagraph();
    flushList();

    return html.join('');
  }

  function render(markup) {
    if (Array.isArray(markup)) {
      const blocks = markup
        .map((item) => renderSingle(item))
        .filter(Boolean)
        .join('');
      return `<div class="rendered-markup">${blocks}</div>`;
    }

    return `<div class="rendered-markup">${renderSingle(markup)}</div>`;
  }

  global.MarkupEngine = { render };
})(window);
