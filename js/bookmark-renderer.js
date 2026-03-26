import { handleDeleteBookmark, renameBookmark, renameGroup, createGroup } from './modules.js';
import { setupDragParams, setupCategoryDropZone } from './drag-drop.js';

export function renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers) {
    contentArea.innerHTML = '';
    const { getBookmarks, setBookmarks, spaceId } = stateHelpers || {};

    if (bookmarks && bookmarks.length > 0) {
        bookmarks.forEach((category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bookmark-category';

            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.borderBottom = '2px solid var(--section-line-color, var(--accent))';
            headerDiv.style.paddingBottom = '10px';
            headerDiv.style.marginBottom = '15px';

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            categoryTitle.title = "Duplo clique para renomear este grupo";
            categoryTitle.style.cursor = "text";
            categoryTitle.style.borderBottom = 'none'; // Overrides CSS default
            categoryTitle.style.paddingBottom = '0';
            categoryTitle.style.marginBottom = '0';
            categoryTitle.style.marginTop = '0';

            const arrowsDiv = document.createElement('div');
            arrowsDiv.style.display = 'flex';
            arrowsDiv.style.gap = '12px';
            
            const upArrow = document.createElement('span');
            upArrow.textContent = '⬆️';
            upArrow.style.cursor = 'pointer';
            upArrow.title = "Mover Grupo para Cima";
            upArrow.style.opacity = '0.5';
            upArrow.style.transition = 'opacity 0.2s';
            upArrow.onmouseenter = () => upArrow.style.opacity = '1';
            upArrow.onmouseleave = () => upArrow.style.opacity = '0.5';
            upArrow.onclick = () => {
                if (category.id) {
                    chrome.bookmarks.getChildren(spaceId, siblings => {
                        const currentIndex = siblings.findIndex(s => s.id === category.id);
                        if (currentIndex > 0) {
                            chrome.bookmarks.move(category.id, { parentId: spaceId, index: currentIndex - 1 }, () => {
                                const cIndex = bookmarks.findIndex(c => c.id === category.id);
                                if (cIndex > 0) {
                                    const temp = bookmarks[cIndex];
                                    bookmarks[cIndex] = bookmarks[cIndex - 1];
                                    bookmarks[cIndex - 1] = temp;
                                    if (setBookmarks) setBookmarks(bookmarks);
                                    renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers);
                                }
                            });
                        }
                    });
                }
            };

            const downArrow = document.createElement('span');
            downArrow.textContent = '⬇️';
            downArrow.style.cursor = 'pointer';
            downArrow.title = "Mover Grupo para Baixo";
            downArrow.style.opacity = '0.5';
            downArrow.style.transition = 'opacity 0.2s';
            downArrow.onmouseenter = () => downArrow.style.opacity = '1';
            downArrow.onmouseleave = () => downArrow.style.opacity = '0.5';
            downArrow.onclick = () => {
                if (category.id) {
                    chrome.bookmarks.getChildren(spaceId, siblings => {
                        const currentIndex = siblings.findIndex(s => s.id === category.id);
                        if (currentIndex > -1 && currentIndex < siblings.length - 1) {
                            chrome.bookmarks.move(category.id, { parentId: spaceId, index: currentIndex + 1 }, () => {
                                const cIndex = bookmarks.findIndex(c => c.id === category.id);
                                if (cIndex < bookmarks.length - 1) {
                                    const temp = bookmarks[cIndex];
                                    bookmarks[cIndex] = bookmarks[cIndex + 1];
                                    bookmarks[cIndex + 1] = temp;
                                    if (setBookmarks) setBookmarks(bookmarks);
                                    renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers);
                                }
                            });
                        }
                    });
                }
            };

            arrowsDiv.appendChild(upArrow);
            arrowsDiv.appendChild(downArrow);
            
            headerDiv.appendChild(categoryTitle);
            if (spaceId) headerDiv.appendChild(arrowsDiv);
            categoryDiv.appendChild(headerDiv);

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

            headerDiv.insertBefore(input, categoryTitle);
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
            editBtn.title = "Editar Link";
            editBtn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();

                // Dispara o evento para abrir o modal
                const editEvent = new CustomEvent('openEditModal', {
                    detail: {
                        link: link,
                        category: category,
                        bookmarks: bookmarks,
                        contentArea: contentArea,
                        iconSize: iconSize,
                        stateHelpers: stateHelpers
                    }
                });
                window.dispatchEvent(editEvent);
            });

            const favicon = document.createElement('img');
            favicon.className = 'bookmark-favicon';
            favicon.dataset.url = link.url;

            const customIcon = stateHelpers && stateHelpers.customIcons ? stateHelpers.customIcons[link.url] : null;

            if (customIcon && customIcon.type === 'simpleicons') {
                let colorHex = customIcon.color ? customIcon.color.replace('#', '') : 'default';
                favicon.src = `https://cdn.simpleicons.org/${customIcon.value}/${colorHex}`;
            } else if (customIcon && customIcon.type === 'techicons') {
                const suffix = customIcon.color === 'original' ? 'original' : 'plain';
                favicon.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${customIcon.value}/${customIcon.value}-${suffix}.svg`;
            } else if (customIcon && customIcon.type === 'dashboardicons') {
                favicon.src = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${customIcon.value}.svg`;
            } else if (customIcon && customIcon.type === 'custom') {
                favicon.src = customIcon.value;
            } else {
                favicon.src = `https://www.google.com/s2/favicons?domain=${link.url}&sz=${iconSize}`;
            }
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
