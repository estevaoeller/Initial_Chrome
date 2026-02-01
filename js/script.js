// js/script.js (versão final limpa)
import {
    loadBookmarksFromChrome,
    addBookmarkToChrome,
    applyTheme,
    toggleTheme,
    updateClock,
    updateDate,
    updateCalendar,
    loadSpacesFromChrome,
    loadGroupsFromSpace,
    createSpace,
    deleteSpace,
    checkAndMigrateToSpaces,
    getRandomSpaceIcon
} from './modules.js';
import {
    loadSettings,
    applyIconSizeSetting,
    applyIconAppearance,
    applyIconSpacingSetting,
    applyBookmarkMinWidthSetting,
    applyIconGapSetting,
    applyCategoryGapSetting,
    applyIconLayoutSetting,
    applyNameDisplaySetting,
    applyTextBehaviorSetting,
    applySidebarWidthSetting,
    applyBookmarkFontSettings,
    applyBackgroundFilter,
    applyLayoutMode
} from './settings-handlers.js';
import { renderBookmarks } from './bookmark-renderer.js';

document.addEventListener('DOMContentLoaded', function () {
    // ---- CONSTANTES E VARIÁVEIS ----
    const contentArea = document.getElementById('content-area');
    const analogClockPlaceholder = document.getElementById('analog-clock-placeholder');
    const datePlaceholder = document.getElementById('date-placeholder');
    const calendarPlaceholder = document.getElementById('calendar-placeholder');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const settingsBtn = document.getElementById('settings-btn');

    // Sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const spacesList = document.getElementById('spaces-list');
    const addSpaceBtn = document.getElementById('add-space-btn');

    const defaultBookmarkCategories = [
        { name: 'IA', links: [{ name: 'ChatGPT', url: 'https://chat.openai.com/' }, { name: 'Gemini', url: 'https://gemini.google.com/' }] },
        { name: 'News', links: [{ name: 'Google News', url: 'https://news.google.com/' }] },
        { name: 'Ferramentas', links: [{ name: 'Photopea', url: 'https://www.photopea.com/' }] }
    ];
    let currentBookmarks = [];
    let currentSpaces = [];
    let activeSpaceId = null;

    const settingsState = {
        iconSize: 32,
        iconBorderRadius: 6,
        iconBorderColor: '#ddd',
        iconBgColor: '#fff',
        iconSpacing: 8,
        iconGap: 8,
        categoryGap: 20,
        bookmarkFontFamily: 'sans-serif',
        bookmarkFontSize: 14,
        bookmarkFontColor: '#333333',
        bookmarkMinWidth: 100,
        filterColor: '#000000',
        filterOpacity: 0.3,
        iconLayout: 'row', // New
        nameDisplay: 'always', // New
        textBehavior: 'truncate', // New
        themePreset: 'light',
        lastActiveSpace: null,
        sidebarCollapsed: false,
        sidebarWidth: 200
    };

    // ---- SIDEBAR FUNCTIONS ----
    function renderSpacesList(spaces) {
        if (!spacesList) return;
        spacesList.innerHTML = '';
        spaces.forEach(space => {
            const spaceItem = document.createElement('button');
            spaceItem.className = 'space-item';
            if (space.id === activeSpaceId) {
                spaceItem.classList.add('active');
            }
            spaceItem.dataset.spaceId = space.id;
            spaceItem.innerHTML = `
                <span class="space-icon">${space.icon}</span>
                <span class="space-name">${space.name}</span>
            `;
            spaceItem.addEventListener('click', () => selectSpace(space.id));
            spacesList.appendChild(spaceItem);
        });
    }

    function selectSpace(spaceId) {
        activeSpaceId = spaceId;
        // Update active class
        document.querySelectorAll('.space-item').forEach(item => {
            item.classList.toggle('active', item.dataset.spaceId === spaceId);
        });
        // Load groups from this space
        loadGroupsFromSpace(spaceId, groups => {
            currentBookmarks = groups;
            const stateHelpers = {
                getBookmarks: () => currentBookmarks,
                setBookmarks: (newVal) => { currentBookmarks = newVal; }
            };
            renderBookmarks(currentBookmarks, contentArea, settingsState.iconSize, stateHelpers);
        });
        // Save to settings
        chrome.storage.local.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            settings.lastActiveSpace = spaceId;
            chrome.storage.local.set({ extensionSettings: settings });
        });
    }

    function toggleSidebar() {
        if (!sidebar) return;
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        if (sidebarToggle) {
            sidebarToggle.textContent = isCollapsed ? '▶' : '◀';
        }
        // Save state
        chrome.storage.local.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            settings.sidebarCollapsed = isCollapsed;
            chrome.storage.local.set({ extensionSettings: settings });
        });
    }

    function handleAddSpace() {
        const name = prompt('Nome do novo espaço:');
        if (!name || !name.trim()) return;
        const icon = getRandomSpaceIcon();
        createSpace(name.trim(), icon, newSpace => {
            if (newSpace) {
                currentSpaces.push(newSpace);
                renderSpacesList(currentSpaces);
                selectSpace(newSpace.id);
            }
        });
    }

    // ---- FUNÇÃO PRINCIPAL ----
    function initialize() {
        // First, check if migration is needed
        checkAndMigrateToSpaces(migrated => {
            if (migrated) {
                console.log('Migração realizada! Recarregando espaços...');
            }

            // Load spaces
            loadSpacesFromChrome(spaces => {
                currentSpaces = spaces;
                renderSpacesList(spaces);

                if (spaces.length > 0) {
                    // Select last active space or first one
                    const targetSpaceId = settingsState.lastActiveSpace && spaces.find(s => s.id === settingsState.lastActiveSpace)
                        ? settingsState.lastActiveSpace
                        : spaces[0].id;
                    selectSpace(targetSpaceId);
                } else {
                    // No spaces exist yet - create default "Home" space
                    createSpace('Home', '🏠', newSpace => {
                        if (newSpace) {
                            currentSpaces = [newSpace];
                            renderSpacesList(currentSpaces);
                            selectSpace(newSpace.id);
                        }
                    });
                }
            });
        });

        // Sidebar toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }

        // Add space button
        if (addSpaceBtn) {
            addSpaceBtn.addEventListener('click', handleAddSpace);
        }

        // Restore sidebar state
        if (settingsState.sidebarCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            if (sidebarToggle) sidebarToggle.textContent = '▶';
        }

        // Inicialização de outros componentes
        chrome.storage.local.get(['extensionSettings', 'theme'], result => {
            const settings = result.extensionSettings || {};
            let theme = settings.themePreset;
            if (!theme && result.theme && ['light', 'dark'].includes(result.theme)) {
                theme = result.theme;
                settings.themePreset = theme;
                chrome.storage.local.set({ extensionSettings: settings }, () => {
                    chrome.storage.local.remove('theme');
                });
            }
            theme = theme || 'light';
            settingsState.themePreset = theme;
            applyTheme(theme);
        });
        if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
        if (settingsBtn) settingsBtn.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') }));
        if (analogClockPlaceholder) {
            updateClock(analogClockPlaceholder);
            setInterval(() => updateClock(analogClockPlaceholder), 1000);
        }
        if (datePlaceholder) {
            updateDate(datePlaceholder);
            setInterval(() => updateDate(datePlaceholder), 60000);
        }
        if (calendarPlaceholder) {
            updateCalendar(calendarPlaceholder);
            setInterval(() => updateCalendar(calendarPlaceholder), 3600000);
        }
    }

    // ---- PONTO DE ENTRADA ----
    loadSettings(settingsState, initialize);

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.extensionSettings) {
            const newSettings = changes.extensionSettings.newValue || {};
            if (newSettings.iconSize !== undefined && newSettings.iconSize !== settingsState.iconSize) {
                settingsState.iconSize = newSettings.iconSize;
                applyIconSizeSetting(settingsState.iconSize);
            }
            if (newSettings.iconBorderRadius !== undefined && newSettings.iconBorderRadius !== settingsState.iconBorderRadius) {
                settingsState.iconBorderRadius = newSettings.iconBorderRadius;
            }
            if (newSettings.iconBorderColor && newSettings.iconBorderColor !== settingsState.iconBorderColor) {
                settingsState.iconBorderColor = newSettings.iconBorderColor;
            }
            if (newSettings.iconBgColor && newSettings.iconBgColor !== settingsState.iconBgColor) {
                settingsState.iconBgColor = newSettings.iconBgColor;
            }
            if (newSettings.iconSpacing !== undefined && newSettings.iconSpacing !== settingsState.iconSpacing) {
                settingsState.iconSpacing = newSettings.iconSpacing;
                applyIconSpacingSetting(settingsState.iconSpacing);
            }
            if (newSettings.iconGap !== undefined && newSettings.iconGap !== settingsState.iconGap) {
                settingsState.iconGap = newSettings.iconGap;
                applyIconGapSetting(settingsState.iconGap);
            }
            if (newSettings.categoryGap !== undefined && newSettings.categoryGap !== settingsState.categoryGap) {
                settingsState.categoryGap = newSettings.categoryGap;
                applyCategoryGapSetting(settingsState.categoryGap);
            }

            if (newSettings.iconLayout && newSettings.iconLayout !== settingsState.iconLayout) {
                settingsState.iconLayout = newSettings.iconLayout;
                applyIconLayoutSetting(settingsState.iconLayout);
            }

            if (newSettings.nameDisplay && newSettings.nameDisplay !== settingsState.nameDisplay) {
                settingsState.nameDisplay = newSettings.nameDisplay;
                applyNameDisplaySetting(settingsState.nameDisplay);
            }

            if (newSettings.textBehavior && newSettings.textBehavior !== settingsState.textBehavior) {
                settingsState.textBehavior = newSettings.textBehavior;
                applyTextBehaviorSetting(settingsState.textBehavior);
            }

            if (newSettings.bookmarkFontFamily && newSettings.bookmarkFontFamily !== settingsState.bookmarkFontFamily) {
                settingsState.bookmarkFontFamily = newSettings.bookmarkFontFamily;
            }
            if (newSettings.bookmarkFontSize !== undefined && newSettings.bookmarkFontSize !== settingsState.bookmarkFontSize) {
                settingsState.bookmarkFontSize = newSettings.bookmarkFontSize;
            }
            if (newSettings.bookmarkFontColor && newSettings.bookmarkFontColor !== settingsState.bookmarkFontColor) {
                settingsState.bookmarkFontColor = newSettings.bookmarkFontColor;
            }

            if (newSettings.bookmarkMinWidth !== undefined && newSettings.bookmarkMinWidth !== settingsState.bookmarkMinWidth) {
                settingsState.bookmarkMinWidth = newSettings.bookmarkMinWidth;
                applyBookmarkMinWidthSetting(settingsState.bookmarkMinWidth);
            }

            if (newSettings.filterColor && newSettings.filterColor !== settingsState.filterColor) {
                settingsState.filterColor = newSettings.filterColor;
            }
            if (newSettings.filterOpacity !== undefined && newSettings.filterOpacity !== settingsState.filterOpacity) {
                settingsState.filterOpacity = newSettings.filterOpacity;
            }

            if (newSettings.themePreset && newSettings.themePreset !== settingsState.themePreset) {
                settingsState.themePreset = newSettings.themePreset;
                applyTheme(settingsState.themePreset);

                // Auto-adjust font color for Dark/Light modes if using defaults
                const DARK_TEXT = '#333333';
                const LIGHT_TEXT = '#e2e8f0';

                if (settingsState.themePreset === 'dark' || settingsState.themePreset === 'solar') { // Solar is also dark-ish usually, or check specifically
                    if (settingsState.bookmarkFontColor === DARK_TEXT) {
                        settingsState.bookmarkFontColor = LIGHT_TEXT;
                        // Update state and UI
                        applyBookmarkFontSettings(
                            settingsState.bookmarkFontFamily,
                            settingsState.bookmarkFontSize,
                            settingsState.bookmarkFontColor
                        );
                        // Persist change
                        chrome.storage.local.get(['extensionSettings'], (res) => {
                            const s = res.extensionSettings || {};
                            s.bookmarkFontColor = LIGHT_TEXT;
                            chrome.storage.local.set({ extensionSettings: s });
                        });
                    }
                } else if (settingsState.themePreset === 'light' || settingsState.themePreset === 'minimal') {
                    if (settingsState.bookmarkFontColor === LIGHT_TEXT) {
                        settingsState.bookmarkFontColor = DARK_TEXT;
                        applyBookmarkFontSettings(
                            settingsState.bookmarkFontFamily,
                            settingsState.bookmarkFontSize,
                            settingsState.bookmarkFontColor
                        );
                        // Persist change
                        chrome.storage.local.get(['extensionSettings'], (res) => {
                            const s = res.extensionSettings || {};
                            s.bookmarkFontColor = DARK_TEXT;
                            chrome.storage.local.set({ extensionSettings: s });
                        });
                    }
                }
            }
            if (newSettings.layoutMode && newSettings.layoutMode !== settingsState.layoutMode) {
                settingsState.layoutMode = newSettings.layoutMode;
                applyLayoutMode(settingsState.layoutMode, settingsState.columnCount);
            }
            if (newSettings.columnCount && newSettings.columnCount !== settingsState.columnCount) {
                settingsState.columnCount = newSettings.columnCount;
                applyLayoutMode(settingsState.layoutMode, settingsState.columnCount);
            }
            if (newSettings.sidebarWidth !== undefined && newSettings.sidebarWidth !== settingsState.sidebarWidth) {
                settingsState.sidebarWidth = newSettings.sidebarWidth;
                applySidebarWidthSetting(settingsState.sidebarWidth);
            }

            applyIconAppearance(settingsState.iconBorderRadius, settingsState.iconBorderColor, settingsState.iconBgColor);
            applyBookmarkFontSettings(
                settingsState.bookmarkFontFamily,
                settingsState.bookmarkFontSize,
                settingsState.bookmarkFontColor
            );
            applyBackgroundFilter(settingsState.filterColor, settingsState.filterOpacity);
        }
    });
});
