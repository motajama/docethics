(function (global) {
  const skinLibrary = {
    msdos: {
      fontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
      vars: {
        '--bg': '#060606', '--surface': '#0f0f0f', '--surface-alt': '#141414', '--text': '#e2ffe0',
        '--muted': '#9ec39b', '--accent': '#39ff14', '--line': '#2f7d2b', '--focus': '#fff700',
        '--font-main': "'VT323', monospace", '--font-heading': "'VT323', monospace"
      }
    },
    'classic-mac': {
      fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap',
      vars: {
        '--bg': '#d9d9d9', '--surface': '#efefef', '--surface-alt': '#d2d2d2', '--text': '#111111',
        '--muted': '#555555', '--accent': '#0055aa', '--line': '#7f7f7f', '--focus': '#ff6600',
        '--font-main': "'IBM Plex Mono', monospace", '--font-heading': "'IBM Plex Mono', monospace"
      }
    },
    atari: {
      fontUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fira+Mono:wght@400;700&display=swap',
      vars: {
        '--bg': '#1e1337', '--surface': '#281a48', '--surface-alt': '#33205b', '--text': '#fce9ff',
        '--muted': '#c6b4d6', '--accent': '#ff9f1c', '--line': '#7f60c2', '--focus': '#00f5d4',
        '--font-main': "'Fira Mono', monospace", '--font-heading': "'Press Start 2P', monospace"
      }
    }
  };

  function applySkin(skinName) {
    const skin = skinLibrary[skinName] || skinLibrary.msdos;
    Object.entries(skin.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    const fontLink = document.getElementById('skin-font-link');
    if (fontLink) fontLink.href = skin.fontUrl;
    document.body.dataset.skin = skinName;
  }

  global.SkinEngine = { applySkin, skinLibrary };
})(window);
