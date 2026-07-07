import { defaultSettings } from '../config.js';

export class SettingsDataManager {
  constructor() {
    this.exportDataBtn = document.getElementById('export-data-btn');
    this.importDataBtn = document.getElementById('import-data-btn');
    this.importFileInput = document.getElementById('import-file-input');
    this.resetSettingsBtn = document.getElementById('reset-settings-btn');
  }

  init(onQuickLinksImported) {
    if (this.exportDataBtn) {
      this.exportDataBtn.addEventListener('click', () => this.exportData());
    }

    if (this.importDataBtn && this.importFileInput) {
      this.importDataBtn.addEventListener('click', () => {
        this.importFileInput.click();
      });

      this.importFileInput.addEventListener('change', (e) =>
        this.importData(e, onQuickLinksImported),
      );
    }

    if (this.resetSettingsBtn) {
      this.resetSettingsBtn.addEventListener('click', () =>
        this.resetSettings(),
      );
    }
  }

  exportData() {
    if (!this.exportDataBtn) return;
    const originalText = this.exportDataBtn.innerHTML;
    this.exportDataBtn.innerHTML = '✔️ Exportado!';
    setTimeout(() => {
      this.exportDataBtn.innerHTML = originalText;
    }, 2000);

    chrome.storage.sync.get(null, (resultSync) => {
      chrome.storage.local.get(['userBookmarks'], (resultLocal) => {
        const customIcons = {};
        // Filter all keys starting with "icon:"
        Object.keys(resultSync).forEach((key) => {
          if (key.startsWith('icon:')) {
            const urlOrId = key.slice(5);
            customIcons[urlOrId] = resultSync[key];
          }
        });

        // Nunca exportar credenciais
        const exportSettings = Object.assign(
          {},
          resultSync.extensionSettings || defaultSettings,
        );
        delete exportSettings.togglApiToken;
        delete exportSettings.wallpaperApiKey;

        const exportData = {
          bookmarks: resultLocal.userBookmarks || [],
          customIcons: customIcons,
          settings: exportSettings,
          quickLinks: resultSync.quickLinks || [],
          exportDate: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `extensao-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
      });
    });
  }

  importData(event, onQuickLinksImported) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (
          confirm(
            'Tem certeza que deseja importar os dados? Isso substituirá todas as configurações e atalhos atuais.',
          )
        ) {
          if (importData.bookmarks) {
            chrome.storage.local.set({ userBookmarks: importData.bookmarks });
          }

          if (importData.customIcons) {
            const iconsToSave = { customIconsInitialized: true };
            chrome.storage.sync.get(null, (syncData) => {
              const keysToRemove = Object.keys(syncData).filter((k) =>
                k.startsWith('icon:'),
              );
              chrome.storage.sync.remove(keysToRemove, () => {
                Object.keys(importData.customIcons).forEach((urlOrId) => {
                  iconsToSave[`icon:${urlOrId}`] =
                    importData.customIcons[urlOrId];
                });
                chrome.storage.sync.set(iconsToSave);
              });
            });
          }

          if (importData.quickLinks) {
            chrome.storage.sync.set(
              { quickLinks: importData.quickLinks },
              () => {
                if (onQuickLinksImported) {
                  onQuickLinksImported(importData.quickLinks);
                }
              },
            );
          }

          if (importData.settings) {
            // Ignora credenciais vindas de arquivos importados
            const importedSettings = Object.assign({}, importData.settings);
            delete importedSettings.togglApiToken;
            delete importedSettings.wallpaperApiKey;
            chrome.storage.sync.set(
              { extensionSettings: importedSettings },
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    'Erro ao importar dados de config:',
                    chrome.runtime.lastError.message,
                  );
                } else {
                  console.log('Dados importados com sucesso!');
                  window.location.reload();
                }
              },
            );
          } else {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert('Falha ao processar arquivo de backup JSON: formato inválido.');
      }
    };
    reader.readAsText(file);
  }

  resetSettings() {
    if (
      confirm(
        'Tem certeza que deseja reiniciar todas as configurações para os valores padrão?',
      )
    ) {
      chrome.storage.sync.set({ extensionSettings: defaultSettings }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            'Erro ao reiniciar configurações:',
            chrome.runtime.lastError.message,
          );
        } else {
          console.log('Configurações reiniciadas com sucesso!');
          window.location.reload();
        }
      });
    }
  }
}
