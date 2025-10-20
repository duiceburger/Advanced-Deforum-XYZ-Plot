// src/ui/init-image.js
import { initImageElements } from '../dom.js';
import { getBaseSettings } from '../state.js';

function toggleControls() {
    const enabled = initImageElements.useInitToggle.checked;
    initImageElements.controlsContainer.style.display = enabled ? 'block' : 'none';
    if (enabled) {
        updateImagePreview();
    } else {
        initImageElements.previewContainer.style.display = 'none';
    }
}

function updateImagePreview() {
    const path = initImageElements.pathInput.value;
    const img = initImageElements.previewImage;
    const container = initImageElements.previewContainer;

    if (!path || path.trim() === '') {
        container.style.display = 'none';
        return;
    }

    let normalizedPath = path.trim();
    // Remove surrounding quotes which can be artifacts of copying
    if (normalizedPath.startsWith('"') && normalizedPath.endsWith('"')) {
        normalizedPath = normalizedPath.slice(1, -1);
    }
    // Replace backslashes with forward slashes for consistency
    normalizedPath = normalizedPath.replace(/\\/g, '/');

    img.onload = () => {
        container.style.display = 'block';
    };
    img.onerror = () => {
        container.style.display = 'none';
        console.warn(`Could not load image preview for: ${normalizedPath}. Note: Local file paths cannot be previewed in the browser.`);
    };
    
    img.src = normalizedPath;
}

export function populateInitImage() {
    const baseSettings = getBaseSettings();
    const useInit = baseSettings.use_init || false;
    const initImage = baseSettings.init_image;
    const strength = baseSettings.strength !== undefined ? baseSettings.strength : 0.8;

    initImageElements.useInitToggle.checked = useInit;
    
    // Only populate the path if it's a valid string, not a number or other junk
    if (typeof initImage === 'string' && initImage.trim() !== '') {
        initImageElements.pathInput.value = initImage;
    } else {
        initImageElements.pathInput.value = '';
    }
    
    initImageElements.strengthInput.value = strength;
    
    toggleControls();
}

export function initializeInitImage() {
    initImageElements.useInitToggle.addEventListener('change', toggleControls);
    initImageElements.pathInput.addEventListener('input', updateImagePreview);
}

export function getInitImageSettings() {
    const use_init = initImageElements.useInitToggle.checked;

    if (!use_init) {
        return { use_init: false };
    }

    const path = initImageElements.pathInput.value.trim();
    let normalizedPath = path;
    if (normalizedPath.startsWith('"') && normalizedPath.endsWith('"')) {
        normalizedPath = normalizedPath.slice(1, -1);
    }
    normalizedPath = normalizedPath.replace(/\\/g, '/');
    
    const strengthStr = initImageElements.strengthInput.value.trim();
    const strengthNum = parseFloat(strengthStr);

    return {
        use_init: true,
        init_image: normalizedPath,
        strength: isNaN(strengthNum) ? strengthStr : strengthNum, // Keep as string if not a valid number
    };
}