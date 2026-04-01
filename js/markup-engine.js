(function (global) {
  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  }

  function parseInline(line) {
    let out = escapeHtml(line);
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
    out = out.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" loading="lazy" />');
    out = out.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out = out.replace(/&([^|&]+)\|([^&]+)&/g, '<button class="inline-link" data-subsection="$2">$1</button>');
    return out;
  }

  function render(markup) {
    const lines = String(markup || '').split('\n');
    const html = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('### ')) return `<h4>${parseInline(trimmed.slice(4))}</h4>`;
      if (trimmed.startsWith('## ')) return `<h3>${parseInline(trimmed.slice(3))}</h3>`;
      if (trimmed.startsWith('# ')) return `<h2>${parseInline(trimmed.slice(2))}</h2>`;
      return `<p>${parseInline(trimmed)}</p>`;
    }).join('');
    return `<div class="rendered-markup">${html}</div>`;
  }

  global.MarkupEngine = { render };
})(window);
