import { defaultSettings } from '../config.js';
import { getRootFolder } from '../modules.js';

/** Serializa a árvore real de bookmarks (Spaces → Grupos → Links) */
function serializeSpacesTree(callback) {
  getRootFolder((root) => {
    if (!root) {
      callback([]);
      return;
    }
    chrome.bookmarks.getSubTree(root.id, (nodes) => {
      const spaces = [];
      const rootNode = nodes && nodes[0];
      ((rootNode && rootNode.children) || []).forEach((spaceNode) => {
        if (spaceNode.url) return;
        const space = { title: spaceNode.title, groups: [] };
        (spaceNode.children || []).forEach((groupNode) => {
          if (groupNode.url) return;
          const group = { title: groupNode.title, links: [] };
          (groupNode.children || []).forEach((linkNode) => {
            if (linkNode.url) {
              group.links.push({ title: linkNode.title, url: linkNode.url });
            }
          });
          space.groups.push(group);
        });
        spaces.push(space);
      });
      callback(spaces);
    });
  });
}

/** Recria a árvore de Spaces a partir de um backup (usa Promises do MV3) */
async function restoreSpacesTree(spaces, rootId) {
  for (const space of spaces) {
    const spaceNode = await chrome.bookmarks.create({
      parentId: rootId,
      title: space.title,
    });
    for (const group of space.groups || []) {
      const groupNode = await chrome.bookmarks.create({
        parentId: spaceNode.id,
        title: group.title,
      });
      for (const link of group.links || []) {
        await chrome.bookmarks.create({
          parentId: groupNode.id,
          title: link.title,
          url: link.url,
        });
      }
    }
  }
}

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
        serializeSpacesTree((spacesTree) => {
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

          const manifest = chrome.runtime.getManifest();
          const exportData = {
            version: manifest.version,
            exportDate: new Date().toISOString(),
            settings: exportSettings,
            quickLinks: resultSync.quickLinks || [],
            customThemes: resultSync.customThemes || {},
            customIcons: customIcons,
            // Árvore real de Spaces → Grupos → Links (backup completo)
            spacesTree: spacesTree,
            // Legado (estrutura antiga pré-spaces)
            bookmarks: resultLocal.userBookmarks || [],
          };

          const dataStr = JSON.stringify(exportData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `pagina-inicial-backup-${new Date().toISOString().split('T')[0]}.json`;
          link.click();

          URL.revokeObjectURL(url);
        });
      });
    });
  }

  importData(event, onQuickLinksImported) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (
          !confirm(
            'Tem certeza que deseja importar os dados? Isso substituirá todas as configurações e atalhos atuais.',
          )
        ) {
          return;
        }

        // Todas as escritas são aguardadas — o reload só acontece no final,
        // senão a restauração assíncrona dos Espaços seria abortada.
        if (importData.bookmarks) {
          await chrome.storage.local.set({
            userBookmarks: importData.bookmarks,
          });
        }

        if (importData.customIcons) {
          const syncData = await chrome.storage.sync.get(null);
          const keysToRemove = Object.keys(syncData).filter((k) =>
            k.startsWith('icon:'),
          );
          await chrome.storage.sync.remove(keysToRemove);
          const iconsToSave = { customIconsInitialized: true };
          Object.keys(importData.customIcons).forEach((urlOrId) => {
            iconsToSave[`icon:${urlOrId}`] = importData.customIcons[urlOrId];
          });
          iconsToSave.customIconsKeys = Object.keys(importData.customIcons).map(
            (urlOrId) => `icon:${urlOrId}`,
          );
          await chrome.storage.sync.set(iconsToSave);
        }

        if (importData.quickLinks) {
          await chrome.storage.sync.set({ quickLinks: importData.quickLinks });
          if (onQuickLinksImported) {
            onQuickLinksImported(importData.quickLinks);
          }
        }

        if (importData.customThemes) {
          await chrome.storage.sync.set({
            customThemes: importData.customThemes,
          });
        }

        if (importData.settings) {
          // Ignora credenciais vindas de arquivos importados
          const importedSettings = Object.assign({}, importData.settings);
          delete importedSettings.togglApiToken;
          delete importedSettings.wallpaperApiKey;
          await chrome.storage.sync.set({
            extensionSettings: importedSettings,
          });
        }

        // Restauração da árvore de Spaces (opcional, pergunta separada)
        if (
          Array.isArray(importData.spacesTree) &&
          importData.spacesTree.length > 0
        ) {
          const root = await new Promise((resolve) => getRootFolder(resolve));
          if (root) {
            const children = await chrome.bookmarks.getChildren(root.id);
            const existingSpaces = children.filter((c) => !c.url);
            const question =
              existingSpaces.length === 0
                ? 'O backup contém seus Espaços e bookmarks. Deseja restaurá-los?'
                : `O backup contém ${importData.spacesTree.length} espaço(s). Você já tem ${existingSpaces.length} espaço(s) — importar vai ADICIONAR os do backup (pode duplicar). Continuar?`;
            if (confirm(question)) {
              await restoreSpacesTree(importData.spacesTree, root.id);
              console.log('Espaços restaurados do backup.');
            }
          }
        }

        console.log('Dados importados com sucesso!');
        window.location.reload();
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
