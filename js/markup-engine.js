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

    let prepared = String(line || '').replace(/\$([^|$]+)\|([^$]+)\$/g, function (_, label, key) {
      const idx = subsectionTokens.push({ label: label, key: key }) - 1;
      return '%%SUBSECTION_' + idx + '%%';
    });

    prepared = applySpecialSpacing(prepared);

    let out = escapeHtml(prepared);

    out = out.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" loading="lazy" />');
    out = out.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
    out = out.replace(/`(.+?)`/g, '<code>$1</code>');

    out = out.replace(/%%SUBSECTION_(\d+)%%/g, function (_, idx) {
      const token = subsectionTokens[Number(idx)];
      if (!token) return '';
      return '<button type="button" class="inline-link" data-subsection="' +
        escapeHtml(token.key) +
        '" aria-expanded="false">' +
        escapeHtml(applySpecialSpacing(token.label)) +
        '</button>';
    });

    return out;
  }

  function isBlockObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item) && item.type;
  }

  function renderTableBlock(block) {
    const headers = Array.isArray(block.headers) ? block.headers : [];
    const rows = Array.isArray(block.rows) ? block.rows : [];
    const caption = block.caption ? '<caption>' + parseInline(block.caption) + '</caption>' : '';

    const thead = headers.length
      ? '<thead><tr>' + headers.map(function (cell) {
          return '<th>' + parseInline(cell) + '</th>';
        }).join('') + '</tr></thead>'
      : '';

    const tbody = '<tbody>' + rows.map(function (row) {
      const cells = Array.isArray(row) ? row : [];
      return '<tr>' + cells.map(function (cell) {
        return '<td>' + parseInline(cell) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';

    return (
      '<figure class="markup-table-block">' +
        caption +
        '<div class="markup-table-wrap">' +
          '<table class="markup-table">' +
            thead +
            tbody +
          '</table>' +
        '</div>' +
      '</figure>'
    );
  }

  function buildAsciiChart(block) {
    if (!global.AsciiChart) return '[AsciiChart not loaded]';

    const chartType = block.chartType || 'bar';

    if (chartType === 'plot') {
      return global.AsciiChart.plot(Array.isArray(block.points) ? block.points : [], block.options || {});
    }

    return global.AsciiChart.barChart(Array.isArray(block.items) ? block.items : [], block.options || {});
  }

  function renderChartBlock(block) {
    const caption = block.caption ? '<figcaption>' + parseInline(block.caption) + '</figcaption>' : '';
    const chartText = escapeHtml(buildAsciiChart(block));

    return (
      '<figure class="markup-chart-block">' +
        caption +
        '<pre class="ascii-chart">' + chartText + '</pre>' +
      '</figure>'
    );
  }

function renderSingle(markup) {
  const source = normalizeMarkup(markup);
  const lines = source.split('\n');

  const html = [];
  let paragraphBuffer = [];
  let ulBuffer = [];
  let olBuffer = [];

  function flushParagraph() {
    if (!paragraphBuffer.length) return;
    const text = paragraphBuffer.join(' ').trim();
    if (text) {
      html.push('<p>' + parseInline(text) + '</p>');
    }
    paragraphBuffer = [];
  }

  function flushUl() {
    if (!ulBuffer.length) return;
    html.push('<ul>');
    ulBuffer.forEach(function (item) {
      html.push('<li>' + parseInline(item) + '</li>');
    });
    html.push('</ul>');
    ulBuffer = [];
  }

  function flushOl() {
    if (!olBuffer.length) return;
    html.push('<ol>');
    olBuffer.forEach(function (item) {
      html.push('<li>' + parseInline(item) + '</li>');
    });
    html.push('</ol>');
    olBuffer = [];
  }

  function flushAll() {
    flushParagraph();
    flushUl();
    flushOl();
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      const nextLine = lines.slice(i + 1).find(function (l) {
        return l.trim();
      });

      const inOl = olBuffer.length > 0;
      const inUl = ulBuffer.length > 0;

      const nextIsOl = /^\d+\.\s+/.test(nextLine || '');
      const nextIsUl = /^[-*]\s+/.test(nextLine || '');

      if ((inOl && nextIsOl) || (inUl && nextIsUl)) {
        continue;
      }

      flushAll();
      continue;
    }

    if (line.startsWith('### ')) {
      flushAll();
      html.push('<h4>' + parseInline(line.slice(4).trim()) + '</h4>');
      continue;
    }

    if (line.startsWith('## ')) {
      flushAll();
      html.push('<h3>' + parseInline(line.slice(3).trim()) + '</h3>');
      continue;
    }

    if (line.startsWith('# ')) {
      flushAll();
      html.push('<h2>' + parseInline(line.slice(2).trim()) + '</h2>');
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      flushOl();
      ulBuffer.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushUl();
      olBuffer.push(line.replace(/^\d+\.\s+/, '').trim());
      continue;
    }

    flushUl();
    flushOl();
    paragraphBuffer.push(line);
  }

  flushAll();

  return html.join('');
}

  function renderContentItem(item) {
    if (typeof item === 'string') {
      return renderSingle(item);
    }

    if (isBlockObject(item)) {
      if (item.type === 'table') {
        return renderTableBlock(item);
      }

      if (item.type === 'chart') {
        return renderChartBlock(item);
      }
    }

    return '';
  }

  function render(markup) {
  if (Array.isArray(markup)) {
    const blocks = [];
    let textBuffer = [];

    function flushTextBuffer() {
      if (!textBuffer.length) return;
      blocks.push(renderSingle(textBuffer.join('\n\n')));
      textBuffer = [];
    }

    markup.forEach(function (item) {
      if (typeof item === 'string') {
        textBuffer.push(item);
        return;
      }

      flushTextBuffer();

      const rendered = renderContentItem(item);
      if (rendered) {
        blocks.push(rendered);
      }
    });

    flushTextBuffer();

    return '<div class="rendered-markup">' + blocks.join('') + '</div>';
  }

  return '<div class="rendered-markup">' + renderContentItem(markup) + '</div>';
}

  global.MarkupEngine = {
    render: render
  };
})(window);
