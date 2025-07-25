// js/modules.js

export const ROOT_FOLDER_NAME = 'Pagina Inicial';

export function saveBookmarks(bookmarksToSave) {
    chrome.storage.local.set({ 'userBookmarks': bookmarksToSave }, function() {
        if (chrome.runtime.lastError) {
            console.error("Erro ao salvar bookmarks:", chrome.runtime.lastError.message);
        } else {
            console.log("Bookmarks salvos com sucesso!");
        }
    });
}

export function loadBookmarks(callback) {
    chrome.storage.local.get('userBookmarks', function(data) {
        if (chrome.runtime.lastError) {
            console.error("Erro ao carregar bookmarks:", chrome.runtime.lastError.message);
            callback(null);
            return;
        }
        if (data.userBookmarks && data.userBookmarks.length > 0) {
            callback(data.userBookmarks);
        } else {
            callback(null); 
        }
    });
}

export function getRootFolder(callback) {
    chrome.bookmarks.getTree(nodes => {
        const queue = [...nodes];
        while (queue.length) {
            const node = queue.shift();
            if (!node.url && node.title === ROOT_FOLDER_NAME) {
                callback(node);
                return;
            }
            if (node.children) queue.push(...node.children);
        }
        callback(null);
    });
}

export function loadBookmarksFromChrome(callback) {
    getRootFolder(folder => {
        if (!folder) {
            callback([]);
            return;
        }
        chrome.bookmarks.getSubTree(folder.id, nodes => {
            const categories = [];
            if (nodes[0].children) {
                nodes[0].children.forEach(catNode => {
                    if (!catNode.url) {
                        const category = { name: catNode.title, links: [] };
                        (catNode.children || []).forEach(child => {
                            if (child.url) {
                                category.links.push({ name: child.title, url: child.url });
                            }
                        });
                        categories.push(category);
                    }
                });
            }
            callback(categories);
        });
    });
}

export function addBookmarkToChrome(categoryName, bookmark, callback) {
    getRootFolder(root => {
        if (!root) { if (callback) callback(); return; }
        chrome.bookmarks.getChildren(root.id, children => {
            let category = children.find(c => c.title === categoryName && !c.url);
            const createBookmark = folderId => chrome.bookmarks.create({ parentId: folderId, title: bookmark.name, url: bookmark.url }, () => callback && callback());
            if (category) {
                createBookmark(category.id);
            } else {
                chrome.bookmarks.create({ parentId: root.id, title: categoryName }, newFolder => {
                    createBookmark(newFolder.id);
                });
            }
        });
    });
}

export function removeBookmarkFromChrome(categoryName, bookmarkUrl, callback) {
    getRootFolder(root => {
        if (!root) { if (callback) callback(); return; }
        chrome.bookmarks.getChildren(root.id, children => {
            const category = children.find(c => c.title === categoryName && !c.url);
            if (!category) { if (callback) callback(); return; }
            chrome.bookmarks.getChildren(category.id, bookmarks => {
                const bm = bookmarks.find(b => b.url === bookmarkUrl);
                if (bm) {
                    chrome.bookmarks.remove(bm.id, () => callback && callback());
                } else {
                    if (callback) callback();
                }
            });
        });
    });
}

export function createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    return placeholder;
}

export function removePlaceholder(placeholder) {
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }
}

export function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.bookmark-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

export function handleDeleteBookmark(urlToDelete, categoryNameToDeleteFrom, currentBookmarks, renderBookmarks) {
    const categoryIndex = currentBookmarks.findIndex(cat => cat.name === categoryNameToDeleteFrom);
    if (categoryIndex > -1) {
        const category = currentBookmarks[categoryIndex];
        const linkIndex = category.links.findIndex(link => link.url === urlToDelete);
        if (linkIndex > -1) {
            if (confirm(`Tem certeza que deseja excluir o bookmark "${category.links[linkIndex].name}"?`)) {
                removeBookmarkFromChrome(category.name, urlToDelete, () => {
                    category.links.splice(linkIndex, 1);
                    renderBookmarks(currentBookmarks);
                });
            }
        } else {
            console.warn("Link não encontrado para exclusão no array de dados:", urlToDelete);
        }
    } else {
        console.warn("Categoria não encontrada para exclusão no array de dados:", categoryNameToDeleteFrom);
    }
}

export function applyTheme(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
}

export function toggleTheme() {
    const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
}

export function updateClock(analogClockPlaceholder) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    analogClockPlaceholder.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function updateDate(datePlaceholder) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    datePlaceholder.textContent = now.toLocaleDateString('pt-BR', options);
}

export function updateCalendar(calendarPlaceholder) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHtml = `<h3>${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>`;
    calendarHtml += `<p><a href="https://calendar.google.com/calendar/" target="_blank">Google Agenda</a></p>`;
    calendarHtml += `<table style="width:100%; text-align:center;">`;
    calendarHtml += `<thead><tr><th>Dom</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th><th>Sáb</th></tr></thead>`;
    calendarHtml += `<tbody><tr>`;

    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHtml += `<td></td>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        if ((firstDayOfMonth + day - 1) % 7 === 0) {
            calendarHtml += `</tr><tr>`;
        }
        calendarHtml += `<td>${day}</td>`;
    }

    for (let i = (firstDayOfMonth + daysInMonth) % 7; i > 0 && i < 7; i++) {
        calendarHtml += `<td></td>`;
    }

    calendarHtml += `</tr></tbody></table>`;
    calendarPlaceholder.innerHTML = calendarHtml;
}


