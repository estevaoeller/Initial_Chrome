// js/drag-drop.js
import { addBookmarkToChrome, removeBookmarkFromChrome, moveBookmark, getRootFolder } from './modules.js';

let draggedItem = null;
let sourceCategoryName = null;
let placeholder = document.createElement('div');
placeholder.className = 'drop-placeholder';

export function setupDragParams(item, categoryName) {
    item.draggable = true;
    item.addEventListener('dragstart', (e) => handleDragStart(e, item, categoryName));
    item.addEventListener('dragend', handleDragEnd);
}

export function setupCategoryDropZone(categoryDiv, categoryName, getBookmarksState, setBookmarksState, renderCallback) {
    const grid = categoryDiv.querySelector('.bookmarks-grid');

    categoryDiv.addEventListener('dragover', (e) => handleDragOver(e, grid));
    categoryDiv.addEventListener('dragenter', (e) => handleDragEnter(e, categoryDiv));
    categoryDiv.addEventListener('dragleave', (e) => handleDragLeave(e, categoryDiv));
    categoryDiv.addEventListener('drop', (e) => handleDrop(e, grid, categoryName, getBookmarksState, setBookmarksState, renderCallback));
}

function handleDragStart(e, item, categoryName) {
    draggedItem = item;
    sourceCategoryName = categoryName;
    e.dataTransfer.effectAllowed = 'move';
    // Guardamos dados básicos para o caso de drop externo, embora usemos as variáveis globais para interno
    e.dataTransfer.setData('text/plain', JSON.stringify({
        url: item.href,
        name: item.querySelector('.bookmark-name').textContent
    }));
    item.classList.add('dragging');
    // Pequeno atraso para a classe e o visual funcionarem bem
    setTimeout(() => item.style.display = 'none', 0);
}

function handleDragEnd(e) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem.style.display = '';
        draggedItem = null;
        sourceCategoryName = null;
    }
    if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }

    document.querySelectorAll('.bookmark-category.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleDragOver(e, grid) {
    e.preventDefault();
    const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
    if (afterElement == null) {
        grid.appendChild(placeholder);
    } else {
        grid.insertBefore(placeholder, afterElement);
    }
}

function handleDragEnter(e, categoryDiv) {
    e.preventDefault();
    categoryDiv.classList.add('drag-over');
}

function handleDragLeave(e, categoryDiv) {
    if (!categoryDiv.contains(e.relatedTarget)) {
        categoryDiv.classList.remove('drag-over');
    }
}

async function handleDrop(e, grid, targetCategoryName, getBookmarksState, setBookmarksState, renderCallback) {
    e.preventDefault();
    document.querySelectorAll('.bookmark-category.drag-over').forEach(el => el.classList.remove('drag-over'));

    const currentBookmarks = getBookmarksState();

    // 1. Caso: Movendo bookmark interno
    if (draggedItem) {
        const url = draggedItem.href;
        const sourceCategory = currentBookmarks.find(c => c.name === sourceCategoryName);
        const targetCategory = currentBookmarks.find(c => c.name === targetCategoryName);

        if (sourceCategory && targetCategory) {
            const itemIndex = sourceCategory.links.findIndex(l => l.url === url);
            if (itemIndex > -1) {
                const movedItem = sourceCategory.links[itemIndex];

                // Remover do array original
                sourceCategory.links.splice(itemIndex, 1);

                // Inserir no novo local
                // O placeholder está no DOM, usamos ele para saber o index
                // Note: draggedItem (que é 'none') ainda está no DOM também, mas placeholder ocupa espaço
                const dropIndex = Array.from(grid.children).indexOf(placeholder);

                targetCategory.links.splice(dropIndex, 0, movedItem);

                // Atualizar Chrome
                await moveBookmarkInChrome(movedItem, sourceCategoryName, targetCategoryName, dropIndex);

                setBookmarksState(currentBookmarks);
                renderCallback(currentBookmarks);
            }
        }
    }
    // 2. Caso: Item Externo
    else if (e.dataTransfer.types.includes('text/uri-list') || e.dataTransfer.types.includes('text/plain')) {
        const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        if (url) {
            const dropIndex = Array.from(grid.children).indexOf(placeholder);
            let name = "Novo Bookmark";
            try {
                name = new URL(url).hostname;
            } catch (e) { }

            const newItem = { name: name, url: url };
            const targetCategory = currentBookmarks.find(c => c.name === targetCategoryName);

            if (targetCategory) {
                // Adiciona no Chrome e depois no estado local
                addBookmarkToChrome(targetCategoryName, newItem, (createdNode) => {
                    // Atualiza com dado real do chrome se possível
                    if (createdNode) {
                        newItem.id = createdNode.id;
                        newItem.name = createdNode.title;
                    }
                    targetCategory.links.splice(dropIndex, 0, newItem);
                    setBookmarksState(currentBookmarks);
                    renderCallback(currentBookmarks);
                });
            }
        }
    }

    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
}

function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.bookmark-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();

        // Simples verificação se o mouse está dentro da caixa do elemento
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
            // Se estiver na metade esquerda, insere antes.
            if (x < box.left + box.width / 2) {
                return { element: child, dist: 0 };
            } else {
                // Se estiver na direita, insere depois (retorna o próximo)
                const nextSibling = draggableElements[draggableElements.indexOf(child) + 1];
                return { element: nextSibling, dist: 0 };
            }
        }

        // Fallback de distância se não estiver exatamente em cima de nenhum
        const dist = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2));
        if (dist < closest.dist) {
            return { element: child, dist: dist };
        } else {
            return closest;
        }
    }, { element: null, dist: Number.POSITIVE_INFINITY }).element;
}

async function moveBookmarkInChrome(item, sourceCat, targetCat, newIndex) {
    return new Promise(resolve => {
        // Obter os IDs das pastas
        getRootFolder(root => {
            if (!root) { resolve(); return; }
            chrome.bookmarks.getChildren(root.id, children => {
                const targetFolder = children.find(c => c.title === targetCat);
                if (targetFolder && item.id) {
                    // Chrome API move
                    moveBookmark(item.id, targetFolder.id, newIndex, resolve);
                } else {
                    // Fallback
                    removeBookmarkFromChrome(sourceCat, item.url, () => {
                        addBookmarkToChrome(targetCat, item, resolve);
                    });
                }
            });
        });
    });
}
