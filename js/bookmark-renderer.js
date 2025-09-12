import { handleDeleteBookmark } from './modules.js';

export function renderBookmarks(bookmarks, contentArea, iconSize) {
    contentArea.innerHTML = '';
    if (!bookmarks || bookmarks.length === 0) return;

    bookmarks.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'bookmark-category';

        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = category.name;
        categoryDiv.appendChild(categoryTitle);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'bookmarks-grid';
        categoryDiv.appendChild(gridDiv);

        category.links.forEach(link => {
            const bookmarkItem = document.createElement('a');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.href = link.url;
            bookmarkItem.target = '_blank';

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-bookmark-btn';
            deleteBtn.innerHTML = '&times;';

            deleteBtn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                handleDeleteBookmark(
                    link.url,
                    category.name,
                    bookmarks,
                    updated => renderBookmarks(updated, contentArea, iconSize)
                );
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
            bookmarkItem.appendChild(deleteBtn);
            gridDiv.appendChild(bookmarkItem);
        });
        contentArea.appendChild(categoryDiv);
    });
}
