const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['src/js/main.js', 'src/js/preload.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  },
  {
    // Loaded both by the main process (require) and the renderer (<script>)
    files: ['src/js/translations.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['src/js/renderer.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        // Provided by translations.js via a classic <script> tag
        getTranslation: 'readonly'
      }
    }
  }
];
