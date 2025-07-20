// js/script.js (versão final limpa)
import { saveBookmarks, loadBookmarks, applyTheme, toggleTheme, updateClock, updateDate, updateCalendar } from './modules.js';

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
                    handleDeleteBookmark(link.url, category.name, currentBookmarks, saveBookmarks, renderBookmarks);
                });

                

                const favicon = document.createElement('img');
                favicon.className = 'bookmark-favicon';
                favicon.src = `https://www.google.com/s2/favicons?domain=${link.url}&sz=32`;
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
        loadBookmarks(savedBookmarks => {
            if (savedBookmarks) {
                currentBookmarks = savedBookmarks;
            } else {
                currentBookmarks = defaultBookmarkCategories;
                saveBookmarks(currentBookmarks);
            }
            renderBookmarks(currentBookmarks);
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
    initialize();
});