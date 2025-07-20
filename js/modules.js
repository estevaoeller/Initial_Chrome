// js/modules.js

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

export function handleDeleteBookmark(urlToDelete, categoryNameToDeleteFrom, currentBookmarks, saveBookmarks, renderBookmarks) {
    const categoryIndex = currentBookmarks.findIndex(cat => cat.name === categoryNameToDeleteFrom);
    if (categoryIndex > -1) {
        const category = currentBookmarks[categoryIndex];
        const linkIndex = category.links.findIndex(link => link.url === urlToDelete);
        if (linkIndex > -1) {
            if (confirm(`Tem certeza que deseja excluir o bookmark "${category.links[linkIndex].name}"?`)) {
                category.links.splice(linkIndex, 1);
                saveBookmarks(currentBookmarks);
                renderBookmarks(currentBookmarks);
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


