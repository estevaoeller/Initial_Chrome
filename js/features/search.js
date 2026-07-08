import { getRootFolder, loadCustomIcons } from '../modules.js';

export class SearchManager {
  constructor() {
    this.modal = document.getElementById('search-modal');
    this.input = document.getElementById('search-input');
    this.resultsList = document.getElementById('search-results-list');
    this.noResults = document.getElementById('search-no-results');
    this.spaceFilters = document.getElementById('search-space-filters');
    this.closeBtn = document.getElementById('search-close-btn');
    this.searchBtn = document.getElementById('search-btn');

    this.allBookmarks = [];
    this.spaces = [];
    this.customIcons = {};
    this.filteredBookmarks = [];
    this.selectedIndex = 0;
    this.activeSpaceFilter = 'all';
    this.isOpen = false;
    this.isCommandMode = false;
    this.appContext = {};
  }

  init(appContext = {}) {
    this.appContext = appContext;
    if (!this.modal || !this.input) {
      console.error('Search elements not found in DOM.');
      return;
    }

    // Global Shortcuts: Ctrl+K / Cmd+K, Alt+K, or Slash (/)
    window.addEventListener('keydown', (e) => {
      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
        return;
      }

      // Alt+K (Backup)
      if (e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
        return;
      }

      // Forward slash (/) (only if not currently typing in a form input)
      if (e.key === '/' && !this.isOpen) {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        this.open();
        return;
      }

      // Close with Escape key when open
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });

