// src/core/generator.js
import { elements } from '../dom.js';
import { getBaseSettings } from '../state.js';
import { getCommonOverrides } from '../ui/common-settings.js';

function generateFilename(settings, plotParams) {
    let template = elements.batchNameTemplate.value;
    const now = new Date();
    const timestring = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    
    const cleanValue = (val) => {
        if (val === null || val === undefined) return 'none';
        if (typeof val === 'object') val = JSON.stringify(val);
        return String(val).replace(/\s/g, '_').replace(/[():]/g, '').replace(/[^a-zA-Z0-9_.-]/g, '');
    };
    
    const replacements = {
        timestring,
        filename: elements.customFilename.value,
        seed: settings.seed,
        seed_behavior: settings.seed_behavior,
        w: settings.W,
        h: settings.H,
        x_param: plotParams.x_axis.param,
        x_value: cleanValue(plotParams.x_axis.value),
        y_param: plotParams.y_axis.param,
        y_value: cleanValue(plotParams.y_axis.value),
        z_param: plotParams.z_axis ? plotParams.z_axis.param : 'none',
        z_value: plotParams.z_axis ? cleanValue(plotParams.z_axis.value) : 'none',
        steps: settings.steps,
        cfg_scale: cleanValue(settings.cfg_scale),
        sampler: cleanValue(settings.sampler),
        strength: cleanValue(settings.strength),
        max_frames: settings.max_frames,
    };

    for (const [key, value] of Object.entries(replacements)) {
        template = template.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    return template + '.txt';
}

export function generateSettings(getPromptsObject, getValuesForAxis, getInitImageSettings) {
    const xParam = elements.xParam.value;
    const yParam = elements.yParam.value;
    const zParam = elements.enableZ.checked ? elements.zParam.value : null;

    if (!xParam || !yParam) throw new Error("X and Y-Axis parameters must be selected.");

    const xValues = getValuesForAxis('x');
    const yValues = getValuesForAxis('y');
    const zValues = zParam ? getValuesForAxis('z') : [null];

    if (xParam && xValues.length === 0) throw new Error(`X_AXIS_EMPTY: The X-Axis parameter '${xParam}' has no values defined. Please provide at least one value.`);
    if (yParam && yValues.length === 0) throw new Error(`Y_AXIS_EMPTY: The Y-Axis parameter '${yParam}' has no values defined. Please provide at least one value.`);
    if (zParam && zValues.length === 0) throw new Error(`Z_AXIS_EMPTY: The Z-Axis parameter '${zParam}' has no values defined. Please provide at least one value.`);

    const baseSettings = getBaseSettings();
    const commonOverrides = getCommonOverrides();
    const basePrompts = getPromptsObject();
    const initImageSettings = getInitImageSettings();
    const generatedSettings = [];
    
    // Create a new base that includes the common settings from the UI
    let effectiveBase = { ...baseSettings, ...commonOverrides };

    // Apply the UI's init settings to this new base
    if (initImageSettings.use_init) {
        effectiveBase.use_init = true;
        effectiveBase.init_image = initImageSettings.init_image;
        effectiveBase.strength = initImageSettings.strength;
    } else {
        effectiveBase.use_init = false;
        delete effectiveBase.init_image;
        delete effectiveBase.strength;
    }

    for (const zVal of zValues) {
        for (const yVal of yValues) {
            for (const xVal of xValues) {
                // Each iteration starts with the effective base
                let newSettings = { ...effectiveBase };
                
                let currentPrompts = JSON.parse(JSON.stringify(basePrompts));

                // Apply plot parameter overrides
                [
                    { param: xParam, value: xVal, axis: 'x' },
                    { param: yParam, value: yVal, axis: 'y' },
                    { param: zParam, value: zVal, axis: 'z' }
                ].forEach(({ param, value, axis }) => {
                    if (param === 'prompts') {
                        const mode = document.getElementById(`${axis}PromptMode`).value;
                        if (mode === 'override') {
                            if (typeof value === 'string' && value.trim().startsWith('{')) {
                                try {
                                    const parsedValue = JSON.parse(value);
                                    if (typeof parsedValue === 'object' && parsedValue !== null) {
                                        currentPrompts = parsedValue;
                                    }
                                } catch (e) {
                                    console.warn(`Invalid JSON in prompt override for ${axis}-axis, treating as string:`, value);
                                    currentPrompts = { "0": value };
                                }
                            } else {
                                currentPrompts = { "0": String(value) };
                            }
                        } else { // append
                            for (const frame in currentPrompts) {
                                currentPrompts[frame] += `, ${String(value)}`;
                            }
                        }
                    } else if (param) {
                        newSettings[param] = value;
                    }
                });
                
                newSettings.prompts = currentPrompts;
                 
                // Final cleanup: if use_init was plotted to false, remove related keys
                if (newSettings.use_init === false) {
                    delete newSettings.init_image;
                    delete newSettings.strength;
                }
                
                const meta = {
                    generated_by: "Deforum-XYZ-Plot",
                    generated_at: new Date().toUTCString(),
                    plot_params: {
                        x_axis: { param: xParam, value: xVal },
                        y_axis: { param: yParam, value: yVal },
                    }
                };
                if (zParam) {
                    meta.plot_params.z_axis = { param: zParam, value: zVal };
                }
                newSettings.meta = meta;

                const filename = generateFilename(newSettings, meta.plot_params);

                generatedSettings.push({
                    filename,
                    content: JSON.stringify(newSettings, null, 2),
                });
            }
        }
    }
    return generatedSettings;
}