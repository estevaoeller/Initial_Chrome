const ROOT_FOLDER_NAME = 'Pagina Inicial';

function getRootFolder(callback) {
  chrome.bookmarks.getTree(function(nodes) {
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
  getRootFolder(folder => {
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
        break: 'Pausa finalizada! ☕'
      };
      const messages = {
        work: 'Ótimo trabalho! Tire um momento para descansar.',
        break: 'Pronto para começar outra sessão de foco?'
      };

      chrome.notifications.create('pomodoro-notification', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: titles[mode] || 'Pomodoro Timer',
        message: messages[mode] || 'Seu timer acabou.',
        priority: 2,
        requireInteraction: true // Keep notification until user dismisses
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
  'cdn.jsdelivr.net'
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if target is a cacheable favicon host
  if (CACHEABLE_HOSTS.includes(url.hostname)) {
    // Specifically filter to make sure it's an icon request
    const isGoogleFavicon = url.hostname === 'www.google.com' && url.pathname.startsWith('/s2/favicons');
    const isSimpleIcon = url.hostname === 'cdn.simpleicons.org';
    const isJsDelivrIcon = url.hostname === 'cdn.jsdelivr.net' && (
      url.pathname.includes('/devicon') || 
      url.pathname.includes('/dashboard-icons')
    );

    if (isGoogleFavicon || isSimpleIcon || isJsDelivrIcon) {
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(() => {
              return new Response('', { status: 404 });
            });
          });
        })
      );
    }
  }
});
