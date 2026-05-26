import { handleDeleteBookmark, renameGroup, createGroup } from './modules.js';
// Removed drag-drop.js in favor of CDN SortableJS

export function renderBookmarks(bookmarks, contentArea, iconSize, stateHelpers) {
    contentArea.innerHTML = '';
    const { getBookmarks, setBookmarks, spaceId } = stateHelpers || {};

    if (bookmarks && bookmarks.length > 0) {
        bookmarks.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bookmark-category animate-cascade';
            categoryDiv.style.animationDelay = `${index * 0.05}s`;

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

            // Set data-id on categoryDiv
            categoryDiv.dataset.categoryId = category.id || '';
            
            const dragHandle = document.createElement('span');
            dragHandle.className = 'group-drag-handle';
            dragHandle.innerHTML = '⋮⋮';
            dragHandle.style.cursor = 'grab';
            dragHandle.style.opacity = '0.3';
            dragHandle.style.marginRight = '10px';
            dragHandle.title = 'Arrastar Grupo';
            
            const titleContainer = document.createElement('div');
            titleContainer.style.display = 'flex';
            titleContainer.style.alignItems = 'center';
            titleContainer.appendChild(dragHandle);
            titleContainer.appendChild(categoryTitle);
            
            headerDiv.appendChild(titleContainer);
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

        if (window.Sortable && getBookmarks && setBookmarks && spaceId) {
            window.Sortable.create(gridDiv, {
                group: 'shared', // all gridDivs are part of the 'shared' list
                animation: 150,
                delay: 200,   // Delay to distinguish tap from drag on touch
                delayOnTouchOnly: true,
                onEnd: function (evt) {
                    if (evt.from === evt.to && evt.oldIndex === evt.newIndex) return;

                    const itemEl = evt.item; // dragged HTMLElement
                    const itemId = itemEl.dataset.id;
                    const newIndex = evt.newIndex;
                    const targetCategoryId = evt.to.closest('.bookmark-category').dataset.categoryId;

                    if (itemId && targetCategoryId) {
                        try {
                            chrome.bookmarks.move(itemId, { parentId: targetCategoryId, index: newIndex }, () => {
                                // Full reload to keep UI consistent, could optimize later
                                window.location.reload();
                            });
                        } catch (e) {
                            console.error("Error moving bookmark:", e);
                        }
                    }
                }
            });
        }

        category.links.forEach((link, linkIndex) => {
            const bookmarkItem = document.createElement('a');
            bookmarkItem.className = 'bookmark-item animate-cascade';
            // Start item animation after its category starts animating + small stagger per item
            bookmarkItem.style.animationDelay = `${(index * 0.05) + (linkIndex * 0.02) + 0.15}s`;
            bookmarkItem.href = link.url;
            bookmarkItem.target = '_blank';
            bookmarkItem.draggable = true;

            bookmarkItem.dataset.id = link.id || '';
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

            const customIcon = stateHelpers && stateHelpers.customIcons ? (stateHelpers.customIcons[link.url] || stateHelpers.customIcons[link.id]) : null;

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
        });
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
    
    // Make Categories sortable
    if (window.Sortable && getBookmarks && setBookmarks && spaceId) {
        window.Sortable.create(contentArea, {
            animation: 150,
            handle: '.group-drag-handle',
            filter: '.new-group-container',
            draggable: '.bookmark-category',
            onEnd: function (evt) {
                if (evt.oldIndex === evt.newIndex) return;
                
                const itemEl = evt.item;
                const catId = itemEl.dataset.categoryId;
                
                if (catId) {
                    try {
                        chrome.bookmarks.move(catId, { parentId: spaceId, index: evt.newIndex }, () => {
                            // Reload to sync state cleanly
                            window.location.reload();
                        });
                    } catch (e) {
                        console.error('Error moving category', e);
                    }
                }
            }
        });
    }
}
