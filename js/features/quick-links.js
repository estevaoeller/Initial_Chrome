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
            { name: 'GFinance', url: 'https://www.google.com/finance/' }
        ];
    }

    init() {
        chrome.storage.sync.get(['quickLinks'], result => {
            if (result.quickLinks && result.quickLinks.length > 0) {
                this.renderQuickLinks(result.quickLinks);
            } else {
                this.renderQuickLinks(this.DEFAULT_QUICK_LINKS);
                chrome.storage.sync.set({ quickLinks: this.DEFAULT_QUICK_LINKS });
            }
        });

        // Load Initial Font Size
        chrome.storage.sync.get(['extensionSettings'], res => {
            const settings = res.extensionSettings || {};
            if (settings.quickLinksSize) {
                document.documentElement.style.setProperty('--quick-links-size', settings.quickLinksSize + 'px');
            }
        });
    }

    renderQuickLinks(links) {
        if (!this.quickLinksBar) return;
        this.quickLinksBar.innerHTML = '';
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            a.className = 'quick-link';
            this.quickLinksBar.appendChild(a);
        });
    }
}
