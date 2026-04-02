/*!
 * ExportLib v2.2
 * jQuery library for exporting structured JSON into:
 *  - LaTeX (.tex)
 *  - Markdown (.md)
 *  - RTF (.rtf)
 *
 * Fixes in v2.2:
 *  - fixed leaking placeholders in LaTeX
 *  - fixed internal references $label|key$
 *  - fixed nested patterns like **[link](url)**
 *  - all LaTeX links now have a thin blue border
 */

(function (global, $) {
  'use strict';

  if (!$) {
    throw new Error('CompassExportLib v2.2 requires jQuery.');
  }

  const CompassExportLib = {};
  const authorName="Jan Motal";

  /* =========================================================
   * PUBLIC API
   * ========================================================= */

  CompassExportLib.exportAll = function (jsonData, baseFilename, options) {
    options = options || {};
    return {
      latex: this.exportLatex(jsonData, baseFilename, options.latex || {}),
      markdown: this.exportMarkdown(jsonData, baseFilename, options.markdown || {}),
      rtf: this.exportRtf(jsonData, baseFilename, options.rtf || {})
    };
  };

  CompassExportLib.exportLatex = function (jsonData, filename, options) {
    const content = this.generateLatex(jsonData, options || {});
    this.downloadText(content, ensureExt(filename, '.tex'), 'application/x-tex;charset=utf-8');
    return content;
  };

  CompassExportLib.exportMarkdown = function (jsonData, filename, options) {
    const content = this.generateMarkdown(jsonData, options || {});
    this.downloadText(content, ensureExt(filename, '.md'), 'text/markdown;charset=utf-8');
    return content;
  };

  CompassExportLib.exportRtf = function (jsonData, filename, options) {
    const content = this.generateRtf(jsonData, options || {});
    this.downloadText(content, ensureExt(filename, '.rtf'), 'application/rtf;charset=utf-8');
    return content;
  };

  CompassExportLib.downloadText = function (content, filename, mimeType) {
    const blob = new Blob([content], {
      type: mimeType || 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const $a = $('<a>', {
      href: url,
      download: filename,
      style: 'display:none'
    });

    $('body').append($a);
    $a[0].click();

    setTimeout(function () {
      URL.revokeObjectURL(url);
      $a.remove();
    }, 0);
  };

  /* =========================================================
   * MAIN GENERATORS
   * ========================================================= */

  CompassExportLib.generateLatex = function (jsonData, options) {
    options = Object.assign({
      documentClass: 'article',
      fontSize: '11pt',
      paperSize: 'a4paper',
      margin: '2.5cm',
      includePreamble: true,
      titlePage: true,
      toc: false,
      engine: 'xelatex',
      topLevel: 1,
      language: 'czech'
    }, options || {});

    const ctx = buildContext(jsonData);
    const lines = [];

    const title = safeGet(jsonData, 'meta.title', 'Untitled');
    const subtitle = safeGet(jsonData, 'meta.subtitle', '');
    const infoPosition = safeGet(jsonData, 'info.position', 'start');
    const info = jsonData && jsonData.info ? jsonData.info : null;
    const sections = Array.isArray(jsonData && jsonData.sections) ? jsonData.sections : [];

    if (options.includePreamble) {
      lines.push('\\documentclass[' + options.fontSize + ',' + options.paperSize + ']{' + options.documentClass + '}');

      if (options.engine === 'xelatex' || options.engine === 'lualatex') {
        lines.push('\\usepackage{fontspec}');
        lines.push('\\usepackage{polyglossia}');
        lines.push('\\setmainlanguage{' + latexEscape(options.language) + '}');
      } else {
        lines.push('\\usepackage[T1]{fontenc}');
        lines.push('\\usepackage[utf8]{inputenc}');
        lines.push('\\usepackage[' + latexEscape(options.language) + ']{babel}');
      }

      lines.push('\\usepackage{xcolor}');
      lines.push('\\usepackage[unicode]{hyperref}');
      lines.push('\\hypersetup{');
      lines.push('  colorlinks=false,');
      lines.push('  pdfborder={0 0 1},');
      lines.push('  linkbordercolor={0 0 1},');
      lines.push('  urlbordercolor={0 0 1},');
      lines.push('  citebordercolor={0 0 1}');
      lines.push('}');
      lines.push('\\usepackage{enumitem}');
      lines.push('\\usepackage{parskip}');
      lines.push('\\setlength{\\parindent}{0pt}');
      lines.push('\\setlist[itemize]{leftmargin=2em}');
      lines.push('\\setlist[enumerate]{leftmargin=2em}');
      lines.push('');
      lines.push('\\title{' + latexEscape(title) + '}');
      lines.push('\\author{' + authorName + '}');
      lines.push('\\date{}');
      lines.push('');
      lines.push('\\begin{document}');
      lines.push('');

      if (options.titlePage) {
        lines.push('\\maketitle');
        if (subtitle && String(subtitle).trim()) {
          lines.push('\\begin{center}');
          lines.push('{\\large ' + latexEscape(subtitle) + '}');
          lines.push('\\end{center}');
          lines.push('');
        }
      }

      if (options.toc) {
        lines.push('\\tableofcontents');
        lines.push('\\bigskip');
        lines.push('');
      }
    }

    if (info && infoPosition === 'start') {
      renderLatexInfo(info, lines, ctx, options.topLevel);
    }

    sections.forEach(function (section) {
      renderLatexSection(section, lines, ctx, options.topLevel);
    });

    if (info && infoPosition === 'end') {
      renderLatexInfo(info, lines, ctx, options.topLevel);
    }

    if (options.includePreamble) {
      lines.push('');
      lines.push('\\end{document}');
    }

    return cleanupText(lines.join('\n'));
  };

  CompassExportLib.generateMarkdown = function (jsonData, options) {
    options = Object.assign({
      includeTitle: true,
      topHeadingLevel: 1
    }, options || {});

    const ctx = buildContext(jsonData);
    const lines = [];

    const title = safeGet(jsonData, 'meta.title', 'Untitled');
    const subtitle = safeGet(jsonData, 'meta.subtitle', '');
    const infoPosition = safeGet(jsonData, 'info.position', 'start');
    const info = jsonData && jsonData.info ? jsonData.info : null;
    const sections = Array.isArray(jsonData && jsonData.sections) ? jsonData.sections : [];

    if (options.includeTitle) {
      lines.push(repeatChar('#', options.topHeadingLevel) + ' ' + mdEscapeTitle(title));
      if (subtitle && String(subtitle).trim()) {
        lines.push('');
        lines.push('*' + subtitle + '*');
      }
      lines.push('');
    }

    if (info && infoPosition === 'start') {
      renderMarkdownInfo(info, lines, ctx, options.topHeadingLevel + 1);
    }

    sections.forEach(function (section) {
      renderMarkdownSection(section, lines, ctx, options.topHeadingLevel + 1);
    });

    if (info && infoPosition === 'end') {
      renderMarkdownInfo(info, lines, ctx, options.topHeadingLevel + 1);
    }

    return cleanupText(lines.join('\n'));
  };

  CompassExportLib.generateRtf = function (jsonData, options) {
    options = Object.assign({
      includeTitle: true,
      topLevel: 1
    }, options || {});

    const ctx = buildContext(jsonData);
    const out = [];

    const title = safeGet(jsonData, 'meta.title', 'Untitled');
    const subtitle = safeGet(jsonData, 'meta.subtitle', '');
    const infoPosition = safeGet(jsonData, 'info.position', 'start');
    const info = jsonData && jsonData.info ? jsonData.info : null;
    const sections = Array.isArray(jsonData && jsonData.sections) ? jsonData.sections : [];

    out.push('{\\rtf1\\ansi\\deff0');
    out.push('{\\fonttbl{\\f0 Times New Roman;}{\\f1 Arial;}}');
    out.push('\\viewkind4\\uc1');

    if (options.includeTitle) {
      out.push(rtfParagraph(title, { bold: true, size: 34, align: 'center', font: 1 }));
      if (subtitle && String(subtitle).trim()) {
        out.push(rtfParagraph(subtitle, { italic: true, size: 24, align: 'center', font: 1 }));
      }
    }

    if (info && infoPosition === 'start') {
      renderRtfInfo(info, out, ctx, options.topLevel);
    }

    sections.forEach(function (section) {
      renderRtfSection(section, out, ctx, options.topLevel);
    });

    if (info && infoPosition === 'end') {
      renderRtfInfo(info, out, ctx, options.topLevel);
    }

    out.push('}');
    return out.join('\n');
  };

  /* =========================================================
   * CONTEXT / REFERENCES
   * ========================================================= */

  function buildContext(jsonData) {
    const references = {};
    const sections = Array.isArray(jsonData && jsonData.sections) ? jsonData.sections : [];

    sections.forEach(function (section) {
      if (!section || !section.subsections) return;

      Object.keys(section.subsections).forEach(function (key) {
        const sub = section.subsections[key];
        references[key] = {
          key: key,
          title: sub && sub.title ? sub.title : key,
          latexLabel: 'ref:' + slugify(key),
          anchor: slugify(key)
        };
      });
    });

    return {
      references: references
    };
  }

  /* =========================================================
   * LATEX RENDERING
   * ========================================================= */

  function renderLatexInfo(info, lines, ctx, level) {
    if (!info) return;
    pushLatexHeading(lines, info.title || 'Info', level);
    renderLatexContentArray(info.content || [], lines, ctx, level);
  }

  function renderLatexSection(section, lines, ctx, level) {
    if (!section) return;

    pushLatexHeading(lines, section.title || 'Section', level);

    if (section.short) {
      lines.push('\\textit{' + renderInlineLatex(section.short, ctx) + '}');
      lines.push('');
    }

    renderLatexContentArray(section.content || [], lines, ctx, level);

    if (section.subsections && typeof section.subsections === 'object') {
      Object.keys(section.subsections).forEach(function (key) {
        const sub = section.subsections[key];
        const ref = ctx.references[key];

        pushLatexHeading(lines, (sub && sub.title) ? sub.title : key, level + 1);

        if (ref) {
          lines.push('\\label{' + ref.latexLabel + '}');
        }

        renderLatexContentArray((sub && sub.content) || [], lines, ctx, level + 1);
      });
    }
  }

  function renderLatexContentArray(arr, lines, ctx, level) {
    if (!Array.isArray(arr)) return;

    let openList = null;

    function closeList() {
      if (openList) {
        lines.push('\\end{' + openList + '}');
        openList = null;
      }
    }

    arr.forEach(function (rawItem) {
      const parsed = parseLine(rawItem);

      if (parsed.type === 'blank') {
        closeList();
        lines.push('');
        return;
      }

      if (parsed.type === 'heading') {
        closeList();
        pushLatexHeading(lines, parsed.text, level + parsed.level);
        return;
      }

      if (parsed.type === 'list-item') {
        const env = parsed.ordered ? 'enumerate' : 'itemize';
        if (openList !== env) {
          closeList();
          openList = env;
          lines.push('\\begin{' + env + '}');
        }
        lines.push('\\item ' + renderInlineLatex(parsed.text, ctx));
        return;
      }

      if (isLikelyLiteratureHeading(parsed.text)) {
        closeList();
        pushLatexHeading(lines, parsed.text, level);
        return;
      }

      closeList();
      lines.push(renderInlineLatex(parsed.text, ctx));
      lines.push('');
    });

    closeList();
  }

  function pushLatexHeading(lines, text, level) {
    const normalized = latexEscape(normalizeTilde(text));
    const map = {
      1: 'section',
      2: 'subsection',
      3: 'subsubsection',
      4: 'paragraph',
      5: 'subparagraph'
    };
    const cmd = map[level] || 'subparagraph';

    if (cmd === 'paragraph' || cmd === 'subparagraph') {
      lines.push('\\' + cmd + '{' + normalized + '}');
    } else {
      lines.push('\\' + cmd + '{' + normalized + '}');
      lines.push('');
    }
  }

  /* =========================================================
   * MARKDOWN RENDERING
   * ========================================================= */

  function renderMarkdownInfo(info, lines, ctx, level) {
    if (!info) return;
    lines.push(repeatChar('#', level) + ' ' + info.title);
    lines.push('');
    renderMarkdownContentArray(info.content || [], lines, ctx, level);
  }

  function renderMarkdownSection(section, lines, ctx, level) {
    if (!section) return;

    lines.push(repeatChar('#', level) + ' ' + section.title);
    lines.push('');

    if (section.short) {
      lines.push('*' + renderInlineMarkdown(section.short, ctx) + '*');
      lines.push('');
    }

    renderMarkdownContentArray(section.content || [], lines, ctx, level);

    if (section.subsections && typeof section.subsections === 'object') {
      Object.keys(section.subsections).forEach(function (key) {
        const sub = section.subsections[key];
        const ref = ctx.references[key];
        const title = (sub && sub.title) ? sub.title : key;

        if (ref) {
          lines.push('<a id="' + ref.anchor + '"></a>');
        }

        lines.push(repeatChar('#', level + 1) + ' ' + title);
        lines.push('');
        renderMarkdownContentArray((sub && sub.content) || [], lines, ctx, level + 1);
      });
    }
  }

  function renderMarkdownContentArray(arr, lines, ctx, level) {
    if (!Array.isArray(arr)) return;

    arr.forEach(function (rawItem) {
      const parsed = parseLine(rawItem);

      if (parsed.type === 'blank') {
        lines.push('');
        return;
      }

      if (parsed.type === 'heading') {
        lines.push(repeatChar('#', level + parsed.level) + ' ' + parsed.text);
        lines.push('');
        return;
      }

      if (parsed.type === 'list-item') {
        lines.push((parsed.ordered ? '1. ' : '- ') + renderInlineMarkdown(parsed.text, ctx));
        return;
      }

      lines.push(renderInlineMarkdown(parsed.text, ctx));
      lines.push('');
    });
  }

  /* =========================================================
   * RTF RENDERING
   * ========================================================= */

  function renderRtfInfo(info, out, ctx, level) {
    if (!info) return;
    out.push(rtfHeading(info.title || 'Info', level));
    renderRtfContentArray(info.content || [], out, ctx, level);
  }

  function renderRtfSection(section, out, ctx, level) {
    if (!section) return;

    out.push(rtfHeading(section.title || 'Section', level));

    if (section.short) {
      out.push(rtfParagraph(stripMarkupAndReferences(section.short), { italic: true }));
    }

    renderRtfContentArray(section.content || [], out, ctx, level);

    if (section.subsections && typeof section.subsections === 'object') {
      Object.keys(section.subsections).forEach(function (key) {
        const sub = section.subsections[key];
        const title = (sub && sub.title) ? sub.title : key;
        out.push(rtfHeading(title, level + 1));
        renderRtfContentArray((sub && sub.content) || [], out, ctx, level + 1);
      });
    }
  }

  function renderRtfContentArray(arr, out, ctx, level) {
  if (!Array.isArray(arr)) return;

  let orderedIndex = 0;
  let previousWasOrdered = false;

  arr.forEach(function (rawItem) {
    const parsed = parseLine(rawItem);

    if (parsed.type === 'blank') {
      out.push('\\par');
      orderedIndex = 0;
      previousWasOrdered = false;
      return;
    }

    if (parsed.type === 'heading') {
      out.push(rtfHeading(parsed.text, level + parsed.level));
      orderedIndex = 0;
      previousWasOrdered = false;
      return;
    }

    if (parsed.type === 'list-item') {
      if (parsed.ordered) {
        if (!previousWasOrdered) {
          orderedIndex = 1;
        } else {
          orderedIndex += 1;
        }

        out.push(rtfParagraph(orderedIndex + '. ' + stripMarkupAndReferences(parsed.text)));
        previousWasOrdered = true;
      } else {
        out.push(rtfParagraph('• ' + stripMarkupAndReferences(parsed.text)));
        orderedIndex = 0;
        previousWasOrdered = false;
      }
      return;
    }

    orderedIndex = 0;
    previousWasOrdered = false;
    out.push(rtfParagraph(stripMarkupAndReferences(parsed.text)));
  });
}

  function rtfHeading(text, level) {
    const sizeMap = {
      1: 32,
      2: 28,
      3: 24,
      4: 22,
      5: 20
    };
    return rtfParagraph(text, {
      bold: true,
      size: sizeMap[level] || 20,
      font: 1
    });
  }

  function rtfParagraph(text, options) {
    options = options || {};
    const parts = ['\\pard\\sa180\\sl276\\slmult1'];

    parts.push(options.font === 1 ? '\\f1' : '\\f0');
    parts.push('\\fs' + (options.size || 24));

    if (options.align === 'center') parts.push('\\qc');
    else if (options.align === 'right') parts.push('\\qr');
    else parts.push('\\ql');

    if (options.bold) parts.push('\\b');
    if (options.italic) parts.push('\\i');

    parts.push(' ' + rtfEscape(normalizeTilde(text)));

    if (options.bold) parts.push('\\b0');
    if (options.italic) parts.push('\\i0');

    parts.push('\\par');
    return parts.join('');
  }

  function rtfEscape(str) {
    let out = '';
    String(str || '').split('').forEach(function (ch) {
      const code = ch.charCodeAt(0);

      if (ch === '\\') out += '\\\\';
      else if (ch === '{') out += '\\{';
      else if (ch === '}') out += '\\}';
      else if (code > 127) out += '\\u' + code + '?';
      else if (ch === '\n') out += '\\par ';
      else out += ch;
    });

    return out;
  }

  /* =========================================================
   * INLINE PARSERS
   * ========================================================= */

  function renderInlineLatex(text, ctx) {
    return renderInlineGeneric(String(text || ''), ctx, {
      text: function (t) {
        return latexEscape(normalizeTilde(t));
      },
      bold: function (inner) {
        return '\\textbf{' + renderInlineLatex(inner, ctx) + '}';
      },
      italic: function (inner) {
        return '\\textit{' + renderInlineLatex(inner, ctx) + '}';
      },
      link: function (label, url) {
        return '\\href{' + latexEscapeUrl(url) + '}{' + renderInlineLatex(label, ctx) + '}';
      },
      reference: function (label, key) {
        const ref = ctx.references[key];
        if (ref) {
          return '\\hyperref[' + ref.latexLabel + ']{' + renderInlineLatex(label, ctx) + '}';
        }
        return '\\textit{' + renderInlineLatex(label, ctx) + '}';
      }
    });
  }

  function renderInlineMarkdown(text, ctx) {
    return renderInlineGeneric(String(text || ''), ctx, {
      text: function (t) {
        return normalizeTilde(t);
      },
      bold: function (inner) {
        return '**' + renderInlineMarkdown(inner, ctx) + '**';
      },
      italic: function (inner) {
        return '*' + renderInlineMarkdown(inner, ctx) + '*';
      },
      link: function (label, url) {
        return '[' + renderInlineMarkdown(label, ctx) + '](' + url + ')';
      },
      reference: function (label, key) {
        const ref = ctx.references[key];
        if (ref) {
          return '[' + renderInlineMarkdown(label, ctx) + '](#' + ref.anchor + ')';
        }
        return '*' + renderInlineMarkdown(label, ctx) + '*';
      }
    });
  }

  function renderInlineGeneric(source, ctx, handlers) {
  source = String(source || '');

  let out = '';
  let i = 0;

  while (i < source.length) {
    // **bold**
    if (source.slice(i, i + 2) === '**') {
      const end = findClosingDoubleAsterisk(source, i + 2);
      if (end !== -1) {
        const inner = source.slice(i + 2, end);
        out += handlers.bold(inner);
        i = end + 2;
        continue;
      }
    }

    // *italic*
    if (source[i] === '*') {
      const end = findClosingSingleAsterisk(source, i + 1);
      if (end !== -1) {
        const inner = source.slice(i + 1, end);
        out += handlers.italic(inner);
        i = end + 1;
        continue;
      }
    }

    // $label|key$
    if (source[i] === '$') {
      const end = source.indexOf('$', i + 1);
      if (end !== -1) {
        const inner = source.slice(i + 1, end);
        const pipeIndex = inner.indexOf('|');

        if (pipeIndex !== -1) {
          const label = inner.slice(0, pipeIndex).trim();
          const key = inner.slice(pipeIndex + 1).trim();

          if (label && key) {
            out += handlers.reference(label, key);
            i = end + 1;
            continue;
          }
        }
      }
    }

    // [label](url)
    if (source[i] === '[') {
      const parsedLink = parseMarkdownLinkAt(source, i);
      if (parsedLink) {
        out += handlers.link(parsedLink.label, parsedLink.url);
        i = parsedLink.end;
        continue;
      }
    }

    // fallback: consume at least one character
    const next = findNextSpecialIndex(source, i + 1);

    if (next === -1) {
      out += handlers.text(source.slice(i));
      break;
    }

    // if current char is special but invalid, emit it literally and move on
    if (next <= i) {
      out += handlers.text(source.charAt(i));
      i += 1;
      continue;
    }

    out += handlers.text(source.slice(i, next));
    i = next;
  }

  return out;
}
  function parseMarkdownLinkAt(source, start) {
    if (source[start] !== '[') return null;

    const closeBracket = source.indexOf(']', start + 1);
    if (closeBracket === -1) return null;
    if (source[closeBracket + 1] !== '(') return null;

    let j = closeBracket + 2;
    let depth = 1;

    while (j < source.length) {
      if (source[j] === '(') depth += 1;
      else if (source[j] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
      j += 1;
    }

    if (j >= source.length) return null;

    return {
      label: source.slice(start + 1, closeBracket),
      url: source.slice(closeBracket + 2, j),
      end: j + 1
    };
  }

  function findNextSpecialIndex(source, from) {
  const candidates = [];

  const idxDouble = source.indexOf('**', from);
  const idxSingle = source.indexOf('*', from);
  const idxDollar = source.indexOf('$', from);
  const idxBracket = source.indexOf('[', from);

  if (idxDouble !== -1) candidates.push(idxDouble);
  if (idxSingle !== -1) candidates.push(idxSingle);
  if (idxDollar !== -1) candidates.push(idxDollar);
  if (idxBracket !== -1) candidates.push(idxBracket);

  if (!candidates.length) return -1;
  return Math.min.apply(null, candidates);
}

  function findClosingDoubleAsterisk(source, from) {
    return source.indexOf('**', from);
  }

  function findClosingSingleAsterisk(source, from) {
    let i = from;
    while (i < source.length) {
      if (source[i] === '*' && source.slice(i, i + 2) !== '**') {
        return i;
      }
      i += 1;
    }
    return -1;
  }

  /* =========================================================
   * PARSING / PLAIN STRIPPING
   * ========================================================= */

  function parseLine(raw) {
    const text = String(raw == null ? '' : raw);
    const trimmed = text.trim();

    if (!trimmed) {
      return { type: 'blank', text: '' };
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s*(.+)$/);
    if (headingMatch) {
      return {
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      };
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      return {
        type: 'list-item',
        ordered: true,
        text: orderedMatch[1].trim()
      };
    }

    const bulletMatch = trimmed.match(/^\-\s+(.+)$/);
    if (bulletMatch) {
      return {
        type: 'list-item',
        ordered: false,
        text: bulletMatch[1].trim()
      };
    }

    return {
      type: 'paragraph',
      text: trimmed
    };
  }

  function stripMarkupAndReferences(text) {
    return String(text || '')
      .replace(/\$([^|$]+)\|([^$]+)\$/g, '$1')
      .replace(/\[([^\]]+)\]\(\(([^)]+)\)/g, '$1 ($2)')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1');
  }

  /* =========================================================
   * HELPERS
   * ========================================================= */

  function latexEscape(str) {
    return String(str || '')
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/([#$%&_{}])/g, '\\$1')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}');
  }

  function latexEscapeUrl(str) {
    return String(str || '')
      .replace(/\\/g, '/')
      .replace(/([{}])/g, '\\$1');
  }

  function mdEscapeTitle(text) {
    return String(text || '').replace(/\n+/g, ' ').trim();
  }

  function normalizeTilde(text) {
    return String(text || '').replace(/~/g, ' ');
  }

  function cleanupText(text) {
    return String(text || '')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n';
  }

  function repeatChar(ch, count) {
    return new Array((count || 0) + 1).join(ch);
  }

  function ensureExt(filename, ext) {
    const name = String(filename || 'export');
    return name.toLowerCase().endsWith(ext.toLowerCase()) ? name : name + ext;
  }

  function safeGet(obj, path, fallback) {
    try {
      const value = path.split('.').reduce(function (acc, key) {
        return acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined;
      }, obj);
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'ref';
  }

  function isLikelyLiteratureHeading(text) {
    const t = String(text || '').trim().toLowerCase();
    return (
      t === 'kam dál?' ||
      t === 'kam dal?' ||
      t === 'použitá literatura' ||
      t === 'pouzita literatura' ||
      t === 'doporučená literatura' ||
      t === 'doporucena literatura' ||
      t === 'použitá a doporučená literatura' ||
      t === 'pouzita a doporucena literatura' ||
      t === 'o autorovi'
    );
  }

  /* =========================================================
   * EXPORT TO GLOBAL
   * ========================================================= */

  global.CompassExportLib = CompassExportLib;

})(window, window.jQuery);
