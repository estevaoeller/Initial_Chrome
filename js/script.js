// js/script.js (versão final limpa)
import { loadBookmarksFromChrome, addBookmarkToChrome, removeBookmarkFromChrome, applyTheme, toggleTheme, updateClock, updateDate, updateCalendar, handleDeleteBookmark } from './modules.js';

document.addEventListener('DOMContentLoaded', function() {
    // ---- CONSTANTES E VARIÁVEIS ----
    const contentArea = document.getElementById('content-area');
    const analogClockPlaceholder = document.getElementById("analog-clock-placeholder");
    const datePlaceholder = document.getElementById("date-placeholder");
    const calendarPlaceholder = document.getElementById("calendar-placeholder");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const settingsBtn = document.getElementById("settings-btn");

    const defaultBookmarkCategories = [
        { name: "IA", links: [{ name: "ChatGPT", url: "https://chat.openai.com/" }, { name: "Gemini", url: "https://gemini.google.com/" }] },
        { name: "News", links: [{ name: "Google News", url: "https://news.google.com/" }] },
        { name: "Ferramentas", links: [{ name: "Photopea", url: "https://www.photopea.com/" }] }
    ];
    let currentBookmarks = [];
    let iconSize = 32;
    let iconBorderRadius = 6;
    let iconBorderColor = '#ddd';
    let iconBgColor = '#fff';
    let iconSpacing = 8; // padding inside each bookmark
    let iconGap = 8; // space between bookmark items
    let bookmarkFontFamily = 'sans-serif';
    let bookmarkFontSize = 14;
    let bookmarkFontColor = '#333333';
    let bookmarkMinWidth = 100;

    function applyIconSizeSetting(size) {
        document.documentElement.style.setProperty('--icon-size', `${size}px`);
        document.querySelectorAll('.bookmark-favicon').forEach(img => {
            if (img.dataset.url) {
                img.src = `https://www.google.com/s2/favicons?domain=${img.dataset.url}&sz=${size}`;
            }
        });
    }

    function applyIconAppearance() {
        document.documentElement.style.setProperty('--icon-border-radius', `${iconBorderRadius}px`);
        document.documentElement.style.setProperty('--icon-border-color', iconBorderColor);
        document.documentElement.style.setProperty('--icon-bg-color', iconBgColor);
    }

    function applyIconSpacingSetting(spacing) {
        document.documentElement.style.setProperty('--icon-spacing', `${spacing}px`);
    }

    function applyBookmarkMinWidthSetting(width) {
        document.documentElement.style.setProperty('--bookmark-min-width', `${width}px`);
    }

    function applyIconGapSetting(gap) {
        document.documentElement.style.setProperty('--icon-gap', `${gap}px`);
    }

    function applyBookmarkFontSettings() {
        document.documentElement.style.setProperty('--bookmark-font-family', bookmarkFontFamily);
        document.documentElement.style.setProperty('--bookmark-font-size', `${bookmarkFontSize}px`);
        document.documentElement.style.setProperty('--bookmark-font-color', bookmarkFontColor);
    }

    function loadSettings(callback) {
        chrome.storage.local.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            if (settings.iconSize) {
                iconSize = settings.iconSize;
            }
            if (settings.iconBorderRadius !== undefined) {
                iconBorderRadius = settings.iconBorderRadius;
            }
            if (settings.iconBorderColor) {
                iconBorderColor = settings.iconBorderColor;
            }
            if (settings.iconBgColor) {
                iconBgColor = settings.iconBgColor;
            }
            if (settings.iconSpacing !== undefined) {
                iconSpacing = settings.iconSpacing;
            }
            if (settings.iconGap !== undefined) {
                iconGap = settings.iconGap;
            } else {
                iconGap = iconSpacing;
            }

            if (settings.bookmarkFontFamily) {
                bookmarkFontFamily = settings.bookmarkFontFamily;
            }
            if (settings.bookmarkFontSize !== undefined) {
                bookmarkFontSize = settings.bookmarkFontSize;
            }
            if (settings.bookmarkFontColor) {
                bookmarkFontColor = settings.bookmarkFontColor;
            }

            if (settings.bookmarkMinWidth !== undefined) {
                bookmarkMinWidth = settings.bookmarkMinWidth;
            }

            applyIconSizeSetting(iconSize);
            applyIconAppearance();
            applyIconSpacingSetting(iconSpacing);
            applyIconGapSetting(iconGap);
            applyBookmarkFontSettings();
            applyBookmarkMinWidthSetting(bookmarkMinWidth);


            if (callback) callback();
        });
    }

    // ---- FUNÇÕES PRINCIPAIS ----

    function renderBookmarks(bookmarks) {
        contentArea.innerHTML = '';

        if (!bookmarks || bookmarks.length === 0) return;

        bookmarks.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bookmark-category';

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            categoryDiv.appendChild(categoryTitle);

            const gridDiv = document.createElement('div');
            gridDiv.className = 'bookmarks-grid';
            categoryDiv.appendChild(gridDiv);

            category.links.forEach(link => {
                const bookmarkItem = document.createElement('a');
                bookmarkItem.className = 'bookmark-item';
                bookmarkItem.href = link.url;
                bookmarkItem.target = '_blank';

                const deleteBtn = document.createElement('span');
                deleteBtn.className = 'delete-bookmark-btn';
                deleteBtn.innerHTML = '&times;'; // Símbolo 'X'

                deleteBtn.addEventListener('click', function(event) {
                    // Previne que o clique no 'X' também abra o link do bookmark
                    event.preventDefault();
                    event.stopPropagation();

                    // Chama a função que você já tem em modules.js
                    // mas agora passando os parâmetros corretos
                    handleDeleteBookmark(link.url, category.name, currentBookmarks, renderBookmarks);
                });



                const favicon = document.createElement('img');
                favicon.className = 'bookmark-favicon';
                favicon.dataset.url = link.url;
                favicon.src = `https://www.google.com/s2/favicons?domain=${link.url}&sz=${iconSize}`;
                favicon.alt = '';

                const bookmarkName = document.createElement('span');
                bookmarkName.className = 'bookmark-name';
                bookmarkName.textContent = link.name;

                bookmarkItem.appendChild(favicon);
                bookmarkItem.appendChild(bookmarkName);
                bookmarkItem.appendChild(deleteBtn);
                gridDiv.appendChild(bookmarkItem);
            });
            contentArea.appendChild(categoryDiv);
        });
    }

    function initialize() {
        loadBookmarksFromChrome(bookmarks => {
            if (bookmarks && bookmarks.length > 0) {
                currentBookmarks = bookmarks;
                renderBookmarks(currentBookmarks);
            } else {
                currentBookmarks = defaultBookmarkCategories;
                const tasks = [];
                currentBookmarks.forEach(cat => {
                    cat.links.forEach(link => {
                        tasks.push(new Promise(res => addBookmarkToChrome(cat.name, link, res)));
                    });
                });
                Promise.all(tasks).then(() => renderBookmarks(currentBookmarks));
            }
        });

        // Inicialização de outros componentes
        chrome.storage.local.get(["theme"], result => applyTheme(result.theme || "light"));
        if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
        if (settingsBtn) settingsBtn.addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") }));
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
    loadSettings(initialize);

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.extensionSettings) {
            const newSettings = changes.extensionSettings.newValue || {};
            if (newSettings.iconSize && newSettings.iconSize !== iconSize) {
                iconSize = newSettings.iconSize;
                applyIconSizeSetting(iconSize);
            }
            if (newSettings.iconBorderRadius !== undefined && newSettings.iconBorderRadius !== iconBorderRadius) {
                iconBorderRadius = newSettings.iconBorderRadius;
            }
            if (newSettings.iconBorderColor && newSettings.iconBorderColor !== iconBorderColor) {
                iconBorderColor = newSettings.iconBorderColor;
            }
            if (newSettings.iconBgColor && newSettings.iconBgColor !== iconBgColor) {
                iconBgColor = newSettings.iconBgColor;
            }
            if (newSettings.iconSpacing !== undefined && newSettings.iconSpacing !== iconSpacing) {
                iconSpacing = newSettings.iconSpacing;
                applyIconSpacingSetting(iconSpacing);
            }
            if (newSettings.iconGap !== undefined && newSettings.iconGap !== iconGap) {
                iconGap = newSettings.iconGap;
                applyIconGapSetting(iconGap);
            }

            if (newSettings.bookmarkFontFamily && newSettings.bookmarkFontFamily !== bookmarkFontFamily) {
                bookmarkFontFamily = newSettings.bookmarkFontFamily;
            }
            if (newSettings.bookmarkFontSize !== undefined && newSettings.bookmarkFontSize !== bookmarkFontSize) {
                bookmarkFontSize = newSettings.bookmarkFontSize;
            }
            if (newSettings.bookmarkFontColor && newSettings.bookmarkFontColor !== bookmarkFontColor) {
                bookmarkFontColor = newSettings.bookmarkFontColor;
            }

            if (newSettings.bookmarkMinWidth !== undefined && newSettings.bookmarkMinWidth !== bookmarkMinWidth) {
                bookmarkMinWidth = newSettings.bookmarkMinWidth;
                applyBookmarkMinWidthSetting(bookmarkMinWidth);
            }

            applyIconAppearance();
            applyBookmarkFontSettings();
        }
    });
});
