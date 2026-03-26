// js/settings.js
import { defaultSettings } from './config.js';
document.addEventListener('DOMContentLoaded', function () {
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
    const categoryGap = document.getElementById('category-gap'); // Fixed
    const categoryGapValue = document.getElementById('category-gap-value'); // Fixed
    const iconBorderRadius = document.getElementById('icon-border-radius');
    const iconBorderRadiusValue = document.getElementById('icon-border-radius-value');
    const iconBorderColor = document.getElementById('icon-border-color');
    const iconBgColor = document.getElementById('icon-bg-color');
    const iconBgOpacity = document.getElementById('icon-bg-opacity');
    const iconBgOpacityValue = document.getElementById('icon-bg-opacity-value');
    const themePreset = document.getElementById('theme-preset');
    const bookmarkFontFamily = document.getElementById('bookmark-font-family');
    const bookmarkFontSize = document.getElementById('bookmark-font-size');
    const bookmarkFontSizeValue = document.getElementById('bookmark-font-size-value');
    const bookmarkFontColor = document.getElementById('bookmark-font-color');
    const nameDisplay = document.getElementById('name-display');
    const textBehavior = document.getElementById('text-behavior');
    const iconLayout = document.getElementById('icon-layout'); // New
    const layoutMode = document.getElementById('layout-mode');
    const columnCountContainer = document.getElementById('column-count-container');
    const columnCount = document.getElementById('column-count');
    const columnCountValue = document.getElementById('column-count-value');
    const sidebarWidth = document.getElementById('sidebar-width');
    const sidebarWidthValue = document.getElementById('sidebar-width-value');

    // Quick Links Elements
    const quickLinksSize = document.getElementById('quick-links-size');
    const quickLinksSizeValue = document.getElementById('quick-links-size-value');
    const quickLinksList = document.getElementById('quick-links-list');
    const newLinkName = document.getElementById('new-link-name');
    const newLinkUrl = document.getElementById('new-link-url');
    const addLinkBtn = document.getElementById('add-link-btn');

    // Section Style Elements
    const sectionPadding = document.getElementById('section-padding');
    const sectionPaddingValue = document.getElementById('section-padding-value');
    const sectionBgColor = document.getElementById('section-bg-color');
    const sectionBgOpacity = document.getElementById('section-bg-opacity');
    const sectionBgOpacityValue = document.getElementById('section-bg-opacity-value');
    const sectionLineColor = document.getElementById('section-line-color');

    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // New Widget Settings
    const clockStyle = document.getElementById('clock-style');
    const userName = document.getElementById('user-name');
    const weatherCity = document.getElementById('weather-city');
    const wallpaperSource = document.getElementById('wallpaper-source');
    const wallpaperTheme = document.getElementById('wallpaper-theme');
    const wallpaperThemeCustom = document.getElementById('wallpaper-theme-custom');
    const wallpaperApiKey = document.getElementById('wallpaper-api-key');
    const wallpaperLocalConfig = document.getElementById('wallpaper-local-config');
    const wallpaperUnsplashConfig = document.getElementById('wallpaper-unsplash-config');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key-btn');
    const clearApiKeyBtn = document.getElementById('clear-api-key-btn');

    // Toggle Wallpaper Configs based on Source
    if (wallpaperSource) {
        wallpaperSource.addEventListener('change', () => {
            if (wallpaperSource.value === 'local') {
                wallpaperLocalConfig.style.display = 'block';
                wallpaperUnsplashConfig.style.display = 'none';
            } else if (wallpaperSource.value === 'unsplash') {
                wallpaperLocalConfig.style.display = 'none';
                wallpaperUnsplashConfig.style.display = 'block';
            } else {
                wallpaperLocalConfig.style.display = 'none';
                wallpaperUnsplashConfig.style.display = 'none';
            }
        });
    }

    if (toggleApiKeyBtn) {
        toggleApiKeyBtn.addEventListener('click', () => {
            if (wallpaperApiKey.type === 'password') {
                wallpaperApiKey.type = 'text';
                toggleApiKeyBtn.textContent = '🙈'; // Monkey hide icon
            } else {
                wallpaperApiKey.type = 'password';
                toggleApiKeyBtn.textContent = '👁️'; // Eye icon
            }
        });
    }

    if (clearApiKeyBtn) {
        clearApiKeyBtn.addEventListener('click', () => {
            wallpaperApiKey.value = '';
            // Dispara um evento change manual para acionar o auto-save
            const event = new Event('change');
            wallpaperApiKey.dispatchEvent(event);
        });
    }

    // TAB NAVIGATION LOGIC
    const tabs = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // Update Active Tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show Active Page
            pages.forEach(p => {
                p.classList.remove('active');
                if (p.id === 'tab-' + targetId) {
                    p.classList.add('active');
                }
            });
        });
    });

    let isInitializing = true;

    // Helper to ensure full hex for color inputs
    const ensureFullHex = (hex) => {
        if (!hex) return "#000000";
        if (hex.length === 4) {
            return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex;
    };

    function toggleColumnCountDisplay(mode) {
        if (mode === 'columns') {
            columnCountContainer.style.display = 'block';
        } else {
            columnCountContainer.style.display = 'none';
        }
    }

    // Carregar configurações salvas
    function loadSettings() {
        isInitializing = true;
        chrome.storage.sync.get(['extensionSettings'], function (result) {
            const settings = Object.assign({}, defaultSettings, result.extensionSettings || {});

            wallpaperFolderPath.value = settings.wallpaperFolderPath;
            wallpaperFrequency.value = settings.wallpaperFrequency;
            if (wallpaperSource) {
                wallpaperSource.value = settings.wallpaperSource || 'local';
                // Trigger change event to update display
                const event = new Event('change');
                wallpaperSource.dispatchEvent(event);
            }
            if (wallpaperApiKey) wallpaperApiKey.value = settings.wallpaperApiKey || '';
            if (wallpaperTheme) {
                const savedTheme = settings.wallpaperTheme || 'nature';
                const options = Array.from(wallpaperTheme.options).map(opt => opt.value);
                if (options.includes(savedTheme) && savedTheme !== 'custom') {
                    wallpaperTheme.value = savedTheme;
                    if (wallpaperThemeCustom) wallpaperThemeCustom.style.display = 'none';
                } else {
                    wallpaperTheme.value = 'custom';
                    if (wallpaperThemeCustom) {
                        wallpaperThemeCustom.value = savedTheme !== 'custom' ? savedTheme : '';
                        wallpaperThemeCustom.style.display = 'block';
                    }
                }
                
                wallpaperTheme.addEventListener('change', () => {
                    if (wallpaperTheme.value === 'custom') {
                        if (wallpaperThemeCustom) wallpaperThemeCustom.style.display = 'block';
                    } else {
                        if (wallpaperThemeCustom) wallpaperThemeCustom.style.display = 'none';
                    }
                });
            }

            if (clockStyle) clockStyle.value = settings.clockStyle || 'analog';
            if (userName) userName.value = settings.userName || '';
            if (weatherCity) weatherCity.value = settings.weatherCity || '';

            updateFrequencyDisplay(settings.wallpaperFrequency);
            filterColor.value = ensureFullHex(settings.filterColor);
            filterOpacity.value = settings.filterOpacity;
            updateOpacityDisplay(settings.filterOpacity);
            iconSize.value = settings.iconSize;
            updateIconSizeDisplay(settings.iconSize);
            iconSpacing.value = settings.iconSpacing;
            updateIconSpacingDisplay(settings.iconSpacing);
            iconGap.value = settings.iconGap !== undefined ? settings.iconGap : settings.iconSpacing;
            updateIconGapDisplay(iconGap.value);
            categoryGap.value = settings.categoryGap !== undefined ? settings.categoryGap : 20;
            updateCategoryGapDisplay(categoryGap.value);


            bookmarkMinWidth.value = settings.bookmarkMinWidth;
            updateBookmarkMinWidthDisplay(settings.bookmarkMinWidth);
            iconBorderRadius.value = settings.iconBorderRadius;
            updateBorderRadiusDisplay(settings.iconBorderRadius);
            iconBorderColor.value = ensureFullHex(settings.iconBorderColor);
            iconBgColor.value = ensureFullHex(settings.iconBgColor);
            if (iconBgOpacity) {
                iconBgOpacity.value = settings.iconBgOpacity !== undefined ? settings.iconBgOpacity : 1;
                if (iconBgOpacityValue) iconBgOpacityValue.textContent = Number(iconBgOpacity.value).toFixed(2);
            }
            bookmarkFontFamily.value = settings.bookmarkFontFamily;
            bookmarkFontSize.value = settings.bookmarkFontSize;
            updateBookmarkFontSizeDisplay(settings.bookmarkFontSize);
            bookmarkFontColor.value = ensureFullHex(settings.bookmarkFontColor);

            if (quickLinksSize) {
                quickLinksSize.value = settings.quickLinksSize || 13;
                if (quickLinksSizeValue) quickLinksSizeValue.textContent = (settings.quickLinksSize || 13) + 'px';
            }

            // Section Styles
            if (sectionPadding) {
                sectionPadding.value = settings.sectionPadding !== undefined ? settings.sectionPadding : 15;
                if (sectionPaddingValue) sectionPaddingValue.textContent = (settings.sectionPadding !== undefined ? settings.sectionPadding : 15) + 'px';
            }
            if (sectionBgColor) sectionBgColor.value = ensureFullHex(settings.sectionBgColor) || '#ffffff';
            if (sectionBgOpacity) {
                sectionBgOpacity.value = settings.sectionBgOpacity !== undefined ? settings.sectionBgOpacity : 1;
                if (sectionBgOpacityValue) sectionBgOpacityValue.textContent = Number(sectionBgOpacity.value).toFixed(2);
            }
            if (sectionLineColor) sectionLineColor.value = ensureFullHex(settings.sectionLineColor) || '#007bff';

            // Load Quick Links List (Separate Storage)
            loadQuickLinksList();
            nameDisplay.value = settings.nameDisplay;
            textBehavior.value = settings.textBehavior || 'truncate';
            iconLayout.value = settings.iconLayout || 'row'; // New
            layoutMode.value = settings.layoutMode || 'list';
            toggleColumnCountDisplay(layoutMode.value);

            if (settings.columnCount) {
                columnCount.value = settings.columnCount;
                columnCountValue.textContent = settings.columnCount;
            }

            if (settings.sidebarWidth) {
                sidebarWidth.value = settings.sidebarWidth;
                sidebarWidthValue.textContent = settings.sidebarWidth + 'px';
            }

            themePreset.value = settings.themePreset || 'light';
            document.body.classList.remove('light-theme', 'dark-theme', 'solar-theme', 'minimal-theme');
            document.body.classList.add(`${themePreset.value}-theme`);

            // Allow saving after all elements are loaded and events dispatched
            setTimeout(() => {
                isInitializing = false;
            }, 100);
        });
    }

    let saveTimeout = null;

    // Salvar configurações com Debounce
    function saveSettings() {
        if (isInitializing) return;

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            const settings = {
                wallpaperFolderPath: wallpaperFolderPath.value,
                wallpaperFrequency: parseFloat(wallpaperFrequency.value),
                filterColor: filterColor.value,
                filterOpacity: parseFloat(filterOpacity.value),
                iconSize: parseInt(iconSize.value),
                iconSpacing: parseInt(iconSpacing.value),
                iconGap: parseInt(iconGap.value),
                categoryGap: parseInt(categoryGap.value),
                bookmarkMinWidth: parseInt(bookmarkMinWidth.value),
                iconBorderRadius: parseInt(iconBorderRadius.value),
                iconBorderColor: iconBorderColor.value,
                iconBgColor: iconBgColor.value,
                iconBgOpacity: iconBgOpacity ? parseFloat(iconBgOpacity.value) : 1,
                bookmarkFontFamily: bookmarkFontFamily.value,
                bookmarkFontSize: parseInt(bookmarkFontSize.value),
                bookmarkFontColor: bookmarkFontColor.value,
                nameDisplay: nameDisplay.value,
                textBehavior: textBehavior.value,
                iconLayout: iconLayout.value, // New
                themePreset: themePreset.value,
                layoutMode: layoutMode.value,
                columnCount: parseInt(columnCount.value),
                sidebarWidth: parseInt(sidebarWidth.value),
                quickLinksSize: parseInt(quickLinksSize.value || 13),
                sectionPadding: parseInt(sectionPadding.value || 15),
                sectionBgColor: sectionBgColor.value,
                sectionBgOpacity: sectionBgOpacity ? parseFloat(sectionBgOpacity.value) : 1,
                sectionLineColor: sectionLineColor.value,
                clockStyle: clockStyle ? clockStyle.value : 'analog',
                userName: userName ? userName.value.trim() : '',
                weatherCity: weatherCity ? weatherCity.value.trim() : '',
                wallpaperSource: wallpaperSource ? wallpaperSource.value : 'local',
                wallpaperTheme: wallpaperTheme ? (wallpaperTheme.value === 'custom' && wallpaperThemeCustom && wallpaperThemeCustom.value.trim() ? wallpaperThemeCustom.value.trim() : wallpaperTheme.value) : 'nature',
                wallpaperApiKey: wallpaperApiKey ? wallpaperApiKey.value.trim() : ''
            };

            chrome.storage.sync.set({ extensionSettings: settings }, function () {
                if (saveStatus) {
                    saveStatus.style.opacity = '1';
                    saveStatus.style.transform = 'translateY(0)';
                    setTimeout(() => {
                        saveStatus.style.opacity = '0';
                        saveStatus.style.transform = 'translateY(-10px)';
                    }, 2000);
                }

                if (chrome.runtime.lastError) {
                    console.error("Erro ao salvar configurações:", chrome.runtime.lastError.message);
                } else {
                    console.log("Configurações salvas com sucesso!");
                }
            });
        }, 300); // 300ms de Debounce
    }

    // Atualizar displays dos valores
    function updateFrequencyDisplay(value) {
        const hours = parseFloat(value);
        if (hours === 0) {
            wallpaperFrequencyValue.textContent = "0 horas";
        } else if (hours === 1) {
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

    function updateCategoryGapDisplay(value) { // New
        categoryGapValue.textContent = `${value}px`;
    }

    function updateBorderRadiusDisplay(value) {
        iconBorderRadiusValue.textContent = `${value}px`;
    }

    function updateBookmarkFontSizeDisplay(value) {
        bookmarkFontSizeValue.textContent = `${value}px`;
    }

    // Event listeners para atualizar displays
    wallpaperFrequency.addEventListener('input', function () {
        updateFrequencyDisplay(this.value);
        saveSettings();
    });

    filterOpacity.addEventListener('input', function () {
        updateOpacityDisplay(this.value);
        saveSettings();
    });

    iconSize.addEventListener('input', function () {
        updateIconSizeDisplay(this.value);
        saveSettings();
    });

    iconSpacing.addEventListener('input', function () {
        updateIconSpacingDisplay(this.value);
        saveSettings();
    });

    iconGap.addEventListener('input', function () {
        updateIconGapDisplay(this.value);
        saveSettings();
    });

    categoryGap.addEventListener('input', function () { // New
        updateCategoryGapDisplay(this.value);
        saveSettings();
    });

    bookmarkMinWidth.addEventListener('input', function () {
        updateBookmarkMinWidthDisplay(this.value);
        saveSettings();
    });

    if (sectionPadding) {
        sectionPadding.addEventListener('input', function () {
            if (sectionPaddingValue) sectionPaddingValue.textContent = this.value + 'px';
            saveSettings();
        });
    }

    if (sectionBgColor) {
        sectionBgColor.addEventListener('input', saveSettings);
        sectionBgColor.addEventListener('change', saveSettings);
    }

    // Helper para Converter Hex + Opacidade para RGBA
    function hexToRgbaStr(hex, opacity) {
        if (!hex) hex = '#ffffff';
        if (hex.length === 4) {
            hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        let r = parseInt(hex.substring(1, 3), 16) || 0;
        let g = parseInt(hex.substring(3, 5), 16) || 0;
        let b = parseInt(hex.substring(5, 7), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    if (sectionBgOpacity) {
        sectionBgOpacity.addEventListener('input', function () {
            if (sectionBgOpacityValue) sectionBgOpacityValue.textContent = Number(this.value).toFixed(2);
            document.documentElement.style.setProperty('--section-bg-color', hexToRgbaStr(sectionBgColor ? sectionBgColor.value : '#ffffff', this.value));
            saveSettings();
        });
    }

    if (sectionLineColor) {
        sectionLineColor.addEventListener('input', saveSettings);
        sectionLineColor.addEventListener('change', saveSettings);
    }

    if (iconBgOpacity) {
        iconBgOpacity.addEventListener('input', function () {
            if (iconBgOpacityValue) iconBgOpacityValue.textContent = Number(this.value).toFixed(2);
            document.documentElement.style.setProperty('--icon-bg-color', hexToRgbaStr(iconBgColor ? iconBgColor.value : '#ffffff', this.value));
            saveSettings();
        });
    }

    iconBorderRadius.addEventListener('input', function () {
        updateBorderRadiusDisplay(this.value);
        saveSettings();
    });

    bookmarkFontSize.addEventListener('input', function () {
        updateBookmarkFontSizeDisplay(this.value);
        saveSettings();
    });

    themePreset.addEventListener('change', function () {
        const newTheme = this.value;
        document.body.classList.remove('light-theme', 'dark-theme', 'solar-theme', 'minimal-theme');
        document.body.classList.add(`${newTheme}-theme`);

        const themeColors = {
            light: { bg: '#ffffff', border: '#e2e8f0', text: '#333333', sectionBg: '#f8fafc', sectionLine: '#3b82f6', filter: '#ffffff' },
            dark: { bg: '#334155', border: '#475569', text: '#e2e8f0', sectionBg: '#1e293b', sectionLine: '#38bdf8', filter: '#000000' },
            solar: { bg: '#002b36', border: '#073642', text: '#839496', sectionBg: '#073642', sectionLine: '#b58900', filter: '#002b36' },
            minimal: { bg: '#ffffff', border: '#eeeeee', text: '#111111', sectionBg: '#fafafa', sectionLine: '#dddddd', filter: '#ffffff' }
        };

        const colors = themeColors[newTheme];
        if (colors) {
            if (iconBgColor) iconBgColor.value = colors.bg;
            if (iconBorderColor) iconBorderColor.value = colors.border;
            if (bookmarkFontColor) bookmarkFontColor.value = colors.text;
            if (sectionBgColor) sectionBgColor.value = colors.sectionBg;
            if (sectionLineColor) sectionLineColor.value = colors.sectionLine;
            if (filterColor) filterColor.value = colors.filter;
        }

        saveSettings();
    });

    layoutMode.addEventListener('change', function () {
        toggleColumnCountDisplay(this.value);
        saveSettings();
    });

    iconLayout.addEventListener('change', saveSettings); // New

    columnCount.addEventListener('input', function () {
        columnCountValue.textContent = this.value;
        saveSettings();
    });

    sidebarWidth.addEventListener('input', function () {
        sidebarWidthValue.textContent = this.value + 'px';
        saveSettings();
    });

    if (quickLinksSize) {
        quickLinksSize.addEventListener('input', function () {
            if (quickLinksSizeValue) quickLinksSizeValue.textContent = this.value + 'px';
            saveSettings();
        });
    }

    // Auto-save para campos sem display
    [
        wallpaperFolderPath,
        filterColor,
        iconBorderColor,
        iconBgColor,
        iconBgOpacity,
        bookmarkFontFamily,
        bookmarkFontColor,
        nameDisplay,
        textBehavior,
        sectionBgOpacity,
        layoutMode, // New
        clockStyle,
        userName,
        weatherCity,
        wallpaperSource,
        wallpaperTheme,
        wallpaperThemeCustom,
        wallpaperApiKey
    ].forEach(element => {
        if (element) {
            element.addEventListener('input', saveSettings);
            element.addEventListener('change', saveSettings);
        }
    });

    // QUICK LINKS LOGIC
    function loadQuickLinksList() {
        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            renderQuickLinksUI(links);
        });
    }

    // Drag and Drop Variables
    let dragSrcEl = null;

    function renderQuickLinksUI(links) {
        if (!quickLinksList) return;
        quickLinksList.innerHTML = '';
        if (links.length === 0) {
            quickLinksList.innerHTML = '<div style="padding:15px; text-align:center; opacity:0.7;">Nenhum link adicionado</div>';
            return;
        }
        links.forEach((link, index) => {
            const item = document.createElement('div');
            item.draggable = true;
            item.dataset.index = index;
            item.className = 'draggable-link';
            item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--settings-border); background:var(--input-bg); margin-bottom:5px; border-radius:4px; transition: transform 0.2s, box-shadow 0.2s;';

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex:1; overflow:hidden;">
                    <span style="cursor:grab; font-size:1.2em; opacity:0.5; user-select:none;">☰</span>
                    <div style="overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
                        <strong style="color:var(--text);">${link.name}</strong>
                        <div style="font-size:0.8em; opacity:0.7; overflow:hidden; text-overflow:ellipsis;">${link.url}</div>
                    </div>
                </div>
                <button class="delete-link-btn" data-index="${index}" style="background:transparent; border:none; cursor:pointer; font-size:1.2em; padding:5px;">🗑️</button>
            `;

            // DnD Events
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);

            quickLinksList.appendChild(item);
        });

        // Add listeners to delete buttons
        document.querySelectorAll('.delete-link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent drag issue logic if any
                const index = parseInt(e.currentTarget.dataset.index); // Use currentTarget for button
                removeQuickLink(index);
            });
        });
    }

    // DnD Handlers
    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.style.border = '2px dashed var(--accent)';
        return false;
    }

    function handleDragLeave(e) {
        this.style.border = 'none';
        this.style.borderBottom = '1px solid var(--settings-border)';
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();

        // Restore style
        this.style.border = 'none';
        this.style.borderBottom = '1px solid var(--settings-border)';

        const srcIndex = parseInt(dragSrcEl.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        if (dragSrcEl !== this) {
            reorderQuickLinks(srcIndex, targetIndex);
        }
        return false;
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        document.querySelectorAll('.draggable-link').forEach(item => {
            item.style.border = 'none';
            item.style.borderBottom = '1px solid var(--settings-border)';
        });
    }

    function reorderQuickLinks(fromIndex, toIndex) {
        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            if (fromIndex >= 0 && fromIndex < links.length) {
                const item = links.splice(fromIndex, 1)[0];
                links.splice(toIndex, 0, item);
                chrome.storage.sync.set({ quickLinks: links }, () => {
                    renderQuickLinksUI(links);
                });
            }
        });
    }

    function addQuickLink() {
        const name = newLinkName.value.trim();
        let url = newLinkUrl.value.trim();

        if (!name || !url) return alert('Preencha nome e URL');
        if (!url.startsWith('http')) url = 'https://' + url;

        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            links.push({ name, url });
            chrome.storage.sync.set({ quickLinks: links }, () => {
                newLinkName.value = '';
                newLinkUrl.value = '';
                renderQuickLinksUI(links);
            });
        });
    }

    function removeQuickLink(index) {
        chrome.storage.sync.get(['quickLinks'], (result) => {
            const links = result.quickLinks || [];
            if (index >= 0 && index < links.length) {
                links.splice(index, 1);
                chrome.storage.sync.set({ quickLinks: links }, () => {
                    renderQuickLinksUI(links);
                });
            }
        });
    }

    if (addLinkBtn) addLinkBtn.addEventListener('click', addQuickLink);

    if (quickLinksSize) {
        quickLinksSize.addEventListener('input', (e) => {
            if (quickLinksSizeValue) quickLinksSizeValue.textContent = e.target.value + 'px';
            saveSettings(); // Save font size immediately or waiting for button? Just updating preview.
            // But saveSettings handles saving extensionSettings which includes quickLinksSize.
            // We can auto-save here too.
            saveSettings();
        });
    }

    // Exportar dados
    exportDataBtn.addEventListener('click', function () {
        const originalText = exportDataBtn.innerHTML;
        exportDataBtn.innerHTML = "✔️ Exportado!";
        setTimeout(() => { exportDataBtn.innerHTML = originalText; }, 2000);

        chrome.storage.local.get(['userBookmarks', 'customIcons'], function (resultLocal) {
            chrome.storage.sync.get(['extensionSettings', 'quickLinks'], function (resultSync) {
                const exportData = {
                    bookmarks: resultLocal.userBookmarks || [],
                    customIcons: resultLocal.customIcons || {},
                    settings: resultSync.extensionSettings || defaultSettings,
                    quickLinks: resultSync.quickLinks || [],
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
    });

    // Importar dados
    importDataBtn.addEventListener('click', function () {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const importData = JSON.parse(e.target.result);

                    if (confirm("Tem certeza que deseja importar os dados? Isso substituirá todas as configurações e atalhos atuais.")) {
                        const dataToSave = {};

                        if (importData.bookmarks) {
                            dataToSave.userBookmarks = importData.bookmarks;
                            // Bookmarks must remain local due to eventual length limits on sync APIs or Chrome API preference.
                            chrome.storage.local.set({ userBookmarks: importData.bookmarks });
                        }

                        if (importData.customIcons) {
                            chrome.storage.local.set({ customIcons: importData.customIcons });
                        }

                        if (importData.quickLinks) {
                            chrome.storage.sync.set({ quickLinks: importData.quickLinks }, function () {
                                renderQuickLinksUI(importData.quickLinks);
                            });
                        }

                        if (importData.settings) {
                            chrome.storage.sync.set({ extensionSettings: importData.settings }, function () {
                                if (chrome.runtime.lastError) {
                                    console.error("Erro ao importar dados de config:", chrome.runtime.lastError.message);
                                } else {
                                    console.log("Dados importados com sucesso!");
                                    window.location.reload(); // Recarregar página para aplicar tudo
                                }
                            });
                        } else {
                            window.location.reload();
                        }
                    }
                } catch (error) {
                    console.error("Erro ao processar arquivo:", error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Reiniciar configurações
    resetSettingsBtn.addEventListener('click', function () {
        if (confirm("Tem certeza que deseja reiniciar todas as configurações para os valores padrão?")) {
            chrome.storage.sync.set({ extensionSettings: defaultSettings }, function () {
                if (chrome.runtime.lastError) {
                    console.error("Erro ao reiniciar configurações:", chrome.runtime.lastError.message);
                } else {
                    console.log("Configurações reiniciadas com sucesso!");
                    window.location.reload(); // Recarregar a página para limpar os estados visuais
                }
            });
        }
    });

    // Salvar configurações
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Fechar configurações
    closeSettingsBtn.addEventListener('click', function () {
        window.close();
    });

    // Carregar configurações ao inicializar
    loadSettings();
});

