// Aplica o tema e estados visuais cacheados imediatamente para evitar flash (FOUC).
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

  // Estilo de cartão cacheado (card | frameless | compact)
  const cachedCardStyle = localStorage.getItem('cardStyle');
  if (cachedCardStyle === 'frameless') {
    document.body.classList.add('card-style-frameless');
  } else if (cachedCardStyle === 'compact') {
    document.body.classList.add('card-style-compact');
  }

  // Trava de layout cacheada
  if (localStorage.getItem('lockLayout') === '1') {
    document.body.classList.add('layout-locked');
  }

  // Modo Zen cacheado: aplica antes do primeiro paint para evitar
  // flash da UI completa ao abrir nova aba com zen ativo
  if (localStorage.getItem('zenMode') === '1') {
    document.body.classList.add('zen-mode');
  }
})();
