// js/script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página carregada. Iniciando script completo.");

    const defaultBookmarkCategories = [
        {
            name: "IA",
            links: [
                { name: "ChatGPT", url: "https://chat.openai.com/" },
                { name: "Gemini", url: "https://gemini.google.com/" },
                { name: "Perplexity AI", url: "https://www.perplexity.ai/" }
            ]
        },
        {
            name: "News",
            links: [
                { name: "Google News", url: "https://news.google.com/" },
                { name: "TechCrunch", url: "https://techcrunch.com/" }
            ]
        },
        {
            name: "Ferramentas",
            links: [
                { name: "Photopea", url: "https://www.photopea.com/" },
                { name: "TinyPNG", url: "https://tinypng.com/" },
                { name: "Regex101", url: "https://regex101.com/" }
            ]
        },
        {
            name: "Estudos",
            links: [
                { name: "MDN Web Docs", url: "https://developer.mozilla.org/" },
                { name: "freeCodeCamp", url: "https://www.freecodecamp.org/" }
            ]
        },
        { name: "Ler depois", links: [] },
        { name: "Visitar mais tarde", links: [] },
        {
            name: "Social",
            links: [
                { name: "LinkedIn", url: "https://www.linkedin.com/" },
                { name: "GitHub", url: "https://github.com/" }
            ]
        }
    ];

    let currentBookmarks = [];
    const contentArea = document.getElementById('content-area');
    let placeholder = null; // Variável para o placeholder visual

    function saveBookmarks(bookmarksToSave) {
        chrome.storage.local.set({ 'userBookmarks': bookmarksToSave }, function() {
            if (chrome.runtime.lastError) {
                console.error("Erro ao salvar bookmarks:", chrome.runtime.lastError.message);
            } else {
                console.log("Bookmarks salvos com sucesso!");
            }
        });
    }

    function loadBookmarks(callback) {
        chrome.storage.local.get('userBookmarks', function(data) {
            if (chrome.runtime.lastError) {
                console.error("Erro ao carregar bookmarks:", chrome.runtime.lastError.message);
                callback(null);
                return;
            }
            if (data.userBookmarks && data.userBookmarks.length > 0) {
                callback(data.userBookmarks);
            } else {
                callback(null); // Indica que os padrões devem ser usados
            }
        });
    }

    // Funções do Placeholder
    function createPlaceholder() {
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'drop-placeholder';
        }
        return placeholder;
    }

    function removePlaceholder() {
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
    }

    // Funções de Drag and Drop
    function handleDragEnter(event) {
        event.preventDefault();
        if (event.currentTarget.classList.contains('bookmark-category')) {
             event.currentTarget.classList.add('drag-over');
        }
    }

    function getDragAfterElement(container, y) {
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

    function handleDragOver(event) {
        event.preventDefault();
        const categoryDiv = event.currentTarget.classList.contains('bookmark-category')
            ? event.currentTarget
            : event.target.closest('.bookmark-category');

        if (!categoryDiv) {
            removePlaceholder();
            return;
        }

        if (event.dataTransfer.types.includes('application/json-bookmark')) {
            event.dataTransfer.dropEffect = 'move';
            const bookmarksGrid = categoryDiv.querySelector('.bookmarks-grid');
            if (!bookmarksGrid) return;

            removePlaceholder(); 
            const localPlaceholder = createPlaceholder();
            const afterElement = getDragAfterElement(bookmarksGrid, event.clientY);

            if (afterElement) {
                bookmarksGrid.insertBefore(localPlaceholder, afterElement);
            } else {
                bookmarksGrid.appendChild(localPlaceholder);
            }
        } else {
            event.dataTransfer.dropEffect = 'link';
            removePlaceholder(); 
        }
    }

    function handleDragLeave(event) {
        const categoryDiv = event.currentTarget.classList.contains('bookmark-category')
            ? event.currentTarget
            : event.target.closest('.bookmark-category');

        if (categoryDiv) {
            categoryDiv.classList.remove('drag-over');
            if (event.relatedTarget && !categoryDiv.contains(event.relatedTarget)) {
                 removePlaceholder();
            } else if (!event.relatedTarget) { 
                 removePlaceholder();
            }
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const categoryDiv = event.currentTarget.classList.contains('bookmark-category')
            ? event.currentTarget
            : event.target.closest('.bookmark-category');

        if (!categoryDiv) {
            console.warn("Drop ocorreu fora de uma categoria válida.");
            removePlaceholder();
            const draggingElem = document.querySelector('.bookmark-item.dragging');
            if (draggingElem) draggingElem.classList.remove('dragging');
            return;
        }

        categoryDiv.classList.remove('drag-over');
        removePlaceholder(); 

        const targetCategoryName = categoryDiv.dataset.categoryName;

        if (event.dataTransfer.types.includes('application/json-bookmark')) {
            const bookmarkDataString = event.dataTransfer.getData('application/json-bookmark');
            if (!bookmarkDataString) {
                console.warn("Dados do bookmark interno não encontrados.");
                return;
            }
            const bookmarkData = JSON.parse(bookmarkDataString);
            let removedLink = null;

            const originalCategory = currentBookmarks.find(cat => cat.name === bookmarkData.originalCategoryName);
            if (originalCategory) {
                const linkIndex = originalCategory.links.findIndex(lnk => lnk.url === bookmarkData.url);
                if (linkIndex > -1) {
                    removedLink = originalCategory.links.splice(linkIndex, 1)[0];
                }
            }

            if (!removedLink) {
                console.error("Não foi possível remover o link da categoria original.");
                return;
            }

            const targetCategory = currentBookmarks.find(cat => cat.name === targetCategoryName);
            if (targetCategory) {
                const bookmarksGrid = categoryDiv.querySelector('.bookmarks-grid');
                const afterElement = bookmarksGrid ? getDragAfterElement(bookmarksGrid, event.clientY) : null;

                if (afterElement) {
                    const referenceUrl = afterElement.dataset.url;
                    if (referenceUrl) {
                        const insertAtIndex = targetCategory.links.findIndex(link => link.url === referenceUrl);
                        if (insertAtIndex !== -1) {
                            targetCategory.links.splice(insertAtIndex, 0, removedLink);
                        } else {
                            targetCategory.links.push(removedLink); 
                            console.warn("Índice de referência não encontrado (drop), adicionado ao final.");
                        }
                    } else {
                        targetCategory.links.push(removedLink); 
                        console.warn("'afterElement' (drop) não tem data-url, adicionado ao final.");
                    }
                } else {
                    targetCategory.links.push(removedLink); 
                }
            } else {
                console.error("Categoria de destino para reordenar não encontrada:", targetCategoryName);
                if (originalCategory && removedLink) { 
                    originalCategory.links.push(removedLink); 
                    console.warn("Link devolvido à categoria original pois o destino não foi encontrado.");
                }
                saveBookmarks(currentBookmarks); 
                renderBookmarks(currentBookmarks);
                return;
            }
            saveBookmarks(currentBookmarks);
            renderBookmarks(currentBookmarks);

        } else { 
            const draggedUrl = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
            if (!draggedUrl) {
                console.warn("Nenhuma URL (externa) encontrada.");
                return;
            }
            if (!targetCategoryName) {
                console.error("Nome da categoria não encontrado (drop externo).");
                return;
            }
            let bookmarkName = "Novo Link";
            try {
                const urlObject = new URL(draggedUrl);
                if (urlObject.hostname) bookmarkName = urlObject.hostname.replace(/^www\./, '');
            } catch (e) {
                if (draggedUrl.length > 0 && draggedUrl.length < 50) bookmarkName = draggedUrl;
            }
            const category = currentBookmarks.find(cat => cat.name === targetCategoryName);
            if (category) {
                if (category.links.some(link => link.url === draggedUrl)) {
                    alert("Este link já existe nesta categoria!");
                    return;
                }
                category.links.push({ name: bookmarkName, url: draggedUrl });
                saveBookmarks(currentBookmarks);
                renderBookmarks(currentBookmarks);
            } else {
                console.error("Categoria (para drop externo) não encontrada:", targetCategoryName);
            }
        }
    }

    function renderBookmarks(categoriesToRender) {
        if (!contentArea) {
            console.error("Elemento 'content-area' não encontrado!");
            return;
        }
        contentArea.innerHTML = '';

        if (!categoriesToRender || categoriesToRender.length === 0) {
            contentArea.innerHTML = '<p style="text-align:center;">Nenhum bookmark para exibir.</p>';
            return;
        }

        categoriesToRender.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bookmark-category';
            categoryDiv.dataset.categoryName = category.name;

            categoryDiv.addEventListener('dragenter', handleDragEnter);
            categoryDiv.addEventListener('dragover', handleDragOver);
            categoryDiv.addEventListener('dragleave', handleDragLeave);
            categoryDiv.addEventListener('drop', handleDrop);

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            categoryDiv.appendChild(categoryTitle);

            const bookmarksGridDiv = document.createElement('div');
            bookmarksGridDiv.className = 'bookmarks-grid';

            if (category.links.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.textContent = 'Arraste um link para esta categoria';
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.gridColumn = '1 / -1';
                bookmarksGridDiv.appendChild(emptyMessage);
            } else {
                category.links.forEach(link => {
                    const bookmarkItem = document.createElement('a');
                    bookmarkItem.className = 'bookmark-item';
                    bookmarkItem.dataset.url = link.url; 

                    if (typeof link.url === 'string' && link.url.trim() !== '' && (link.url.startsWith('http') || link.url.startsWith('file:') || link.url.startsWith('ftp:'))) {
                        bookmarkItem.href = link.url;
                    } else {
                        bookmarkItem.href = '#';
                    }
                    bookmarkItem.target = '_blank';
                    bookmarkItem.draggable = true; 

                    const bookmarkNameSpan = document.createElement('span');
                    bookmarkNameSpan.textContent = link.name;

                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'test-delete-button-x'; 
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.title = 'Excluir bookmark';
                    deleteBtn.dataset.urlToDelete = link.url;
                    deleteBtn.dataset.categoryName = category.name;

                    bookmarkItem.appendChild(bookmarkNameSpan);
                    bookmarkItem.appendChild(deleteBtn);
                    bookmarksGridDiv.appendChild(bookmarkItem);

                    bookmarkItem.addEventListener('dragstart', function(event) {
                        const bookmarkDataToDrag = {
                            url: link.url, name: link.name, originalCategoryName: category.name
                        };
                        event.dataTransfer.setData('application/json-bookmark', JSON.stringify(bookmarkDataToDrag));
                        event.dataTransfer.effectAllowed = 'move';
                        event.currentTarget.classList.add('dragging');
                        event.stopPropagation(); 
                    });

                    bookmarkItem.addEventListener('dragend', function(event) {
                        event.currentTarget.classList.remove('dragging');
                        removePlaceholder(); 
                    });
                });
            }
            categoryDiv.appendChild(bookmarksGridDiv);
            contentArea.appendChild(categoryDiv);
        });
    }

    function handleDeleteBookmark(urlToDelete, categoryNameToDeleteFrom) {
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

    loadBookmarks(function(loadedData) {
        if (loadedData) {
            currentBookmarks = loadedData;
        } else {
            currentBookmarks = defaultBookmarkCategories;
            saveBookmarks(currentBookmarks); 
        }
        renderBookmarks(currentBookmarks);

        if (contentArea) {
            contentArea.addEventListener('click', function(event) {
                if (event.target.classList.contains('test-delete-button-x')) {
                    const urlToDelete = event.target.dataset.urlToDelete;
                    const categoryName = event.target.dataset.categoryName;
                    if (urlToDelete && categoryName) {
                        handleDeleteBookmark(urlToDelete, categoryName);
                    } else {
                        console.error("Dataset para exclusão incompleto no botão.");
                    }
                }
            });
        } else {
            console.error("Elemento 'content-area' não encontrado para listener de exclusão.");
        }
    });

}); // Fim do DOMContentLoaded