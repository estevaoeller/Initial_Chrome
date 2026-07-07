// Aplica o tema cacheado imediatamente para evitar flash de tema errado (FOUC).
// Arquivo externo porque o CSP do Manifest V3 bloqueia scripts inline.
(function () {
  const cachedTheme = localStorage.getItem('themePreset') || 'dark';
  document.body.classList.add(`${cachedTheme}-theme`);
})();
