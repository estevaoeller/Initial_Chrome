// js/modules.js

export const ROOT_FOLDER_NAME = 'Pagina Inicial';

export function saveBookmarks(bookmarksToSave) {
    chrome.storage.local.set({ 'userBookmarks': bookmarksToSave }, function () {
        if (chrome.runtime.lastError) {
            console.error("Erro ao salvar bookmarks:", chrome.runtime.lastError.message);
        } else {
            console.log("Bookmarks salvos com sucesso!");
        }
    });
}

export function loadBookmarks(callback) {
    chrome.storage.local.get('userBookmarks', function (data) {
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

export function getRootFolder(callback) {
    chrome.bookmarks.getTree(nodes => {
        const queue = [...nodes];
        while (queue.length) {
            const node = queue.shift();
            if (!node.url && node.title === ROOT_FOLDER_NAME) {
                callback(node);
                return;
            }
            if (node.children) queue.push(...node.children);
        }
        callback(null);
    });
}

export function renameBookmark(bookmarkId, newTitle, callback) {
    chrome.bookmarks.update(bookmarkId, { title: newTitle }, () => {
        if (callback) callback();
    });
}

export function loadBookmarksFromChrome(callback) {
    getRootFolder(folder => {
        if (!folder) {
            callback([]);
            return;
        }
        chrome.bookmarks.getSubTree(folder.id, nodes => {
            const categories = [];
            if (nodes[0].children) {
                nodes[0].children.forEach(catNode => {
                    if (!catNode.url) {
                        const category = { id: catNode.id, name: catNode.title, links: [] };
                        (catNode.children || []).forEach(child => {
                            if (child.url) {
                                category.links.push({ id: child.id, name: child.title, url: child.url });
                            }
                        });
                        categories.push(category);
                    }
                });
            }
            callback(categories);
        });
    });
}

// ========== SPACES FUNCTIONALITY ==========

const DEFAULT_SPACE_ICON = '📁';
const DEFAULT_SPACE_ICONS = ['🏠', '💼', '📋', '🎯', '📚', '🔧', '🎨', '🎵', '🎮', '📰'];

/**
 * Load all spaces (first-level folders inside root)
 */
export function loadSpacesFromChrome(callback) {
    getRootFolder(folder => {
        if (!folder) {
            callback([]);
            return;
        }
        chrome.bookmarks.getChildren(folder.id, children => {
            const spaces = [];
            children.forEach(child => {
                if (!child.url) {
                    // Extract icon from title if present (format: "emoji Name" or just "Name")
                    const titleParts = child.title.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*(.+)$/u);
                    let icon = DEFAULT_SPACE_ICON;
                    let name = child.title;
                    if (titleParts) {
                        icon = titleParts[1];
                        name = titleParts[2];
                    }
                    spaces.push({
                        id: child.id,
                        name: name,
                        icon: icon,
                        fullTitle: child.title
                    });
                }
            });
            callback(spaces);
        });
    });
}

/**
 * Load groups (categories) from a specific space
 */
export function loadGroupsFromSpace(spaceId, callback) {
    chrome.bookmarks.getChildren(spaceId, children => {
        const groups = [];
        children.forEach(child => {
            if (!child.url) {
                const group = { id: child.id, name: child.title, links: [] };
                chrome.bookmarks.getChildren(child.id, bookmarks => {
                    bookmarks.forEach(bm => {
                        if (bm.url) {
                            group.links.push({ id: bm.id, name: bm.title, url: bm.url });
                        }
                    });
                });
                groups.push(group);
            }
        });
        // Need to wait for all getChildren calls
        // Using a simpler approach with getSubTree
        chrome.bookmarks.getSubTree(spaceId, nodes => {
            const categories = [];
            if (nodes[0].children) {
                nodes[0].children.forEach(catNode => {
                    if (!catNode.url) {
                        const category = { id: catNode.id, name: catNode.title, links: [] };
                        (catNode.children || []).forEach(child => {
                            if (child.url) {
                                category.links.push({ id: child.id, name: child.title, url: child.url });
                            }
                        });
                        categories.push(category);
                    }
                });
            }
            callback(categories);
        });
    });
}

/**
 * Create a new space
 */
export function createSpace(name, icon, callback) {
    getRootFolder(root => {
        if (!root) {
            if (callback) callback(null);
            return;
        }
        const fullTitle = icon ? `${icon} ${name}` : name;
        chrome.bookmarks.create({ parentId: root.id, title: fullTitle }, newFolder => {
            if (callback) callback({
                id: newFolder.id,
                name: name,
                icon: icon || DEFAULT_SPACE_ICON,
                fullTitle: fullTitle
            });
        });
    });
}

/**
 * Delete a space (and all its contents)
 */
export function deleteSpace(spaceId, callback) {
    chrome.bookmarks.removeTree(spaceId, () => {
        if (callback) callback();
    });
}

/**
 * Rename a space
 */
export function renameSpace(spaceId, newName, newIcon, callback) {
    const fullTitle = newIcon ? `${newIcon} ${newName}` : newName;
    chrome.bookmarks.update(spaceId, { title: fullTitle }, () => {
        if (callback) callback();
    });
}

/**
 * Rename a group (category)
 */
export function renameGroup(groupId, newName, callback) {
    chrome.bookmarks.update(groupId, { title: newName }, () => {
        if (callback) callback();
    });
}

/**
 * Create a new group (category) inside a space
 */
export function createGroup(spaceId, groupName, callback) {
    chrome.bookmarks.create({ parentId: spaceId, title: groupName }, newGroup => {
        if (callback) callback({
            id: newGroup.id,
            name: newGroup.title,
            links: []
        });
    });
}

/**
 * Check if migration is needed (old structure -> new spaces structure)
 * Old structure: Root > Categories > Bookmarks
 * New structure: Root > Spaces > Groups > Bookmarks
 */
export function checkAndMigrateToSpaces(callback) {
    getRootFolder(root => {
        if (!root) {
            if (callback) callback(false);
            return;
        }
        chrome.bookmarks.getChildren(root.id, children => {
            // Check if any child has bookmarks directly (old structure)
            // or if all children are folders with folders inside (new structure)
            let hasDirectBookmarks = false;
            let hasGroups = false;

            const checkPromises = children.map(child => {
                return new Promise(resolve => {
                    if (child.url) {
                        hasDirectBookmarks = true;
                        resolve();
                    } else {
                        chrome.bookmarks.getChildren(child.id, grandchildren => {
                            const hasUrls = grandchildren.some(gc => gc.url);
                            if (hasUrls) {
                                hasDirectBookmarks = true;
                            }
                            const hasFolders = grandchildren.some(gc => !gc.url);
                            if (hasFolders) {
                                hasGroups = true;
                            }
                            resolve();
                        });
                    }
                });
            });

            Promise.all(checkPromises).then(() => {
                // If we have direct bookmarks but no nested groups, we need to migrate
                if (hasDirectBookmarks && !hasGroups) {
                    migrateToSpacesStructure(root.id, children, callback);
                } else {
                    if (callback) callback(false);
                }
            });
        });
    });
}

/**
 * Migrate old structure to new spaces structure
 */
function migrateToSpacesStructure(rootId, existingCategories, callback) {
    // Create "Home" space and move all existing categories into it
    chrome.bookmarks.create({ parentId: rootId, title: '🏠 Home', index: 0 }, homeSpace => {
        const movePromises = existingCategories.map(cat => {
            return new Promise(resolve => {
                chrome.bookmarks.move(cat.id, { parentId: homeSpace.id }, () => {
                    resolve();
                });
            });
        });

        Promise.all(movePromises).then(() => {
            console.log('Migration to Spaces structure complete!');
            if (callback) callback(true);
        });
    });
}

/**
 * Get a random icon for new spaces
 */
export function getRandomSpaceIcon() {
    return DEFAULT_SPACE_ICONS[Math.floor(Math.random() * DEFAULT_SPACE_ICONS.length)];
}

export function moveBookmark(bookmarkId, destinationFolderId, index, callback) {
    chrome.bookmarks.move(bookmarkId, { parentId: destinationFolderId, index: index }, () => {
        if (callback) callback();
    });
}

export function addBookmarkToChrome(spaceId, categoryName, bookmark, callback) {
    if (!spaceId) { if (callback) callback(); return; }
    chrome.bookmarks.getChildren(spaceId, children => {
        let category = children.find(c => c.title === categoryName && !c.url);
        const createBookmark = folderId => chrome.bookmarks.create({ parentId: folderId, title: bookmark.name, url: bookmark.url }, (newNode) => callback && callback(newNode));
        if (category) {
            createBookmark(category.id);
        } else {
            chrome.bookmarks.create({ parentId: spaceId, title: categoryName }, newFolder => {
                createBookmark(newFolder.id);
            });
        }
    });
}

export function removeBookmarkFromChrome(spaceId, categoryName, bookmarkUrl, callback) {
    if (!spaceId) { if (callback) callback(); return; }
    chrome.bookmarks.getChildren(spaceId, children => {
        const category = children.find(c => c.title === categoryName && !c.url);
        if (!category) { if (callback) callback(); return; }
        chrome.bookmarks.getChildren(category.id, bookmarks => {
            const bm = bookmarks.find(b => b.url === bookmarkUrl);
            if (bm) {
                chrome.bookmarks.remove(bm.id, () => callback && callback());
            } else {
                if (callback) callback();
            }
        });
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

export function handleDeleteBookmark(urlToDelete, categoryNameToDeleteFrom, currentBookmarks, renderBookmarks, spaceId) {
    const categoryIndex = currentBookmarks.findIndex(cat => cat.name === categoryNameToDeleteFrom);
    if (categoryIndex > -1) {
        const category = currentBookmarks[categoryIndex];
        const linkIndex = category.links.findIndex(link => link.url === urlToDelete);
        if (linkIndex > -1) {
            if (confirm(`Tem certeza que deseja excluir o bookmark "${category.links[linkIndex].name}"?`)) {
                removeBookmarkFromChrome(spaceId, category.name, urlToDelete, () => {
                    category.links.splice(linkIndex, 1);
                    renderBookmarks(currentBookmarks);
                });
            }
        } else {
            console.warn("Link não encontrado para exclusão no array de dados:", urlToDelete);
        }
    } else {
        console.warn("Categoria não encontrada para exclusão no array de dados:", categoryNameToDeleteFrom);
    }
}

const THEME_LIST = ["light", "dark", "solar", "minimal"];
const THEME_CLASSES = THEME_LIST.map(t => `${t}-theme`);

export function applyTheme(theme) {
    const validTheme = THEME_LIST.includes(theme) ? theme : "light";
    document.body.classList.remove(...THEME_CLASSES);
    document.body.classList.add(`${validTheme}-theme`);
}

export function toggleTheme() {
    const current = THEME_LIST.find(t => document.body.classList.contains(`${t}-theme`)) || "light";
    const next = THEME_LIST[(THEME_LIST.indexOf(current) + 1) % THEME_LIST.length];
    applyTheme(next);
    chrome.storage.sync.get(["extensionSettings"], data => {
        const settings = data.extensionSettings || {};
        settings.themePreset = next;
        chrome.storage.sync.set({ extensionSettings: settings });
    });
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

export function updateDigitalClock(digitalClockPlaceholder) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    digitalClockPlaceholder.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function updateGreeting(greetingPlaceholder, userName) {
    if (!greetingPlaceholder) return;
    const hour = new Date().getHours();
    let greeting = 'Boa noite';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';

    greetingPlaceholder.textContent = userName ? `${greeting}, ${userName}` : greeting;
}

export async function updateWeather(weatherWidget, weatherIcon, weatherTemp, city) {
    if (!weatherWidget || !city) return;
    try {
        // Simple geocoding using Open-Meteo
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude } = geoData.results[0];
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherRes.json();

            if (weatherData.current_weather) {
                const temp = weatherData.current_weather.temperature;
                const weathercode = weatherData.current_weather.weathercode;

                // Keep it simple for weather codes
                let icon = '☁️';
                if (weathercode === 0) icon = '☀️';
                else if (weathercode >= 1 && weathercode <= 3) icon = '⛅';
                else if (weathercode >= 61 && weathercode <= 69) icon = '🌧️';
                else if (weathercode >= 71 && weathercode <= 79) icon = '❄️';
                else if (weathercode >= 95) icon = '⛈️';

                if (weatherIcon) weatherIcon.textContent = icon;
                if (weatherTemp) weatherTemp.textContent = `${temp}°C`;
                weatherWidget.style.display = 'flex';
                weatherWidget.title = `${geoData.results[0].name}: ${temp}°C`;
            }
        }
    } catch (error) {
        console.error("Falha ao buscar clima:", error);
    }
}

export async function manageWallpaper(settingsState) {
    // This will be called from script.js background logic
    const body = document.body;
    const unsplashInfoDiv = document.getElementById('unsplash-info');

    const hideUnsplashInfo = () => {
        if (unsplashInfoDiv) unsplashInfoDiv.style.display = 'none';
    };

    if (settingsState.wallpaperSource === 'none') {
        body.style.backgroundImage = 'none';
        hideUnsplashInfo();
        return;
    }

    if (settingsState.wallpaperSource === 'unsplash') {
        const theme = settingsState.wallpaperTheme || 'nature';
        const apiKey = settingsState.wallpaperApiKey || '';

        const setBackground = (url) => {
            body.style.backgroundImage = `url('${url}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundRepeat = 'no-repeat';
        };

        if (!apiKey) {
            console.warn("Unsplash API Key is missing. Crie no site e cole em configurações. Fazendo fallback para loremflickr por enquanto.");
            const seed = new Date().toDateString();
            setBackground(`https://loremflickr.com/1920/1080/${encodeURIComponent(theme)}?random=${encodeURIComponent(seed)}`);
            hideUnsplashInfo();
            return;
        }

        try {
            const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)}&orientation=landscape`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Client-ID ${apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Unsplash API Error: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.urls && data.urls.regular) {
                setBackground(data.urls.regular);

                // Show Unsplash Info
                if (unsplashInfoDiv) {
                    const linkEl = document.getElementById('unsplash-link');
                    const locEl = document.getElementById('unsplash-location');
                    const dateEl = document.getElementById('unsplash-date');
                    const viewsEl = document.getElementById('unsplash-views');
                    const userEl = document.getElementById('unsplash-user');

                    if (linkEl) linkEl.href = data.links?.html || `https://unsplash.com/photos/${data.id}`;

                    if (locEl) {
                        locEl.innerHTML = data.location?.name ? `📍 ${data.location.name}` : '';
                    }
                    if (dateEl) {
                        const dateObj = new Date(data.created_at);
                        dateEl.innerHTML = data.created_at ? `📅 ${dateObj.toLocaleDateString('pt-BR')}` : '';
                    }
                    if (viewsEl) {
                        const stats = data.views || data.downloads || data.likes || 0;
                        const label = data.views ? 'visualizações' : (data.downloads ? 'downloads' : 'curtidas');
                        viewsEl.innerHTML = stats ? `👁️ ${stats.toLocaleString('pt-BR')} ${label}` : '';
                    }
                    if (userEl) {
                        userEl.innerHTML = data.user?.name ? `👤 ${data.user.name}` : '';
                    }

                    unsplashInfoDiv.style.display = 'block';
                }
            } else {
                throw new Error("Invalid Unsplash response format");
            }
        } catch (error) {
            console.error("Falha ao buscar Unsplash Oficial:", error);
            const seed = new Date().toDateString();
            setBackground(`https://loremflickr.com/1920/1080/${encodeURIComponent(theme)}?random=${encodeURIComponent(seed)}`);
            hideUnsplashInfo();
        }
        return;
    }

    // Default to local folder logic which is handled in script.js interval
    hideUnsplashInfo();
}



// ========== CUSTOM ICONS LOGIC ==========
export function saveCustomIconProps(bookmarkId, iconData, callback) {
    chrome.storage.local.get("customIcons", data => {
        const customIcons = data.customIcons || {};
        customIcons[bookmarkId] = iconData;
        chrome.storage.local.set({ customIcons }, callback);
    });
}

export function loadCustomIcons(callback) {
    chrome.storage.local.get("customIcons", data => {
        callback(data.customIcons || {});
    });
}


export function updateBookmarkFull(bookmarkId, newTitle, newUrl, callback) {
    chrome.bookmarks.update(bookmarkId, { title: newTitle, url: newUrl }, () => {
        if (callback) callback();
    });
}

