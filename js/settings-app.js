import { defaultSettings } from './config.js';
import { SettingsQuickLinksManager } from './features/settings-quick-links.js';
import { SettingsDataManager } from './features/settings-data.js';
import { ThemeBuilderManager } from './features/theme-builder.js';
import { applyTheme } from './modules.js';
import {
  loadApiTokens,
  saveApiTokens,
  migrateTokensFromSync,
} from './token-store.js';

document.addEventListener('DOMContentLoaded', () => {
  // ---- CONSTANTES E ELEMENTOS DO DOM ----
  // Wallpaper & Background Settings
  const wallpaperFolderPath = document.getElementById('wallpaper-folder-path');
  const wallpaperFrequency = document.getElementById('wallpaper-frequency');
  const wallpaperFrequencyValue = document.getElementById(
    'wallpaper-frequency-value',
  );
  const wallpaperSource = document.getElementById('wallpaper-source');
  const wallpaperApiKey = document.getElementById('wallpaper-api-key');
  const wallpaperTheme = document.getElementById('wallpaper-theme');
  const wallpaperThemeCustom = document.getElementById(
    'wallpaper-theme-custom',
  );
  const wallpaperLocalConfig = document.getElementById(
    'wallpaper-local-config',
  );
  const wallpaperUnsplashConfig = document.getElementById(
    'wallpaper-unsplash-config',
  );
  const toggleApiKeyBtn = document.getElementById('toggle-api-key-btn');
  const clearApiKeyBtn = document.getElementById('clear-api-key-btn');

  // Filter Settings
  const filterColor = document.getElementById('filter-color');
  const filterOpacity = document.getElementById('filter-opacity');
  const filterOpacityValue = document.getElementById('filter-opacity-value');

  // Icon Size & Spacing Settings
  const iconSize = document.getElementById('icon-size');
  const iconSizeValue = document.getElementById('icon-size-value');
  const iconSpacing = document.getElementById('icon-spacing');
  const iconSpacingValue = document.getElementById('icon-spacing-value');
  const iconGap = document.getElementById('icon-gap');
  const iconGapValue = document.getElementById('icon-gap-value');
  const categoryGap = document.getElementById('category-gap');
  const categoryGapValue = document.getElementById('category-gap-value');

  // Bookmark Card Settings
  const bookmarkMinWidth = document.getElementById('bookmark-min-width');
  const bookmarkMinWidthValue = document.getElementById(
    'bookmark-min-width-value',
  );
  const iconBorderRadius = document.getElementById('icon-border-radius');
  const iconBorderRadiusValue = document.getElementById(
    'icon-border-radius-value',
  );
  const iconBorderColor = document.getElementById('icon-border-color');
  const iconBgColor = document.getElementById('icon-bg-color');
  const iconBgOpacity = document.getElementById('icon-bg-opacity');
  const iconBgOpacityValue = document.getElementById('icon-bg-opacity-value');

  // Font Settings
  const bookmarkFontFamily = document.getElementById('bookmark-font-family');
  const bookmarkFontSize = document.getElementById('bookmark-font-size');
  const bookmarkFontSizeValue = document.getElementById(
    'bookmark-font-size-value',
  );
  const bookmarkFontColor = document.getElementById('bookmark-font-color');

  // Layout Settings
  const nameDisplay = document.getElementById('name-display');
  const textBehavior = document.getElementById('text-behavior');
  const iconLayout = document.getElementById('icon-layout');
  const layoutMode = document.getElementById('layout-mode');
  const columnCountContainer = document.getElementById(
    'column-count-container',
  );
  const columnCount = document.getElementById('column-count');
  const columnCountValue = document.getElementById('column-count-value');

  // Sidebar Settings
  const sidebarWidth = document.getElementById('sidebar-width');
  const sidebarWidthValue = document.getElementById('sidebar-width-value');

  // Group Section Settings
  const sectionPadding = document.getElementById('section-padding');
  const sectionPaddingValue = document.getElementById('section-padding-value');
  const sectionBgColor = document.getElementById('section-bg-color');
  const sectionBgOpacity = document.getElementById('section-bg-opacity');
  const sectionBgOpacityValue = document.getElementById(
    'section-bg-opacity-value',
  );
  const sectionLineColor = document.getElementById('section-line-color');

  // Theme Preset
  const themePreset = document.getElementById('theme-preset');

  // Widget Settings
  const clockStyle = document.getElementById('clock-style');
  const userName = document.getElementById('user-name');
  const weatherCity = document.getElementById('weather-city');

  // Widget Visibility Settings
  const todoEnabled = document.getElementById('todo-enabled');
  const quotesEnabled = document.getElementById('quotes-enabled');
  const rssEnabled = document.getElementById('rss-enabled');
  const solidSurfaces = document.getElementById('solid-surfaces');
  const dynamicAccent = document.getElementById('dynamic-accent');

  // Productivity Settings
  const togglApiToken = document.getElementById('toggl-api-token');
  const pomodoroEnabled = document.getElementById('pomodoro-enabled');
  const pomodoroWork = document.getElementById('pomodoro-work');
  const pomodoroBreak = document.getElementById('pomodoro-break');
  const toggleTogglTokenBtn = document.getElementById('toggle-toggl-token-btn');
  const rssUrl = document.getElementById('rss-url');

  // Save & Close UI
  const saveStatus = document.getElementById('save-status');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');

  // Quick Links Font Size
  const quickLinksSize = document.getElementById('quick-links-size');
  const quickLinksSizeValue = document.getElementById('quick-links-size-value');

  // Instantiate Managers
  const quickLinksManager = new SettingsQuickLinksManager();
  const dataManager = new SettingsDataManager();
  const themeBuilderManager = new ThemeBuilderManager();

  let isInitializing = true;
  let saveTimeout = null;

  // ---- INITIALIZATION ----
  quickLinksManager.init();
  dataManager.init((importedQuickLinks) => {
    quickLinksManager.renderQuickLinksUI(importedQuickLinks);
  });
  themeBuilderManager.init(
    'theme-preset',
    'custom-theme-builder-container',
    'theme-preview-mockup',
  );

  // Ícones de mostrar/ocultar campos sensíveis (olho aberto/fechado)
  const EYE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  // Toggle Toggle Token visibility
  if (toggleTogglTokenBtn && togglApiToken) {
    toggleTogglTokenBtn.innerHTML = EYE_SVG;
    toggleTogglTokenBtn.addEventListener('click', () => {
      if (togglApiToken.type === 'password') {
        togglApiToken.type = 'text';
        toggleTogglTokenBtn.innerHTML = EYE_OFF_SVG;
      } else {
        togglApiToken.type = 'password';
        toggleTogglTokenBtn.innerHTML = EYE_SVG;
      }
    });
  }

  // Toggle Wallpaper configuration forms based on wallpaper source
  if (wallpaperSource) {
    wallpaperSource.addEventListener('change', () => {
      if (wallpaperSource.value === 'local') {
        if (wallpaperLocalConfig) wallpaperLocalConfig.style.display = 'block';
        if (wallpaperUnsplashConfig)
          wallpaperUnsplashConfig.style.display = 'none';
      } else if (wallpaperSource.value === 'unsplash') {
        if (wallpaperLocalConfig) wallpaperLocalConfig.style.display = 'none';
        if (wallpaperUnsplashConfig)
          wallpaperUnsplashConfig.style.display = 'block';
      } else {
        if (wallpaperLocalConfig) wallpaperLocalConfig.style.display = 'none';
        if (wallpaperUnsplashConfig)
          wallpaperUnsplashConfig.style.display = 'none';
      }
    });
  }

  if (toggleApiKeyBtn && wallpaperApiKey) {
    toggleApiKeyBtn.innerHTML = EYE_SVG;
    toggleApiKeyBtn.addEventListener('click', () => {
      if (wallpaperApiKey.type === 'password') {
        wallpaperApiKey.type = 'text';
        toggleApiKeyBtn.innerHTML = EYE_OFF_SVG;
      } else {
        wallpaperApiKey.type = 'password';
        toggleApiKeyBtn.innerHTML = EYE_SVG;
      }
    });
  }

  if (clearApiKeyBtn && wallpaperApiKey) {
    clearApiKeyBtn.addEventListener('click', () => {
      wallpaperApiKey.value = '';
      const event = new Event('change');
      wallpaperApiKey.dispatchEvent(event);
    });
  }

  // ---- TAB NAVIGATION LOGIC ----
  const tabs = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.tab-pane');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      pages.forEach((p) => {
        p.classList.remove('active');
        if (p.id === 'tab-' + targetId) {
          p.classList.add('active');
        }
      });
    });
  });

  // Helper to ensure full hex color codes
  const ensureFullHex = (hex) => {
    if (!hex) return '#000000';
    if (hex.length === 4) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  };

  function toggleColumnCountDisplay(mode) {
    if (columnCountContainer) {
      columnCountContainer.style.display =
        mode === 'columns' ? 'block' : 'none';
    }
  }

  // Helper to convert Hex + Opacity to RGBA
  function hexToRgbaStr(hex, opacity) {
    if (!hex) hex = '#ffffff';
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    let r = parseInt(hex.substring(1, 3), 16) || 0;
    let g = parseInt(hex.substring(3, 5), 16) || 0;
    let b = parseInt(hex.substring(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // ---- LOAD SAVED SETTINGS ----
  function loadSettings() {
    isInitializing = true;
    chrome.storage.sync.get(['extensionSettings'], function (result) {
      const settings = Object.assign(
        {},
        defaultSettings,
        result.extensionSettings || {},
      );

      if (wallpaperFolderPath)
        wallpaperFolderPath.value = settings.wallpaperFolderPath || '';
      if (wallpaperFrequency)
        wallpaperFrequency.value = settings.wallpaperFrequency || 1;

      if (wallpaperSource) {
        wallpaperSource.value = settings.wallpaperSource || 'unsplash';
        const event = new Event('change');
        wallpaperSource.dispatchEvent(event);
      }

      if (wallpaperTheme) {
        const savedTheme = settings.wallpaperTheme || 'nature';
        const options = Array.from(wallpaperTheme.options).map(
          (opt) => opt.value,
        );
        if (options.includes(savedTheme) && savedTheme !== 'custom') {
          wallpaperTheme.value = savedTheme;
          if (wallpaperThemeCustom) wallpaperThemeCustom.style.display = 'none';
        } else {
          wallpaperTheme.value = 'custom';
          if (wallpaperThemeCustom) {
            wallpaperThemeCustom.value =
              savedTheme !== 'custom' ? savedTheme : '';
            wallpaperThemeCustom.style.display = 'block';
          }
        }

        wallpaperTheme.addEventListener('change', () => {
          if (wallpaperTheme.value === 'custom') {
            if (wallpaperThemeCustom)
              wallpaperThemeCustom.style.display = 'block';
          } else {
            if (wallpaperThemeCustom)
              wallpaperThemeCustom.style.display = 'none';
          }
        });
      }

      if (clockStyle) clockStyle.value = settings.clockStyle || 'analog';
      if (userName) userName.value = settings.userName || '';
      if (weatherCity) weatherCity.value = settings.weatherCity || '';
      // Tokens de API vêm do storage.local (ver token-store.js)
      loadApiTokens((apiTokens) => {
        if (wallpaperApiKey)
          wallpaperApiKey.value = apiTokens.wallpaperApiKey || '';
        if (togglApiToken) togglApiToken.value = apiTokens.togglApiToken || '';
      });
      if (pomodoroEnabled)
        pomodoroEnabled.checked = settings.pomodoroEnabled !== false;
      if (pomodoroWork) pomodoroWork.value = settings.pomodoroWork || 25;
      if (pomodoroBreak) pomodoroBreak.value = settings.pomodoroBreak || 5;
      if (rssUrl)
        rssUrl.value = settings.rssUrl || 'https://hnrss.org/frontpage';
      if (todoEnabled) todoEnabled.checked = settings.todoEnabled !== false;
      if (quotesEnabled)
        quotesEnabled.checked = settings.quotesEnabled !== false;
      if (rssEnabled) rssEnabled.checked = settings.rssEnabled !== false;
      if (solidSurfaces)
        solidSurfaces.checked = settings.solidSurfaces === true;
      if (dynamicAccent)
        dynamicAccent.checked = settings.dynamicAccent === true;

      updateFrequencyDisplay(settings.wallpaperFrequency);
      if (filterColor) filterColor.value = ensureFullHex(settings.filterColor);
      if (filterOpacity) {
        filterOpacity.value =
          settings.filterOpacity !== undefined ? settings.filterOpacity : 0.3;
        updateOpacityDisplay(filterOpacity.value);
      }
      if (iconSize) {
        iconSize.value = settings.iconSize || 28;
        updateIconSizeDisplay(iconSize.value);
      }
      if (iconSpacing) {
        iconSpacing.value = settings.iconSpacing || 8;
        updateIconSpacingDisplay(iconSpacing.value);
      }
      if (iconGap) {
        iconGap.value =
          settings.iconGap !== undefined
            ? settings.iconGap
            : settings.iconSpacing || 8;
        updateIconGapDisplay(iconGap.value);
      }
      if (categoryGap) {
        categoryGap.value =
          settings.categoryGap !== undefined ? settings.categoryGap : 12;
        updateCategoryGapDisplay(categoryGap.value);
      }

      if (bookmarkMinWidth) {
        bookmarkMinWidth.value = settings.bookmarkMinWidth || 150;
        updateBookmarkMinWidthDisplay(bookmarkMinWidth.value);
      }
      if (iconBorderRadius) {
        iconBorderRadius.value =
          settings.iconBorderRadius !== undefined
            ? settings.iconBorderRadius
            : 8;
        updateBorderRadiusDisplay(iconBorderRadius.value);
      }
      if (iconBorderColor)
        iconBorderColor.value = ensureFullHex(settings.iconBorderColor);
      if (iconBgColor) iconBgColor.value = ensureFullHex(settings.iconBgColor);
      if (iconBgOpacity) {
        iconBgOpacity.value =
          settings.iconBgOpacity !== undefined ? settings.iconBgOpacity : 0.75;
        if (iconBgOpacityValue)
          iconBgOpacityValue.textContent = Number(iconBgOpacity.value).toFixed(
            2,
          );
      }
      if (bookmarkFontFamily)
        bookmarkFontFamily.value = settings.bookmarkFontFamily || 'sans-serif';
      if (bookmarkFontSize) {
        bookmarkFontSize.value = settings.bookmarkFontSize || 12;
        updateBookmarkFontSizeDisplay(bookmarkFontSize.value);
      }
      if (bookmarkFontColor)
        bookmarkFontColor.value = ensureFullHex(settings.bookmarkFontColor);

      if (quickLinksSize) {
        quickLinksSize.value = settings.quickLinksSize || 13;
        if (quickLinksSizeValue)
          quickLinksSizeValue.textContent =
            (settings.quickLinksSize || 13) + 'px';
      }

      if (sectionPadding) {
        sectionPadding.value =
          settings.sectionPadding !== undefined ? settings.sectionPadding : 15;
        if (sectionPaddingValue)
          sectionPaddingValue.textContent =
            (settings.sectionPadding !== undefined
              ? settings.sectionPadding
              : 15) + 'px';
      }
      if (sectionBgColor)
        sectionBgColor.value =
          ensureFullHex(settings.sectionBgColor) || '#43587a';
      if (sectionBgOpacity) {
        sectionBgOpacity.value =
          settings.sectionBgOpacity !== undefined
            ? settings.sectionBgOpacity
            : 0.55;
        if (sectionBgOpacityValue)
          sectionBgOpacityValue.textContent = Number(
            sectionBgOpacity.value,
          ).toFixed(2);
      }
      if (sectionLineColor)
        sectionLineColor.value =
          ensureFullHex(settings.sectionLineColor) || '#7d3af8';

      if (nameDisplay) nameDisplay.value = settings.nameDisplay || 'always';
      if (textBehavior)
        textBehavior.value = settings.textBehavior || 'truncate';
      if (iconLayout) iconLayout.value = settings.iconLayout || 'row';
      if (layoutMode) {
        layoutMode.value = settings.layoutMode || 'list';
        toggleColumnCountDisplay(layoutMode.value);
      }

      if (columnCount && settings.columnCount) {
        columnCount.value = settings.columnCount;
        if (columnCountValue)
          columnCountValue.textContent = settings.columnCount;
      }

      if (sidebarWidth) {
        sidebarWidth.value = settings.sidebarWidth || 240;
        if (sidebarWidthValue)
          sidebarWidthValue.textContent = (settings.sidebarWidth || 240) + 'px';
      }

      if (themePreset) {
        themePreset.value = settings.themePreset || 'dark';
        applyTheme(themePreset.value);
      }

      setTimeout(() => {
        isInitializing = false;
      }, 100);
    });
  }

  // ---- SAVE SETTINGS WITH DEBOUNCE ----
  function saveSettings() {
    if (isInitializing) return;
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
      const settings = {
        wallpaperFolderPath: wallpaperFolderPath
          ? wallpaperFolderPath.value
          : '',
        wallpaperFrequency: wallpaperFrequency
          ? parseFloat(wallpaperFrequency.value)
          : 1,
        filterColor: filterColor ? filterColor.value : '#000000',
        filterOpacity: filterOpacity ? parseFloat(filterOpacity.value) : 0.3,
        iconSize: iconSize ? parseInt(iconSize.value) : 28,
        iconSpacing: iconSpacing ? parseInt(iconSpacing.value) : 8,
        iconGap: iconGap ? parseInt(iconGap.value) : 8,
        categoryGap: categoryGap ? parseInt(categoryGap.value) : 12,
        bookmarkMinWidth: bookmarkMinWidth
          ? parseInt(bookmarkMinWidth.value)
          : 150,
        iconBorderRadius: iconBorderRadius
          ? parseInt(iconBorderRadius.value)
          : 8,
        iconBorderColor: iconBorderColor ? iconBorderColor.value : '#697c96',
        iconBgColor: iconBgColor ? iconBgColor.value : '#7491b9',
        iconBgOpacity: iconBgOpacity ? parseFloat(iconBgOpacity.value) : 0.75,
        bookmarkFontFamily: bookmarkFontFamily
          ? bookmarkFontFamily.value
          : 'sans-serif',
        bookmarkFontSize: bookmarkFontSize
          ? parseInt(bookmarkFontSize.value)
          : 12,
        bookmarkFontColor: bookmarkFontColor
          ? bookmarkFontColor.value
          : '#e2e8f0',
        nameDisplay: nameDisplay ? nameDisplay.value : 'always',
        textBehavior: textBehavior ? textBehavior.value : 'truncate',
        iconLayout: iconLayout ? iconLayout.value : 'row',
        themePreset: themePreset ? themePreset.value : 'dark',
        layoutMode: layoutMode ? layoutMode.value : 'list',
        columnCount: columnCount ? parseInt(columnCount.value) : 3,
        sidebarWidth: sidebarWidth ? parseInt(sidebarWidth.value) : 240,
        quickLinksSize: quickLinksSize
          ? parseInt(quickLinksSize.value || 13)
          : 13,
        sectionPadding: sectionPadding
          ? parseInt(sectionPadding.value || 15)
          : 15,
        sectionBgColor: sectionBgColor ? sectionBgColor.value : '#43587a',
        sectionBgOpacity: sectionBgOpacity
          ? parseFloat(sectionBgOpacity.value)
          : 0.55,
        sectionLineColor: sectionLineColor ? sectionLineColor.value : '#7d3af8',
        clockStyle: clockStyle ? clockStyle.value : 'analog',
        userName: userName ? userName.value.trim() : '',
        weatherCity: weatherCity ? weatherCity.value.trim() : '',
        wallpaperSource: wallpaperSource ? wallpaperSource.value : 'unsplash',
        wallpaperTheme: wallpaperTheme
          ? wallpaperTheme.value === 'custom' &&
            wallpaperThemeCustom &&
            wallpaperThemeCustom.value.trim()
            ? wallpaperThemeCustom.value.trim()
            : wallpaperTheme.value
          : 'nature',
        pomodoroEnabled: pomodoroEnabled ? pomodoroEnabled.checked : false,
        pomodoroWork: pomodoroWork ? parseInt(pomodoroWork.value) : 25,
        pomodoroBreak: pomodoroBreak ? parseInt(pomodoroBreak.value) : 5,
        rssUrl: rssUrl ? rssUrl.value.trim() : 'https://hnrss.org/frontpage',
        todoEnabled: todoEnabled ? todoEnabled.checked : true,
        quotesEnabled: quotesEnabled ? quotesEnabled.checked : true,
        rssEnabled: rssEnabled ? rssEnabled.checked : true,
        solidSurfaces: solidSurfaces ? solidSurfaces.checked : false,
        dynamicAccent: dynamicAccent ? dynamicAccent.checked : false,
      };

      // Tokens de API nunca vão para o sync nem para o export
      saveApiTokens({
        wallpaperApiKey: wallpaperApiKey ? wallpaperApiKey.value.trim() : '',
        togglApiToken: togglApiToken ? togglApiToken.value.trim() : '',
      });

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
          console.error(
            'Erro ao salvar configurações:',
            chrome.runtime.lastError.message,
          );
        } else {
          console.log('Configurações salvas com sucesso!');
        }
      });
    }, 300);
  }

  // ---- UPDATE DISPLAYS FUNCTIONS ----
  function updateFrequencyDisplay(value) {
    if (!wallpaperFrequencyValue) return;
    const hours = parseFloat(value);
    if (hours === 0) {
      wallpaperFrequencyValue.textContent = '0 horas';
    } else if (hours === 1) {
      wallpaperFrequencyValue.textContent = '1 hora';
    } else if (hours < 1) {
      wallpaperFrequencyValue.textContent = `${hours * 60} minutos`;
    } else {
      wallpaperFrequencyValue.textContent = `${hours} horas`;
    }
  }

  function updateOpacityDisplay(value) {
    if (filterOpacityValue)
      filterOpacityValue.textContent = `${Math.round(value * 100)}%`;
  }

  function updateIconSizeDisplay(value) {
    if (iconSizeValue) iconSizeValue.textContent = `${value}px`;
  }

  function updateIconSpacingDisplay(value) {
    if (iconSpacingValue) iconSpacingValue.textContent = `${value}px`;
  }

  function updateBookmarkMinWidthDisplay(value) {
    if (bookmarkMinWidthValue) bookmarkMinWidthValue.textContent = `${value}px`;
  }

  function updateIconGapDisplay(value) {
    if (iconGapValue) iconGapValue.textContent = `${value}px`;
  }

  function updateCategoryGapDisplay(value) {
    if (categoryGapValue) categoryGapValue.textContent = `${value}px`;
  }

  function updateBorderRadiusDisplay(value) {
    if (iconBorderRadiusValue) iconBorderRadiusValue.textContent = `${value}px`;
  }

  function updateBookmarkFontSizeDisplay(value) {
    if (bookmarkFontSizeValue) bookmarkFontSizeValue.textContent = `${value}px`;
  }

  // ---- ATTACH EVENT LISTENERS FOR CONTROLS ----
  if (wallpaperFrequency) {
    wallpaperFrequency.addEventListener('input', function () {
      updateFrequencyDisplay(this.value);
      saveSettings();
    });
  }

  if (filterOpacity) {
    filterOpacity.addEventListener('input', function () {
      updateOpacityDisplay(this.value);
      saveSettings();
    });
  }

  if (iconSize) {
    iconSize.addEventListener('input', function () {
      updateIconSizeDisplay(this.value);
      saveSettings();
    });
  }

  if (iconSpacing) {
    iconSpacing.addEventListener('input', function () {
      updateIconSpacingDisplay(this.value);
      saveSettings();
    });
  }

  if (iconGap) {
    iconGap.addEventListener('input', function () {
      updateIconGapDisplay(this.value);
      saveSettings();
    });
  }

  if (categoryGap) {
    categoryGap.addEventListener('input', function () {
      updateCategoryGapDisplay(this.value);
      saveSettings();
    });
  }

  if (bookmarkMinWidth) {
    bookmarkMinWidth.addEventListener('input', function () {
      updateBookmarkMinWidthDisplay(this.value);
      saveSettings();
    });
  }

  if (sectionPadding) {
    sectionPadding.addEventListener('input', function () {
      if (sectionPaddingValue)
        sectionPaddingValue.textContent = this.value + 'px';
      saveSettings();
    });
  }

  if (sectionBgColor) {
    sectionBgColor.addEventListener('input', saveSettings);
    sectionBgColor.addEventListener('change', saveSettings);
  }

  if (sectionBgOpacity) {
    sectionBgOpacity.addEventListener('input', function () {
      if (sectionBgOpacityValue)
        sectionBgOpacityValue.textContent = Number(this.value).toFixed(2);
      document.documentElement.style.setProperty(
        '--section-bg-color',
        hexToRgbaStr(
          sectionBgColor ? sectionBgColor.value : '#ffffff',
          this.value,
        ),
      );
      saveSettings();
    });
  }

  if (sectionLineColor) {
    sectionLineColor.addEventListener('input', saveSettings);
    sectionLineColor.addEventListener('change', saveSettings);
  }

  if (iconBgOpacity) {
    iconBgOpacity.addEventListener('input', function () {
      if (iconBgOpacityValue)
        iconBgOpacityValue.textContent = Number(this.value).toFixed(2);
      document.documentElement.style.setProperty(
        '--icon-bg-color',
        hexToRgbaStr(iconBgColor ? iconBgColor.value : '#ffffff', this.value),
      );
      saveSettings();
    });
  }

  if (iconBorderRadius) {
    iconBorderRadius.addEventListener('input', function () {
      updateBorderRadiusDisplay(this.value);
      saveSettings();
    });
  }

  if (bookmarkFontSize) {
    bookmarkFontSize.addEventListener('input', function () {
      updateBookmarkFontSizeDisplay(this.value);
      saveSettings();
    });
  }

  if (themePreset) {
    themePreset.addEventListener('change', function () {
      const newTheme = this.value;
      applyTheme(newTheme);

      const themeColors = {
        light: {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#333333',
          sectionBg: '#f8fafc',
          sectionLine: '#3b82f6',
          filter: '#ffffff',
        },
        dark: {
          bg: '#334155',
          border: '#475569',
          text: '#e2e8f0',
          sectionBg: '#1e293b',
          sectionLine: '#38bdf8',
          filter: '#000000',
        },
        solar: {
          bg: '#002b36',
          border: '#073642',
          text: '#839496',
          sectionBg: '#073642',
          sectionLine: '#b58900',
          filter: '#002b36',
        },
        minimal: {
          bg: '#ffffff',
          border: '#eeeeee',
          text: '#111111',
          sectionBg: '#fafafa',
          sectionLine: '#dddddd',
          filter: '#ffffff',
        },
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
  }

  if (layoutMode) {
    layoutMode.addEventListener('change', function () {
      toggleColumnCountDisplay(this.value);
      saveSettings();
    });
  }

  if (iconLayout) {
    iconLayout.addEventListener('change', saveSettings);
  }

  if (columnCount) {
    columnCount.addEventListener('input', function () {
      if (columnCountValue) columnCountValue.textContent = this.value;
      saveSettings();
    });
  }

  if (sidebarWidth) {
    sidebarWidth.addEventListener('input', function () {
      if (sidebarWidthValue) sidebarWidthValue.textContent = this.value + 'px';
      saveSettings();
    });
  }

  if (quickLinksSize) {
    quickLinksSize.addEventListener('input', function () {
      if (quickLinksSizeValue)
        quickLinksSizeValue.textContent = this.value + 'px';
      saveSettings();
    });
  }

  // Auto-save logic for inputs without display values
  [
    wallpaperFolderPath,
    filterColor,
    iconBorderColor,
    iconBgColor,
    bookmarkFontFamily,
    bookmarkFontColor,
    nameDisplay,
    textBehavior,
    clockStyle,
    userName,
    weatherCity,
    wallpaperSource,
    wallpaperTheme,
    wallpaperThemeCustom,
    wallpaperApiKey,
    togglApiToken,
    pomodoroEnabled,
    pomodoroWork,
    pomodoroBreak,
    rssUrl,
    todoEnabled,
    quotesEnabled,
    rssEnabled,
    solidSurfaces,
    dynamicAccent,
  ].forEach((element) => {
    if (element) {
      element.addEventListener('input', saveSettings);
      element.addEventListener('change', saveSettings);
    }
  });

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }

  // Feed RSS customizado exige permissão de host (optional_host_permissions)
  if (rssUrl) {
    rssUrl.addEventListener('change', () => {
      const value = rssUrl.value.trim();
      if (!value) return;
      try {
        const parsed = new URL(value);
        if (!['http:', 'https:'].includes(parsed.protocol)) return;
        if (parsed.hostname === 'hnrss.org') return; // já coberto pelo manifest
        chrome.permissions.request(
          { origins: [`${parsed.origin}/*`] },
          (granted) => {
            if (!granted) {
              console.warn(
                'Permissão para o feed RSS não concedida:',
                parsed.origin,
              );
            }
          },
        );
      } catch {
        // URL inválida — ignora, validação visual fica a cargo do campo
      }
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', function () {
      window.close();
    });
  }

  // Initial load
  migrateTokensFromSync(() => loadSettings());
});
