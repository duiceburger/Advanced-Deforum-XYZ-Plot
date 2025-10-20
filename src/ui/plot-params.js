// src/ui/plot-params.js
import { elements } from '../dom.js';
import { getBaseSettings, getParameterList } from '../state.js';
import { PARAMETER_GROUPS, SAMPLER_DETAILS, PARAM_DESCRIPTIONS, PARAM_FRIENDLY_NAMES } from '../constants.js';
import { getParamType, parseValueString, generateSuggestedValues } from '../utils.js';

function updateParamInfo(axis, paramName) {
    const infoEl = elements[`${axis}ParamInfo`];
    const baseSettings = getBaseSettings();
    if (!paramName) {
        infoEl.innerHTML = '';
        return;
    }
    const type = getParamType(paramName);
    let currentVal = baseSettings[paramName] !== undefined ? baseSettings[paramName] : 'Not set in base file';
    if (typeof currentVal === 'object') currentVal = JSON.stringify(currentVal);
    
    infoEl.innerHTML = `Type: <strong>${type}</strong> | Current Value: <strong>${currentVal}</strong>`;
}

function updateParamReminder(axis, paramName) {
    const reminderEl = document.querySelector(`#${axis}Values .param-reminder`);
    if (!paramName) {
        reminderEl.style.display = 'none';
        return;
    }

    const baseSettings = getBaseSettings();
    const currentValue = baseSettings[paramName];
    // Generate the suggestion based on the current value
    const suggestion = generateSuggestedValues(paramName, currentValue);
        
    const friendlyName = PARAM_FRIENDLY_NAMES[paramName] || paramName;
    const description = PARAM_DESCRIPTIONS[paramName] || "No description available for this parameter.";
    
    // Updated HTML structure
    reminderEl.innerHTML = `
        <strong>${friendlyName}</strong>
        <em>${description}</em>
        <p class="current-value-display"><strong>Suggested Values:</strong> <code>${suggestion}</code></p>
        <small>You can copy this into the value field below or define your own range.</small>
    `;
    reminderEl.style.display = 'block';
}

function updateParamUI(axis, paramName) {
    updateParamInfo(axis, paramName);
    updateParamReminder(axis, paramName);
    
    const valueFields = document.getElementById(`${axis}ValueFields`);
    const samplerContainer = document.getElementById(`${axis}SamplerValuesContainer`);
    const promptOptions = document.getElementById(`${axis}ParamPromptOptions`);
    const hint = document.querySelector(`#${axis}Values .value-hint`);

    if (!paramName) {
        hint.textContent = `Select a ${axis.toUpperCase()}-Axis parameter to see input suggestions.`;
        hint.style.display = 'block';
        valueFields.style.display = 'none';
        samplerContainer.style.display = 'none';
        promptOptions.style.display = 'none';
        return;
    }

    hint.style.display = 'none';
    const paramType = getParamType(paramName);
    const firstInput = valueFields.querySelector('.value-input');

    valueFields.style.display = (paramType !== 'SAMPLER') ? 'block' : 'none';
    samplerContainer.style.display = (paramType === 'SAMPLER') ? 'block' : 'none';
    promptOptions.style.display = (paramType === 'PROMPTS') ? 'block' : 'none';
    
    if (paramType === 'PROMPTS') {
        const mode = document.getElementById(`${axis}PromptMode`).value;
        firstInput.placeholder = mode === 'append' 
            ? 'e.g., cinematic lighting, 4k' 
            : 'e.g., {"0": "a new prompt"}';
    } else if (paramType === 'BOOLEAN') {
        firstInput.placeholder = 'e.g., true, false';
    } else if (paramType === 'SCHEDULE') {
        firstInput.placeholder = 'e.g., "0: (0.5), 100: (0.8)"';
    } else {
        firstInput.placeholder = 'Value or Range';
    }
}

const addValueField = (containerId) => {
    const container = document.getElementById(containerId);
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    inputGroup.innerHTML = `
        <input type="text" placeholder="Value or Range" class="value-input ${containerId.replace('ValueFields', '-value')}">
        <button type="button" class="remove-btn">Remove</button>
    `;
    container.appendChild(inputGroup);
    inputGroup.querySelector('.remove-btn').addEventListener('click', () => inputGroup.remove());
};

export function initializePlotParams(onUpdate) {
    const parameterList = getParameterList();
    const selects = [elements.xParam, elements.yParam, elements.zParam];
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Parameter</option>';
        Object.keys(PARAMETER_GROUPS).forEach(groupName => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            PARAMETER_GROUPS[groupName].forEach(param => {
                if (parameterList.includes(param)) {
                    const friendlyName = PARAM_FRIENDLY_NAMES[param] || param;
                    const option = document.createElement('option');
                    option.value = param;
                    option.innerHTML = `${friendlyName} <span class="param-variable-name">(${param})</span>`;
                    optgroup.appendChild(option);
                }
            });
            if (optgroup.children.length > 0) {
               select.appendChild(optgroup);
            }
        });
    });
    
    document.querySelectorAll('.sampler-value-select').forEach(select => {
        select.innerHTML = '';
        SAMPLER_DETAILS.forEach(sampler => {
            const option = document.createElement('option');
            option.value = sampler.name;
            option.textContent = sampler.displayName || sampler.name;
            select.appendChild(option);
        });
    });

    elements.enableZ.addEventListener('change', () => {
        const enabled = elements.enableZ.checked;
        elements.zAxisControls.style.display = enabled ? 'block' : 'none';
        onUpdate();
    });

    ['x', 'y', 'z'].forEach(axis => {
        const paramSelect = elements[`${axis}Param`];
        paramSelect.addEventListener('change', (e) => {
            updateParamUI(axis, e.target.value);
            onUpdate();
        });
        const promptModeSelect = document.getElementById(`${axis}PromptMode`);
        promptModeSelect.addEventListener('change', () => updateParamUI(axis, paramSelect.value));
    });

    elements.addXValueBtn.addEventListener('click', () => addValueField('xValueFields'));
    elements.addYValueBtn.addEventListener('click', () => addValueField('yValueFields'));
    elements.addZValueBtn.addEventListener('click', () => addValueField('zValueFields'));

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.closest('.input-group');
            if (group && group.parentElement.children.length > 1) {
                group.remove();
            }
        });
    });
    
    // Trigger initial UI update
    ['x', 'y', 'z'].forEach(axis => updateParamUI(axis, elements[`${axis}Param`].value));
}

export function getValuesForAxis(axis) {
    const paramName = elements[`${axis}Param`].value;
    if (!paramName) return [];

    if (getParamType(paramName) === 'SAMPLER') {
        const select = document.getElementById(`${axis}SamplerValues`);
        return Array.from(select.selectedOptions).map(opt => opt.value);
    }

    const inputs = document.querySelectorAll(`.${axis}-value`);
    return Array.from(inputs)
        .flatMap(input => parseValueString(input.value))
        .filter(v => v !== null && v !== undefined);
}