    // Toggle on visual search button click (sidebar)
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.toggle());
    }

    // Close on close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close on clicking outside the modal content
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Input change event
    this.input.addEventListener('input', () => {
      this.selectedIndex = 0;
      this.performSearch();
    });

    // Keyboard navigation (while input is focused)
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Click delegation on results: close search after opening bookmark
    this.resultsList.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (item) {
        this.close();
      }
    });

    // Focus trap
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isOpen) {
        const focusables = Array.from(
          this.modal.querySelectorAll(
            'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => {
          return (
            el.offsetWidth > 0 ||
            el.offsetHeight > 0 ||
            el.getClientRects().length > 0
          );
        });
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.previouslyFocusedElement = document.activeElement;
    this.isOpen = true;
    this.modal.style.display = 'flex';
    // Add class for anims (needs a tiny delay for browser transitions)
    setTimeout(() => this.modal.classList.add('show'), 10);

    this.input.value = '';
    this.selectedIndex = 0;
    this.activeSpaceFilter = 'all';
    this.resultsList.innerHTML = '';
    this.noResults.style.display = 'none';

    this.input.focus();

    // Load data
    this.fetchBookmarksAndSpaces();
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('show');
    // Hide after animation finishes
    setTimeout(() => {
      if (!this.isOpen) {
        this.modal.style.display = 'none';
      }
    }, 300);
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  fetchBookmarksAndSpaces() {
    loadCustomIcons((customIcons) => {
      this.customIcons = customIcons || {};

      getRootFolder((root) => {
        if (!root) {
          this.renderNoBookmarksMessage();
          return;
        }

        chrome.bookmarks.getSubTree(root.id, (nodes) => {
          if (!nodes || nodes.length === 0) {
            this.renderNoBookmarksMessage();
            return;
          }

          const rootNode = nodes[0];
          const bookmarks = [];
          const spaces = [];

          if (rootNode.children) {
            rootNode.children.forEach((spaceNode) => {
              if (!spaceNode.url) {
                // Space folder
                const titleParts = spaceNode.title.match(
                  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*(.+)$/u,
                );
                let spaceIcon = '📁';
                let spaceName = spaceNode.title;
                if (titleParts) {
                  spaceIcon = titleParts[1];
                  spaceName = titleParts[2];
                }
                spaces.push({
                  id: spaceNode.id,
                  name: spaceName,
                  icon: spaceIcon,
                });

                if (spaceNode.children) {
                  spaceNode.children.forEach((groupNode) => {
                    if (!groupNode.url && groupNode.children) {
                      // Group folder
                      groupNode.children.forEach((bookmarkNode) => {
                        if (bookmarkNode.url) {
                          // Bookmark link
                          bookmarks.push({
                            id: bookmarkNode.id,
                            name: bookmarkNode.title,
                            url: bookmarkNode.url,
                            spaceId: spaceNode.id,
                            spaceName: spaceName,
                            spaceIcon: spaceIcon,
                            groupName: groupNode.title,
                            path: `${spaceIcon} ${spaceName} › ${groupNode.title}`,
                          });
                        }
                      });
                    }
                  });
                }
              }
            });
          }

          this.allBookmarks = bookmarks;
          this.spaces = spaces;

          this.renderFilters();
          this.performSearch();
        });
      });
    });
  }

  renderFilters() {
    if (!this.spaceFilters) return;
    this.spaceFilters.innerHTML = '';

    // "Todos" Filter
    const allBtn = document.createElement('button');
    allBtn.className = `search-filter-btn ${this.activeSpaceFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = '🔍 Todos';
    allBtn.addEventListener('click', () => this.setSpaceFilter('all'));
    this.spaceFilters.appendChild(allBtn);

    // Individual Spaces Filters
    this.spaces.forEach((space) => {
      const btn = document.createElement('button');
      btn.className = `search-filter-btn ${this.activeSpaceFilter === space.id ? 'active' : ''}`;
      btn.textContent = `${space.icon} ${space.name}`;
      btn.addEventListener('click', () => this.setSpaceFilter(space.id));
      this.spaceFilters.appendChild(btn);
    });
  }

  setSpaceFilter(spaceId) {
    this.activeSpaceFilter = spaceId;
    this.selectedIndex = 0;

    // Update active class on buttons
    const buttons = this.spaceFilters.querySelectorAll('.search-filter-btn');
    buttons.forEach((btn, idx) => {
      if (spaceId === 'all' && idx === 0) {
        btn.classList.add('active');
      } else if (
        spaceId !== 'all' &&
        idx > 0 &&
        this.spaces[idx - 1].id === spaceId
      ) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.performSearch();
    this.input.focus();
  }

  /* ===== COMMAND PALETTE (prefixo ">") ===== */

  saveThemePreference(theme) {
    // Persiste em sync; o storage listener do app.js aplica o tema
    // (com crossfade) em todas as abas abertas
    chrome.storage.sync.get(['extensionSettings'], (res) => {
      const s = res.extensionSettings || {};
      s.themePreset = theme;
      chrome.storage.sync.set({ extensionSettings: s });
    });
  }

  clickIfExists(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.click();
  }

  buildCommands() {
    const commands = [];

    // Trocar de espaço
    this.spaces.forEach((space) => {
      commands.push({
        icon: space.icon,
        name: `Ir para espaço: ${space.name}`,
        hint: 'Navegação',
        keywords: `espaco espaço space ir ${space.name.toLowerCase()}`,
        run: () => {
          const sidebar = this.appContext.sidebarManager;
          if (sidebar) sidebar.selectSpace(space.id);
        },
      });
    });

    // Temas
    const themes = [
      ['auto', 'Tema: Auto (segue o sistema)'],
      ['light', 'Tema: Claro'],
      ['dark', 'Tema: Escuro'],
      ['solar', 'Tema: Solar'],
      ['minimal', 'Tema: Minimal'],
    ];
    themes.forEach(([value, label]) => {
      commands.push({
        icon: '🎨',
        name: label,
        hint: 'Aparência',
        keywords: `tema theme ${value} ${label.toLowerCase()}`,
        run: () => this.saveThemePreference(value),
      });
    });

    // Ações
    commands.push(
      {
        icon: '➕',
        name: 'Novo Bookmark',
        hint: 'Alt+N',
        keywords: 'novo bookmark adicionar link favorito criar new',
        run: () => {
          const shortcuts = this.appContext.shortcutsManager;
          if (shortcuts) shortcuts.addBookmarkFlow();
        },
      },
      {
        icon: '📁',
        name: 'Novo Grupo',
        hint: 'Alt+G',
        keywords: 'novo grupo categoria pasta criar new group',
        run: () => {
          const btn = document.querySelector('.new-group-btn');
          if (btn) btn.click();
        },
      },
      {
        icon: '🧘',
        name: 'Alternar Modo Zen',
        hint: 'Alt+Z',
        keywords: 'zen foco focus modo distração',
        run: () => this.clickIfExists('zen-mode-btn'),
      },
      {
        icon: '⚙️',
        name: 'Abrir Configurações',
        hint: 'Alt+,',
        keywords: 'configurações settings opções ajustes',
        run: () => this.clickIfExists('settings-btn'),
      },
      {
        icon: '🖼️',
        name: 'Próximo Wallpaper',
        hint: 'Unsplash',
        keywords: 'wallpaper papel de parede fundo próximo trocar imagem',
        run: () => this.clickIfExists('next-wallpaper-btn'),
      },
      {
        icon: '⌨️',
        name: 'Atalhos de Teclado',
        hint: 'Alt+/',
        keywords: 'atalhos teclado shortcuts ajuda help guia',
        run: () => this.clickIfExists('shortcuts-btn'),
      },
      {
        icon: '📑',
        name: 'Bookmarks do Chrome',
        hint: 'chrome://bookmarks',
        keywords: 'bookmarks favoritos chrome gerenciador',
        run: () => this.clickIfExists('chrome-bookmarks-btn'),
      },
      {
        icon: '🕘',
        name: 'Histórico do Chrome',
        hint: 'chrome://history',
        keywords: 'histórico history chrome',
        run: () => this.clickIfExists('chrome-history-btn'),
      },
      {
        icon: '⬇️',
        name: 'Downloads do Chrome',
        hint: 'chrome://downloads',
        keywords: 'downloads chrome baixados',
        run: () => this.clickIfExists('chrome-downloads-btn'),
      },
    );

    return commands;
  }

  performSearch() {
    const rawValue = this.input.value;
    const commandMode = rawValue.trimStart().startsWith('>');
    this.isCommandMode = commandMode;

    // Filtros de espaço não se aplicam a comandos
    if (this.spaceFilters) {
      this.spaceFilters.style.display = commandMode ? 'none' : '';
    }

    if (commandMode) {
      const query = rawValue.trimStart().slice(1).trim().toLowerCase();
      const commands = this.buildCommands();
      this.filteredBookmarks = query
        ? commands.filter(
            (cmd) =>
              cmd.name.toLowerCase().includes(query) ||
              cmd.keywords.includes(query),
          )
        : commands;
      this.renderCommandResults(query);
      return;
    }

    const query = rawValue.trim().toLowerCase();

    // 1. Filter by Space
    let list = this.allBookmarks;
    if (this.activeSpaceFilter !== 'all') {
      list = list.filter((bm) => bm.spaceId === this.activeSpaceFilter);
    }

    // 2. Filter by search query
    if (query) {
      this.filteredBookmarks = list.filter(
        (bm) =>
          bm.name.toLowerCase().includes(query) ||
          bm.url.toLowerCase().includes(query),
      );
    } else {
      // If query is empty, show all in current space filter
      this.filteredBookmarks = list;
    }

    this.renderResults(query);
  }

  renderCommandResults(query) {
    this.resultsList.innerHTML = '';

    if (this.filteredBookmarks.length === 0) {
      this.noResults.textContent = 'Nenhum comando encontrado.';
      this.noResults.style.display = 'block';
      return;
    }

    this.noResults.style.display = 'none';

    this.filteredBookmarks.forEach((cmd, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `search-result-item search-command-item ${index === this.selectedIndex ? 'selected' : ''}`;
      item.dataset.index = index;

      const icon = document.createElement('span');
      icon.className = 'search-command-icon';
      icon.textContent = cmd.icon;

      const details = document.createElement('div');
      details.className = 'search-result-details';

      const title = document.createElement('div');
      title.className = 'search-result-title';
      title.innerHTML = this.highlightText(cmd.name, query);

      const path = document.createElement('div');
      path.className = 'search-result-path';
      path.textContent = cmd.hint || 'Comando';

      details.appendChild(title);
      details.appendChild(path);

      item.appendChild(icon);
      item.appendChild(details);

      item.addEventListener('click', () => {
        // Roda o comando DEPOIS que o modal fechou e devolveu o foco —
        // comandos que abrem input/modal próprios precisam ficar com o foco
        setTimeout(() => cmd.run(), 60);
        // close() já é chamado pela delegação de clique do resultsList
      });

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelectionVisuals();
      });

      this.resultsList.appendChild(item);
    });

    this.scrollToSelected();
  }

  renderResults(query) {
    this.resultsList.innerHTML = '';

    if (this.filteredBookmarks.length === 0) {
      this.noResults.textContent = 'Nenhum bookmark encontrado.';
      this.noResults.style.display = 'block';
      return;
    }

    this.noResults.style.display = 'none';

    this.filteredBookmarks.forEach((bm, index) => {
      const item = document.createElement('a');
      item.className = `search-result-item ${index === this.selectedIndex ? 'selected' : ''}`;
      item.href = bm.url;
      item.target = '_blank';
      item.dataset.index = index;

      // Favicon image element
      const favicon = document.createElement('img');
      favicon.className = 'search-result-favicon';
      favicon.src = this.getFaviconUrl(bm);
      favicon.alt = '';
      favicon.onerror = () => {
        favicon.src = 'icons/icon48.png'; // Fallback to extension icon
      };

      // Details container
      const details = document.createElement('div');
      details.className = 'search-result-details';

      // Title
      const title = document.createElement('div');
      title.className = 'search-result-title';
      title.innerHTML = this.highlightText(bm.name, query);

      // Breadcrumb path
      const path = document.createElement('div');
      path.className = 'search-result-path';
      path.innerHTML = `${bm.path} • ${this.highlightText(bm.url, query)}`;

      details.appendChild(title);
      details.appendChild(path);

      item.appendChild(favicon);
      item.appendChild(details);

      // Add hover to update selection index
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelectionVisuals();
      });

      this.resultsList.appendChild(item);
    });

    this.scrollToSelected();
  }

  getFaviconUrl(link) {
    const customIcon = this.customIcons[link.url] || this.customIcons[link.id];
    if (customIcon) {
      if (customIcon.type === 'simpleicons') {
        let colorHex = customIcon.color
          ? customIcon.color.replace('#', '')
          : 'default';
        return `https://cdn.simpleicons.org/${customIcon.value}/${colorHex}`;
      } else if (customIcon.type === 'techicons') {
        const suffix = customIcon.color === 'original' ? 'original' : 'plain';
        return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${customIcon.value}/${customIcon.value}-${suffix}.svg`;
      } else if (customIcon.type === 'dashboardicons') {
        return `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${customIcon.value}.svg`;
      } else if (customIcon.type === 'custom') {
        return customIcon.value;
      }
    }
    return `https://www.google.com/s2/favicons?domain=${link.url}&sz=32`;
  }

  highlightText(text, query) {
    if (!query) return this.escapeHtml(text);
    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeHtml(query);

    const index = escapedText.toLowerCase().indexOf(escapedQuery.toLowerCase());
    if (index === -1) return escapedText;

    const before = escapedText.slice(0, index);
    const match = escapedText.slice(index, index + escapedQuery.length);
    const after = escapedText.slice(index + escapedQuery.length);

    return `${before}<mark class="search-result-highlight">${match}</mark>${after}`;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  handleKeyDown(e) {
    if (!this.isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.filteredBookmarks.length === 0) return;
      this.selectedIndex =
        (this.selectedIndex + 1) % this.filteredBookmarks.length;
      this.updateSelectionVisuals();
      this.scrollToSelected();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.filteredBookmarks.length === 0) return;
      this.selectedIndex =
        (this.selectedIndex - 1 + this.filteredBookmarks.length) %
        this.filteredBookmarks.length;
      this.updateSelectionVisuals();
      this.scrollToSelected();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedEl = this.resultsList.querySelector(
        '.search-result-item.selected',
      );
      if (selectedEl) {
        selectedEl.click();
      }
    }
  }

  updateSelectionVisuals() {
    const items = this.resultsList.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  scrollToSelected() {
    const selectedEl = this.resultsList.querySelector(
      '.search-result-item.selected',
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  renderNoBookmarksMessage() {
    this.resultsList.innerHTML = '';
    this.noResults.textContent =
      'Nenhum espaço ou bookmark configurado no momento.';
    this.noResults.style.display = 'block';
  }
}
