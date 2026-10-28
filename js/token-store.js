// js/token-store.js
// Tokens de API ficam em chrome.storage.local — fora do sync (conta Google)
// e fora do export/backup, para evitar vazamento de credenciais.

export const TOKEN_KEYS = ['togglApiToken', 'wallpaperApiKey'];

export function loadApiTokens(callback) {
  chrome.storage.local.get(['apiTokens'], (result) => {
    callback(result.apiTokens || {});
  });
}

export function saveApiTokens(tokens, callback) {
  loadApiTokens((current) => {
    const merged = Object.assign({}, current, tokens);
    chrome.storage.local.set({ apiTokens: merged }, () => {
      if (callback) callback(merged);
    });
  });
}

// Migra tokens que versões antigas salvavam dentro de extensionSettings (sync).
export function migrateTokensFromSync(callback) {
  chrome.storage.sync.get(['extensionSettings'], (result) => {
    const settings = result.extensionSettings;
    const present = settings
      ? TOKEN_KEYS.filter((key) => key in settings)
      : [];
    if (present.length === 0) {
      if (callback) callback();
      return;
    }
    const found = {};
    present.forEach((key) => {
      if (settings[key]) found[key] = settings[key];
      delete settings[key];
    });
    saveApiTokens(found, () => {
      chrome.storage.sync.set({ extensionSettings: settings }, () => {
        if (callback) callback();
      });
    });
  });
}
