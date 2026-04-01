(function ($) {
  const state = { lang: 'cs', skin: 'msdos', data: null, activeIndex: 0 };

  function fetchLanguage(lang) {
    return fetch(`./data/${lang}.json`).then((r) => r.json());
  }

  function renderWheel() {
    const sections = state.data.sections;
    const $slices = $('#wheel-slices').empty();
    const $labels = $('#wheel-labels').empty();
    const center = { x: 160, y: 160, r: 118 };

    sections.forEach((s, i) => {
      const start = (i * 90 - 90) * Math.PI / 180;
      const end = ((i + 1) * 90 - 90) * Math.PI / 180;
      const x1 = center.x + center.r * Math.cos(start);
      const y1 = center.y + center.r * Math.sin(start);
      const x2 = center.x + center.r * Math.cos(end);
      const y2 = center.y + center.r * Math.sin(end);
      const d = `M ${center.x} ${center.y} L ${x1} ${y1} A ${center.r} ${center.r} 0 0 1 ${x2} ${y2} Z`;
      const active = i === state.activeIndex;

      const $path = $('<path/>', {
        class: 'wheel-slice', d,
        fill: active ? 'var(--accent)' : 'var(--surface-alt)',
        'aria-label': s.title,
        tabindex: 0,
        role: 'button'
      }).on('click keydown', (e) => {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') setActiveSection(i);
      });
      $slices.append($path);

      const $btn = $('<button/>', { class: `wheel-link ${active ? 'is-active' : ''}`, text: s.title })
        .on('click', () => setActiveSection(i));
      $labels.append($('<li/>').append($btn));
    });
  }

  function renderHeroText() {
    const section = state.data.sections[state.activeIndex];
    const html = `<h3>${section.title}</h3><p>${section.short}</p><a href="#section-${section.id}" data-jump="${section.id}">${state.data.ui.more}</a>`;
    $('#hero-description').html(html);
    $('#hero-description [data-jump]').on('click', function (e) {
      e.preventDefault();
      const id = $(this).data('jump');
      setSectionOpen(id, true, true);
    });
  }

  function makeChart(block) {
    if (!block || !block.type) return '';
    if (block.type === 'bar') return `<pre class="ascii-chart">${AsciiChart.barChart(block.items, block.options)}</pre>`;
    if (block.type === 'plot') return `<pre class="ascii-chart">${AsciiChart.plot(block.points, block.options)}</pre>`;
    return '';
  }

  function renderSections() {
    const $root = $('#content-root').empty();
    state.data.sections.forEach((s) => {
      const sectionHtml = `
        <section class="section-block" id="section-${s.id}">
          <button class="section-header" aria-expanded="false">
            <span>${s.title}</span><span aria-hidden="true">+</span>
          </button>
          <div class="section-body">
            <div class="section-main">${MarkupEngine.render(s.content)}${makeChart(s.chart)}</div>
            <aside class="section-side" aria-live="polite"></aside>
          </div>
        </section>`;
      const $sec = $(sectionHtml);
      $sec.find('.section-header').on('click', () => setSectionOpen(s.id));
      $sec.find('.section-main').on('click', '.inline-link', function () {
        const key = $(this).data('subsection');
        const sub = s.subsections[key];
        if (!sub) return;
        const $side = $sec.find('.section-side');
        $side.html(`<h4>${sub.title}</h4>${MarkupEngine.render(sub.content)}`).addClass('is-visible');
      });
      $root.append($sec);
    });
  }

  function setSectionOpen(id, forceOpen = null, smooth = false) {
    const $all = $('.section-block');
    const $current = $(`#section-${id}`);
    const open = forceOpen !== null ? forceOpen : !$current.hasClass('is-open');
    $all.removeClass('is-open').find('.section-header').attr('aria-expanded', 'false');
    if (open) {
      $current.addClass('is-open').find('.section-header').attr('aria-expanded', 'true');
      if (smooth) $current[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setActiveSection(index) {
    state.activeIndex = index;
    renderWheel();
    renderHeroText();
  }

  async function loadLanguage(lang) {
    state.lang = lang;
    state.data = await fetchLanguage(lang);
    $('html').attr('lang', lang).attr('dir', state.data.meta.dir || 'ltr');
    $('#site-title').text(state.data.meta.title);
    $('#site-subtitle').text(state.data.meta.subtitle);
    renderWheel();
    renderHeroText();
    renderSections();
  }

  $(async function () {
    SkinEngine.applySkin(state.skin);
    await loadLanguage(state.lang);

    $('#language-select').on('change', async function () { await loadLanguage($(this).val()); });
    $('#skin-select').on('change', function () { state.skin = $(this).val(); SkinEngine.applySkin(state.skin); });
  });
})(jQuery);
