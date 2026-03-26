// js/script.js (versão final limpa)
import {
    loadBookmarksFromChrome,
    addBookmarkToChrome,
    applyTheme,
    toggleTheme,
    updateClock,
    updateDate,
    updateCalendar,
    loadSpacesFromChrome,
    loadGroupsFromSpace,
    createSpace,
    deleteSpace,
    checkAndMigrateToSpaces,
    getRandomSpaceIcon,
    updateDigitalClock,
    updateGreeting,
    updateWeather,
    manageWallpaper,
    loadCustomIcons,
    saveCustomIconProps,
    updateBookmarkFull
} from './modules.js';
import {
    loadSettings,
    applyIconSizeSetting,
    applyIconAppearance,
    applyIconSpacingSetting,
    applyBookmarkMinWidthSetting,
    applyIconGapSetting,
    applyCategoryGapSetting,
    applyIconLayoutSetting,
    applyNameDisplaySetting,
    applyTextBehaviorSetting,
    applySidebarWidthSetting,
    applyBookmarkFontSettings,
    applyBackgroundFilter,
    applyLayoutMode,
    applySectionAppearance
} from './settings-handlers.js';
import { renderBookmarks } from './bookmark-renderer.js';

document.addEventListener('DOMContentLoaded', function () {
    // ---- CONSTANTES E VARIÁVEIS ----
    const contentArea = document.getElementById('content-area');
    const analogClockPlaceholder = document.getElementById('analog-clock-placeholder');
    const digitalClockPlaceholder = document.getElementById('digital-clock-placeholder');
    const greetingPlaceholder = document.getElementById('greeting-placeholder');
    const weatherWidget = document.getElementById('weather-widget');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');
    const datePlaceholder = document.getElementById('date-placeholder');
    const calendarPlaceholder = document.getElementById('calendar-placeholder');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const settingsBtn = document.getElementById('settings-btn');

    // Sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const spacesList = document.getElementById('spaces-list');
    const addSpaceBtn = document.getElementById('add-space-btn');

    const defaultBookmarkCategories = [
        { name: 'IA', links: [{ name: 'ChatGPT', url: 'https://chat.openai.com/' }, { name: 'Gemini', url: 'https://gemini.google.com/' }] },
        { name: 'News', links: [{ name: 'Google News', url: 'https://news.google.com/' }] },
        { name: 'Ferramentas', links: [{ name: 'Photopea', url: 'https://www.photopea.com/' }] }
    ];
    let currentBookmarks = [];
    let currentSpaces = [];
    let activeSpaceId = null;

    const settingsState = {
        iconSize: 32,
        iconBorderRadius: 6,
        iconBorderColor: '#ddd',
        iconBgColor: '#fff',
        iconSpacing: 8,
        iconGap: 8,
        categoryGap: 20,
        bookmarkFontFamily: 'sans-serif',
        bookmarkFontSize: 14,
        bookmarkFontColor: '#333333',
        bookmarkMinWidth: 100,
        filterColor: '#000000',
        filterOpacity: 0.3,
        iconLayout: 'row', // New
        nameDisplay: 'always', // New
        textBehavior: 'truncate', // New
        themePreset: 'light',
        lastActiveSpace: null,
        sidebarCollapsed: false,
        sidebarWidth: 200
    };

    // ---- SIDEBAR FUNCTIONS ----
    function renderSpacesList(spaces) {
        if (!spacesList) return;
        spacesList.innerHTML = '';
        spaces.forEach(space => {
            const spaceItem = document.createElement('button');
            spaceItem.className = 'space-item';
            if (space.id === activeSpaceId) {
                spaceItem.classList.add('active');
            }
            spaceItem.dataset.spaceId = space.id;
            spaceItem.innerHTML = `
                <span class="space-icon">${space.icon}</span>
                <span class="space-name">${space.name}</span>
            `;
            spaceItem.addEventListener('click', () => selectSpace(space.id));
            spacesList.appendChild(spaceItem);
        });
    }

    function selectSpace(spaceId) {
        activeSpaceId = spaceId;
        // Update active class
        document.querySelectorAll('.space-item').forEach(item => {
            item.classList.toggle('active', item.dataset.spaceId === spaceId);
        });
        // Load groups from this space
        loadCustomIcons(customIcons => {
            loadGroupsFromSpace(spaceId, groups => {
                currentBookmarks = groups;
                const stateHelpers = {
                    spaceId: spaceId,
                    getBookmarks: () => currentBookmarks,
                    setBookmarks: (newVal) => { currentBookmarks = newVal; },
                    customIcons: customIcons
                };
                renderBookmarks(currentBookmarks, contentArea, settingsState.iconSize, stateHelpers);
            });
        });
        // Save to settings
        chrome.storage.sync.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            settings.lastActiveSpace = spaceId;
            chrome.storage.sync.set({ extensionSettings: settings });
        });
    }

    function toggleSidebar() {
        if (!sidebar) return;
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        if (sidebarToggle) {
            sidebarToggle.textContent = isCollapsed ? '▶' : '◀';
        }
        // Save state
        chrome.storage.sync.get(['extensionSettings'], result => {
            const settings = result.extensionSettings || {};
            settings.sidebarCollapsed = isCollapsed;
            chrome.storage.sync.set({ extensionSettings: settings });
        });
    }

    function handleAddSpace() {
        const name = prompt('Nome do novo espaço:');
        if (!name || !name.trim()) return;
        const icon = getRandomSpaceIcon();
        createSpace(name.trim(), icon, newSpace => {
            if (newSpace) {
                currentSpaces.push(newSpace);
                renderSpacesList(currentSpaces);
                selectSpace(newSpace.id);
            }
        });
    }

    // ---- FUNÇÃO PRINCIPAL ----
    function initialize() {
        // First, check if migration is needed
        checkAndMigrateToSpaces(migrated => {
            if (migrated) {
                console.log('Migração realizada! Recarregando espaços...');
            }

            // Load spaces
            loadSpacesFromChrome(spaces => {
                currentSpaces = spaces;
                renderSpacesList(spaces);

                if (spaces.length > 0) {
                    // Select last active space or first one
                    const targetSpaceId = settingsState.lastActiveSpace && spaces.find(s => s.id === settingsState.lastActiveSpace)
                        ? settingsState.lastActiveSpace
                        : spaces[0].id;
                    selectSpace(targetSpaceId);
                } else {
                    // No spaces exist yet - create default "Home" space
                    createSpace('Home', '🏠', newSpace => {
                        if (newSpace) {
                            currentSpaces = [newSpace];
                            renderSpacesList(currentSpaces);
                            selectSpace(newSpace.id);
                        }
                    });
                }
            });
        });

        // Sidebar toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }

        // Add space button
        if (addSpaceBtn) {
            addSpaceBtn.addEventListener('click', handleAddSpace);
        }

        // Restore sidebar state
        if (settingsState.sidebarCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            if (sidebarToggle) sidebarToggle.textContent = '▶';
        }

        // Inicialização de outros componentes
        chrome.storage.sync.get(['extensionSettings', 'theme'], result => {
            const settings = result.extensionSettings || {};
            let theme = settings.themePreset;
            if (!theme && result.theme && ['light', 'dark'].includes(result.theme)) {
                theme = result.theme;
                settings.themePreset = theme;
                chrome.storage.sync.set({ extensionSettings: settings }, () => {
                    chrome.storage.sync.remove('theme');
                });
            }
            theme = theme || 'light';
            settingsState.themePreset = theme;
            applyTheme(theme);
        });

        // Initialize Widgets
        if (settingsState.clockStyle === 'digital') {
            analogClockPlaceholder.style.display = 'none';
            digitalClockPlaceholder.style.display = 'block';
            updateDigitalClock(digitalClockPlaceholder);
            setInterval(() => updateDigitalClock(digitalClockPlaceholder), 1000);
        } else {
            analogClockPlaceholder.style.display = 'block';
            digitalClockPlaceholder.style.display = 'none';
            updateClock(analogClockPlaceholder);
            setInterval(() => updateClock(analogClockPlaceholder), 1000);
        }

        updateGreeting(greetingPlaceholder, settingsState.userName);
        // Refresh greeting smoothly every 10 min
        setInterval(() => updateGreeting(greetingPlaceholder, settingsState.userName), 600000);

        if (settingsState.weatherCity) {
            updateWeather(weatherWidget, weatherIcon, weatherTemp, settingsState.weatherCity);
            // Refresh weather every 30 mins
            setInterval(() => updateWeather(weatherWidget, weatherIcon, weatherTemp, settingsState.weatherCity), 1800000);
        }

        manageWallpaper(settingsState);
        const nextWallpaperBtn = document.getElementById('next-wallpaper-btn');
        if (nextWallpaperBtn) {
            nextWallpaperBtn.addEventListener('click', (e) => {
                e.preventDefault();
                manageWallpaper(settingsState, true);
            });
        }
        if (datePlaceholder) {
            updateDate(datePlaceholder);
            setInterval(() => updateDate(datePlaceholder), 60000);
        }
        if (calendarPlaceholder) {
            updateCalendar(calendarPlaceholder);
            setInterval(() => updateCalendar(calendarPlaceholder), 3600000);
        }

        // ---- QUICK LINKS LOGIC ----
        const quickLinksBar = document.getElementById('quick-links-bar');
        const DEFAULT_QUICK_LINKS = [
            { name: 'Gmail', url: 'https://mail.google.com' },
            { name: 'Contatos', url: 'https://contacts.google.com/' },
            { name: 'Calendar', url: 'https://calendar.google.com' },
            { name: 'Drive', url: 'https://drive.google.com/drive/u/0/home' },
            { name: 'YouTube', url: 'https://www.youtube.com' },
            { name: 'YTMusic', url: 'https://music.youtube.com/' },
            { name: 'GNews', url: 'https://news.google.com/' },
            { name: 'GFinance', url: 'https://www.google.com/finance/' }
        ];

        function renderQuickLinks(links) {
            if (!quickLinksBar) return;
            quickLinksBar.innerHTML = '';
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.name;
                a.className = 'quick-link';
                // Try to open in same tab or new tab? Normally quick links open in same tab or new tab.
                // User didn't specify. Google's links open in same tab usually.
                // But this is a new tab page. Opening in same tab navigates away. New tab is better?
                // Or same tab is fine. Let's stick to simple href.
                quickLinksBar.appendChild(a);
            });
        }

        chrome.storage.sync.get(['quickLinks'], result => {
            if (result.quickLinks && result.quickLinks.length > 0) {
                renderQuickLinks(result.quickLinks);
            } else {
                renderQuickLinks(DEFAULT_QUICK_LINKS);
                chrome.storage.sync.set({ quickLinks: DEFAULT_QUICK_LINKS });
            }
        });

        // Load Font Size & Section Styles
        chrome.storage.sync.get(['extensionSettings'], res => {
            const settings = res.extensionSettings || {};
            if (settings.quickLinksSize) {
                document.documentElement.style.setProperty('--quick-links-size', settings.quickLinksSize + 'px');
            }
            if (settings.sectionPadding) {
                document.documentElement.style.setProperty('--section-padding', settings.sectionPadding + 'px');
            }
            if (settings.sectionBgColor) {
                document.documentElement.style.setProperty('--section-bg-color', settings.sectionBgColor);
            }
            if (settings.sectionLineColor) {
                document.documentElement.style.setProperty('--section-line-color', settings.sectionLineColor);
            }
        });

        // Real-time Updates
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                if (changes.quickLinks) {
                    renderQuickLinks(changes.quickLinks.newValue || []);
                }
                if (changes.extensionSettings) {
                    const newSettings = changes.extensionSettings.newValue;
                    if (newSettings) {
                        if (newSettings.quickLinksSize) {
                            document.documentElement.style.setProperty('--quick-links-size', newSettings.quickLinksSize + 'px');
                        }
                        if (newSettings.sectionPadding) {
                            document.documentElement.style.setProperty('--section-padding', newSettings.sectionPadding + 'px');
                        }
                        if (newSettings.sectionBgColor) {
                            document.documentElement.style.setProperty('--section-bg-color', newSettings.sectionBgColor);
                        }
                        if (newSettings.sectionLineColor) {
                            document.documentElement.style.setProperty('--section-line-color', newSettings.sectionLineColor);
                        }
                    }
                }
            }
        });

        // Setup Edit Modal Events
        setupEditModal();
    }

    // ---- EDIT MODAL LOGIC ----
    function setupEditModal() {
        const modal = document.getElementById('edit-link-modal');
        if (!modal) return;

        const closeBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-link-btn');
        const saveBtn = document.getElementById('save-link-btn');

        const inputName = document.getElementById('edit-link-name');
        const inputUrl = document.getElementById('edit-link-url');
        const tabBtns = document.querySelectorAll('.icon-tab-btn');
        const tabContents = document.querySelectorAll('.icon-tab-content');

        const previewFavicon = document.getElementById('preview-favicon');
        const previewName = document.getElementById('preview-name');

        const gallerySource = document.getElementById('gallery-source');
        const gallerySearch = document.getElementById('gallery-search');

        const gallerySimpleiconsSettings = document.getElementById('gallery-simpleicons-settings');
        const simpleColor = document.getElementById('edit-icon-color');
        const simpleColorHex = document.getElementById('edit-icon-color-hex');

        const galleryTechiconsSettings = document.getElementById('gallery-techicons-settings');
        const techColored = document.getElementById('techicon-colored');

        const galleryDashboardiconsSettings = document.getElementById('gallery-dashboardicons-settings');

        const customUrl = document.getElementById('custom-icon-url');

        let currentActiveTab = 'auto'; // auto, gallery, custom
        let currentEditingLink = null;
        let currentStateHelpers = null; // Para poder chamar renderBookmarks() e ter customIcons

        // --- Tab Switching ---
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                currentActiveTab = btn.dataset.tab;
                document.getElementById(`tab-${currentActiveTab}`).style.display = 'block';
                updatePreview();
            });
        });

        // --- Live Preview Updates ---
        const updatePreview = () => {
            if (!currentEditingLink) return;
            const size = currentStateHelpers ? currentStateHelpers.iconSize || settingsState.iconSize : 32;
            previewName.textContent = inputName.value || 'Nome do Link';

            if (currentActiveTab === 'auto') {
                const url = inputUrl.value || currentEditingLink.url;
                try {
                    const parsed = new URL(url);
                    previewFavicon.src = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=${size}`;
                } catch (e) {
                    previewFavicon.src = '';
                }
            } else if (currentActiveTab === 'gallery') {
                const val = gallerySearch.value.trim().toLowerCase().replace(/\s+/g, '');
                const source = gallerySource.value;
                if (val) {
                    if (source === 'simpleicons') {
                        const color = simpleColor.value.replace('#', '');
                        previewFavicon.src = `https://cdn.simpleicons.org/${val}/${color}`;
                    } else if (source === 'techicons') {
                        const suffix = techColored.checked ? 'original' : 'plain';
                        previewFavicon.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${val}/${val}-${suffix}.svg`;
                    } else if (source === 'dashboardicons') {
                        previewFavicon.src = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${val}.svg`;
                    }
                } else {
                    previewFavicon.src = '';
                }
            } else if (currentActiveTab === 'custom') {
                previewFavicon.src = customUrl.value || '';
            }
        };

        // --- Gallery Dynamic Settings Toggling ---
        const updateGallerySettingsVisibility = () => {
            const source = gallerySource.value;
            gallerySimpleiconsSettings.style.display = source === 'simpleicons' ? 'block' : 'none';
            galleryTechiconsSettings.style.display = source === 'techicons' ? 'flex' : 'none';
            galleryDashboardiconsSettings.style.display = source === 'dashboardicons' ? 'block' : 'none';
            updatePreview();
        };

        gallerySource.addEventListener('change', updateGallerySettingsVisibility);

        inputName.addEventListener('input', updatePreview);
        inputUrl.addEventListener('input', updatePreview);
        gallerySearch.addEventListener('input', updatePreview);
        customUrl.addEventListener('input', updatePreview);
        techColored.addEventListener('change', updatePreview);

        simpleColor.addEventListener('input', (e) => {
            simpleColorHex.textContent = e.target.value;
            updatePreview();
        });

        // --- Listen to global event ---
        window.addEventListener('openEditModal', (e) => {
            const { link, stateHelpers } = e.detail;
            currentEditingLink = link;
            currentStateHelpers = stateHelpers;

            // Load values
            inputName.value = link.name;
            inputUrl.value = link.url;

            // Load custom icon if exists
            const customIcons = stateHelpers.customIcons || {};
            const iconData = customIcons[link.url];

            if (iconData) {
                if (iconData.type === 'simpleicons' || iconData.type === 'techicons' || iconData.type === 'dashboardicons') {
                    currentActiveTab = 'gallery';
                    gallerySource.value = iconData.type;
                    gallerySearch.value = iconData.value;
                    if (iconData.type === 'simpleicons') {
                        simpleColor.value = iconData.color || '#ffffff';
                        simpleColorHex.textContent = simpleColor.value;
                    } else if (iconData.type === 'techicons') {
                        techColored.checked = iconData.color !== 'plain';
                    }
                } else if (iconData.type === 'custom') {
                    currentActiveTab = 'custom';
                    customUrl.value = iconData.value;
                }
            } else {
                currentActiveTab = 'auto';
                gallerySource.value = 'simpleicons';
                gallerySearch.value = link.name ? link.name.toLowerCase().replace(/\s+/g, '') : '';
                simpleColor.value = '#ffffff';
                simpleColorHex.textContent = '#ffffff';
                techColored.checked = true;
                customUrl.value = '';
            }

            updateGallerySettingsVisibility();

            // Sync Tabs UI
            tabBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.tab === currentActiveTab);
            });
            tabContents.forEach(c => {
                c.style.display = c.id === `tab-${currentActiveTab}` ? 'block' : 'none';
            });

            updatePreview();

            // Show modal
            modal.style.display = 'flex';
            // slight delay to allow display flow before adding class for animation
            setTimeout(() => modal.classList.add('show'), 10);
        });

        // --- Close Logic ---
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
            currentEditingLink = null;
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(); // Click outside
        });

        // --- Save Logic ---
        saveBtn.addEventListener('click', () => {
            if (!currentEditingLink) return;

            const newName = inputName.value.trim() || currentEditingLink.name;
            const newUrl = inputUrl.value.trim() || currentEditingLink.url;

            // Prepare Icon Data
            let iconData = null;
            if (currentActiveTab === 'gallery' && gallerySearch.value.trim()) {
                const source = gallerySource.value;
                if (source === 'simpleicons') {
                    iconData = {
                        type: 'simpleicons',
                        value: gallerySearch.value.trim().toLowerCase().replace(/\s+/g, ''),
                        color: simpleColor.value
                    };
                } else if (source === 'techicons') {
                    iconData = {
                        type: 'techicons',
                        value: gallerySearch.value.trim().toLowerCase().replace(/\s+/g, ''),
                        color: techColored.checked ? 'original' : 'plain'
                    };
                } else if (source === 'dashboardicons') {
                    iconData = {
                        type: 'dashboardicons',
                        value: gallerySearch.value.trim().toLowerCase().replace(/\s+/g, '')
                    };
                }
            } else if (currentActiveTab === 'custom' && customUrl.value.trim()) {
                iconData = {
                    type: 'custom',
                    value: customUrl.value.trim()
                };
            }

            const idKey = currentEditingLink.url; // Use URL as universal key for icons

            // Function to finish and re-render
            const finishSave = () => {
                // Modificar o link no objeto local para re-render imediato
                currentEditingLink.name = newName;
                currentEditingLink.url = newUrl;

                // Re-render
                if (currentStateHelpers) {
                    if (iconData) {
                        currentStateHelpers.customIcons[idKey] = iconData;
                    } else {
                        delete currentStateHelpers.customIcons[idKey];
                    }
                    if (currentStateHelpers.setBookmarks) currentStateHelpers.setBookmarks(currentStateHelpers.getBookmarks());

                    // Import renderBookmarks from module scope or assume it is available
                    renderBookmarks(currentStateHelpers.getBookmarks(), document.getElementById('content-area'), settingsState.iconSize, currentStateHelpers);
                }
                closeModal();
            };

            // 1. Save Icon to storage
            if (iconData) {
                saveCustomIconProps(idKey, iconData, () => {
                    // 2. Save Link changes to Chrome
                    if (currentEditingLink.id) {
                        updateBookmarkFull(currentEditingLink.id, newName, newUrl, finishSave);
                    } else {
                        finishSave();
                    }
                });
            } else {
                // Clear old icon if switched to auto
                chrome.storage.local.get("customIcons", data => {
                    const icons = data.customIcons || {};
                    if (icons[idKey]) {
                        delete icons[idKey];
                        chrome.storage.local.set({ customIcons: icons }, () => {
                            if (currentEditingLink.id) {
                                updateBookmarkFull(currentEditingLink.id, newName, newUrl, finishSave);
                            } else {
                                finishSave();
                            }
                        });
                    } else {
                        if (currentEditingLink.id) {
                            updateBookmarkFull(currentEditingLink.id, newName, newUrl, finishSave);
                        } else {
                            finishSave();
                        }
                    }
                });
            }
        });
    }

    // ---- PONTO DE ENTRADA ----
    loadSettings(settingsState, initialize);

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.extensionSettings) {
            const newSettings = changes.extensionSettings.newValue || {};
            if (newSettings.iconSize !== undefined && newSettings.iconSize !== settingsState.iconSize) {
                settingsState.iconSize = newSettings.iconSize;
                applyIconSizeSetting(settingsState.iconSize);
            }
            let updateIconAppearance = false;
            let updateSectionAppearance = false;

            if (newSettings.iconBorderRadius !== undefined && newSettings.iconBorderRadius !== settingsState.iconBorderRadius) {
                settingsState.iconBorderRadius = newSettings.iconBorderRadius;
                updateIconAppearance = true;
            }
            if (newSettings.iconBorderColor && newSettings.iconBorderColor !== settingsState.iconBorderColor) {
                settingsState.iconBorderColor = newSettings.iconBorderColor;
                updateIconAppearance = true;
            }
            if (newSettings.iconBgColor && newSettings.iconBgColor !== settingsState.iconBgColor) {
                settingsState.iconBgColor = newSettings.iconBgColor;
                updateIconAppearance = true;
            }
            if (newSettings.iconBgOpacity !== undefined && newSettings.iconBgOpacity !== settingsState.iconBgOpacity) {
                settingsState.iconBgOpacity = newSettings.iconBgOpacity;
                updateIconAppearance = true;
            }

            if (updateIconAppearance) {
                applyIconAppearance(
                    settingsState.iconBorderRadius,
                    settingsState.iconBorderColor,
                    settingsState.iconBgColor,
                    settingsState.iconBgOpacity
                );
            }

            if (newSettings.sectionPadding !== undefined && newSettings.sectionPadding !== settingsState.sectionPadding) {
                settingsState.sectionPadding = newSettings.sectionPadding;
                updateSectionAppearance = true;
            }
            if (newSettings.sectionBgColor && newSettings.sectionBgColor !== settingsState.sectionBgColor) {
                settingsState.sectionBgColor = newSettings.sectionBgColor;
                updateSectionAppearance = true;
            }
            if (newSettings.sectionBgOpacity !== undefined && newSettings.sectionBgOpacity !== settingsState.sectionBgOpacity) {
                settingsState.sectionBgOpacity = newSettings.sectionBgOpacity;
                updateSectionAppearance = true;
            }
            if (newSettings.sectionLineColor && newSettings.sectionLineColor !== settingsState.sectionLineColor) {
                settingsState.sectionLineColor = newSettings.sectionLineColor;
                updateSectionAppearance = true;
            }

            if (updateSectionAppearance) {
                applySectionAppearance(
                    settingsState.sectionPadding,
                    settingsState.sectionBgColor,
                    settingsState.sectionBgOpacity,
                    settingsState.sectionLineColor
                );
            }

            if (newSettings.iconSpacing !== undefined && newSettings.iconSpacing !== settingsState.iconSpacing) {
                settingsState.iconSpacing = newSettings.iconSpacing;
                applyIconSpacingSetting(settingsState.iconSpacing);
            }
            if (newSettings.iconGap !== undefined && newSettings.iconGap !== settingsState.iconGap) {
                settingsState.iconGap = newSettings.iconGap;
                applyIconGapSetting(settingsState.iconGap);
            }
            if (newSettings.categoryGap !== undefined && newSettings.categoryGap !== settingsState.categoryGap) {
                settingsState.categoryGap = newSettings.categoryGap;
                applyCategoryGapSetting(settingsState.categoryGap);
            }

            if (newSettings.iconLayout && newSettings.iconLayout !== settingsState.iconLayout) {
                settingsState.iconLayout = newSettings.iconLayout;
                applyIconLayoutSetting(settingsState.iconLayout);
            }

            if (newSettings.nameDisplay && newSettings.nameDisplay !== settingsState.nameDisplay) {
                settingsState.nameDisplay = newSettings.nameDisplay;
                applyNameDisplaySetting(settingsState.nameDisplay);
            }

            if (newSettings.textBehavior && newSettings.textBehavior !== settingsState.textBehavior) {
                settingsState.textBehavior = newSettings.textBehavior;
                applyTextBehaviorSetting(settingsState.textBehavior);
            }

            if (newSettings.bookmarkFontFamily && newSettings.bookmarkFontFamily !== settingsState.bookmarkFontFamily) {
                settingsState.bookmarkFontFamily = newSettings.bookmarkFontFamily;
            }
            if (newSettings.bookmarkFontSize !== undefined && newSettings.bookmarkFontSize !== settingsState.bookmarkFontSize) {
                settingsState.bookmarkFontSize = newSettings.bookmarkFontSize;
            }
            if (newSettings.bookmarkFontColor && newSettings.bookmarkFontColor !== settingsState.bookmarkFontColor) {
                settingsState.bookmarkFontColor = newSettings.bookmarkFontColor;
            }

            if (newSettings.bookmarkMinWidth !== undefined && newSettings.bookmarkMinWidth !== settingsState.bookmarkMinWidth) {
                settingsState.bookmarkMinWidth = newSettings.bookmarkMinWidth;
                applyBookmarkMinWidthSetting(settingsState.bookmarkMinWidth);
            }

            if (newSettings.filterColor && newSettings.filterColor !== settingsState.filterColor) {
                settingsState.filterColor = newSettings.filterColor;
            }
            if (newSettings.filterOpacity !== undefined && newSettings.filterOpacity !== settingsState.filterOpacity) {
                settingsState.filterOpacity = newSettings.filterOpacity;
            }

            if (newSettings.themePreset && newSettings.themePreset !== settingsState.themePreset) {
                settingsState.themePreset = newSettings.themePreset;
                applyTheme(settingsState.themePreset);

                // Auto-adjust font color for Dark/Light modes naturally (No auto-saving to avoid race conditions)
                const DARK_TEXT = '#333333';
                const LIGHT_TEXT = '#e2e8f0';

                if (settingsState.themePreset === 'dark' || settingsState.themePreset === 'solar') {
                    if (settingsState.bookmarkFontColor === DARK_TEXT) {
                        settingsState.bookmarkFontColor = LIGHT_TEXT;
                        applyBookmarkFontSettings(settingsState.bookmarkFontFamily, settingsState.bookmarkFontSize, settingsState.bookmarkFontColor);
                    }
                } else if (settingsState.themePreset === 'light' || settingsState.themePreset === 'minimal') {
                    if (settingsState.bookmarkFontColor === LIGHT_TEXT) {
                        settingsState.bookmarkFontColor = DARK_TEXT;
                        applyBookmarkFontSettings(settingsState.bookmarkFontFamily, settingsState.bookmarkFontSize, settingsState.bookmarkFontColor);
                    }
                }
            }
            if (newSettings.layoutMode && newSettings.layoutMode !== settingsState.layoutMode) {
                settingsState.layoutMode = newSettings.layoutMode;
                applyLayoutMode(settingsState.layoutMode, settingsState.columnCount);
            }
            if (newSettings.columnCount && newSettings.columnCount !== settingsState.columnCount) {
                settingsState.columnCount = newSettings.columnCount;
                applyLayoutMode(settingsState.layoutMode, settingsState.columnCount);
            }
            if (newSettings.sidebarWidth !== undefined && newSettings.sidebarWidth !== settingsState.sidebarWidth) {
                settingsState.sidebarWidth = newSettings.sidebarWidth;
                applySidebarWidthSetting(settingsState.sidebarWidth);
            }

            // Widget Reactivity
            if (newSettings.clockStyle && newSettings.clockStyle !== settingsState.clockStyle) {
                settingsState.clockStyle = newSettings.clockStyle;
                const analogClockPlaceholder = document.getElementById('analog-clock-placeholder');
                const digitalClockPlaceholder = document.getElementById('digital-clock-placeholder');
                if (settingsState.clockStyle === 'digital') {
                    analogClockPlaceholder.style.display = 'none';
                    digitalClockPlaceholder.style.display = 'block';
                    updateDigitalClock(digitalClockPlaceholder);
                } else {
                    analogClockPlaceholder.style.display = 'block';
                    digitalClockPlaceholder.style.display = 'none';
                    updateClock(analogClockPlaceholder);
                }
            }

            if (newSettings.userName !== undefined && newSettings.userName !== settingsState.userName) {
                settingsState.userName = newSettings.userName;
                const greetingPlaceholder = document.getElementById('greeting-placeholder');
                if (greetingPlaceholder) updateGreeting(greetingPlaceholder, settingsState.userName);
            }

            if (newSettings.weatherCity !== undefined && newSettings.weatherCity !== settingsState.weatherCity) {
                settingsState.weatherCity = newSettings.weatherCity;
                const weatherWidget = document.getElementById('weather-widget');
                const weatherIcon = document.getElementById('weather-icon');
                const weatherTemp = document.getElementById('weather-temp');
                if (weatherWidget && weatherIcon && weatherTemp) {
                    updateWeather(weatherWidget, weatherIcon, weatherTemp, settingsState.weatherCity);
                }
            }

            if (newSettings.wallpaperSource !== undefined && newSettings.wallpaperSource !== settingsState.wallpaperSource ||
                newSettings.wallpaperTheme !== undefined && newSettings.wallpaperTheme !== settingsState.wallpaperTheme ||
                newSettings.wallpaperFrequency !== undefined && newSettings.wallpaperFrequency !== settingsState.wallpaperFrequency) {

                settingsState.wallpaperSource = newSettings.wallpaperSource !== undefined ? newSettings.wallpaperSource : settingsState.wallpaperSource;
                settingsState.wallpaperTheme = newSettings.wallpaperTheme !== undefined ? newSettings.wallpaperTheme : settingsState.wallpaperTheme;
                settingsState.wallpaperFrequency = newSettings.wallpaperFrequency !== undefined ? newSettings.wallpaperFrequency : settingsState.wallpaperFrequency;

                manageWallpaper(settingsState);
            }

            applyIconAppearance(settingsState.iconBorderRadius, settingsState.iconBorderColor, settingsState.iconBgColor, settingsState.iconBgOpacity);
            applyBookmarkFontSettings(
                settingsState.bookmarkFontFamily,
                settingsState.bookmarkFontSize,
                settingsState.bookmarkFontColor
            );
            applyBackgroundFilter(settingsState.filterColor, settingsState.filterOpacity);
        }
    });
});

