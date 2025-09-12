export function applyIconSizeSetting(size) {
    document.documentElement.style.setProperty('--icon-size', `${size}px`);
    document.querySelectorAll('.bookmark-favicon').forEach(img => {
        if (img.dataset.url) {
            img.src = `https://www.google.com/s2/favicons?domain=${img.dataset.url}&sz=${size}`;
        }
    });
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

export function applyBookmarkFontSettings(fontFamily, fontSize, fontColor) {
    document.documentElement.style.setProperty('--bookmark-font-family', fontFamily);
    document.documentElement.style.setProperty('--bookmark-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--bookmark-font-color', fontColor);
}

export function loadSettings(state, callback) {
    chrome.storage.local.get(['extensionSettings'], result => {
        const settings = result.extensionSettings || {};
        if (settings.iconSize) {
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

        applyIconSizeSetting(state.iconSize);
        applyIconAppearance(state.iconBorderRadius, state.iconBorderColor, state.iconBgColor);
        applyIconSpacingSetting(state.iconSpacing);
        applyIconGapSetting(state.iconGap);
        applyBookmarkFontSettings(state.bookmarkFontFamily, state.bookmarkFontSize, state.bookmarkFontColor);
        applyBookmarkMinWidthSetting(state.bookmarkMinWidth);

        if (callback) callback();
    });
}
