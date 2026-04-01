(function (global) {
  function normalize(items) {
    const max = Math.max(...items.map((i) => i.value), 1);
    return items.map((i) => ({ ...i, norm: i.value / max }));
  }

  function barChart(items, options = {}) {
    const { orientation = 'horizontal', width = 28, height = 10 } = options;
    const normalized = normalize(items);

    if (orientation === 'vertical') {
      const cols = normalized.map((i) => Math.round(i.norm * height));
      const rows = [];
      for (let r = height; r >= 1; r--) {
        rows.push(cols.map((c) => (c >= r ? '█' : ' ')).join(' '));
      }
      rows.push('-'.repeat(Math.max(3, cols.length * 2 - 1)));
      rows.push(items.map((i) => i.label.slice(0, 2)).join(' '));
      return rows.join('\n');
    }

    return normalized.map((i) => {
      const bars = '█'.repeat(Math.max(1, Math.round(i.norm * width)));
      return `${i.label.padEnd(14)} | ${bars} ${i.value}`;
    }).join('\n');
  }

  function plot(points, options = {}) {
    const w = options.width || 36;
    const h = options.height || 12;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const grid = Array.from({ length: h }, () => Array.from({ length: w }, () => ' '));

    points.forEach((p) => {
      const x = Math.round(((p.x - minX) / (maxX - minX || 1)) * (w - 1));
      const y = h - 1 - Math.round(((p.y - minY) / (maxY - minY || 1)) * (h - 1));
      grid[y][x] = '●';
    });

    return grid.map((r) => r.join('')).join('\n');
  }

  global.AsciiChart = { barChart, plot };
})(window);