// Setup Sidebar Actions (Theme Toggle & Chrome Links)
function setupSidebarActions() {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const themes = ['light', 'dark', 'solar', 'minimal'];

            // Determine current theme from body class
            const currentClass = Array.from(document.body.classList).find(c => c.endsWith('-theme'));
            const current = currentClass ? currentClass.replace('-theme', '') : 'light';

            const nextIndex = (themes.indexOf(current) + 1) % themes.length;
            const nextTheme = themes[nextIndex];

            // Update Storage (Listener will handle UI update)
            chrome.storage.sync.get(['extensionSettings'], res => {
                const s = res.extensionSettings || {};
                s.themePreset = nextTheme;
                chrome.storage.sync.set({ extensionSettings: s });
            });
        });
    }

    // Settings Button (Custom Size) - Replacer to ensure dimensions
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

        newSettingsBtn.addEventListener('click', () => {
            const width = Math.round(window.screen.availWidth * 0.35);
            const height = Math.round(window.screen.availHeight * 0.8);
            const left = Math.round((window.screen.availWidth - width) / 2);
            const top = Math.round((window.screen.availHeight - height) / 2);

            chrome.windows.create({
                url: 'settings.html',
                type: 'popup',
                width: width,
                height: height,
                left: left,
                top: top
            });
        });
    }

    // Chrome Shortcuts
    const shortcuts = {
        'chrome-bookmarks-btn': 'chrome://bookmarks',
        'chrome-history-btn': 'chrome://history',
        'chrome-downloads-btn': 'chrome://downloads'
    };

    Object.keys(shortcuts).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                chrome.tabs.create({ url: shortcuts[id] });
            });
        }
    });
}

// Call setup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarActions);
} else {
    setupSidebarActions();
}
