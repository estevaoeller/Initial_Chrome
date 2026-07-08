export class ShortcutsManager {
  constructor(appContext) {
    this.appContext = appContext;

    this.modal = document.getElementById('shortcuts-modal');
    this.openBtn = document.getElementById('shortcuts-btn');
    this.closeBtn = document.getElementById('close-shortcuts-btn');

    this.isOpen = false;
  }

  init() {
    if (!this.modal) {
      console.error('Shortcuts modal element not found in DOM.');
      return;
    }

    // Click visual button to toggle modal
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.toggle());
    }

    // Close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Click outside content to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Global keydown listener
    window.addEventListener('keydown', (e) => {
      // Close modal with Escape key
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }

      // Detect if user is typing in a form input or editable element
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      // 1. Cheatsheet help: Alt+/ or "?" (when not typing)
      if ((e.altKey && e.key === '/') || (e.key === '?' && !isTyping)) {
        e.preventDefault();
        this.toggle();
        return;
      }

      // The following shortcuts only execute if not typing in form inputs
      if (isTyping) return;

      // 2. Open Settings: Alt + ,
      if (e.altKey && e.key === ',') {
        e.preventDefault();
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.click();
        return;
      }

      // 3. Create Group: Alt + G
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const newGroupBtn = document.querySelector('.new-group-btn');
        if (newGroupBtn) {
          newGroupBtn.click();
        } else {
          alert(
            'Por favor, certifique-se de que os favoritos estão carregados para criar um grupo.',
          );
        }
        return;
      }

      // 4. Create Bookmark: Alt + N
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.addBookmarkFlow();
        return;
      }

      // 5. Switch Spaces: Alt + 1 to Alt + 9
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const spaceNum = parseInt(e.key, 10);
        this.switchSpaceFlow(spaceNum);
        return;
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
    setTimeout(() => {
      this.modal.classList.add('show');
      if (this.closeBtn) this.closeBtn.focus();
    }, 10);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('show');
    setTimeout(() => {
      if (!this.isOpen) {
        this.modal.style.display = 'none';
      }
    }, 300);
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  switchSpaceFlow(number) {
    const index = number - 1;
    const sidebar = this.appContext.sidebarManager;
    if (sidebar && sidebar.currentSpaces && sidebar.currentSpaces[index]) {
      sidebar.selectSpace(sidebar.currentSpaces[index].id);
    } else {
      console.log(`Space #${number} not found.`);
    }
  }

  addBookmarkFlow() {
    const sidebar = this.appContext.sidebarManager;
    const activeSpaceId = sidebar ? sidebar.activeSpaceId : null;
    const groups = this.appContext.getBookmarks();

    if (!activeSpaceId) {
      alert('Nenhum espaço ativo encontrado.');
      return;
    }
    if (!groups || groups.length === 0) {
      alert(
        'Por favor, crie um grupo primeiro utilizando Alt+G antes de adicionar um bookmark.',
      );
      return;
    }

    this.openAddBookmarkModal(activeSpaceId, groups);
  }

  openAddBookmarkModal(activeSpaceId, groups) {
    const modal = document.getElementById('add-bookmark-modal');
    const urlInput = document.getElementById('add-bookmark-url');
    const nameInput = document.getElementById('add-bookmark-name');
    const groupSelect = document.getElementById('add-bookmark-group');
    const saveBtn = document.getElementById('save-add-bookmark-btn');
    const cancelBtn = document.getElementById('cancel-add-bookmark-btn');
    const closeBtn = document.getElementById('close-add-bookmark-btn');
    if (!modal || !urlInput || !nameInput || !groupSelect || !saveBtn) return;

    // Popula o select de grupos
    groupSelect.innerHTML = '';
    groups.forEach((g, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = g.name;
      groupSelect.appendChild(opt);
    });

    urlInput.value = '';
    nameInput.value = '';
    let nameTouched = false;

    const previouslyFocused = document.activeElement;

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
      if (previouslyFocused) previouslyFocused.focus();
    };

    // Autopreenche o nome a partir do hostname da URL
    const suggestName = () => {
      if (nameTouched) return;
      try {
        let url = urlInput.value.trim();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        let host = new URL(url).hostname.replace('www.', '');
        nameInput.value = host.charAt(0).toUpperCase() + host.slice(1);
      } catch {
        /* URL incompleta — ignora */
      }
    };
    urlInput.oninput = suggestName;
    nameInput.oninput = () => {
      nameTouched = nameInput.value.trim() !== '';
    };

    const save = () => {
      let url = urlInput.value.trim();
      const name = nameInput.value.trim();
      if (!url || !name) {
        urlInput.focus();
        return;
      }
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

      const selectedGroup =
        groups[parseInt(groupSelect.value, 10)] || groups[0];

      import('../modules.js').then((m) => {
        m.addBookmarkToChrome(
          activeSpaceId,
          selectedGroup.name,
          { name, url },
          (createdNode) => {
            const newItem = { name, url };
            if (createdNode) {
              newItem.id = createdNode.id;
              newItem.name = createdNode.title;
            }
            selectedGroup.links.push(newItem);
            this.appContext.setBookmarks(groups);

            import('../bookmark-renderer.js').then((r) => {
              r.renderBookmarks(
                groups,
                this.appContext.contentArea,
                this.appContext.settingsState.iconSize,
                this.appContext.stateHelpers(),
              );
            });
          },
        );
      });
      closeModal();
    };

    // Listeners "de sessão" do modal (onclick/onkeydown sobrescrevem os antigos)
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    modal.onkeydown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeModal();
      } else if (e.key === 'Enter' && e.target !== groupSelect) {
        e.preventDefault();
        save();
      }
    };
    saveBtn.onclick = save;

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('show');
      urlInput.focus();
    }, 10);
  }
}
