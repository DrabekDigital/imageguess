const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/', '.history/']
  },
  js.configs.recommended,
  {
    // Electron main process and preload scripts
    files: ['eslint.config.js', 'src/js/main.js', '**/preload.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },
  {
    // Renderer scripts loaded via <script> tags in index.html (shared global scope)
    files: ['src/js/renderer.js', 'src/js/translations.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['src/js/renderer.js'],
    languageOptions: {
      globals: {
        // defined by translations.js, which index.html loads first
        getTranslation: 'readonly'
      }
    }
  },
  {
    // translations.js is also required from the main process
    files: ['src/js/translations.js'],
    languageOptions: {
      globals: {
        ...globals.commonjs,
        process: 'readonly'
      }
    }
  }
];
