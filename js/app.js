(function ($) {
  const state = {
    lang: 'cs',
    skin: 'amiga',
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

  function textWithNbsp(text) {
    return String(text || '')
      .replace(/\\~/g, '%%ESCAPED_TILDE%%')
      .replace(/~/g, '\u00A0')
      .replace(/%%ESCAPED_TILDE%%/g, '~');
  }

  function htmlEscape(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeTextHtml(text) {
    return htmlEscape(textWithNbsp(text));
  }

  function renderContent(content) {
    if (Array.isArray(content)) {
      return MarkupEngine.render(content);
    }
    return MarkupEngine.render(content || '');
  }

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

  function wrapSvgText(text, maxChars = 16) {
    const nbsp = '\u00A0';
    const normalized = textWithNbsp(text);
    const protectedText = normalized.replace(new RegExp(nbsp, 'g'), '%%NBSP%%');
    const words = protectedText.split(/ +/);
    const lines = [];
    let current = '';

    words.forEach((word) => {
      const restoredWord = word.replace(/%%NBSP%%/g, nbsp);
      const candidate = current ? `${current} ${restoredWord}` : restoredWord;

      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = restoredWord;
      } else {
        current = candidate;
      }
    });

    if (current) lines.push(current);
    return lines.slice(0, 3);
  }

  function isMobileLayout() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function refreshSectionHeight($section) {
    if (!$section || !$section.length) return;
    const $body = $section.find('.section-body');
    if (!$body.length) return;

    const body = $body[0];

    if (!$section.hasClass('is-open')) {
      $body.css('--section-open-height', '0px');
      return;
    }

    const previousMaxHeight = body.style.maxHeight;
    body.style.maxHeight = 'none';
    const measured = body.scrollHeight;
    body.style.maxHeight = previousMaxHeight;

    $body.css('--section-open-height', `${measured}px`);
  }

  function refreshAllSectionHeights() {
    $('.section-block').each(function () {
      refreshSectionHeight($(this));
    });
  }

  function scrollToSideboxTop($section) {
    const $side = $section.find('.section-side');
    if (!$side.length || !$side.hasClass('is-visible')) return;

    const behavior = 'smooth';
    $side[0].scrollIntoView({
      behavior,
      block: isMobileLayout() ? 'start' : 'nearest',
      inline: 'nearest'
    });

    const $heading = $side.find('.sidebox-title').first();
    if ($heading.length) {
      window.setTimeout(() => {
        $heading.trigger('focus');
      }, 180);
    }
  }

  function renderWheel() {
    const sections = state.data.sections || [];
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
      if (!el || !sections[i]) return;

      const isActive = i === state.activeIndex;
      el.classList.toggle('is-active', isActive);
      el.setAttribute('data-index', i);
      el.setAttribute('aria-label', textWithNbsp(sections[i].title));

      $(el).off('click keydown').on('click keydown', function (e) {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveSection(i);
        }
      });
    });

    const directions = [
      { angle: 0, anchor: 'middle', dx: 0, dy: -10 },
      { angle: 90, anchor: 'start', dx: 14, dy: 0 },
      { angle: 180, anchor: 'middle', dx: 0, dy: 22 },
      { angle: 270, anchor: 'end', dx: -14, dy: 0 }
    ];

    sections.forEach((section, i) => {
      const cfg = directions[i];
      if (!cfg) return;

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
      labelGroup.setAttribute('aria-label', textWithNbsp(section.title));

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
    if (!section) return;

    const html = `
      <h3>${safeTextHtml(section.title)}</h3>
      <p>${safeTextHtml(section.short || '')}</p>
      <a href="#section-${section.id}" data-jump="${htmlEscape(section.id)}">${safeTextHtml(state.data.ui?.more || 'více')}</a>
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

  function renderInfoBlock() {
    const info = state.data.info;
    if (!info || !info.content) return '';

    const title = info.title ? `<h2>${safeTextHtml(info.title)}</h2>` : '';

    return `
      <section class="info-block" id="info-block">
        <div class="info-block-inner">
          ${title}
          ${renderContent(info.content)}
          ${makeChart(info.chart)}
        </div>
      </section>
    `;
  }

  function closeSideboxes($scope = $('.section-block')) {
    $scope.each(function () {
      const $section = $(this);
      const $side = $section.find('.section-side');
      $side
        .removeClass('is-visible')
        .attr('aria-hidden', 'true')
        .empty();

      $section.find('.inline-link.is-open')
        .removeClass('is-open')
        .attr('aria-expanded', 'false');

      refreshSectionHeight($section);
    });
  }

  function toggleInlinePanel($trigger, $section, subsection) {
    const $side = $section.find('.section-side');
    const sideId = $side.attr('id');
    const isSameOpen = $trigger.hasClass('is-open') && $side.hasClass('is-visible');

    $section.find('.inline-link')
      .not($trigger)
      .removeClass('is-open')
      .attr('aria-expanded', 'false');

    if (isSameOpen) {
      $side
        .removeClass('is-visible')
        .attr('aria-hidden', 'true')
        .empty();

      $trigger.removeClass('is-open').attr('aria-expanded', 'false');
      refreshSectionHeight($section);
      return;
    }

    $side.html(`
      <h4 class="sidebox-title" tabindex="-1">${safeTextHtml(subsection.title)}</h4>
      ${renderContent(subsection.content)}
    `)
      .addClass('is-visible')
      .attr('aria-hidden', 'false');

    if (sideId) {
      $trigger.attr('aria-controls', sideId);
    }

    $trigger.addClass('is-open').attr('aria-expanded', 'true');

    refreshSectionHeight($section);

    window.requestAnimationFrame(() => {
      scrollToSideboxTop($section);
      window.setTimeout(() => refreshSectionHeight($section), 220);
    });
  }

  function renderSections() {
    const $root = $('#content-root').empty();
    const infoPosition = state.data.info?.position === 'start' ? 'start' : 'end';

    if (infoPosition === 'start') {
      $root.append(renderInfoBlock());
    }

    (state.data.sections || []).forEach((s) => {
      const sideId = `sidebox-${htmlEscape(s.id)}`;

      const sectionHtml = `
        <section class="section-block" id="section-${htmlEscape(s.id)}">
          <button class="section-header" aria-expanded="false" aria-controls="section-body-${htmlEscape(s.id)}">
            <span>${safeTextHtml(s.title)}</span>
            <span aria-hidden="true">+</span>
          </button>

          <div class="section-body" id="section-body-${htmlEscape(s.id)}">
            <div class="section-main">
              ${renderContent(s.content)}
              ${makeChart(s.chart)}
            </div>
            <aside
              class="section-side"
              id="${sideId}"
              aria-live="polite"
              aria-hidden="true"
              role="region"
              aria-label="${safeTextHtml(s.title)}"
              tabindex="-1"
            ></aside>
          </div>
        </section>
      `;

      const $sec = $(sectionHtml);

      $sec.find('.section-header').on('click', () => setSectionOpen(s.id));

      $sec.find('.section-main').on('click', '.inline-link', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const key = $(this).data('subsection');
        const sub = s.subsections?.[key];
        if (!sub) return;

        if (!$sec.hasClass('is-open')) {
          setSectionOpen(s.id, true, false);
        }

        toggleInlinePanel($(this), $sec, sub);
      });

      $root.append($sec);
    });

    if (infoPosition === 'end') {
      $root.append(renderInfoBlock());
    }

    refreshAllSectionHeights();
  }

  function setSectionOpen(id, forceOpen = null, smooth = false) {
  const $all = $('.section-block');
  const $current = $(`#section-${CSS.escape(id)}`);
  if (!$current.length) return;

  const open = forceOpen !== null ? forceOpen : !$current.hasClass('is-open');

  closeSideboxes($all);
  $all.removeClass('is-open').find('.section-header').attr('aria-expanded', 'false');

  if (open) {
    $current.addClass('is-open').find('.section-header').attr('aria-expanded', 'true');

    refreshSectionHeight($current);

    requestAnimationFrame(() => {
      refreshSectionHeight($current);

      setTimeout(() => {
        refreshSectionHeight($current);
      }, 250);
    });

    if (smooth && $current[0]) {
      $current[0].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  } else {
    refreshSectionHeight($current);
  }
}

  function setActiveSection(index) {
    state.activeIndex = index;
    renderWheel();
    renderHeroText();

    if (isMobileLayout()) {
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
      .attr('dir', state.data.meta?.dir || 'ltr');

    $('#site-title').text(textWithNbsp(state.data.meta?.title || ''));
    $('#site-subtitle').text(textWithNbsp(state.data.meta?.subtitle || ''));
    document.title = textWithNbsp(state.data.meta?.title || 'Document');

    updateLanguageSwitcher();
    renderWheel();
    renderHeroText();
    renderSections();
  }

  $(async function () {
    SkinEngine.applySkin(state.skin);
    $('#skin-select').val(state.skin);

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

    $(window).on('resize', function () {
      refreshAllSectionHeights();
    });

    $(document).on('click', function (e) {
      const $target = $(e.target);
      const clickedInlineLink = $target.closest('.inline-link').length > 0;
      const clickedSide = $target.closest('.section-side').length > 0;

      if (!clickedInlineLink && !clickedSide) {
        closeSideboxes();
      }
    });

    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSideboxes();
      }
    });
  });
})(jQuery);
