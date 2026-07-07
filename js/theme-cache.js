// Aplica o tema cacheado imediatamente para evitar flash de tema errado (FOUC).
// Arquivo externo porque o CSP do Manifest V3 bloqueia scripts inline.
(function () {
  let cachedTheme = localStorage.getItem('themePreset') || 'dark';
  if (cachedTheme === 'auto') {
    // Tema "auto" segue o prefers-color-scheme do sistema
    cachedTheme =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }
  document.body.classList.add(`${cachedTheme}-theme`);
})();
