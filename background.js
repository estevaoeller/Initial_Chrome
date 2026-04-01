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
