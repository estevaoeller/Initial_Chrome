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

