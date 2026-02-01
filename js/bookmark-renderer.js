import { handleDeleteBookmark, renameBookmark } from './modules.js';
import { setupDragParams, setupCategoryDropZone } from './drag-drop.js';

export function renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers) {
    contentArea.innerHTML = '';
    if (!bookmarks || bookmarks.length === 0) return;

    const { getBookmarks, setBookmarks } = stateHelpers || {};

    bookmarks.forEach((category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'bookmark-category';

        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category.name;
        categoryDiv.appendChild(categoryTitle);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'bookmarks-grid';
        categoryDiv.appendChild(gridDiv);

        if (getBookmarks && setBookmarks) {
            setupCategoryDropZone(
                categoryDiv,
                category.name,
                getBookmarks,
                setBookmarks,
                (updated) => renderBookmarks(updated, contentArea, iconSize, stateHelpers)
            );
        }

        category.links.forEach(link => {
            const bookmarkItem = document.createElement('a');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.href = link.url;
            bookmarkItem.target = '_blank';
            bookmarkItem.draggable = true;

            if (getBookmarks) {
                setupDragParams(bookmarkItem, category.name);
            }

            // --- Delete Button ---
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-bookmark-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = "Excluir";
            deleteBtn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                handleDeleteBookmark(
                    link.url,
                    category.name,
                    bookmarks,
                    updated => renderBookmarks(updated, contentArea, iconSize, stateHelpers)
                );
            });

            // --- Edit Button ---
            const editBtn = document.createElement('span');
            editBtn.className = 'edit-bookmark-btn';
            editBtn.innerHTML = '✎';
            editBtn.title = "Editar Nome";
            editBtn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();

                // Toggle Edit Mode
                const nameSpan = bookmarkItem.querySelector('.bookmark-name');
                const existingInput = bookmarkItem.querySelector('.bookmark-name-edit');

                if (existingInput) return; // Já está editando

                const currentName = nameSpan.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'bookmark-name-edit';
                input.value = currentName;

                nameSpan.style.display = 'none';

                // Substituir o span pelo input temporariamente, inserir antes do edit button
                // Como layout é flex, inserir na posição correta é importante.
                bookmarkItem.insertBefore(input, editBtn); // Insere antes dos botões
                input.focus();

                // Block drag while editing
                bookmarkItem.draggable = false;

                function saveEdit() {
                    const newName = input.value.trim();
                    if (newName && newName !== currentName) {
                        // Salvar
                        if (link.id) {
                            renameBookmark(link.id, newName, () => {
                                link.name = newName;
                                // Atualizar estado local
                                if (setBookmarks) setBookmarks(bookmarks);
                                renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers);
                            });
                        } else {
                            // Se não tiver ID (legado), atualiza só local?
                            // Melhor atualizar o array e re-renderizar, esperando que o próximo sync resolva.
                            link.name = newName;
                            if (setBookmarks) setBookmarks(bookmarks);
                            renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers);
                        }
                    } else {
                        // Cancelar / Sem mudança
                        cancelEdit();
                    }
                }

                function cancelEdit() {
                    if (input.parentNode) input.parentNode.removeChild(input);
                    nameSpan.style.display = '';
                    bookmarkItem.draggable = true;
                }

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit();
                    } else if (e.key === 'Escape') {
                        cancelEdit();
                    }
                });

                input.addEventListener('blur', () => {
                    saveEdit();
                });

                input.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Previne click no link
                });
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
            bookmarkItem.appendChild(editBtn);
            bookmarkItem.appendChild(deleteBtn);
            gridDiv.appendChild(bookmarkItem);
        });
        contentArea.appendChild(categoryDiv);
    }));
}
