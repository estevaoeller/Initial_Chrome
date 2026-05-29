const ROOT_FOLDER_NAME = 'Pagina Inicial';

function getRootFolder(callback) {
  chrome.bookmarks.getTree(function (nodes) {
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

chrome.runtime.onInstalled.addListener(() => {
  getRootFolder((folder) => {
    if (!folder) {
      chrome.bookmarks.create({ title: ROOT_FOLDER_NAME }, () => {
        if (chrome.runtime.lastError) {
          console.error('Erro ao criar pasta raiz:', chrome.runtime.lastError);
        }
      });
    }
  });
});

// --- Pomodoro Timer Background Logic ---

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroAlarm') {
    chrome.storage.local.get(['pomodoroMode'], (res) => {
      const mode = res.pomodoroMode || 'work';
      const titles = {
        work: 'Foco concluído! 🍅',
        break: 'Pausa finalizada! ☕',
      };
      const messages = {
        work: 'Ótimo trabalho! Tire um momento para descansar.',
        break: 'Pronto para começar outra sessão de foco?',
      };

      chrome.notifications.create('pomodoro-notification', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: titles[mode] || 'Pomodoro Timer',
        message: messages[mode] || 'Seu timer acabou.',
        priority: 2,
        requireInteraction: true, // Keep notification until user dismisses
      });

      // Clear active state
      chrome.storage.local.set({ pomodoroActive: false });
    });
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'pomodoro-notification') {
    chrome.tabs.create({ url: 'chrome://newtab/' });
  }
});

// --- Favicon Caching Logic ---
const CACHE_NAME = 'favicon-cache-v1';
const CACHEABLE_HOSTS = [
  'www.google.com',
  'cdn.simpleicons.org',
  'cdn.jsdelivr.net',
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if target is a cacheable favicon host
  if (CACHEABLE_HOSTS.includes(url.hostname)) {
    // Specifically filter to make sure it's an icon request
    const isGoogleFavicon =
      url.hostname === 'www.google.com' &&
      url.pathname.startsWith('/s2/favicons');
    const isSimpleIcon = url.hostname === 'cdn.simpleicons.org';
    const isJsDelivrIcon =
      url.hostname === 'cdn.jsdelivr.net' &&
      (url.pathname.includes('/devicon') ||
        url.pathname.includes('/dashboard-icons'));

    if (isGoogleFavicon || isSimpleIcon || isJsDelivrIcon) {
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                return new Response('', { status: 404 });
              });
          });
        }),
      );
    }
  }
});

// --- Context Menu for Adding Bookmarks ---

function rebuildContextMenus() {
  // Clear all first to prevent duplication
  chrome.contextMenus.removeAll(() => {
    getRootFolder((root) => {
      if (!root) return;
      // Get all child folders under root (which represent the spaces)
      chrome.bookmarks.getChildren(root.id, (children) => {
        const spaces = children.filter((c) => !c.url);
        if (spaces.length === 0) return;

        // Create parent menu item
        chrome.contextMenus.create({
          id: 'add-to-dashboard-root',
          title: 'Adicionar à Página Inicial',
          contexts: ['page', 'link'],
        });

        // Add submenus for each Space
        spaces.forEach((space) => {
          chrome.contextMenus.create({
            id: `space-${space.id}`,
            parentId: 'add-to-dashboard-root',
            title: space.title,
            contexts: ['page', 'link'],
          });
        });
      });
    });
  });
}

// Listen to context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('space-')) {
    const spaceId = info.menuItemId.replace('space-', '');
    const url = info.linkUrl || info.pageUrl || tab.url;
    const title = info.selectionText || tab.title || 'Novo Favorito';

    // Get children of the space folder to check for '📥 Inbox'
    chrome.bookmarks.getChildren(spaceId, (children) => {
      const inboxFolder = children.find(
        (c) => !c.url && c.title === '📥 Inbox',
      );

      const createBookmark = (parentId) => {
        chrome.bookmarks.create({ parentId, title, url }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Erro ao adicionar bookmark via context menu:',
              chrome.runtime.lastError,
            );
            return;
          }
          // Show a notification
          chrome.notifications.create('bookmark-added-notification', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Favorito Adicionado! 📥',
            message: `"${title}" foi adicionado com sucesso em 📥 Inbox.`,
            priority: 1,
          });
        });
      };

      if (inboxFolder) {
        createBookmark(inboxFolder.id);
      } else {
        // Create the folder first
        chrome.bookmarks.create(
          { parentId: spaceId, title: '📥 Inbox' },
          (newInbox) => {
            if (chrome.runtime.lastError) {
              console.error(
                'Erro ao criar pasta Inbox:',
                chrome.runtime.lastError,
              );
              return;
            }
            createBookmark(newInbox.id);
          },
        );
      }
    });
  }
});

// Rebuild context menu when spaces are modified in Chrome bookmarks
chrome.bookmarks.onCreated.addListener(rebuildContextMenus);
chrome.bookmarks.onRemoved.addListener(rebuildContextMenus);
chrome.bookmarks.onChanged.addListener(rebuildContextMenus);
chrome.bookmarks.onMoved.addListener(rebuildContextMenus);

// Initial build on startup/load
chrome.runtime.onInstalled.addListener(rebuildContextMenus);
rebuildContextMenus();
