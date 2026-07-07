import {
  handleDeleteBookmark,
  renameGroup,
  createGroup,
  addBookmarkToChrome,
  loadSortable,
} from './modules.js';

// Setup lazy loading IntersectionObserver globally
const faviconObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  },
  { rootMargin: '100px' },
);

// Track internal drag state globally
document.addEventListener('dragstart', () => {
  document.body.classList.add('dragging-internal');
});

document.addEventListener('dragend', () => {
  document.body.classList.remove('dragging-internal');
});

export function renderBookmarks(
  bookmarks,
  contentArea,
  iconSize,
  stateHelpers,
) {
  const { getBookmarks, setBookmarks, spaceId } = stateHelpers || {};
  const collapsedGroups = (stateHelpers && stateHelpers.collapsedGroups) || [];

  // Hide loading skeletons if present
  const loadingSkeletons = document.getElementById('loading-skeletons');
  if (loadingSkeletons) {
    loadingSkeletons.style.display = 'none';
  }

  if (!bookmarks || bookmarks.length === 0) {
    contentArea.innerHTML = '';
    return;
  }

  // Keep track of DOM categories to delete later if they are not in the new bookmarks list
  const existingCategoryDivs = Array.from(
    contentArea.querySelectorAll('.bookmark-category'),
  );
  const newCategoryIds = new Set(bookmarks.map((c) => c.id).filter(Boolean));

  // Remove categories that are no longer in new list
  existingCategoryDivs.forEach((div) => {
    if (div.dataset.categoryId && !newCategoryIds.has(div.dataset.categoryId)) {
      div.remove();
    }
  });

  // Remove new group container if it exists, to insert it at the very end later
  const existingNewGroupContainer = contentArea.querySelector(
    '.new-group-container',
  );
  if (existingNewGroupContainer) {
    existingNewGroupContainer.remove();
  }

  bookmarks.forEach((category, catIndex) => {
    let categoryDiv = contentArea.querySelector(
      `.bookmark-category[data-category-id="${category.id}"]`,
    );
    let isNewCategory = false;

    if (!categoryDiv) {
      // Create Category Div
      categoryDiv = document.createElement('div');
      categoryDiv.className = 'bookmark-category animate-cascade';
      categoryDiv.dataset.categoryId = category.id || '';
      isNewCategory = true;
    }

    categoryDiv.style.animationDelay = `${catIndex * 0.05}s`;

    // We either update or create the elements inside categoryDiv
    let headerDiv = categoryDiv.querySelector('.category-header');
    let titleContainer = null;
    let dragHandle = null;
    let toggleBtn = null;
    let categoryTitle = null;

    const isCollapsed = collapsedGroups.includes(category.id);

    if (!headerDiv) {
      headerDiv = document.createElement('div');
      headerDiv.className = 'category-header';

      titleContainer = document.createElement('div');
      titleContainer.className = 'title-container';

      dragHandle = document.createElement('span');
      dragHandle.className = 'group-drag-handle';
      dragHandle.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';
      dragHandle.title = 'Arrastar Grupo';

      toggleBtn = document.createElement('button');
      toggleBtn.className = 'group-toggle-btn';
      toggleBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      toggleBtn.title = 'Recolher / Expandir Grupo';
      toggleBtn.setAttribute(
        'aria-label',
        `Recolher ou expandir o grupo ${category.name}`,
      );

      categoryTitle = document.createElement('h2');
      categoryTitle.className = 'category-title';
      categoryTitle.title = 'Duplo clique para renomear este grupo';

      titleContainer.appendChild(dragHandle);
      titleContainer.appendChild(toggleBtn);
      titleContainer.appendChild(categoryTitle);
      headerDiv.appendChild(titleContainer);
      categoryDiv.appendChild(headerDiv);

      // Double Click Rename Event
      categoryTitle.addEventListener('dblclick', () => {
        const currentName = categoryTitle.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'group-name-edit';

        headerDiv.insertBefore(input, titleContainer);
        titleContainer.style.display = 'none';
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
          titleContainer.style.display = 'flex';
        }

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') saveGroupEdit();
          if (e.key === 'Escape') finishEdit();
        });

        input.addEventListener('blur', saveGroupEdit);
      });
    } else {
      titleContainer = headerDiv.querySelector('.title-container');
      toggleBtn = headerDiv.querySelector('.group-toggle-btn');
      categoryTitle = headerDiv.querySelector('h2');
    }

    // Update values
    categoryTitle.textContent = category.name;
    toggleBtn.classList.toggle('collapsed', isCollapsed);
    toggleBtn.setAttribute(
      'aria-label',
      `${isCollapsed ? 'Expandir' : 'Recolher'} grupo ${category.name}`,
    );

    let gridDiv = categoryDiv.querySelector('.bookmarks-grid');
    if (!gridDiv) {
      gridDiv = document.createElement('div');
      gridDiv.className = 'bookmarks-grid';
      categoryDiv.appendChild(gridDiv);
    }

    gridDiv.classList.toggle('collapsed', isCollapsed);

    // Remove old click handler if exists and define a fresh one
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    newToggleBtn.addEventListener('click', () => {
      const collapsed = gridDiv.classList.toggle('collapsed');
      newToggleBtn.classList.toggle('collapsed', collapsed);
      newToggleBtn.setAttribute(
        'aria-label',
        `${collapsed ? 'Expandir' : 'Recolher'} grupo ${category.name}`,
      );

      chrome.storage.sync.get(['collapsedGroups'], (result) => {
        let currentCollapsed = result.collapsedGroups || [];
        if (collapsed) {
          if (!currentCollapsed.includes(category.id)) {
            currentCollapsed.push(category.id);
          }
        } else {
          currentCollapsed = currentCollapsed.filter(
            (id) => id !== category.id,
          );
        }
        if (stateHelpers) {
          stateHelpers.collapsedGroups = currentCollapsed;
        }
        chrome.storage.sync.set({ collapsedGroups: currentCollapsed });
      });
    });

    // RECONCILE BOOKMARKS INSIDE THE GRID
    const existingItems = Array.from(
      gridDiv.querySelectorAll('.bookmark-item'),
    );
    const newLinkIds = new Set(category.links.map((l) => l.id).filter(Boolean));

    // Remove links that are no longer present
    existingItems.forEach((item) => {
      if (item.dataset.id && !newLinkIds.has(item.dataset.id)) {
        item.remove();
      }
    });

    // Add/Update links
    category.links.forEach((link, linkIndex) => {
      let bookmarkItem = gridDiv.querySelector(
        `.bookmark-item[data-id="${link.id}"]`,
      );
      let isNewLink = false;

      if (!bookmarkItem) {
        bookmarkItem = document.createElement('a');
        bookmarkItem.className = 'bookmark-item animate-cascade';
        bookmarkItem.dataset.id = link.id || '';
        isNewLink = true;
      }

      bookmarkItem.style.animationDelay = `${catIndex * 0.05 + linkIndex * 0.02 + 0.15}s`;
      bookmarkItem.href = link.url;
      bookmarkItem.target = '_blank';
      bookmarkItem.draggable = true;
      bookmarkItem.title = `${link.name}\n${link.url}`;

      // Recreate click & contextmenu event listeners to avoid memory leaks
      const newBookmarkItem = bookmarkItem.cloneNode(false);
      newBookmarkItem.className = bookmarkItem.className;

      newBookmarkItem.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const contextMenuEvent = new CustomEvent('openContextMenu', {
          detail: {
            x: event.clientX,
            y: event.clientY,
            link: link,
            category: category,
            bookmarks: bookmarks,
            contentArea: contentArea,
            iconSize: iconSize,
            stateHelpers: stateHelpers,
          },
        });
        window.dispatchEvent(contextMenuEvent);
      });

      // Re-render children inside newBookmarkItem
      const favicon = document.createElement('img');
      favicon.className = 'bookmark-favicon';
      favicon.dataset.url = link.url;
      favicon.alt = '';

      const customIcon =
        stateHelpers && stateHelpers.customIcons
          ? stateHelpers.customIcons[link.url] ||
            stateHelpers.customIcons[link.id]
          : null;
      favicon.setAttribute('data-is-custom', customIcon ? 'true' : 'false');

      let srcUrl = '';
      if (customIcon && customIcon.type === 'simpleicons') {
        let colorHex = customIcon.color
          ? customIcon.color.replace('#', '')
          : 'default';
        srcUrl = `https://cdn.simpleicons.org/${customIcon.value}/${colorHex}`;
      } else if (customIcon && customIcon.type === 'techicons') {
        const suffix = customIcon.color === 'original' ? 'original' : 'plain';
        srcUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${customIcon.value}/${customIcon.value}-${suffix}.svg`;
      } else if (customIcon && customIcon.type === 'dashboardicons') {
        srcUrl = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${customIcon.value}.svg`;
      } else if (customIcon && customIcon.type === 'custom') {
        srcUrl = customIcon.value;
      } else {
        srcUrl = `https://www.google.com/s2/favicons?domain=${link.url}&sz=${iconSize}`;
      }

      // Lazy Load using IntersectionObserver
      favicon.dataset.src = srcUrl;
      faviconObserver.observe(favicon);

      const bookmarkName = document.createElement('span');
      bookmarkName.className = 'bookmark-name';
      bookmarkName.textContent = link.name;

      // Edit Button
      const editBtn = document.createElement('span');
      editBtn.className = 'edit-bookmark-btn';
      editBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
      editBtn.title = 'Editar Link';
      editBtn.setAttribute('role', 'button');
      editBtn.setAttribute('aria-label', `Editar link para ${link.name}`);
      editBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const editEvent = new CustomEvent('openEditModal', {
          detail: {
            link: link,
            category: category,
            bookmarks: bookmarks,
            contentArea: contentArea,
            iconSize: iconSize,
            stateHelpers: stateHelpers,
          },
        });
        window.dispatchEvent(editEvent);
      });

      // Delete Button
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'delete-bookmark-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Excluir';
      deleteBtn.setAttribute('role', 'button');
      deleteBtn.setAttribute('aria-label', `Excluir link para ${link.name}`);
      deleteBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleDeleteBookmark(
          link.url,
          category.name,
          bookmarks,
          (updated) =>
            renderBookmarks(updated, contentArea, iconSize, stateHelpers),
          spaceId,
        );
      });

      newBookmarkItem.appendChild(favicon);
      newBookmarkItem.appendChild(bookmarkName);
      newBookmarkItem.appendChild(editBtn);
      newBookmarkItem.appendChild(deleteBtn);

      if (isNewLink) {
        gridDiv.appendChild(newBookmarkItem);
      } else {
        bookmarkItem.parentNode.replaceChild(newBookmarkItem, bookmarkItem);
      }
    });

    // Ensure proper order of links in DOM matches array order
    category.links.forEach((link, linkIndex) => {
      const el = gridDiv.querySelector(`.bookmark-item[data-id="${link.id}"]`);
      if (el && gridDiv.children[linkIndex] !== el) {
        gridDiv.insertBefore(el, gridDiv.children[linkIndex]);
      }
    });

    // Drag and Drop for External Links
    if (spaceId && setBookmarks) {
      if (isNewCategory) {
        categoryDiv.addEventListener('dragover', (e) => {
          if (document.body.classList.contains('dragging-internal')) return;
          if (
            e.dataTransfer.types.includes('text/uri-list') ||
            e.dataTransfer.types.includes('text/plain') ||
            e.dataTransfer.types.includes('text/html')
          ) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            categoryDiv.classList.add('drag-over');
          }
        });

        categoryDiv.addEventListener('dragenter', (e) => {
          if (document.body.classList.contains('dragging-internal')) return;
          if (
            e.dataTransfer.types.includes('text/uri-list') ||
            e.dataTransfer.types.includes('text/plain') ||
            e.dataTransfer.types.includes('text/html')
          ) {
            e.preventDefault();
            categoryDiv.classList.add('drag-over');
          }
        });

        categoryDiv.addEventListener('dragleave', (e) => {
          if (document.body.classList.contains('dragging-internal')) return;
          if (!categoryDiv.contains(e.relatedTarget)) {
            categoryDiv.classList.remove('drag-over');
          }
        });

        categoryDiv.addEventListener('drop', async (e) => {
          if (document.body.classList.contains('dragging-internal')) return;
          if (
            e.dataTransfer.types.includes('text/uri-list') ||
            e.dataTransfer.types.includes('text/plain') ||
            e.dataTransfer.types.includes('text/html')
          ) {
            e.preventDefault();
            categoryDiv.classList.remove('drag-over');

            let url = '';
            let name = '';

            const htmlData = e.dataTransfer.getData('text/html');
            if (htmlData) {
              try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlData, 'text/html');
                const a = doc.querySelector('a');
                if (a) {
                  url = a.href;
                  name = a.textContent.trim() || a.title.trim();
                }
              } catch (err) {
                console.error('Erro ao extrair text/html do drag:', err);
              }
            }

            if (!url) {
              url =
                e.dataTransfer.getData('text/uri-list') ||
                e.dataTransfer.getData('text/plain');
            }

            url = url ? url.trim() : '';
            if (url) {
              try {
                if (!/^https?:\/\//i.test(url)) {
                  url = 'https://' + url;
                }
                const parsedUrl = new URL(url);
                if (!name) {
                  name = parsedUrl.hostname.replace('www.', '');
                  name = name.charAt(0).toUpperCase() + name.slice(1);
                }
              } catch (err) {
                console.error('URL inválida recebida:', url);
                return;
              }

              const newItem = { name: name, url: url };
              addBookmarkToChrome(
                spaceId,
                category.name,
                newItem,
                (createdNode) => {
                  if (createdNode) {
                    newItem.id = createdNode.id;
                    newItem.name = createdNode.title;
                  }
                  category.links.push(newItem);
                  setBookmarks(bookmarks);
                  renderBookmarks(
                    bookmarks,
                    contentArea,
                    iconSize,
                    stateHelpers,
                  );
                },
              );
            }
          }
        });
      }
    }

    // Initialize Sortable for items inside category grid
    if (spaceId && getBookmarks && setBookmarks) {
      loadSortable((Sortable) => {
        if (!gridDiv.SortableInstance) {
          gridDiv.SortableInstance = Sortable.create(gridDiv, {
            group: 'shared',
            animation: 150,
            delay: 200,
            delayOnTouchOnly: true,
            onEnd: function (evt) {
              if (evt.from === evt.to && evt.oldIndex === evt.newIndex) return;

              const itemEl = evt.item;
              const itemId = itemEl.dataset.id;
              const newIndex = evt.newIndex;
              const targetCategoryId =
                evt.to.closest('.bookmark-category').dataset.categoryId;

              if (itemId && targetCategoryId) {
                try {
                  chrome.bookmarks.move(
                    itemId,
                    { parentId: targetCategoryId, index: newIndex },
                    () => {
                      const currentList = getBookmarks();
                      const sourceCategoryId =
                        evt.from.closest('.bookmark-category').dataset
                          .categoryId;
                      const sourceCategory = currentList.find(
                        (c) => c.id === sourceCategoryId,
                      );
                      const targetCategory = currentList.find(
                        (c) => c.id === targetCategoryId,
                      );

                      if (sourceCategory && targetCategory) {
                        const linkIndex = sourceCategory.links.findIndex(
                          (l) => l.id === itemId,
                        );
                        if (linkIndex > -1) {
                          const [movedLink] = sourceCategory.links.splice(
                            linkIndex,
                            1,
                          );
                          targetCategory.links.splice(newIndex, 0, movedLink);
                          setBookmarks(currentList);
                        }
                      }
                    },
                  );
                } catch (e) {
                  console.error('Error moving bookmark:', e);
                }
              }
            },
          });
        }
      });
    }

    // Insert categoryDiv into contentArea at the correct index if new
    if (isNewCategory) {
      contentArea.appendChild(categoryDiv);
    }
  });

  // Ensure category order in DOM matches bookmarks array order
  bookmarks.forEach((category, catIndex) => {
    const el = contentArea.querySelector(
      `.bookmark-category[data-category-id="${category.id}"]`,
    );
    if (el && contentArea.children[catIndex] !== el) {
      contentArea.insertBefore(el, contentArea.children[catIndex]);
    }
  });

  // --- Create "New Group" Button ---
  if (getBookmarks && setBookmarks && spaceId) {
    const newGroupContainer = document.createElement('div');
    newGroupContainer.className = 'new-group-container';

    const newGroupBtn = document.createElement('button');
    newGroupBtn.textContent = '+ Novo Grupo';
    newGroupBtn.className = 'new-group-btn';
    newGroupBtn.setAttribute('aria-label', 'Criar um novo grupo de marcadores');

    newGroupBtn.addEventListener('click', () => {
      const groupName = prompt('Nome do novo grupo:');
      if (groupName && groupName.trim()) {
        createGroup(spaceId, groupName.trim(), (newGroup) => {
          const currentBookmarks = getBookmarks();
          currentBookmarks.push(newGroup);
          setBookmarks(currentBookmarks);
          renderBookmarks(
            currentBookmarks,
            contentArea,
            iconSize,
            stateHelpers,
          );
        });
      }
    });

    newGroupContainer.appendChild(newGroupBtn);
    contentArea.appendChild(newGroupContainer);
  }

  // Make Categories sortable under contentArea
  if (spaceId && getBookmarks && setBookmarks) {
    loadSortable((Sortable) => {
      if (!contentArea.SortableInstance) {
        contentArea.SortableInstance = Sortable.create(contentArea, {
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
                chrome.bookmarks.move(
                  catId,
                  { parentId: spaceId, index: evt.newIndex },
                  () => {
                    const currentList = getBookmarks();
                    const catIndex = currentList.findIndex(
                      (c) => c.id === catId,
                    );
                    if (catIndex > -1) {
                      const [movedCat] = currentList.splice(catIndex, 1);
                      currentList.splice(evt.newIndex, 0, movedCat);
                      setBookmarks(currentList);
                    }
                  },
                );
              } catch (e) {
                console.error('Error moving category', e);
              }
            }
          },
        });
      }
    });
  }
}
