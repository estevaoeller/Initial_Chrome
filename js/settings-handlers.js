import { defaultSettings } from './config.js';

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

export function applyIconAppearance(borderRadius, borderColor, bgColor, bgOpacity = 1) {
    const target = document.body || document.documentElement;
    target.style.setProperty('--icon-border-radius', `${borderRadius}px`);
    target.style.setProperty('--icon-border-color', borderColor);

    // Convert hex to rgba for bgColor
    let rgbaStr = bgColor;
    if (bgColor && bgColor.startsWith('#')) {
        let r = 0, g = 0, b = 0;
        if (bgColor.length === 4) {
            r = parseInt(bgColor[1] + bgColor[1], 16);
            g = parseInt(bgColor[2] + bgColor[2], 16);
            b = parseInt(bgColor[3] + bgColor[3], 16);
        } else if (bgColor.length === 7) {
            r = parseInt(bgColor.substring(1, 3), 16);
            g = parseInt(bgColor.substring(3, 5), 16);
            b = parseInt(bgColor.substring(5, 7), 16);
        }
        rgbaStr = `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
    }
    target.style.setProperty('--icon-bg-color', rgbaStr);
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

export function applySectionAppearance(padding, bgColor, bgOpacity, lineColor) {
    if (padding !== undefined) document.documentElement.style.setProperty('--section-padding', `${padding}px`);
    if (lineColor) document.documentElement.style.setProperty('--section-line-color', lineColor);

    if (bgColor) {
        let rgbaStr = bgColor;
        if (bgColor.startsWith('#')) {
            let r = 0, g = 0, b = 0;
            if (bgColor.length === 4) {
                r = parseInt(bgColor[1] + bgColor[1], 16);
                g = parseInt(bgColor[2] + bgColor[2], 16);
                b = parseInt(bgColor[3] + bgColor[3], 16);
            } else if (bgColor.length === 7) {
                r = parseInt(bgColor.substring(1, 3), 16);
                g = parseInt(bgColor.substring(3, 5), 16);
                b = parseInt(bgColor.substring(5, 7), 16);
            }
            rgbaStr = `rgba(${r}, ${g}, ${b}, ${bgOpacity !== undefined ? bgOpacity : 1})`;
        }
        document.documentElement.style.setProperty('--section-bg-color', rgbaStr);
    }
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
    chrome.storage.sync.get(['extensionSettings'], result => {
        const settings = Object.assign({}, defaultSettings, result.extensionSettings || {});

        // Map settings to state
        Object.keys(settings).forEach(key => {
            state[key] = settings[key];
        });

        // Specific fallbacks
        if (state.iconGap === undefined) {
            state.iconGap = state.iconSpacing;
        }

        // Apply settings
        applyIconSizeSetting(state.iconSize);
        applyIconAppearance(state.iconBorderRadius, state.iconBorderColor, state.iconBgColor, state.iconBgOpacity);
        applyIconSpacingSetting(state.iconSpacing);
        applyIconGapSetting(state.iconGap);
        applyCategoryGapSetting(state.categoryGap);
        applyIconLayoutSetting(state.iconLayout);
        applyNameDisplaySetting(state.nameDisplay);
        applyTextBehaviorSetting(state.textBehavior);
        applyBookmarkFontSettings(state.bookmarkFontFamily, state.bookmarkFontSize, state.bookmarkFontColor);
        applyBookmarkMinWidthSetting(state.bookmarkMinWidth);
        applySectionAppearance(state.sectionPadding, state.sectionBgColor, state.sectionBgOpacity, state.sectionLineColor);
        applySidebarWidthSetting(state.sidebarWidth);
        applyLayoutMode(state.layoutMode, state.columnCount);

        if (state.filterColor !== undefined) {
            applyBackgroundFilter(state.filterColor, state.filterOpacity);
        }

        if (callback) callback();
    });
}
