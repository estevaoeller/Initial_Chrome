// js/script.js (versão final limpa)
import {
    loadBookmarksFromChrome,
    addBookmarkToChrome,
    applyTheme,
    toggleTheme,
    updateClock,
    updateDate,
    updateCalendar
} from './modules.js';
import {
    loadSettings,
    applyIconSizeSetting,
    applyIconAppearance,
    applyIconSpacingSetting,
    applyBookmarkMinWidthSetting,
    applyIconGapSetting,
    applyBookmarkFontSettings
} from './settings-handlers.js';
import { renderBookmarks } from './bookmark-renderer.js';

document.addEventListener('DOMContentLoaded', function() {
    // ---- CONSTANTES E VARIÁVEIS ----
    const contentArea = document.getElementById('content-area');
    const analogClockPlaceholder = document.getElementById('analog-clock-placeholder');
    const datePlaceholder = document.getElementById('date-placeholder');
    const calendarPlaceholder = document.getElementById('calendar-placeholder');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const settingsBtn = document.getElementById('settings-btn');

    const defaultBookmarkCategories = [
        { name: 'IA', links: [{ name: 'ChatGPT', url: 'https://chat.openai.com/' }, { name: 'Gemini', url: 'https://gemini.google.com/' }] },
        { name: 'News', links: [{ name: 'Google News', url: 'https://news.google.com/' }] },
        { name: 'Ferramentas', links: [{ name: 'Photopea', url: 'https://www.photopea.com/' }] }
    ];
    let currentBookmarks = [];
    const settingsState = {
        iconSize: 32,
        iconBorderRadius: 6,
        iconBorderColor: '#ddd',
        iconBgColor: '#fff',
        iconSpacing: 8,
        iconGap: 8,
        bookmarkFontFamily: 'sans-serif',
        bookmarkFontSize: 14,
        bookmarkFontColor: '#333333',
        bookmarkMinWidth: 100
    };

    // ---- FUNÇÃO PRINCIPAL ----
    function initialize() {
        loadBookmarksFromChrome(bookmarks => {
            if (bookmarks && bookmarks.length > 0) {
                currentBookmarks = bookmarks;
                renderBookmarks(currentBookmarks, contentArea, settingsState.iconSize);
            } else {
                currentBookmarks = defaultBookmarkCategories;
                const tasks = [];
                currentBookmarks.forEach(cat => {
                    cat.links.forEach(link => {
                        tasks.push(new Promise(res => addBookmarkToChrome(cat.name, link, res)));
                    });
                });
                Promise.all(tasks).then(() => renderBookmarks(currentBookmarks, contentArea, settingsState.iconSize));
            }
        });

        // Inicialização de outros componentes
        chrome.storage.local.get(['theme'], result => applyTheme(result.theme || 'light'));
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
            if (newSettings.iconSize && newSettings.iconSize !== settingsState.iconSize) {
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

            applyIconAppearance(settingsState.iconBorderRadius, settingsState.iconBorderColor, settingsState.iconBgColor);
            applyBookmarkFontSettings(
                settingsState.bookmarkFontFamily,
                settingsState.bookmarkFontSize,
                settingsState.bookmarkFontColor
            );
        }
    });
});
