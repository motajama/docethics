(function (global) {
  const skinLibrary = {
  msdos: {
    fontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
    vars: {
      '--bg': '#060606',
      '--surface': '#0f0f0f',
      '--surface-alt': '#141414',
      '--text': '#e2ffe0',
      '--muted': '#9ec39b',
      '--accent': '#39ff14',
      '--line': '#2f7d2b',
      '--focus': '#fff700',
      '--font-main': "'VT323', monospace",
      '--font-heading': "'VT323', monospace"
    }
  },

  amber: {
    fontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
    vars: {
      '--bg': '#080706',
      '--surface': '#110f0c',
      '--surface-alt': '#1a1611',
      '--text': '#ffb347',
      '--muted': '#d08a2f',
      '--accent': '#ffd166',
      '--line': '#8a5a1f',
      '--focus': '#fff7cc',
      '--font-main': "'VT323', monospace",
      '--font-heading': "'VT323', monospace"
    }
  },

  'green-terminal': {
    fontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
    vars: {
      '--bg': '#000000',
      '--surface': '#001100',
      '--surface-alt': '#001a00',
      '--text': '#6cff6c',
      '--muted': '#3fbf3f',
      '--accent': '#b6ff9d',
      '--line': '#1f7a1f',
      '--focus': '#ffffff',
      '--font-main': "'VT323', monospace",
      '--font-heading': "'VT323', monospace"
    }
  },

  'classic-mac': {
    fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Chakra+Petch:wght@400;600;700&display=swap',
    vars: {
      '--bg': '#d8d8d8',
      '--surface': '#f2f2f2',
      '--surface-alt': '#dcdcdc',
      '--text': '#111111',
      '--muted': '#555555',
      '--accent': '#000000',
      '--line': '#7f7f7f',
      '--focus': '#ff6600',
      '--font-main': "'IBM Plex Mono', monospace",
      '--font-heading': "'Chakra Petch', sans-serif"
    }
  },

  win95: {
    fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&family=IBM+Plex+Mono:wght@400;700&display=swap',
    vars: {
      '--bg': '#008080',
      '--surface': '#c0c0c0',
      '--surface-alt': '#d4d0c8',
      '--text': '#111111',
      '--muted': '#404040',
      '--accent': '#000080',
      '--line': '#7a7a7a',
      '--focus': '#ffff00',
      '--font-main': "'IBM Plex Sans', sans-serif",
      '--font-heading': "'IBM Plex Mono', monospace"
    }
  },

  atari: {
    fontUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fira+Mono:wght@400;700&display=swap',
    vars: {
      '--bg': '#1e1337',
      '--surface': '#281a48',
      '--surface-alt': '#33205b',
      '--text': '#fce9ff',
      '--muted': '#c6b4d6',
      '--accent': '#ff9f1c',
      '--line': '#7f60c2',
      '--focus': '#00f5d4',
      '--font-main': "'Fira Mono', monospace",
      '--font-heading': "'Press Start 2P', monospace"
    }
  },

  amiga: {
    fontUrl: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=IBM+Plex+Mono:wght@400;700&display=swap',
    vars: {
      '--bg': '#0b0830',
      '--surface': '#16104a',
      '--surface-alt': '#24136b',
      '--text': '#f3d9ff',
      '--muted': '#c7a7d9',
      '--accent': '#00e5ff',
      '--line': '#ff4ecd',
      '--focus': '#fff06a',
      '--font-main': "'IBM Plex Mono', monospace",
      '--font-heading': "'Chakra Petch', sans-serif"
    }
  },

  'dot-matrix': {
    fontUrl: 'https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;700&display=swap',
    vars: {
      '--bg': '#f3f0e4',
      '--surface': '#fffdf7',
      '--surface-alt': '#ebe6d6',
      '--text': '#1f1f1f',
      '--muted': '#5f5a50',
      '--accent': '#003b6f',
      '--line': '#9a9488',
      '--focus': '#000000',
      '--font-main': "'IBM Plex Mono', monospace",
      '--font-heading': "'Special Elite', monospace"
    }
  },

  arcade: {
    fontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=IBM+Plex+Mono:wght@400;700&display=swap',
    vars: {
      '--bg': '#050505',
      '--surface': '#101010',
      '--surface-alt': '#1a1a1a',
      '--text': '#7df9ff',
      '--muted': '#46b8c8',
      '--accent': '#ff4df0',
      '--line': '#3d3d3d',
      '--focus': '#fff200',
      '--font-main': "'IBM Plex Mono', monospace",
      '--font-heading': "'Orbitron', sans-serif"
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
