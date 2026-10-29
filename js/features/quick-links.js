import { resolveIconUrls, attachIconCascade } from '../icon-resolver.js';

export class QuickLinksManager {
  constructor() {
    this.quickLinksBar = document.getElementById('quick-links-bar');
    this.DEFAULT_QUICK_LINKS = [
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'Contatos', url: 'https://contacts.google.com/' },
      { name: 'Calendar', url: 'https://calendar.google.com' },
      { name: 'Drive', url: 'https://drive.google.com/drive/u/0/home' },
      { name: 'YouTube', url: 'https://www.youtube.com' },
      { name: 'YTMusic', url: 'https://music.youtube.com/' },
      { name: 'GNews', url: 'https://news.google.com/' },
      { name: 'GFinance', url: 'https://www.google.com/finance/' },
    ];
  }

  init() {
    chrome.storage.sync.get(['quickLinks', 'extensionSettings'], (result) => {
      const settings = result.extensionSettings || {};
      if (settings.quickLinksSize) {
        document.documentElement.style.setProperty(
          '--quick-links-size',
          settings.quickLinksSize + 'px',
        );
      }
      const defaultSource = settings.defaultIconSource || 'dashboardicons';
      if (result.quickLinks && result.quickLinks.length > 0) {
        this.renderQuickLinks(result.quickLinks, defaultSource);
      } else {
        this.renderQuickLinks(this.DEFAULT_QUICK_LINKS, defaultSource);
        chrome.storage.sync.set({ quickLinks: this.DEFAULT_QUICK_LINKS });
      }
    });
  }

  renderQuickLinks(links, defaultIconSource = 'dashboardicons') {
    if (!this.quickLinksBar) return;
    this.quickLinksBar.innerHTML = '';
    links.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.url;
      a.className = 'quick-link';

      const img = document.createElement('img');
      img.className = 'quick-link-icon';
      img.alt = '';
      const candidateUrls = resolveIconUrls(
        link,
        null,
        defaultIconSource,
        16,
      );
      attachIconCascade(img, candidateUrls, null, {
        url: link.url,
        source: defaultIconSource,
        isCustom: false,
      });

      const span = document.createElement('span');
      span.textContent = link.name;

      a.appendChild(img);
      a.appendChild(span);
      this.quickLinksBar.appendChild(a);
    });
  }
}
