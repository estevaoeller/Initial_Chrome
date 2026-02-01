export function applyIconSizeSetting(size) {
    document.documentElement.style.setProperty('--icon-size', `${size}px`);
    document.querySelectorAll('.bookmark-favicon').forEach(img => {
        if (img.dataset.url) {
            if (size > 0) {
                img.src = `https://www.google.com/s2/favicons?domain=${img.dataset.url}&sz=${size}`;
            } else {
                img.src = '';
            }
        }
    });
}

export function applySidebarWidthSetting(width) {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
}

export function applyIconAppearance(borderRadius, borderColor, bgColor) {
    document.documentElement.style.setProperty('--icon-border-radius', `${borderRadius}px`);
    document.documentElement.style.setProperty('--icon-border-color', borderColor);
    document.documentElement.style.setProperty('--icon-bg-color', bgColor);
}

export function applyIconSpacingSetting(spacing) {
    document.documentElement.style.setProperty('--icon-spacing', `${spacing}px`);
}

export function applyBookmarkMinWidthSetting(width) {
    document.documentElement.style.setProperty('--bookmark-min-width', `${width}px`);
}

export function applyIconGapSetting(gap) {
    document.documentElement.style.setProperty('--icon-gap', `${gap}px`);
}

export function applyCategoryGapSetting(gap) {
    document.documentElement.style.setProperty('--category-gap', `${gap}px`);
}

export function applyBookmarkFontSettings(fontFamily, fontSize, fontColor) {
    document.documentElement.style.setProperty('--bookmark-font-family', fontFamily);
    document.documentElement.style.setProperty('--bookmark-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--bookmark-font-color', fontColor);
}

export function applyBackgroundFilter(color, opacity) {
    const filter = document.getElementById('background-filter');
    if (filter) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        filter.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
}

export function applyLayoutMode(mode, columnCount) {
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        if (mode === 'columns') {
            contentArea.classList.add('layout-columns');
            if (columnCount) {
                contentArea.style.setProperty('--column-count', columnCount);
            }
        } else {
            contentArea.classList.remove('layout-columns');
            contentArea.style.removeProperty('--column-count');
        }
    }
}

export function applyIconLayoutSetting(layout) {
    if (layout === 'column') {
        document.body.classList.add('icon-layout-column');
    } else {
        document.body.classList.remove('icon-layout-column');
    }
}

export function applyNameDisplaySetting(display) {
    if (display === 'hover') {
        document.body.classList.add('name-display-hover');
    } else {
        document.body.classList.remove('name-display-hover');
    }
}

export function applyTextBehaviorSetting(behavior) {
    document.body.classList.remove('text-behavior-expand', 'text-behavior-single');
    if (behavior === 'expand') {
        document.body.classList.add('text-behavior-expand');
    } else if (behavior === 'single') {
        document.body.classList.add('text-behavior-single');
    }
}

export function loadSettings(state, callback) {
    chrome.storage.local.get(['extensionSettings'], result => {
        const settings = result.extensionSettings || {};
        if (settings.iconSize !== undefined) {
            state.iconSize = settings.iconSize;
        }
        if (settings.iconBorderRadius !== undefined) {
            state.iconBorderRadius = settings.iconBorderRadius;
        }
        if (settings.iconBorderColor) {
            state.iconBorderColor = settings.iconBorderColor;
        }
        if (settings.iconBgColor) {
            state.iconBgColor = settings.iconBgColor;
        }
        if (settings.iconSpacing !== undefined) {
            state.iconSpacing = settings.iconSpacing;
        }
        if (settings.iconGap !== undefined) {
            state.iconGap = settings.iconGap;
        } else {
            state.iconGap = state.iconSpacing;
        }

        if (settings.bookmarkFontFamily) {
            state.bookmarkFontFamily = settings.bookmarkFontFamily;
        }
        if (settings.bookmarkFontSize !== undefined) {
            state.bookmarkFontSize = settings.bookmarkFontSize;
        }
        if (settings.bookmarkFontColor) {
            state.bookmarkFontColor = settings.bookmarkFontColor;
        }

        if (settings.bookmarkMinWidth !== undefined) {
            state.bookmarkMinWidth = settings.bookmarkMinWidth;
        }

        if (settings.filterColor) {
            state.filterColor = settings.filterColor;
        }
        if (settings.filterOpacity !== undefined) {
            state.filterOpacity = settings.filterOpacity;
        }

        if (settings.categoryGap !== undefined) {
            state.categoryGap = settings.categoryGap;
        } else {
            state.categoryGap = 20; // Default
        }
        if (settings.iconLayout) {
            state.iconLayout = settings.iconLayout;
        }
        if (settings.nameDisplay) {
            state.nameDisplay = settings.nameDisplay;
        }
        if (settings.textBehavior) {
            state.textBehavior = settings.textBehavior;
        }

        applyIconSizeSetting(state.iconSize);
        applyIconAppearance(state.iconBorderRadius, state.iconBorderColor, state.iconBgColor);
        applyIconSpacingSetting(state.iconSpacing);
        applyIconGapSetting(state.iconGap);
        applyCategoryGapSetting(state.categoryGap);
        applyIconLayoutSetting(state.iconLayout);
        applyNameDisplaySetting(state.nameDisplay);
        applyTextBehaviorSetting(state.textBehavior); // New
        applyBookmarkFontSettings(state.bookmarkFontFamily, state.bookmarkFontSize, state.bookmarkFontColor);
        applyBookmarkMinWidthSetting(state.bookmarkMinWidth);
        if (settings.layoutMode) {
            state.layoutMode = settings.layoutMode;
        } else {
            state.layoutMode = 'list';
        }
        if (settings.columnCount) {
            state.columnCount = settings.columnCount;
        } else {
            state.columnCount = 3; // Default
        }

        // Sidebar settings
        if (settings.lastActiveSpace) {
            state.lastActiveSpace = settings.lastActiveSpace;
        }
        if (settings.sidebarCollapsed !== undefined) {
            state.sidebarCollapsed = settings.sidebarCollapsed;
        }
        if (settings.sidebarWidth !== undefined) {
            state.sidebarWidth = settings.sidebarWidth;
        } else {
            state.sidebarWidth = 200;
        }

        applySidebarWidthSetting(state.sidebarWidth);
        applyLayoutMode(state.layoutMode, state.columnCount);

        if (callback) callback();
    });
}
