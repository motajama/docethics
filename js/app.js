(function ($) {
  const state = {
    lang: 'en',
    skin: 'classic-mac',
    data: null,
    activeIndex: 0
  };

const WHEEL = {
  cx: 320,
  cy: 320,
  outerR: 160,
  innerR: 66,
  labelRadius: 255
};

  function updateLanguageSwitcher() {
  $('.lang-link').removeClass('is-active').attr('aria-current', 'false');
  $(`.lang-link[data-lang="${state.lang}"]`)
    .addClass('is-active')
    .attr('aria-current', 'page');
}

  function fetchLanguage(lang) {
    return fetch(`./data/${lang}.json`).then((r) => r.json());
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  }

  function describeArcSlice(cx, cy, outerR, innerR, startAngle, endAngle) {
    const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
    const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
    const startInner = polarToCartesian(cx, cy, innerR, startAngle);
    const endInner = polarToCartesian(cx, cy, innerR, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
      'Z'
    ].join(' ');
  }

  function getSectionStep(total) {
    return 360 / total;
  }

  function getMidAngle(index, total) {
    return index * getSectionStep(total) + getSectionStep(total) / 2;
  }

  function wrapSvgText(text, maxChars = 16) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let current = '';

    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });

    if (current) lines.push(current);
    return lines.slice(0, 3);
  }

  function renderWheel() {
  const sections = state.data.sections;
  const $connectors = $('#wheel-connectors').empty();
  const $labels = $('#wheel-label-nodes').empty();

  const segmentIds = [
    '#seg-social-actors',
    '#seg-audience',
    '#seg-artistic-vision',
    '#seg-institutional'
  ];

  $('.wheel-slice').removeClass('is-active');

  segmentIds.forEach((selector, i) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const isActive = i === state.activeIndex;
    el.classList.toggle('is-active', isActive);
    el.setAttribute('data-index', i);
    el.setAttribute('aria-label', sections[i].title);

    $(el).off('click keydown').on('click keydown', function (e) {
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveSection(i);
      }
    });
  });

  const directions = [
    { angle: 0,   anchor: 'middle', dx: 0,   dy: -10 },  // top
    { angle: 90,  anchor: 'start',  dx: 14,  dy: 0 },    // right
    { angle: 180, anchor: 'middle', dx: 0,   dy: 22 },   // bottom
    { angle: 270, anchor: 'end',    dx: -14, dy: 0 }     // left
  ];

  sections.forEach((section, i) => {
    const cfg = directions[i];
    const isActive = i === state.activeIndex;

    const lineStart = polarToCartesian(WHEEL.cx, WHEEL.cy, WHEEL.outerR + 2, cfg.angle);
    const lineEnd = polarToCartesian(WHEEL.cx, WHEEL.cy, WHEEL.labelRadius - 34, cfg.angle);

    const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connector.setAttribute('x1', lineStart.x);
    connector.setAttribute('y1', lineStart.y);
    connector.setAttribute('x2', lineEnd.x);
    connector.setAttribute('y2', lineEnd.y);
    connector.setAttribute('class', `wheel-connector${isActive ? ' is-active' : ''}`);
    $connectors.append(connector);

    const labelPos = polarToCartesian(WHEEL.cx, WHEEL.cy, WHEEL.labelRadius, cfg.angle);

    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelGroup.setAttribute('class', `wheel-label-node${isActive ? ' is-active' : ''}`);
    labelGroup.setAttribute('data-index', i);
    labelGroup.setAttribute('tabindex', '0');
    labelGroup.setAttribute('role', 'button');
    labelGroup.setAttribute('aria-label', section.title);

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', labelPos.x + cfg.dx);
    textEl.setAttribute('y', labelPos.y + cfg.dy);
    textEl.setAttribute('class', 'wheel-label-text');
    textEl.setAttribute('text-anchor', cfg.anchor);

    const lines = wrapSvgText(section.title, 18);
    const lineHeight = 18;
    const startYOffset = -((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, idx) => {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('x', labelPos.x + cfg.dx);
      tspan.setAttribute('dy', idx === 0 ? startYOffset : lineHeight);
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });

    labelGroup.appendChild(textEl);

    $(labelGroup).on('click keydown', function (e) {
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveSection(i);
      }
    });

    $labels.append(labelGroup);
  });
}

  function renderHeroText() {
  const section = state.data.sections[state.activeIndex];
  const html = `
    <h3>${section.title}</h3>
    <p>${section.short}</p>
    <a href="#section-${section.id}" data-jump="${section.id}">${state.data.ui.more}</a>
  `;

  const $hero = $('#hero-description');
  $hero.html(html);

  $hero.find('[data-jump]').on('click', function (e) {
    e.preventDefault();
    const id = $(this).data('jump');
    setSectionOpen(id, true, true);
  });
}

  function makeChart(block) {
    if (!block || !block.type) return '';
    if (block.type === 'bar') {
      return `<pre class="ascii-chart">${AsciiChart.barChart(block.items, block.options)}</pre>`;
    }
    if (block.type === 'plot') {
      return `<pre class="ascii-chart">${AsciiChart.plot(block.points, block.options)}</pre>`;
    }
    return '';
  }

  function renderSections() {
    const $root = $('#content-root').empty();

    state.data.sections.forEach((s) => {
      const sectionHtml = `
        <section class="section-block" id="section-${s.id}">
          <button class="section-header" aria-expanded="false">
            <span>${s.title}</span>
            <span aria-hidden="true">+</span>
          </button>

          <div class="section-body">
            <div class="section-main">
              ${MarkupEngine.render(s.content)}
              ${makeChart(s.chart)}
            </div>
            <aside class="section-side" aria-live="polite"></aside>
          </div>
        </section>
      `;

      const $sec = $(sectionHtml);

      $sec.find('.section-header').on('click', () => setSectionOpen(s.id));

      $sec.find('.section-main').on('click', '.inline-link', function () {
        const key = $(this).data('subsection');
        const sub = s.subsections?.[key];
        if (!sub) return;

        const $side = $sec.find('.section-side');
        $side.html(`
          <h4>${sub.title}</h4>
          ${MarkupEngine.render(sub.content)}
        `).addClass('is-visible');
      });

      $root.append($sec);
    });
  }

  function setSectionOpen(id, forceOpen = null, smooth = false) {
    const $all = $('.section-block');
    const $current = $(`#section-${id}`);
    const open = forceOpen !== null ? forceOpen : !$current.hasClass('is-open');

    $all.removeClass('is-open')
      .find('.section-header')
      .attr('aria-expanded', 'false');

    if (open) {
      $current.addClass('is-open')
        .find('.section-header')
        .attr('aria-expanded', 'true');

      if (smooth && $current[0]) {
        $current[0].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }

function setActiveSection(index) {
  state.activeIndex = index;
  renderWheel();
  renderHeroText();

  if (window.matchMedia('(max-width: 900px)').matches) {
    const hero = document.getElementById('hero-description');
    if (hero) {
      hero.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

async function loadLanguage(lang) {
  state.lang = lang;
  state.data = await fetchLanguage(lang);

  $('html')
    .attr('lang', lang)
    .attr('dir', state.data.meta.dir || 'ltr');

  $('#site-title').text(state.data.meta.title);
  $('#site-subtitle').text(state.data.meta.subtitle);

  updateLanguageSwitcher();
  renderWheel();
  renderHeroText();
  renderSections();
}

$(async function () {
  SkinEngine.applySkin(state.skin);
  await loadLanguage(state.lang);

  $(document).on('click', '.lang-link', async function (e) {
    e.preventDefault();

    const lang = $(this).data('lang');
    if (!lang || lang === state.lang) return;

    await loadLanguage(lang);
  });

  $('#skin-select').on('change', function () {
    state.skin = $(this).val();
    SkinEngine.applySkin(state.skin);
  });
});
})(jQuery);
