import { handleDeleteBookmark, renameBookmark, renameGroup, createGroup } from './modules.js';
import { setupDragParams, setupCategoryDropZone } from './drag-drop.js';

export function renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers) {
    contentArea.innerHTML = '';
    if (!bookmarks || bookmarks.length === 0) return;

    const { getBookmarks, setBookmarks, spaceId } = stateHelpers || {};

    bookmarks.forEach((category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'bookmark-category';

        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category.name;
        categoryTitle.title = "Duplo clique para renomear este grupo";
        categoryTitle.style.cursor = "text";
        categoryDiv.appendChild(categoryTitle);

        // --- Edit Group Title (Double Click) ---
        categoryTitle.addEventListener('dblclick', () => {
            const currentName = categoryTitle.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'group-name-edit';
            input.style.fontSize = window.getComputedStyle(categoryTitle).fontSize;
            input.style.fontWeight = window.getComputedStyle(categoryTitle).fontWeight;
            input.style.fontFamily = window.getComputedStyle(categoryTitle).fontFamily;
            input.style.color = window.getComputedStyle(categoryTitle).color;
            input.style.background = 'transparent';
            input.style.border = '1px solid var(--accent)';
            input.style.borderRadius = '4px';
            input.style.padding = '2px 5px';
            input.style.margin = window.getComputedStyle(categoryTitle).margin;
            input.style.outline = 'none';
            input.style.width = '100%';

            categoryDiv.insertBefore(input, categoryTitle);
            categoryTitle.style.display = 'none';
            input.focus();
            input.select();

            function saveGroupEdit() {
                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    if (category.id) {
                        renameGroup(category.id, newName, () => {
                            category.name = newName;
                            categoryTitle.textContent = newName;
                            finishEdit();
                            if (setBookmarks) setBookmarks(bookmarks);
                        });
                    } else {
                        // Resiliência caso falte o ID temporariamente
                        category.name = newName;
                        categoryTitle.textContent = newName;
                        finishEdit();
                        if (setBookmarks) setBookmarks(bookmarks);
                    }
                } else {
                    finishEdit();
                }
            }

            function finishEdit() {
                if (input.parentNode) input.parentNode.removeChild(input);
                categoryTitle.style.display = '';
            }

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveGroupEdit();
                if (e.key === 'Escape') finishEdit();
            });

            input.addEventListener('blur', saveGroupEdit);
        });

        const gridDiv = document.createElement('div');
        gridDiv.className = 'bookmarks-grid';
        categoryDiv.appendChild(gridDiv);

        if (getBookmarks && setBookmarks) {
            setupCategoryDropZone(
                categoryDiv,
                category.name,
                getBookmarks,
                setBookmarks,
                (updated) => renderBookmarks(updated, contentArea, iconSize, stateHelpers),
                spaceId
            );
        }

        category.links.forEach(link => {
            const bookmarkItem = document.createElement('a');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.href = link.url;
            bookmarkItem.target = '_blank';
            bookmarkItem.draggable = true;

            if (getBookmarks) {
                setupDragParams(bookmarkItem, category.name, spaceId);
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
                    updated => renderBookmarks(updated, contentArea, iconSize, stateHelpers),
                    spaceId
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

    // --- Create "New Group" Button ---
    if (getBookmarks && setBookmarks && spaceId) {
        const newGroupContainer = document.createElement('div');
        newGroupContainer.className = 'new-group-container';
        newGroupContainer.style.textAlign = 'center';
        newGroupContainer.style.padding = '20px';
        newGroupContainer.style.marginTop = '20px';

        const newGroupBtn = document.createElement('button');
        newGroupBtn.textContent = '+ Novo Grupo';
        newGroupBtn.className = 'new-group-btn';
        newGroupBtn.style.padding = '10px 20px';
        newGroupBtn.style.fontSize = '14px';
        newGroupBtn.style.cursor = 'pointer';
        newGroupBtn.style.background = 'var(--input-bg)';
        newGroupBtn.style.color = 'var(--text)';
        newGroupBtn.style.border = '1px dashed var(--settings-border)';
        newGroupBtn.style.borderRadius = '8px';
        newGroupBtn.style.transition = 'all 0.2s';

        newGroupBtn.addEventListener('mouseenter', () => {
            newGroupBtn.style.border = '1px solid var(--accent)';
            newGroupBtn.style.color = 'var(--accent)';
        });
        newGroupBtn.addEventListener('mouseleave', () => {
            newGroupBtn.style.border = '1px dashed var(--settings-border)';
            newGroupBtn.style.color = 'var(--text)';
        });

        newGroupBtn.addEventListener('click', () => {
            const groupName = prompt('Nome do novo grupo:');
            if (groupName && groupName.trim()) {
                createGroup(spaceId, groupName.trim(), (newGroup) => {
                    const currentBookmarks = getBookmarks();
                    currentBookmarks.push(newGroup);
                    setBookmarks(currentBookmarks);
                    renderBookmarks(currentBookmarks, contentArea, iconSize, stateHelpers);
                });
            }
        });

        newGroupContainer.appendChild(newGroupBtn);
        contentArea.appendChild(newGroupContainer);
    }
}
