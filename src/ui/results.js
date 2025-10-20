// src/ui/results.js
import { elements, commonSettingsElements } from '../dom.js';
import { getBaseSettings, setGeneratedSettings, getGeneratedSettings } from '../state.js';

export function updateSuggestedTemplate() {
    const baseSettings = getBaseSettings();
    if (!baseSettings || Object.keys(baseSettings).length === 0) return;

    const parts = ['{timestring}', '{filename}'];
    
    const xParam = elements.xParam.value;
    const yParam = elements.yParam.value;
    const zParam = elements.enableZ.checked ? elements.zParam.value : null;

    if (xParam) parts.push('{x_param}-{x_value}');
    if (yParam) parts.push('{y_param}-{y_value}');
    if (zParam) parts.push('{z_param}-{z_value}');

    // Add some common, useful parameters to the default template
    parts.push('Seed-{seed}');
    parts.push('CFG-{cfg_scale}');

    elements.batchNameTemplate.value = parts.join('_');
}

export function updateBatchNamePreview() {
    const baseSettings = getBaseSettings();
    if (!baseSettings.W) return;
    
    let template = elements.batchNameTemplate.value;
    const now = new Date();
    const timestring = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    
    const xParam = elements.xParam.value || 'x';
    const yParam = elements.yParam.value || 'y';
    const zParam = elements.enableZ.checked ? (elements.zParam.value || 'z') : 'z';

    const replacements = {
        timestring,
        filename: elements.customFilename.value,
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

export function initializeResults(onUpdate) {
    elements.batchNameTemplate.addEventListener('input', onUpdate);
    elements.customFilename.addEventListener('input', onUpdate);

    elements.variableButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('variable-btn')) {
            const variable = e.target.dataset.variable;
            const input = elements.batchNameTemplate;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const text = input.value;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);

            input.value = (before + variable + after);
            
            // Move cursor to after the inserted variable
            input.selectionStart = input.selectionEnd = start + variable.length;
            
            input.focus();
            onUpdate();
        }
    });

    elements.downloadBtn.addEventListener('click', () => {
        const settings = getGeneratedSettings();
        if(settings && settings.length > 0) {
            downloadAll(settings);
        }
    });
}