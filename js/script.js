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
    let placeholder = null; 


        // ----> NOVA FUNCIONALIDADE: FUNDO DINÂMICO - Variáveis e Elementos <----
        const wallpaperFolderInput = document.getElementById('wallpaper-folder-input');
        const selectWallpaperFolderBtn = document.getElementById('select-wallpaper-folder-btn');
        const backgroundFilterDiv = document.getElementById('background-filter'); 

        let wallpaperUrls = [];
        let currentWallpaperIndex = -1;
        let wallpaperIntervalId = null;
        // ----> FIM DAS VARIÁVEIS E ELEMENTOS DO FUNDO DINÂMICO <----




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
                callback(null); 
            }
        });
    }

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
                renderBookmarks(currentBookmarks); // Restaura se falhar
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
                        }
                    } else {
                        targetCategory.links.push(removedLink); 
                    }
                } else {
                    targetCategory.links.push(removedLink); 
                }
            } else {
                console.error("Categoria de destino para reordenar não encontrada:", targetCategoryName);
                if (originalCategory && removedLink) { 
                    originalCategory.links.push(removedLink); 
                }
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
                        console.warn("[renderBookmarks] URL inválida para link '" + link.name + "':", link.url);
                    }
                    bookmarkItem.target = '_blank';
                    bookmarkItem.draggable = true; 

                    // ----> MODIFICAÇÃO PARA EDIÇÃO DE NOME E FAVICON <----
                    try {
                        const domain = new URL(link.url).hostname;
                        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                        const faviconImg = document.createElement('img');
                        faviconImg.className = 'bookmark-favicon';
                        faviconImg.src = faviconUrl;
                        faviconImg.alt = '';
                        bookmarkItem.appendChild(faviconImg);
                    } catch (e) {
                        const genericFaviconPlaceholder = document.createElement('span');
                        genericFaviconPlaceholder.className = 'bookmark-favicon-placeholder';
                        genericFaviconPlaceholder.textContent = '◆'; 
                        bookmarkItem.appendChild(genericFaviconPlaceholder);
                    }

                    const bookmarkNameSpan = document.createElement('span');
                    bookmarkNameSpan.className = 'bookmark-name'; // Classe adicionada
                    bookmarkNameSpan.textContent = link.name;
                    // Guardando dados para edição
                    bookmarkNameSpan.dataset.url = link.url; 
                    bookmarkNameSpan.dataset.categoryName = category.name;
                    // Adicionando listener para edição
                    bookmarkNameSpan.addEventListener('click', handleEditBookmarkName);
                    // ----> FIM DAS MODIFICAÇÕES PARA EDIÇÃO DE NOME E FAVICON <----
                    
                    bookmarkItem.appendChild(bookmarkNameSpan);

                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'delete-bookmark-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.title = 'Excluir bookmark';
                    deleteBtn.dataset.urlToDelete = link.url;
                    deleteBtn.dataset.categoryName = category.name;
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
        console.log("Bookmarks renderizados na tela!");
    }

    // ----> NOVA FUNÇÃO: INÍCIO DA EDIÇÃO DO NOME DO BOOKMARK <----
    function handleEditBookmarkName(event) {

        event.preventDefault();  // Impede qualquer ação padrão que o clique no span possa desencadear via link pai
        event.stopPropagation(); // Impede que o evento de clique se propague para o elemento <a> pai


        const span = event.currentTarget; // O span do nome que foi clicado
        const currentBookmarkItem = span.closest('.bookmark-item');

        // Impede que outros inputs de edição sejam abertos se um já estiver ativo no mesmo item
        if (currentBookmarkItem.querySelector('input.bookmark-name-edit')) {
            return; 
        }

        const originalName = span.textContent;
        const linkUrl = span.dataset.url;
        const categoryName = span.dataset.categoryName;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'bookmark-name-edit';
        input.value = originalName;

        // Substitui o span pelo input temporariamente
        span.style.display = 'none';
        // Insere o input antes do span do botão de excluir, se ele existir, ou no final
        const deleteButtonSibling = span.parentNode.querySelector('.delete-bookmark-btn');
        if (deleteButtonSibling) {
            span.parentNode.insertBefore(input, deleteButtonSibling);
        } else {
            span.parentNode.appendChild(input);
        }
        
        input.focus();
        input.select();


        

        const finishEdit = (saveChanges) => {
            // Evita executar múltiplas vezes se o blur e o keydown ocorrerem quase ao mesmo tempo
            if (!input.parentNode) return; 

            const newName = input.value.trim();
            
            input.parentNode.removeChild(input);
            span.style.display = ''; // Reexibe o span

            if (saveChanges && newName && newName !== originalName) {
                const categoryToUpdate = currentBookmarks.find(cat => cat.name === categoryName);
                if (categoryToUpdate) {
                    const linkToUpdate = categoryToUpdate.links.find(lnk => lnk.url === linkUrl);
                    if (linkToUpdate) {
                        linkToUpdate.name = newName;
                        span.textContent = newName; 
                        saveBookmarks(currentBookmarks);
                        console.log(`Nome do bookmark '${linkUrl}' atualizado para '${newName}'`);
                    }
                }
            } else {
                span.textContent = originalName; // Restaura se não salvou
            }
        };

        const handleBlur = () => {
            finishEdit(true);
            // Remove os listeners para evitar chamadas múltiplas após o input ser removido
            input.removeEventListener('blur', handleBlur);
            input.removeEventListener('keydown', handleKeydown);
        };

        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit(true);
                input.removeEventListener('blur', handleBlur);
                input.removeEventListener('keydown', handleKeydown);
            } else if (e.key === 'Escape') {
                finishEdit(false);
                input.removeEventListener('blur', handleBlur);
                input.removeEventListener('keydown', handleKeydown);
            }
        };
        
        input.addEventListener('blur', handleBlur);
        input.addEventListener('keydown', handleKeydown);
    }
    // ----> FIM DA NOVA FUNÇÃO: INÍCIO DA EDIÇÃO DO NOME DO BOOKMARK <----


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

    // ----> NOVA FUNCIONALIDADE: FUNDO DINÂMICO - Funções <----
    function displayWallpaper(imageUrl) {
        if (backgroundFilterDiv && imageUrl) {
            backgroundFilterDiv.style.backgroundImage = `url('${imageUrl}')`;
            // Os outros estilos como background-size, position, repeat já devem estar no CSS para #background-filter
            console.log("Exibindo wallpaper:", imageUrl.substring(0,100) + "..."); 
        }
    }

    function rotateWallpaper() {
        if (wallpaperUrls.length === 0) {
            // Opcional: definir um fundo padrão se não houver wallpapers
            // backgroundFilterDiv.style.backgroundImage = 'url("icons/default-background.jpg")'; 
            // backgroundFilterDiv.style.backgroundColor = '#333'; 
            return;
        }
        let randomIndex;
        if (wallpaperUrls.length > 1) {
            do {
                randomIndex = Math.floor(Math.random() * wallpaperUrls.length);
            } while (randomIndex === currentWallpaperIndex && wallpaperUrls.length > 1); 
        } else {
            randomIndex = 0;
        }
        currentWallpaperIndex = randomIndex;
        displayWallpaper(wallpaperUrls[currentWallpaperIndex]);
    }
    // ----> FIM DA NOVA FUNCIONALIDADE: FUNDO DINÂMICO - Funções <----

        // ----> NOVA FUNCIONALIDADE: FUNDO DINÂMICO - Listeners <----
        if (selectWallpaperFolderBtn && wallpaperFolderInput && backgroundFilterDiv) {
            selectWallpaperFolderBtn.addEventListener('click', function() {
                wallpaperFolderInput.click(); 
            });

            wallpaperFolderInput.addEventListener('change', function(event) {
                const files = event.target.files;
                if (files.length > 0) {
                    wallpaperUrls.forEach(url => URL.revokeObjectURL(url)); // Limpa URLs de objeto antigas
                    wallpaperUrls = [];
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (file.type.startsWith('image/')) {
                            wallpaperUrls.push(URL.createObjectURL(file));
                        }
                    }
                    if (wallpaperUrls.length > 0) {
                        if (wallpaperIntervalId) clearInterval(wallpaperIntervalId);
                        rotateWallpaper(); // Exibe a primeira imagem
                        // Para teste rápido, use um intervalo menor:
                        // wallpaperIntervalId = setInterval(rotateWallpaper, 5000); // 5 segundos
                        wallpaperIntervalId = setInterval(rotateWallpaper, 3600000); // 1 hora
                    } else {
                        backgroundFilterDiv.style.backgroundImage = 'none'; // Limpa o fundo se nenhuma imagem for válida
                    }
                }
            });
        } else {
            console.warn("Elementos para seleção de wallpaper (input, button ou backgroundDiv) não encontrados no HTML.");
        }
        // ----> FIM DA NOVA FUNCIONALIDADE: FUNDO DINÂMICO - Listeners <----



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
                if (event.target.classList.contains('delete-bookmark-btn')) {
                    event.preventDefault();
                    event.stopPropagation(); 
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