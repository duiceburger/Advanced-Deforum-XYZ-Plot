// src/ui/results.js
import { elements, commonSettingsElements } from '../dom.js';
import { getBaseSettings, setGeneratedSettings, getGeneratedSettings } from '../state.js';

function updateBatchNamePreview() {
    const baseSettings = getBaseSettings();
    if (!baseSettings.W) return;
    
    let template = elements.batchNameTemplate.value;
    const now = new Date();
    const timestring = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    
    const xParam = elements.xParam.value || 'x';
    const yParam = elements.yParam.value || 'y';
    const zParam = elements.enableZ.checked ? elements.zParam.value : 'z';

    const replacements = {
        timestring,
        seed: commonSettingsElements.seed.value || baseSettings.seed,
        seed_behavior: commonSettingsElements.seed_behavior.value || baseSettings.seed_behavior,
        w: baseSettings.W,
        h: baseSettings.H,
        x_param: xParam,
        y_param: yParam,
        z_param: zParam,
        x_value: `[${xParam}_val]`,
        y_value: `[${yParam}_val]`,
        z_value: `[${zParam}_val]`,
        steps: commonSettingsElements.steps.value || baseSettings.steps,
        cfg_scale: (commonSettingsElements.cfg_scale_schedule.value || baseSettings.cfg_scale || '7').replace(/[():\s]/g, ''),
        sampler: commonSettingsElements.sampler.value || baseSettings.sampler,
        strength: (commonSettingsElements.strength_schedule.value || baseSettings.strength_schedule || '0.65').replace(/[():\s]/g, ''),
        max_frames: commonSettingsElements.max_frames.value || baseSettings.max_frames
    };

    for (const [key, value] of Object.entries(replacements)) {
        template = template.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    elements.batchNamePreview.textContent = template + '.txt';
}

function initializeBatchNameTemplate(onUpdate) {
    elements.batchNameTemplate.addEventListener('input', onUpdate);
    elements.variableButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('variable-btn')) {
            const variable = e.target.dataset.variable;
            elements.batchNameTemplate.value += variable;
            elements.batchNameTemplate.focus();
            onUpdate();
        }
    });
}

function downloadAll(generatedSettings) {
    const zip = new JSZip();
    generatedSettings.forEach(file => {
        zip.file(file.filename, file.content);
    });
    zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'deforum_plot_settings.zip');
    });
}

export function displayResults(generatedSettings) {
    setGeneratedSettings(generatedSettings);
    elements.fileCount.textContent = generatedSettings.length;
    elements.fileList.innerHTML = '';
    
    generatedSettings.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.textContent = file.filename;
        elements.fileList.appendChild(fileDiv);
    });

    elements.results.style.display = 'block';
}

export const initializeResults = {
    updateBatchNamePreview,
    initializeBatchNameTemplate,
};

elements.downloadBtn.addEventListener('click', () => {
    const settings = getGeneratedSettings();
    if(settings && settings.length > 0) {
        downloadAll(settings);
    }
});