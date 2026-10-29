import {
  applyTheme,
  THEME_PALETTES,
  loadGroupsFromSpace,
  checkAndMigrateToSpaces,
  manageWallpaper,
  loadCustomIcons,
  updateGreeting,
  updateWeather,
  restoreFromPersistentSourcesIfNeeded,
  syncBackupToChromeBookmarks,
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
  applyWallpaperBlurSetting,
  applyCardStyleSetting,
  applyLockLayoutSetting,
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
import { ShortcutsManager } from './features/shortcuts.js';
import { TodoListManager } from './features/todo.js';
import { QuotesManager } from './features/quotes.js';
import { RssManager } from './features/rss.js';

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
    wallpaperBlur: 0,
    cardStyle: 'card',
    lockLayout: false,
    iconLayout: 'row',
    defaultIconSource: 'dashboardicons',
    nameDisplay: 'always',
    textBehavior: 'truncate',
    themePreset: 'dark',
    lastActiveSpace: null,
    sidebarCollapsed: false,
    sidebarWidth: 240,
  };

  // Instantiate Feature Managers
  const quickLinksManager = new QuickLinksManager();
  const editModalManager = new EditModalManager(settingsState);
  const searchManager = new SearchManager();
  const contextMenuManager = new ContextMenuManager();

  // Callback when space is changed
  const onSpaceSelected = (spaceId) => {
    contentArea.classList.add('switching-space');
    loadCustomIcons((customIcons) => {
      // Save to settingsState so ShortcutsManager can access it on the fly
      settingsState.customIcons = customIcons;
      chrome.storage.sync.get(['collapsedGroups'], (result) => {
        const collapsedGroups = result.collapsedGroups || [];
        settingsState.collapsedGroups = collapsedGroups;
        loadGroupsFromSpace(spaceId, (groups) => {
          currentBookmarks = groups;
          const stateHelpers = {
            spaceId: spaceId,
            getBookmarks: () => currentBookmarks,
            setBookmarks: (newVal) => {
              currentBookmarks = newVal;
            },
            customIcons: customIcons,
            defaultIconSource:
              settingsState.defaultIconSource || 'dashboardicons',
            iconSize: settingsState.iconSize,
            collapsedGroups: collapsedGroups,
          };
          renderBookmarks(
            currentBookmarks,
            contentArea,
            settingsState.iconSize,
            stateHelpers,
          );
          setTimeout(() => {
            contentArea.classList.remove('switching-space');
          }, 50);
        });
      });
    });
  };

  const sidebarManager = new SidebarManager(settingsState, onSpaceSelected);

  const shortcutsManager = new ShortcutsManager({
    sidebarManager: sidebarManager,
    getBookmarks: () => currentBookmarks,
    setBookmarks: (newVal) => {
      currentBookmarks = newVal;
    },
    contentArea: contentArea,
    settingsState: settingsState,
    stateHelpers: () => {
      return {
        spaceId: sidebarManager.activeSpaceId,
        getBookmarks: () => currentBookmarks,
        setBookmarks: (newVal) => {
          currentBookmarks = newVal;
        },
        customIcons: settingsState.customIcons || {},
        defaultIconSource:
          settingsState.defaultIconSource || 'dashboardicons',
        iconSize: settingsState.iconSize,
        collapsedGroups: settingsState.collapsedGroups || [],
      };
    },
  });

  function updateWidgetVisibilities(settings) {
    const todoWidget = document.getElementById('todo-widget');
    const quoteWidget = document.getElementById('quote-widget');
    const topWidgetsContainer = document.getElementById(
      'top-widgets-container',
    );
    const rssWidget = document.getElementById('rss-widget');
    const widgetsDashboardWrapper = document.getElementById(
      'widgets-dashboard-wrapper',
    );

    const todoVal = settings.todoEnabled !== false;
    const quotesVal = settings.quotesEnabled !== false;
    const rssVal = settings.rssEnabled !== false;

    if (todoWidget) {
      todoWidget.style.display = todoVal ? '' : 'none';
    }
    if (quoteWidget) {
      quoteWidget.style.display = quotesVal ? '' : 'none';
    }
    if (rssWidget) {
      rssWidget.style.display = rssVal ? '' : 'none';
    }

    const hasAnyWidget = todoVal || quotesVal || rssVal;
    if (topWidgetsContainer) {
      topWidgetsContainer.style.display = hasAnyWidget ? '' : 'none';
    }
    if (widgetsDashboardWrapper) {
      widgetsDashboardWrapper.style.display = hasAnyWidget ? '' : 'none';
    }
  }

  function initWidgetsDashboardToggle() {
    const toggleBtn = document.getElementById('toggle-widgets-btn');
    const topWidgetsContainer = document.getElementById('top-widgets-container');
    const toggleIcon = document.getElementById('toggle-widgets-icon');
    const toggleText = document.getElementById('toggle-widgets-text');

    if (!toggleBtn || !topWidgetsContainer) return;

    chrome.storage.local.get(['widgetsCollapsed'], (res) => {
      const isCollapsed = res.widgetsCollapsed === true;
      if (isCollapsed) {
        topWidgetsContainer.classList.add('collapsed');
        if (toggleIcon) toggleIcon.textContent = '▸';
        if (toggleText) toggleText.textContent = 'Mostrar Widgets';
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        topWidgetsContainer.classList.remove('collapsed');
        if (toggleIcon) toggleIcon.textContent = '▾';
        if (toggleText) toggleText.textContent = 'Ocultar Widgets';
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    toggleBtn.addEventListener('click', () => {
      const isCurrentlyCollapsed = topWidgetsContainer.classList.toggle('collapsed');
      const isCollapsed = isCurrentlyCollapsed;

      if (toggleIcon) toggleIcon.textContent = isCollapsed ? '▸' : '▾';
      if (toggleText) toggleText.textContent = isCollapsed ? 'Mostrar Widgets' : 'Ocultar Widgets';
      toggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');

      chrome.storage.local.set({ widgetsCollapsed: isCollapsed });
    });
  }

  function initialize() {
    // First, check if migration is needed
    checkAndMigrateToSpaces((migrated) => {
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
    searchManager.init({ sidebarManager, shortcutsManager, settingsState });
    contextMenuManager.init();
    shortcutsManager.init();

    // Theme and Background initialization
    chrome.storage.sync.get(['extensionSettings', 'theme'], (result) => {
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

    // Widgets opcionais: só inicializa (e só gasta rede/DOM) o que está ativado
    const todoListManager = new TodoListManager();
    const quotesManager = new QuotesManager();
    const rssManager = new RssManager();

    const ensureOptionalWidgets = () => {
      if (settingsState.todoEnabled !== false && !todoListManager._started) {
        todoListManager._started = true;
        todoListManager.init();
      }
      if (settingsState.quotesEnabled !== false && !quotesManager._started) {
        quotesManager._started = true;
        quotesManager.init();
      }
      if (settingsState.rssEnabled !== false && !rssManager._started) {
        rssManager._started = true;
        rssManager.init();
      }
    };
    ensureOptionalWidgets();

    // Update widgets visibility
    updateWidgetVisibilities(settingsState);
    initWidgetsDashboardToggle();

    // Modo sólido: desliga o efeito glass (backdrop-filter) das superfícies
    document.body.classList.toggle(
      'solid-surfaces',
      settingsState.solidSurfaces === true,
    );

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
    setupSettingsObserver(widgets.tickClock, rssManager, ensureOptionalWidgets);

    // Setup sidebar actions
    setupSidebarActions();
  }

  function setupSettingsObserver(tickClock, rssManager, ensureOptionalWidgets) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.extensionSettings) {
        const newSettings = changes.extensionSettings.newValue || {};

        if (
          newSettings.iconSize !== undefined &&
          newSettings.iconSize !== settingsState.iconSize
        ) {
          settingsState.iconSize = newSettings.iconSize;
          applyIconSizeSetting(settingsState.iconSize);
        }

        let updateIconAppearance = false;
        let updateSectionAppearance = false;

        if (
          newSettings.iconBorderRadius !== undefined &&
          newSettings.iconBorderRadius !== settingsState.iconBorderRadius
        ) {
          settingsState.iconBorderRadius = newSettings.iconBorderRadius;
          updateIconAppearance = true;
        }
        if (
          newSettings.iconBorderColor &&
          newSettings.iconBorderColor !== settingsState.iconBorderColor
        ) {
          settingsState.iconBorderColor = newSettings.iconBorderColor;
          updateIconAppearance = true;
        }
        if (
          newSettings.iconBgColor &&
          newSettings.iconBgColor !== settingsState.iconBgColor
        ) {
          settingsState.iconBgColor = newSettings.iconBgColor;
          updateIconAppearance = true;
        }
        if (
          newSettings.iconBgOpacity !== undefined &&
          newSettings.iconBgOpacity !== settingsState.iconBgOpacity
        ) {
          settingsState.iconBgOpacity = newSettings.iconBgOpacity;
          updateIconAppearance = true;
        }

        if (updateIconAppearance) {
          applyIconAppearance(
            settingsState.iconBorderRadius,
            settingsState.iconBorderColor,
            settingsState.iconBgColor,
            settingsState.iconBgOpacity,
          );
        }

        if (
          newSettings.sectionPadding !== undefined &&
          newSettings.sectionPadding !== settingsState.sectionPadding
        ) {
          settingsState.sectionPadding = newSettings.sectionPadding;
          updateSectionAppearance = true;
        }
        if (
          newSettings.sectionBgColor &&
          newSettings.sectionBgColor !== settingsState.sectionBgColor
        ) {
          settingsState.sectionBgColor = newSettings.sectionBgColor;
          updateSectionAppearance = true;
        }
        if (
          newSettings.sectionBgOpacity !== undefined &&
          newSettings.sectionBgOpacity !== settingsState.sectionBgOpacity
        ) {
          settingsState.sectionBgOpacity = newSettings.sectionBgOpacity;
          updateSectionAppearance = true;
        }
        if (
          newSettings.sectionLineColor &&
          newSettings.sectionLineColor !== settingsState.sectionLineColor
        ) {
          settingsState.sectionLineColor = newSettings.sectionLineColor;
          updateSectionAppearance = true;
        }

        if (updateSectionAppearance) {
          applySectionAppearance(
            settingsState.sectionPadding,
            settingsState.sectionBgColor,
            settingsState.sectionBgOpacity,
            settingsState.sectionLineColor,
          );
        }

        if (
          newSettings.iconSpacing !== undefined &&
          newSettings.iconSpacing !== settingsState.iconSpacing
        ) {
          settingsState.iconSpacing = newSettings.iconSpacing;
          applyIconSpacingSetting(settingsState.iconSpacing);
        }
        if (
          newSettings.iconGap !== undefined &&
          newSettings.iconGap !== settingsState.iconGap
        ) {
          settingsState.iconGap = newSettings.iconGap;
          applyIconGapSetting(settingsState.iconGap);
        }
        if (
          newSettings.categoryGap !== undefined &&
          newSettings.categoryGap !== settingsState.categoryGap
        ) {
          settingsState.categoryGap = newSettings.categoryGap;
          applyCategoryGapSetting(settingsState.categoryGap);
        }

        if (
          newSettings.iconLayout &&
          newSettings.iconLayout !== settingsState.iconLayout
        ) {
          settingsState.iconLayout = newSettings.iconLayout;
          applyIconLayoutSetting(settingsState.iconLayout);
        }

        if (
          newSettings.defaultIconSource &&
          newSettings.defaultIconSource !== settingsState.defaultIconSource
        ) {
          settingsState.defaultIconSource = newSettings.defaultIconSource;
          if (sidebarManager.activeSpaceId) {
            contentArea.innerHTML = '';
            onSpaceSelected(sidebarManager.activeSpaceId);
          }
        }

        if (
          newSettings.nameDisplay &&
          newSettings.nameDisplay !== settingsState.nameDisplay
        ) {
          settingsState.nameDisplay = newSettings.nameDisplay;
          applyNameDisplaySetting(settingsState.nameDisplay);
        }

        if (
          newSettings.textBehavior &&
          newSettings.textBehavior !== settingsState.textBehavior
        ) {
          settingsState.textBehavior = newSettings.textBehavior;
          applyTextBehaviorSetting(settingsState.textBehavior);
        }

        if (
          newSettings.bookmarkFontFamily &&
          newSettings.bookmarkFontFamily !== settingsState.bookmarkFontFamily
        ) {
          settingsState.bookmarkFontFamily = newSettings.bookmarkFontFamily;
        }
        if (
          newSettings.bookmarkFontSize !== undefined &&
          newSettings.bookmarkFontSize !== settingsState.bookmarkFontSize
        ) {
          settingsState.bookmarkFontSize = newSettings.bookmarkFontSize;
        }
        if (
          newSettings.bookmarkFontColor &&
          newSettings.bookmarkFontColor !== settingsState.bookmarkFontColor
        ) {
          settingsState.bookmarkFontColor = newSettings.bookmarkFontColor;
        }

        if (
          newSettings.bookmarkMinWidth !== undefined &&
          newSettings.bookmarkMinWidth !== settingsState.bookmarkMinWidth
        ) {
          settingsState.bookmarkMinWidth = newSettings.bookmarkMinWidth;
          applyBookmarkMinWidthSetting(settingsState.bookmarkMinWidth);
        }

        if (
          newSettings.filterColor &&
          newSettings.filterColor !== settingsState.filterColor
        ) {
          settingsState.filterColor = newSettings.filterColor;
        }
        if (
          newSettings.filterOpacity !== undefined &&
          newSettings.filterOpacity !== settingsState.filterOpacity
        ) {
          settingsState.filterOpacity = newSettings.filterOpacity;
        }

        if (
          newSettings.wallpaperBlur !== undefined &&
          newSettings.wallpaperBlur !== settingsState.wallpaperBlur
        ) {
          settingsState.wallpaperBlur = newSettings.wallpaperBlur;
          applyWallpaperBlurSetting(settingsState.wallpaperBlur);
        }

        if (
          newSettings.cardStyle !== undefined &&
          newSettings.cardStyle !== settingsState.cardStyle
        ) {
          settingsState.cardStyle = newSettings.cardStyle;
          applyCardStyleSetting(settingsState.cardStyle);
        }

        if (
          newSettings.lockLayout !== undefined &&
          newSettings.lockLayout !== settingsState.lockLayout
        ) {
          settingsState.lockLayout = newSettings.lockLayout;
          applyLockMode(settingsState.lockLayout === true);
        }

        if (
          newSettings.themePreset &&
          newSettings.themePreset !== settingsState.themePreset
        ) {
          settingsState.themePreset = newSettings.themePreset;
          applyTheme(settingsState.themePreset);

          const palette = THEME_PALETTES[settingsState.themePreset];
          if (palette) {
            settingsState.iconBgColor = palette.bg;
            settingsState.iconBorderColor = palette.border;
            settingsState.bookmarkFontColor = palette.text;
            settingsState.sectionBgColor = palette.sectionBg;
            settingsState.sectionLineColor = palette.sectionLine;
            settingsState.filterColor = palette.filter;
            applySectionAppearance(
              settingsState.sectionPadding,
              settingsState.sectionBgColor,
              settingsState.sectionBgOpacity,
              settingsState.sectionLineColor,
            );
          }
        }
        if (
          newSettings.layoutMode &&
          newSettings.layoutMode !== settingsState.layoutMode
        ) {
          settingsState.layoutMode = newSettings.layoutMode;
          applyLayoutMode(settingsState.layoutMode, settingsState.columnCount);
        }
        if (
          newSettings.columnCount &&
          newSettings.columnCount !== settingsState.columnCount
        ) {
          settingsState.columnCount = newSettings.columnCount;
          applyLayoutMode(settingsState.layoutMode, settingsState.columnCount);
        }
        if (
          newSettings.sidebarWidth !== undefined &&
          newSettings.sidebarWidth !== settingsState.sidebarWidth
        ) {
          settingsState.sidebarWidth = newSettings.sidebarWidth;
          applySidebarWidthSetting(settingsState.sidebarWidth);
        }

        // Widget Reactivity
        if (
          newSettings.clockStyle &&
          newSettings.clockStyle !== settingsState.clockStyle
        ) {
          settingsState.clockStyle = newSettings.clockStyle;
          const analogClockPlaceholder = document.getElementById(
            'analog-clock-placeholder',
          );
          const digitalClockPlaceholder = document.getElementById(
            'digital-clock-placeholder',
          );
          if (settingsState.clockStyle === 'digital') {
            if (analogClockPlaceholder)
              analogClockPlaceholder.style.display = 'none';
            if (digitalClockPlaceholder)
              digitalClockPlaceholder.style.display = 'block';
          } else {
            if (analogClockPlaceholder)
              analogClockPlaceholder.style.display = 'block';
            if (digitalClockPlaceholder)
              digitalClockPlaceholder.style.display = 'none';
          }
          tickClock();
        }

        if (
          newSettings.userName !== undefined &&
          newSettings.userName !== settingsState.userName
        ) {
          settingsState.userName = newSettings.userName;
          if (greetingPlaceholder)
            updateGreeting(greetingPlaceholder, settingsState.userName);
        }

        if (
          newSettings.weatherCity !== undefined &&
          newSettings.weatherCity !== settingsState.weatherCity
        ) {
          settingsState.weatherCity = newSettings.weatherCity;
          if (weatherWidget && weatherIcon && weatherTemp) {
            updateWeather(
              weatherWidget,
              weatherIcon,
              weatherTemp,
              settingsState.weatherCity,
            );
          }
        }

        if (
          newSettings.rssUrl !== undefined &&
          newSettings.rssUrl !== settingsState.rssUrl
        ) {
          settingsState.rssUrl = newSettings.rssUrl;
          rssManager.init();
        }

        if (
          newSettings.todoEnabled !== undefined &&
          newSettings.todoEnabled !== settingsState.todoEnabled
        ) {
          settingsState.todoEnabled = newSettings.todoEnabled;
          updateWidgetVisibilities(settingsState);
          if (ensureOptionalWidgets) ensureOptionalWidgets();
        }

        if (
          newSettings.quotesEnabled !== undefined &&
          newSettings.quotesEnabled !== settingsState.quotesEnabled
        ) {
          settingsState.quotesEnabled = newSettings.quotesEnabled;
          updateWidgetVisibilities(settingsState);
          if (ensureOptionalWidgets) ensureOptionalWidgets();
        }

        if (
          newSettings.rssEnabled !== undefined &&
          newSettings.rssEnabled !== settingsState.rssEnabled
        ) {
          settingsState.rssEnabled = newSettings.rssEnabled;
          updateWidgetVisibilities(settingsState);
          if (ensureOptionalWidgets) ensureOptionalWidgets();
        }

        if (
          newSettings.zenMode !== undefined &&
          newSettings.zenMode !== settingsState.zenMode
        ) {
          settingsState.zenMode = newSettings.zenMode;
          applyZenMode(settingsState.zenMode === true);
        }

        if (
          newSettings.solidSurfaces !== undefined &&
          newSettings.solidSurfaces !== settingsState.solidSurfaces
        ) {
          settingsState.solidSurfaces = newSettings.solidSurfaces;
          document.body.classList.toggle(
            'solid-surfaces',
            settingsState.solidSurfaces === true,
          );
        }

        if (
          newSettings.dynamicAccent !== undefined &&
          newSettings.dynamicAccent !== settingsState.dynamicAccent
        ) {
          settingsState.dynamicAccent = newSettings.dynamicAccent;
          // Reaplica (ou remove) o acento a partir do wallpaper em cache
          manageWallpaper(settingsState);
        }

        if (
          (newSettings.wallpaperSource !== undefined &&
            newSettings.wallpaperSource !== settingsState.wallpaperSource) ||
          (newSettings.wallpaperTheme !== undefined &&
            newSettings.wallpaperTheme !== settingsState.wallpaperTheme) ||
          (newSettings.wallpaperFrequency !== undefined &&
            newSettings.wallpaperFrequency !== settingsState.wallpaperFrequency)
        ) {
          settingsState.wallpaperSource =
            newSettings.wallpaperSource !== undefined
              ? newSettings.wallpaperSource
              : settingsState.wallpaperSource;
          settingsState.wallpaperTheme =
            newSettings.wallpaperTheme !== undefined
              ? newSettings.wallpaperTheme
              : settingsState.wallpaperTheme;
          settingsState.wallpaperFrequency =
            newSettings.wallpaperFrequency !== undefined
              ? newSettings.wallpaperFrequency
              : settingsState.wallpaperFrequency;

          manageWallpaper(settingsState);
        }

        applyIconAppearance(
          settingsState.iconBorderRadius,
          settingsState.iconBorderColor,
          settingsState.iconBgColor,
          settingsState.iconBgOpacity,
        );
        applyBookmarkFontSettings(
          settingsState.bookmarkFontFamily,
          settingsState.bookmarkFontSize,
          settingsState.bookmarkFontColor,
        );
        applyBackgroundFilter(
          settingsState.filterColor,
          settingsState.filterOpacity,
          settingsState.wallpaperBlur,
        );
      }

      if (area === 'sync' && changes.quickLinks) {
        quickLinksManager.renderQuickLinks(
          changes.quickLinks.newValue || [],
          settingsState.defaultIconSource || 'dashboardicons',
        );
      }
    });
  }

  function applyLockMode(locked) {
    const isLocked = Boolean(locked);
    applyLockLayoutSetting(isLocked);
    const lockBtn = document.getElementById('lock-layout-btn');
    if (lockBtn) {
      lockBtn.setAttribute('aria-pressed', String(isLocked));
      lockBtn.classList.toggle('active', isLocked);
      lockBtn.title = isLocked
        ? 'Layout Travado — Clique para permitir arrastar/excluir (Alt+L)'
        : 'Layout Destravado — Clique para travar contra esbarrões (Alt+L)';
    }
  }

  function toggleLockMode() {
    const nextLocked = !document.body.classList.contains('layout-locked');
    applyLockMode(nextLocked);
    settingsState.lockLayout = nextLocked;
    chrome.storage.sync.get(['extensionSettings'], (res) => {
      const s = res.extensionSettings || {};
      s.lockLayout = nextLocked;
      chrome.storage.sync.set({ extensionSettings: s }, () => {
        syncBackupToChromeBookmarks();
      });
    });
  }

  function applyZenMode(enabled) {
    document.body.classList.toggle('zen-mode', enabled === true);
    // Cache local para aplicar sem flash na próxima aba (ver theme-cache.js)
    localStorage.setItem('zenMode', enabled === true ? '1' : '0');
    const zenBtn = document.getElementById('zen-mode-btn');
    if (zenBtn) {
      zenBtn.setAttribute('aria-pressed', String(enabled === true));
      zenBtn.classList.toggle('active', enabled === true);
    }
  }

  function toggleZenMode() {
    const enabled = !document.body.classList.contains('zen-mode');
    applyZenMode(enabled);
    settingsState.zenMode = enabled;
    chrome.storage.sync.get(['extensionSettings'], (res) => {
      const s = res.extensionSettings || {};
      s.zenMode = enabled;
      chrome.storage.sync.set({ extensionSettings: s });
    });
  }

  function openSettingsPopup() {
    const width = Math.round(window.screen.availWidth * 0.42);
    const height = Math.round(window.screen.availHeight * 0.82);
    const left = Math.round((window.screen.availWidth - width) / 2);
    const top = Math.round((window.screen.availHeight - height) / 2);

    chrome.windows.create({
      url: 'settings.html',
      type: 'popup',
      width: Math.max(width, 640),
      height: Math.max(height, 600),
      left: left,
      top: top,
    });
  }

  function setupQuickAppearancePopover() {
    const popover = document.getElementById('quick-appearance-popover');
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const swatchesContainer = document.getElementById('qap-theme-swatches');
    const cardStyleBtns = document.querySelectorAll(
      '#qap-card-style-group .qap-seg-btn',
    );
    const blurSlider = document.getElementById('qap-wallpaper-blur');
    const blurVal = document.getElementById('qap-wallpaper-blur-val');
    const opacitySlider = document.getElementById('qap-filter-opacity');
    const opacityVal = document.getElementById('qap-filter-opacity-val');
    const openFullSettingsBtn = document.getElementById(
      'qap-open-full-settings',
    );

    if (!popover || !toggleBtn) return;

    const persistQuickPatch = (patch) => {
      Object.assign(settingsState, patch);
      chrome.storage.sync.get(['extensionSettings'], (res) => {
        const s = Object.assign({}, res.extensionSettings || {}, patch);
        chrome.storage.sync.set({ extensionSettings: s }, () => {
          syncBackupToChromeBookmarks();
        });
      });
    };

    const syncPopoverControls = () => {
      if (swatchesContainer) {
        swatchesContainer
          .querySelectorAll('.qap-theme-chip')
          .forEach((chip) => {
            chip.classList.toggle(
              'active',
              chip.dataset.theme === (settingsState.themePreset || 'dark'),
            );
          });
      }
      cardStyleBtns.forEach((btn) => {
        btn.classList.toggle(
          'active',
          btn.dataset.style === (settingsState.cardStyle || 'card'),
        );
      });
      if (blurSlider) {
        blurSlider.value = settingsState.wallpaperBlur || 0;
      }
      if (blurVal) {
        blurVal.textContent = `${settingsState.wallpaperBlur || 0}px`;
      }
      if (opacitySlider) {
        opacitySlider.value =
          settingsState.filterOpacity !== undefined
            ? settingsState.filterOpacity
            : 0.3;
      }
      if (opacityVal) {
        opacityVal.textContent = Number(
          settingsState.filterOpacity !== undefined
            ? settingsState.filterOpacity
            : 0.3,
        ).toFixed(2);
      }
    };

    if (swatchesContainer) {
      swatchesContainer.innerHTML = '';
      Object.entries(THEME_PALETTES).forEach(([themeKey, palette]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'qap-theme-chip';
        btn.dataset.theme = themeKey;
        btn.title = palette.label;

        const dot = document.createElement('span');
        dot.className = 'qap-theme-dot';
        dot.style.background = `linear-gradient(135deg, ${palette.swatch} 55%, ${palette.accent} 55%)`;

        const name = document.createElement('span');
        name.className = 'qap-theme-name';
        name.textContent = palette.label;

        btn.appendChild(dot);
        btn.appendChild(name);

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          applyTheme(themeKey);
          const patch = {
            themePreset: themeKey,
            iconBgColor: palette.bg,
            iconBorderColor: palette.border,
            bookmarkFontColor: palette.text,
            sectionBgColor: palette.sectionBg,
            sectionLineColor: palette.sectionLine,
            filterColor: palette.filter,
          };
          applyIconAppearance(
            settingsState.iconBorderRadius,
            palette.border,
            palette.bg,
            settingsState.iconBgOpacity,
          );
          applyBookmarkFontSettings(
            settingsState.bookmarkFontFamily,
            settingsState.bookmarkFontSize,
            palette.text,
          );
          applySectionAppearance(
            settingsState.sectionPadding,
            palette.sectionBg,
            settingsState.sectionBgOpacity,
            palette.sectionLine,
          );
          applyBackgroundFilter(
            palette.filter,
            settingsState.filterOpacity,
            settingsState.wallpaperBlur,
          );
          persistQuickPatch(patch);
          syncPopoverControls();
        });

        swatchesContainer.appendChild(btn);
      });
    }

    cardStyleBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const style = btn.dataset.style || 'card';
        applyCardStyleSetting(style);
        persistQuickPatch({ cardStyle: style });
        syncPopoverControls();
      });
    });

    if (blurSlider) {
      blurSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 0;
        if (blurVal) blurVal.textContent = `${val}px`;
        applyWallpaperBlurSetting(val);
        persistQuickPatch({ wallpaperBlur: val });
      });
    }

    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (opacityVal) opacityVal.textContent = val.toFixed(2);
        applyBackgroundFilter(
          settingsState.filterColor || '#000000',
          val,
          settingsState.wallpaperBlur || 0,
        );
        persistQuickPatch({ filterOpacity: val });
      });
    }

    if (openFullSettingsBtn) {
      openFullSettingsBtn.addEventListener('click', () => {
        popover.style.display = 'none';
        openSettingsPopup();
      });
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = popover.style.display === 'flex';
      if (isVisible) {
        popover.style.display = 'none';
        toggleBtn.classList.remove('active');
      } else {
        syncPopoverControls();
        popover.style.display = 'flex';
        toggleBtn.classList.add('active');
      }
    });

    popover.addEventListener('click', (e) => e.stopPropagation());

    window.addEventListener('click', () => {
      if (popover.style.display === 'flex') {
        popover.style.display = 'none';
        toggleBtn.classList.remove('active');
      }
    });
  }

  function setupSidebarActions() {
    // Zen Mode
    const zenBtn = document.getElementById('zen-mode-btn');
    if (zenBtn) {
      zenBtn.addEventListener('click', toggleZenMode);
    }
    applyZenMode(settingsState.zenMode === true);

    // Lock Layout Mode
    const lockBtn = document.getElementById('lock-layout-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', toggleLockMode);
    }
    applyLockMode(settingsState.lockLayout === true);

    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);
      if (!isTyping && e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        toggleZenMode();
      }
      if (!isTyping && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLockMode();
      }
    });

    // Quick Appearance Popover
    setupQuickAppearancePopover();

    // Settings Button (Custom Size)
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      const newSettingsBtn = settingsBtn.cloneNode(true);
      settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

      newSettingsBtn.addEventListener('click', openSettingsPopup);
    }

    // Chrome Shortcuts
    const shortcuts = {
      'chrome-bookmarks-btn': 'chrome://bookmarks',
      'chrome-history-btn': 'chrome://history',
      'chrome-downloads-btn': 'chrome://downloads',
    };

    Object.keys(shortcuts).forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          chrome.tabs.create({ url: shortcuts[id] });
        });
      }
    });
  }

  // Restaura automaticamente do backup nos Bookmarks ou user-defaults.json caso o storage esteja limpo
  restoreFromPersistentSourcesIfNeeded(() => {
    loadSettings(settingsState, initialize);
  });
});
