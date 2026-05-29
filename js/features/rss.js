export class RssManager {
  constructor() {
    this.containerEl = null;
    this.listEl = null;
    this.titleEl = null;
    this.defaultFeed = 'https://hnrss.org/frontpage'; // Hacker News default feed
  }

  init() {
    this.containerEl = document.getElementById('rss-widget');
    this.listEl = document.getElementById('rss-list');
    this.titleEl = document.getElementById('rss-title');

    if (!this.containerEl || !this.listEl) {
      console.warn('Elementos do RSS Feed não encontrados no DOM.');
      return;
    }

    // Load settings and cached items
    chrome.storage.sync.get(['rssUrl'], (syncResult) => {
      const rssUrl = syncResult.rssUrl || this.defaultFeed;

      chrome.storage.local.get(['cachedRssData'], (localResult) => {
        const cache = localResult.cachedRssData;
        const now = Date.now();

        // If cache exists and is fresh (less than 15 minutes old), render cache
        if (
          cache &&
          cache.url === rssUrl &&
          now - cache.timestamp < 15 * 60 * 1000
        ) {
          this.render(cache.items, cache.feedTitle);
          // Also trigger background fetch to keep it warm, but don't block
          this.fetchFeed(rssUrl, false);
        } else {
          // Cache missed or expired
          if (cache && cache.url === rssUrl) {
            // Render stale cache first for speed, then update
            this.render(cache.items, cache.feedTitle);
          }
          this.fetchFeed(rssUrl, true);
        }
      });
    });
  }

  async fetchFeed(url, updateUi = true) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const xmlText = await response.text();
      const parser = new window.DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) throw new Error('XML parsing error');

      const channelTitle =
        xmlDoc.querySelector('channel > title')?.textContent || 'RSS Feed';
      const items = Array.from(xmlDoc.querySelectorAll('item'))
        .slice(0, 5)
        .map((itemNode) => {
          return {
            title: itemNode.querySelector('title')?.textContent || 'Sem título',
            link: itemNode.querySelector('link')?.textContent || '#',
            date: itemNode.querySelector('pubDate')?.textContent || '',
          };
        });

      // Cache data
      chrome.storage.local.set({
        cachedRssData: {
          url: url,
          feedTitle: channelTitle,
          items: items,
          timestamp: Date.now(),
        },
      });

      if (updateUi) {
        this.render(items, channelTitle);
      }
    } catch (error) {
      console.error('Erro ao buscar ou processar feed RSS:', error);
      if (updateUi && this.listEl.children.length === 0) {
        this.listEl.innerHTML = `<div class="rss-error">Falha ao carregar o feed RSS. Verifique o link nas configurações.</div>`;
      }
    }
  }

  render(items, feedTitle) {
    if (this.titleEl) {
      this.titleEl.textContent = `📰 Feed: ${feedTitle}`;
    }

    this.listEl.innerHTML = '';

    if (!items || items.length === 0) {
      this.listEl.innerHTML = `<div class="rss-empty">Nenhuma notícia encontrada.</div>`;
      return;
    }

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'rss-item';

      const link = document.createElement('a');
      link.href = item.link;
      link.target = '_blank';
      link.className = 'rss-link';
      link.textContent = item.title;

      // Format date if possible
      let dateStr = '';
      if (item.date) {
        try {
          const dateObj = new Date(item.date);
          dateStr = dateObj.toLocaleDateString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          // Ignore date formatting errors
        }
      }

      const metaSpan = document.createElement('span');
      metaSpan.className = 'rss-meta';
      metaSpan.textContent = dateStr;

      li.appendChild(link);
      if (dateStr) {
        li.appendChild(metaSpan);
      }
      this.listEl.appendChild(li);
    });
  }
}
