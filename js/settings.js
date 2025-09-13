// js/settings.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de configurações carregada.");

    // Elementos da interface
    const wallpaperFolderPath = document.getElementById('wallpaper-folder-path');
    const wallpaperFrequency = document.getElementById('wallpaper-frequency');
    const wallpaperFrequencyValue = document.getElementById('wallpaper-frequency-value');
    const filterColor = document.getElementById('filter-color');
    const filterOpacity = document.getElementById('filter-opacity');
    const filterOpacityValue = document.getElementById('filter-opacity-value');
    const iconSize = document.getElementById('icon-size');
    const iconSizeValue = document.getElementById('icon-size-value');
    const iconSpacing = document.getElementById('icon-spacing');
    const iconSpacingValue = document.getElementById('icon-spacing-value');
    const bookmarkMinWidth = document.getElementById('bookmark-min-width');
    const bookmarkMinWidthValue = document.getElementById('bookmark-min-width-value');
    const iconGap = document.getElementById('icon-gap');
    const iconGapValue = document.getElementById('icon-gap-value');
    const iconBorderRadius = document.getElementById('icon-border-radius');
    const iconBorderRadiusValue = document.getElementById('icon-border-radius-value');
    const iconBorderColor = document.getElementById('icon-border-color');
    const iconBgColor = document.getElementById('icon-bg-color');
    const themePreset = document.getElementById('theme-preset');
    const bookmarkFontFamily = document.getElementById('bookmark-font-family');
    const bookmarkFontSize = document.getElementById('bookmark-font-size');
    const bookmarkFontSizeValue = document.getElementById('bookmark-font-size-value');
    const bookmarkFontColor = document.getElementById('bookmark-font-color');
    const nameDisplay = document.getElementById('name-display');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // Configurações padrão
    const defaultSettings = {
        wallpaperFolderPath: "C:\\Users\\estev\\OneDrive\\Imagens\\Wallpapers",
        wallpaperFrequency: 1,
        filterColor: "#000000",
        filterOpacity: 0.3,
        iconSize: 32,
        iconSpacing: 8,
        iconGap: 8,
        bookmarkMinWidth: 100,
        iconBorderRadius: 6,
        iconBorderColor: "#ddd",
        iconBgColor: "#fff",
        bookmarkFontFamily: "sans-serif",
        bookmarkFontSize: 14,
        bookmarkFontColor: "#333333",
        nameDisplay: "always",
        themePreset: "light"
    };

    // Carregar configurações salvas
    function loadSettings() {
        chrome.storage.local.get(['extensionSettings'], function(result) {
            const settings = result.extensionSettings || defaultSettings;

            wallpaperFolderPath.value = settings.wallpaperFolderPath;
            wallpaperFrequency.value = settings.wallpaperFrequency;
            updateFrequencyDisplay(settings.wallpaperFrequency);
            filterColor.value = settings.filterColor;
            filterOpacity.value = settings.filterOpacity;
            updateOpacityDisplay(settings.filterOpacity);
            iconSize.value = settings.iconSize;
            updateIconSizeDisplay(settings.iconSize);
            iconSpacing.value = settings.iconSpacing;
            updateIconSpacingDisplay(settings.iconSpacing);
            iconGap.value = settings.iconGap !== undefined ? settings.iconGap : settings.iconSpacing;
            updateIconGapDisplay(iconGap.value);
            bookmarkMinWidth.value = settings.bookmarkMinWidth;
            updateBookmarkMinWidthDisplay(settings.bookmarkMinWidth);
            iconBorderRadius.value = settings.iconBorderRadius;
            updateBorderRadiusDisplay(settings.iconBorderRadius);
            iconBorderColor.value = settings.iconBorderColor;
            iconBgColor.value = settings.iconBgColor;
            bookmarkFontFamily.value = settings.bookmarkFontFamily;
            bookmarkFontSize.value = settings.bookmarkFontSize;
            updateBookmarkFontSizeDisplay(settings.bookmarkFontSize);
            bookmarkFontColor.value = settings.bookmarkFontColor;
            nameDisplay.value = settings.nameDisplay;
            themePreset.value = settings.themePreset || 'light';
            document.body.classList.remove('light-theme','dark-theme','solar-theme','minimal-theme');
            document.body.classList.add(`${themePreset.value}-theme`);
        });
    }

    // Salvar configurações
    function saveSettings() {
        const settings = {
            wallpaperFolderPath: wallpaperFolderPath.value,
            wallpaperFrequency: parseFloat(wallpaperFrequency.value),
            filterColor: filterColor.value,
            filterOpacity: parseFloat(filterOpacity.value),
            iconSize: parseInt(iconSize.value),
            iconSpacing: parseInt(iconSpacing.value),
            iconGap: parseInt(iconGap.value),
            bookmarkMinWidth: parseInt(bookmarkMinWidth.value),
            iconBorderRadius: parseInt(iconBorderRadius.value),
            iconBorderColor: iconBorderColor.value,
            iconBgColor: iconBgColor.value,
            bookmarkFontFamily: bookmarkFontFamily.value,
            bookmarkFontSize: parseInt(bookmarkFontSize.value),
            bookmarkFontColor: bookmarkFontColor.value,
            nameDisplay: nameDisplay.value,
            themePreset: themePreset.value
        };

        chrome.storage.local.set({ extensionSettings: settings }, function() {
            if (chrome.runtime.lastError) {
                console.error("Erro ao salvar configurações:", chrome.runtime.lastError.message);
                alert("Erro ao salvar configurações!");
            } else {
                console.log("Configurações salvas com sucesso!");
                alert("Configurações salvas com sucesso!");
            }
        });
    }

    // Atualizar displays dos valores
    function updateFrequencyDisplay(value) {
        const hours = parseFloat(value);
        if (hours === 1) {
            wallpaperFrequencyValue.textContent = "1 hora";
        } else if (hours < 1) {
            wallpaperFrequencyValue.textContent = `${hours * 60} minutos`;
        } else {
            wallpaperFrequencyValue.textContent = `${hours} horas`;
        }
    }

    function updateOpacityDisplay(value) {
        filterOpacityValue.textContent = `${Math.round(value * 100)}%`;
    }

    function updateIconSizeDisplay(value) {
        iconSizeValue.textContent = `${value}px`;
    }

    function updateIconSpacingDisplay(value) {
        iconSpacingValue.textContent = `${value}px`;
    }

    function updateBookmarkMinWidthDisplay(value) {
        bookmarkMinWidthValue.textContent = `${value}px`;
    }

    function updateIconGapDisplay(value) {
        iconGapValue.textContent = `${value}px`;
    }

    function updateBorderRadiusDisplay(value) {
        iconBorderRadiusValue.textContent = `${value}px`;
    }

    function updateBookmarkFontSizeDisplay(value) {
        bookmarkFontSizeValue.textContent = `${value}px`;
    }

    // Event listeners para atualizar displays
    wallpaperFrequency.addEventListener('input', function() {
        updateFrequencyDisplay(this.value);
    });

    filterOpacity.addEventListener('input', function() {
        updateOpacityDisplay(this.value);
    });

    iconSize.addEventListener('input', function() {
        updateIconSizeDisplay(this.value);
    });

    iconSpacing.addEventListener('input', function() {
        updateIconSpacingDisplay(this.value);
    });

    iconGap.addEventListener('input', function() {
        updateIconGapDisplay(this.value);
    });

    bookmarkMinWidth.addEventListener('input', function() {
        updateBookmarkMinWidthDisplay(this.value);
    });

    iconBorderRadius.addEventListener('input', function() {
        updateBorderRadiusDisplay(this.value);
    });

    bookmarkFontSize.addEventListener('input', function() {
        updateBookmarkFontSizeDisplay(this.value);
    });

    themePreset.addEventListener('change', function() {
        const newTheme = this.value;
        document.body.classList.remove('light-theme','dark-theme','solar-theme','minimal-theme');
        document.body.classList.add(`${newTheme}-theme`);
        chrome.storage.local.get(['extensionSettings'], function(result) {
            const settings = result.extensionSettings || defaultSettings;
            settings.themePreset = newTheme;
            chrome.storage.local.set({ extensionSettings: settings });
        });
    });

    // Exportar dados
    exportDataBtn.addEventListener('click', function() {
        chrome.storage.local.get(['userBookmarks', 'extensionSettings'], function(result) {
            const exportData = {
                bookmarks: result.userBookmarks || [],
                settings: result.extensionSettings || defaultSettings,
                exportDate: new Date().toISOString()
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

    // Importar dados
    importDataBtn.addEventListener('click', function() {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importData = JSON.parse(e.target.result);

                    if (confirm("Tem certeza que deseja importar os dados? Isso substituirá todas as configurações e bookmarks atuais.")) {
                        const dataToSave = {};

                        if (importData.bookmarks) {
                            dataToSave.userBookmarks = importData.bookmarks;
                        }

                        if (importData.settings) {
                            dataToSave.extensionSettings = importData.settings;
                        }

                        chrome.storage.local.set(dataToSave, function() {
                            if (chrome.runtime.lastError) {
                                console.error("Erro ao importar dados:", chrome.runtime.lastError.message);
                                alert("Erro ao importar dados!");
                            } else {
                                alert("Dados importados com sucesso! Recarregue a página para ver as mudanças.");
                                loadSettings(); // Recarregar configurações na interface
                            }
                        });
                    }
                } catch (error) {
                    console.error("Erro ao processar arquivo:", error);
                    alert("Erro ao processar arquivo. Verifique se é um arquivo JSON válido.");
                }
            };
            reader.readAsText(file);
        }
    });

    // Reiniciar configurações
    resetSettingsBtn.addEventListener('click', function() {
        if (confirm("Tem certeza que deseja reiniciar todas as configurações para os valores padrão?")) {
            chrome.storage.local.set({ extensionSettings: defaultSettings }, function() {
                if (chrome.runtime.lastError) {
                    console.error("Erro ao reiniciar configurações:", chrome.runtime.lastError.message);
                    alert("Erro ao reiniciar configurações!");
                } else {
                    alert("Configurações reiniciadas com sucesso!");
                    loadSettings(); // Recarregar configurações na interface
                }
            });
        }
    });

    // Salvar configurações
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Fechar configurações
    closeSettingsBtn.addEventListener('click', function() {
        window.close();
    });

    // Carregar configurações ao inicializar
    loadSettings();
});

