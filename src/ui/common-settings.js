// src/ui/common-settings.js
import { commonSettingsElements, animationElements } from '../dom.js';
import { getBaseSettings, updateBaseSetting } from '../state.js';
import { SEED_BEHAVIORS, BORDER_MODES, NOISE_TYPES, SAMPLERS } from '../constants.js';
import { populateSelect } from '../utils.js';

function updateDuration() {
    const frames = parseInt(commonSettingsElements.max_frames.value, 10);
    const fps = parseInt(commonSettingsElements.fps.value, 10);
    if (!isNaN(frames) && !isNaN(fps) && fps > 0) {
        const durationSeconds = frames / fps;
        commonSettingsElements.durationDisplay.textContent = `${durationSeconds.toFixed(2)} seconds`;
    } else {
        commonSettingsElements.durationDisplay.textContent = '-';
    }
}

function toggleAnimationModeView() {
    const selectedMode = document.querySelector('input[name="animation_mode"]:checked').value;
    updateBaseSetting('animation_mode', selectedMode);
    animationElements.container2D.style.display = (selectedMode === '2D') ? 'block' : 'none';
    animationElements.container3D.style.display = (selectedMode === '3D') ? 'block' : 'none';
}

export function populateCommonSettings() {
    const baseSettings = getBaseSettings();
    if (!baseSettings) return;

    // Simple value fields
    Object.keys(commonSettingsElements).forEach(key => {
        if (commonSettingsElements[key].tagName === 'INPUT') {
            commonSettingsElements[key].value = baseSettings[key] || '';
        }
    });
    commonSettingsElements.cfg_scale_schedule.value = baseSettings.cfg_scale || '';


    // Dropdowns
    populateSelect(commonSettingsElements.seed_behavior, SEED_BEHAVIORS, baseSettings.seed_behavior || 'iter');
    populateSelect(commonSettingsElements.border_mode, BORDER_MODES, baseSettings.border_mode || 'wrap');
    populateSelect(commonSettingsElements.noise_type, NOISE_TYPES, baseSettings.noise_type || 'uniform');
    
    const loadedSampler = baseSettings.sampler;
    const samplerOptions = [...SAMPLERS];
    if (loadedSampler && !samplerOptions.includes(loadedSampler)) {
        samplerOptions.unshift(loadedSampler);
    }
    populateSelect(commonSettingsElements.sampler, samplerOptions, loadedSampler || 'euler');
    
    // Animation Mode and Motion
    const animationMode = baseSettings.animation_mode || '2D';
    document.querySelector(`input[name="animation_mode"][value="${animationMode}"]`).checked = true;
    
    animationElements.zoom_2d.value = baseSettings.zoom || '0: (1.04)';
    animationElements.translation_x_2d.value = baseSettings.translation_x || '0: (0)';
    animationElements.translation_y_2d.value = baseSettings.translation_y || '0: (0)';
    animationElements.rotation_2d.value = baseSettings.rotation_2d || '0: (0)';

    animationElements.translation_x_3d.value = baseSettings.translation_x || '0: (0)';
    animationElements.translation_y_3d.value = baseSettings.translation_y || '0: (0)';
    animationElements.translation_z_3d.value = baseSettings.translation_z || '0: (1.75)';
    animationElements.rotation_3d_x.value = baseSettings.rotation_3d_x || '0: (0)';
    animationElements.rotation_3d_y.value = baseSettings.rotation_3d_y || '0: (0)';
    animationElements.rotation_3d_z.value = baseSettings.rotation_3d_z || '0: (0)';

    toggleAnimationModeView();
    updateDuration();
}

export function initializeCommonSettingsEventListeners(updateBatchNamePreview) {
    // Standard inputs
    Object.values(commonSettingsElements).forEach(element => {
        element.addEventListener('input', (e) => {
            const key = e.target.id;
            const value = e.target.value;
            const numValue = parseFloat(value);
            const finalValue = (String(value) === String(numValue)) ? numValue : value;
            updateBaseSetting(key, finalValue);
            if (key === 'max_frames' || key === 'fps') updateDuration();
            updateBatchNamePreview();
        });
    });

    // Motion inputs
    Object.values(animationElements).forEach(element => {
        if (element.tagName === 'INPUT') {
            element.addEventListener('input', (e) => {
                let paramName = e.target.id.replace(/_2d|_3d/g, '');
                if (paramName === 'zoom') paramName = 'zoom'; // Fix for zoom_2d
                updateBaseSetting(paramName, e.target.value);
            });
        }
    });

    // Animation mode radios
    animationElements.modeRadios.forEach(radio => {
        radio.addEventListener('change', toggleAnimationModeView);
    });
}

export function getCommonOverrides() {
    const commonOverrides = {};
    Object.keys(commonSettingsElements).forEach(key => {
        const el = commonSettingsElements[key];
        if (el && el.value !== undefined && el.id !== 'durationDisplay') {
             const val = el.value;
             const numVal = parseFloat(val);
             commonOverrides[key] = (String(val) === String(numVal)) ? numVal : val;
        }
    });
    
    const selectedMode = document.querySelector('input[name="animation_mode"]:checked').value;
    commonOverrides.animation_mode = selectedMode;
    const container = selectedMode === '2D' ? animationElements.container2D : animationElements.container3D;
    container.querySelectorAll('input').forEach(input => {
        let paramName = input.id.replace(/_2d|_3d/g, '');
        if (paramName === 'zoom') paramName = 'zoom';
        commonOverrides[paramName] = input.value;
    });

    commonOverrides.cfg_scale = commonOverrides.cfg_scale_schedule;
    delete commonOverrides.cfg_scale_schedule;
    
    return commonOverrides;
}
