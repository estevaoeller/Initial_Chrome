import {
    applyTheme,
    loadGroupsFromSpace,
    checkAndMigrateToSpaces,
    manageWallpaper,
    loadCustomIcons,
    updateGreeting,
    updateWeather
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
    applyLayoutMode,
    applySectionAppearance,
} from './settings-handlers.js';
import { renderBookmarks } from './bookmark-renderer.js';
import { initPomodoro } from './pomodoro.js';
import { initWidgets } from './core/clock-greeting.js';
import { SidebarManager } from './features/sidebar.js';
import { QuickLinksManager } from './features/quick-links.js';
import { EditModalManager } from './features/edit-modal.js';
import { SearchManager } from './features/search.js';
import { ContextMenuManager } from './features/context-menu.js';

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const greetingPlaceholder = document.getElementById('greeting-placeholder');
    const weatherWidget = document.getElementById('weather-widget');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');

    let currentBookmarks = [];

    const settingsState = {
        iconSize: 28,
        iconBorderRadius: 8,
        iconBorderColor: '#697c96',
        iconBgColor: '#7491b9',
        iconBgOpacity: 0.75,
        iconSpacing: 8,
        iconGap: 8,
        categoryGap: 12,
        bookmarkFontFamily: 'sans-serif',
        bookmarkFontSize: 12,
        bookmarkFontColor: '#e2e8f0',
        bookmarkMinWidth: 150,
        filterColor: '#000000',
        filterOpacity: 0.3,
        iconLayout: 'row',
        nameDisplay: 'always',
        textBehavior: 'truncate',
        themePreset: 'dark',
        lastActiveSpace: null,
        sidebarCollapsed: false,
        sidebarWidth: 240
    };

    // Instantiate Feature Managers
    const quickLinksManager = new QuickLinksManager();
    const editModalManager = new EditModalManager(settingsState);
    const searchManager = new SearchManager();
    const contextMenuManager = new ContextMenuManager();
    
    // Callback when space is changed
    const onSpaceSelected = (spaceId) => {
        loadCustomIcons(customIcons => {
            loadGroupsFromSpace(spaceId, groups => {
                currentBookmarks = groups;
                const stateHelpers = {
                    spaceId: spaceId,
                    getBookmarks: () => currentBookmarks,
                    setBookmarks: (newVal) => { currentBookmarks = newVal; },
                    customIcons: customIcons,
                    iconSize: settingsState.iconSize
                };
                renderBookmarks(currentBookmarks, contentArea, settingsState.iconSize, stateHelpers);
            });
        });
    };

    const sidebarManager = new SidebarManager(settingsState, onSpaceSelected);

    function initialize() {
        // First, check if migration is needed
        checkAndMigrateToSpaces(migrated => {
            if (migrated) {
                console.log('Migração realizada! Recarregando espaços...');
            }

            // Init Sidebar & Load Spaces
            sidebarManager.init();
            sidebarManager.loadSpaces(settingsState.lastActiveSpace);
        });

        // Initialize Quick Links & Modal
        quickLinksManager.init();
        editModalManager.init();
        searchManager.init();
        contextMenuManager.init();

        // Theme and Background initialization
        chrome.storage.sync.get(['extensionSettings', 'theme'], result => {
            const settings = result.extensionSettings || {};
            let theme = settings.themePreset;
            if (!theme && result.theme && ['light', 'dark'].includes(result.theme)) {
                theme = result.theme;
                settings.themePreset = theme;
                chrome.storage.sync.set({ extensionSettings: settings }, () => {
                    chrome.storage.sync.remove('theme');
                });
            }
            theme = theme || 'light';
            settingsState.themePreset = theme;
            applyTheme(theme);
        });

        // Initialize Widgets (Relógio, Clima, Saudação)
        const widgets = initWidgets(settingsState);

        // Pomodoro
        initPomodoro();

        // Wallpaper
        manageWallpaper(settingsState);
        const nextWallpaperBtn = document.getElementById('next-wallpaper-btn');
        if (nextWallpaperBtn) {
            nextWallpaperBtn.addEventListener('click', (e) => {
                e.preventDefault();
                manageWallpaper(settingsState, true);
            });
        }

        // Setup settings observer
        setupSettingsObserver(widgets.tickClock);

        // Setup sidebar actions
        setupSidebarActions();
    }

    function setupSettingsObserver(tickClock) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync' && changes.extensionSettings) {
                const newSettings = changes.extensionSettings.newValue || {};
                
                if (newSettings.iconSize !== undefined && newSettings.iconSize !== settingsState.iconSize) {
                    settingsState.iconSize = newSettings.iconSize;
                    applyIconSizeSetting(settingsState.iconSize);
                }
                
                let updateIconAppearance = false;
                let updateSectionAppearance = false;

                if (newSettings.iconBorderRadius !== undefined && newSettings.iconBorderRadius !== settingsState.iconBorderRadius) {
                    settingsState.iconBorderRadius = newSettings.iconBorderRadius;
                    updateIconAppearance = true;
                }
                if (newSettings.iconBorderColor && newSettings.iconBorderColor !== settingsState.iconBorderColor) {
                    settingsState.iconBorderColor = newSettings.iconBorderColor;
                    updateIconAppearance = true;
                }
                if (newSettings.iconBgColor && newSettings.iconBgColor !== settingsState.iconBgColor) {
                    settingsState.iconBgColor = newSettings.iconBgColor;
                    updateIconAppearance = true;
                }
                if (newSettings.iconBgOpacity !== undefined && newSettings.iconBgOpacity !== settingsState.iconBgOpacity) {
                    settingsState.iconBgOpacity = newSettings.iconBgOpacity;
                    updateIconAppearance = true;
                }

                if (updateIconAppearance) {
                    applyIconAppearance(
                        settingsState.iconBorderRadius,
                        settingsState.iconBorderColor,
                        settingsState.iconBgColor,
                        settingsState.iconBgOpacity
                    );
                }

                if (newSettings.sectionPadding !== undefined && newSettings.sectionPadding !== settingsState.sectionPadding) {
                    settingsState.sectionPadding = newSettings.sectionPadding;
                    updateSectionAppearance = true;
                }
                if (newSettings.sectionBgColor && newSettings.sectionBgColor !== settingsState.sectionBgColor) {
                    settingsState.sectionBgColor = newSettings.sectionBgColor;
                    updateSectionAppearance = true;
                }
                if (newSettings.sectionBgOpacity !== undefined && newSettings.sectionBgOpacity !== settingsState.sectionBgOpacity) {
                    settingsState.sectionBgOpacity = newSettings.sectionBgOpacity;
                    updateSectionAppearance = true;
                }
                if (newSettings.sectionLineColor && newSettings.sectionLineColor !== settingsState.sectionLineColor) {
                    settingsState.sectionLineColor = newSettings.sectionLineColor;
                    updateSectionAppearance = true;
                }

                if (updateSectionAppearance) {
                    applySectionAppearance(
                        settingsState.sectionPadding,
                        settingsState.sectionBgColor,
                        settingsState.sectionBgOpacity,
                        settingsState.sectionLineColor
                    );
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

                    const DARK_TEXT = '#333333';
                    const LIGHT_TEXT = '#e2e8f0';

                    if (settingsState.themePreset === 'dark' || settingsState.themePreset === 'solar') {
                        if (settingsState.bookmarkFontColor === DARK_TEXT) {
                            settingsState.bookmarkFontColor = LIGHT_TEXT;
                            applyBookmarkFontSettings(settingsState.bookmarkFontFamily, settingsState.bookmarkFontSize, settingsState.bookmarkFontColor);
                        }
                    } else if (settingsState.themePreset === 'light' || settingsState.themePreset === 'minimal') {
                        if (settingsState.bookmarkFontColor === LIGHT_TEXT) {
                            settingsState.bookmarkFontColor = DARK_TEXT;
                            applyBookmarkFontSettings(settingsState.bookmarkFontFamily, settingsState.bookmarkFontSize, settingsState.bookmarkFontColor);
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

                // Widget Reactivity
                if (newSettings.clockStyle && newSettings.clockStyle !== settingsState.clockStyle) {
                    settingsState.clockStyle = newSettings.clockStyle;
                    const analogClockPlaceholder = document.getElementById('analog-clock-placeholder');
                    const digitalClockPlaceholder = document.getElementById('digital-clock-placeholder');
                    if (settingsState.clockStyle === 'digital') {
                        if (analogClockPlaceholder) analogClockPlaceholder.style.display = 'none';
                        if (digitalClockPlaceholder) digitalClockPlaceholder.style.display = 'block';
                    } else {
                        if (analogClockPlaceholder) analogClockPlaceholder.style.display = 'block';
                        if (digitalClockPlaceholder) digitalClockPlaceholder.style.display = 'none';
                    }
                    tickClock();
                }

                if (newSettings.userName !== undefined && newSettings.userName !== settingsState.userName) {
                    settingsState.userName = newSettings.userName;
                    if (greetingPlaceholder) updateGreeting(greetingPlaceholder, settingsState.userName);
                }

                if (newSettings.weatherCity !== undefined && newSettings.weatherCity !== settingsState.weatherCity) {
                    settingsState.weatherCity = newSettings.weatherCity;
                    if (weatherWidget && weatherIcon && weatherTemp) {
                        updateWeather(weatherWidget, weatherIcon, weatherTemp, settingsState.weatherCity);
                    }
                }

                if (newSettings.wallpaperSource !== undefined && newSettings.wallpaperSource !== settingsState.wallpaperSource ||
                    newSettings.wallpaperTheme !== undefined && newSettings.wallpaperTheme !== settingsState.wallpaperTheme ||
                    newSettings.wallpaperFrequency !== undefined && newSettings.wallpaperFrequency !== settingsState.wallpaperFrequency) {

                    settingsState.wallpaperSource = newSettings.wallpaperSource !== undefined ? newSettings.wallpaperSource : settingsState.wallpaperSource;
                    settingsState.wallpaperTheme = newSettings.wallpaperTheme !== undefined ? newSettings.wallpaperTheme : settingsState.wallpaperTheme;
                    settingsState.wallpaperFrequency = newSettings.wallpaperFrequency !== undefined ? newSettings.wallpaperFrequency : settingsState.wallpaperFrequency;

                    manageWallpaper(settingsState);
                }

                applyIconAppearance(settingsState.iconBorderRadius, settingsState.iconBorderColor, settingsState.iconBgColor, settingsState.iconBgOpacity);
                applyBookmarkFontSettings(
                    settingsState.bookmarkFontFamily,
                    settingsState.bookmarkFontSize,
                    settingsState.bookmarkFontColor
                );
                applyBackgroundFilter(settingsState.filterColor, settingsState.filterOpacity);
            }

            if (area === 'sync' && changes.quickLinks) {
                quickLinksManager.renderQuickLinks(changes.quickLinks.newValue || []);
            }
        });
    }

    function setupSidebarActions() {
        // Theme Toggle
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const themes = ['light', 'dark', 'solar', 'minimal'];
                const currentClass = Array.from(document.body.classList).find(c => c.endsWith('-theme'));
                const current = currentClass ? currentClass.replace('-theme', '') : 'light';
                const nextIndex = (themes.indexOf(current) + 1) % themes.length;
                const nextTheme = themes[nextIndex];

                chrome.storage.sync.get(['extensionSettings'], res => {
                    const s = res.extensionSettings || {};
                    s.themePreset = nextTheme;
                    chrome.storage.sync.set({ extensionSettings: s });
                });
            });
        }

        // Settings Button (Custom Size)
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            const newSettingsBtn = settingsBtn.cloneNode(true);
            settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

            newSettingsBtn.addEventListener('click', () => {
                const width = Math.round(window.screen.availWidth * 0.35);
                const height = Math.round(window.screen.availHeight * 0.8);
                const left = Math.round((window.screen.availWidth - width) / 2);
                const top = Math.round((window.screen.availHeight - height) / 2);

                chrome.windows.create({
                    url: 'settings.html',
                    type: 'popup',
                    width: width,
                    height: height,
                    left: left,
                    top: top
                });
            });
        }

        // Chrome Shortcuts
        const shortcuts = {
            'chrome-bookmarks-btn': 'chrome://bookmarks',
            'chrome-history-btn': 'chrome://history',
            'chrome-downloads-btn': 'chrome://downloads'
        };

        Object.keys(shortcuts).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    chrome.tabs.create({ url: shortcuts[id] });
                });
            }
        });
    }

    // Load initial settings and run initialize
    loadSettings(settingsState, initialize);
});
