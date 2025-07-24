
import {
    saveBookmarks,
    loadBookmarks,
    applyTheme,
    toggleTheme,
    updateClock,
    updateDate,
    updateCalendar,
    handleDeleteBookmark,
    getDragAfterElement
} from './modules.js';

let currentBookmarks = [];

// Render bookmarks along with drag & drop and editing
function renderBookmarks(bookmarks) {
    const contentArea = document.getElementById('content-area');
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

            const favicon = document.createElement('img');
            favicon.className = 'bookmark-favicon';
            favicon.src = `https://www.google.com/s2/favicons?domain=${link.url}&sz=32`;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'bookmark-name';
            nameSpan.textContent = link.name;
            nameSpan.addEventListener('dblclick', () => {
                enableBookmarkEditing(bookmarkItem, link, category.name);
            });

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-bookmark-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                handleDeleteBookmark(link.url, category.name, currentBookmarks, saveBookmarks, renderBookmarks);
                checkAndRemoveEmptyCategory(category.name);
            });

            bookmarkItem.appendChild(favicon);
            bookmarkItem.appendChild(nameSpan);
            bookmarkItem.appendChild(deleteBtn);
            gridDiv.appendChild(bookmarkItem);
        });

        makeBookmarksDraggable(gridDiv, category.name);
        categoryDiv.appendChild(gridDiv);
        contentArea.appendChild(categoryDiv);
    });

    makeCategoriesDraggable(contentArea);
}

function enableBookmarkEditing(item, link, categoryName) {
    const nameSpan = item.querySelector('.bookmark-name');
    const input = document.createElement('input');
    input.className = 'bookmark-name-edit';
    input.value = link.name;
    nameSpan.replaceWith(input);
    item.classList.add('editing');
    input.focus();

    function finishEdit() {
        const newName = input.value.trim();
        if (newName && newName !== link.name) {
            link.name = newName;
            saveBookmarks(currentBookmarks);
        }
        const restored = document.createElement('span');
        restored.className = 'bookmark-name';
        restored.textContent = link.name;
        restored.addEventListener('dblclick', () => enableBookmarkEditing(item, link, categoryName));
        input.replaceWith(restored);
        item.classList.remove('editing');
    }

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') input.blur();
    });
}

function makeBookmarksDraggable(container, categoryName) {
    container.querySelectorAll('.bookmark-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', () => item.classList.add('dragging'));
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            saveBookmarks(currentBookmarks);
        });
    });

    container.addEventListener('dragover', e => {
        e.preventDefault();
        const after = getDragAfterElement(container, e.clientY);
        const dragging = container.querySelector('.dragging');
        if (!dragging) return;
        if (after == null) container.appendChild(dragging);
        else container.insertBefore(dragging, after);

        const newOrder = [...container.querySelectorAll('.bookmark-item')]
            .map(el => el.querySelector('.bookmark-name').textContent);
        const category = currentBookmarks.find(c => c.name === categoryName);
        category.links.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
    });
}

function makeCategoriesDraggable(container) {
    container.querySelectorAll('.bookmark-category').forEach(cat => {
        cat.setAttribute('draggable', 'true');

        cat.addEventListener('dragstart', () => {
            cat.classList.add('dragging');
        });

        cat.addEventListener('dragend', () => {
            cat.classList.remove('dragging');
            const newOrder = [...container.querySelectorAll('.bookmark-category')].map(el => el.querySelector('h2').textContent);
            currentBookmarks.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
            saveBookmarks(currentBookmarks);
        });
    });

    container.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const dragging = container.querySelector('.dragging');
        if (afterElement == null) {
            container.appendChild(dragging);
        } else {
            container.insertBefore(dragging, afterElement);
        }
    });
}

function checkAndRemoveEmptyCategory(categoryName) {
    const index = currentBookmarks.findIndex(c => c.name === categoryName);
    if (index > -1 && currentBookmarks[index].links.length === 0) {
        currentBookmarks.splice(index, 1);
        saveBookmarks(currentBookmarks);
        renderBookmarks(currentBookmarks);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById("content-area");
    const analogClockPlaceholder = document.getElementById("analog-clock-placeholder");
    const datePlaceholder = document.getElementById("date-placeholder");
    const calendarPlaceholder = document.getElementById("calendar-placeholder");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const addSection = document.getElementById("add-bookmark-section");

loadBookmarks(savedBookmarks => {
    if (savedBookmarks && savedBookmarks.length > 0) {
        currentBookmarks = savedBookmarks;
        renderBookmarks(currentBookmarks);
    } else {
        fetch('bookmarks_realistas.json')
            .then(response => response.json())
            .then(data => {
                currentBookmarks = data;
                saveBookmarks(currentBookmarks);
                renderBookmarks(currentBookmarks);
                saveBookmarks(currentBookmarks);
            })
            .catch(error => {
                console.error('Erro ao carregar JSON de bookmarks:', error);
                // Fallback para bookmarks padrão
                currentBookmarks = defaultBookmarkCategories;
                saveBookmarks(currentBookmarks);
                renderBookmarks(currentBookmarks);
            });
    }
});

    chrome.storage.local.get(['theme'], result => applyTheme(result.theme || 'light'));
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (settingsBtn) settingsBtn.addEventListener('click', () =>
        chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") })
    );

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

    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Adicionar Bookmark";
    toggleButton.style.margin = "10px";
    toggleButton.addEventListener("click", () => {
        addSection.style.display = addSection.style.display === "none" ? "block" : "none";
    });
    contentArea.before(toggleButton);

    document.getElementById("add-bookmark-form").addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("bookmark-name").value.trim();
        const url = document.getElementById("bookmark-url").value.trim();
        const category = document.getElementById("bookmark-category").value.trim();
        if (!name || !url || !category) return;

        const categoryIndex = currentBookmarks.findIndex(c => c.name.toLowerCase() === category.toLowerCase());
        if (categoryIndex > -1) {
            currentBookmarks[categoryIndex].links.push({ name, url });
        } else {
            currentBookmarks.push({ name: category, links: [{ name, url }] });
        }

        saveBookmarks(currentBookmarks);
        renderBookmarks(currentBookmarks);
        this.reset();
        addSection.style.display = "none";
    });
});