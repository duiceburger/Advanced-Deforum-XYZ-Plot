// src/ui/prompts.js
import { promptsElements } from '../dom.js';
import { getBaseSettings } from '../state.js';

function addKeyframeRow(frame = '', prompt = '') {
    const container = promptsElements.animatedPromptsFields;
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group keyframe-row';
    inputGroup.innerHTML = `
        <input type="number" class="keyframe-frame" placeholder="Frame" value="${frame}" min="0">
        <input type="text" class="keyframe-prompt" placeholder="Prompt for this frame" value="${prompt}">
        <button type="button" class="remove-btn">Remove</button>
    `;
    container.appendChild(inputGroup);
    inputGroup.querySelector('.remove-btn').addEventListener('click', () => {
         if (container.children.length > 1) {
            inputGroup.remove();
        } else {
            alert("At least one keyframe is required for animated prompts.");
        }
    });
}

function togglePromptView() {
    const isAnimated = promptsElements.animatePrompts.checked;
    
    if (isAnimated && promptsElements.animatedPromptsContainer.style.display === 'none') {
        const positive = promptsElements.positivePrompt.value.trim();
        const negative = promptsElements.negativePrompt.value.trim();
        const combined = negative ? `${positive} --neg ${negative}` : positive;
        
        promptsElements.animatedPromptsFields.innerHTML = '';
        addKeyframeRow('0', combined);

        if (combined) {
            addKeyframeRow('', '');
        }
    }
    
    promptsElements.animatedPromptsContainer.style.display = isAnimated ? 'block' : 'none';
    promptsElements.fixedPromptsContainer.style.display = isAnimated ? 'none' : 'block';
}

export function initializePrompts() {
    const baseSettings = getBaseSettings();
    const prompts = baseSettings.prompts || { "0": "" };
    const keys = Object.keys(prompts).sort((a,b) => parseInt(a,10) - parseInt(b,10));

    if (keys.length > 1 || (keys.length === 1 && keys[0] !== "0")) {
        promptsElements.animatePrompts.checked = true;
        promptsElements.animatedPromptsFields.innerHTML = '';
        keys.forEach(key => addKeyframeRow(key, prompts[key]));
    } else {
        promptsElements.animatePrompts.checked = false;
        const promptString = prompts[keys[0] || "0"] || "";
        
        let separator = ' --neg ';
        let parts = promptString.split(separator);
        if (parts.length === 1) {
            separator = ' -neg ';
            parts = promptString.split(separator);
        }

        promptsElements.positivePrompt.value = parts[0].trim();
        promptsElements.negativePrompt.value = (parts.length > 1) ? parts[1].trim() : "";
    }
    
    togglePromptView();

    promptsElements.addKeyframeBtn.addEventListener('click', () => addKeyframeRow());
    promptsElements.animatePrompts.addEventListener('change', togglePromptView);
}

export function getPromptsObject() {
    if (promptsElements.animatePrompts.checked) {
        const prompts = {};
        const rows = promptsElements.animatedPromptsFields.querySelectorAll('.keyframe-row');
        rows.forEach(row => {
            const frame = row.querySelector('.keyframe-frame').value.trim();
            const prompt = row.querySelector('.keyframe-prompt').value.trim();
            if (frame !== '' && !isNaN(frame)) {
                prompts[frame] = prompt;
            }
        });
        return prompts;
    } else {
        const positive = promptsElements.positivePrompt.value.trim();
        const negative = promptsElements.negativePrompt.value.trim();
        const combined = negative ? `${positive} --neg ${negative}` : positive;
        return { "0": combined };
    }
}
