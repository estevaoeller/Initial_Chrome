// js/settings.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de configurações carregada.");

    // Elementos da interface
    const wallpaperFolderPath = document.getElementById('wallpaper-folder-path');
    const selectWallpaperFolderBtn = document.getElementById('select-wallpaper-folder-btn');
    const wallpaperFrequency = document.getElementById('wallpaper-frequency');
    const wallpaperFrequencyValue = document.getElementById('wallpaper-frequency-value');
    const filterColor = document.getElementById('filter-color');
    const filterOpacity = document.getElementById('filter-opacity');
    const filterOpacityValue = document.getElementById('filter-opacity-value');
    const iconSize = document.getElementById('icon-size');
    const iconSizeValue = document.getElementById('icon-size-value');
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
        nameDisplay: "always"
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
            nameDisplay.value = settings.nameDisplay;
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
            nameDisplay: nameDisplay.value
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

