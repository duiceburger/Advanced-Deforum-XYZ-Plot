// Fix: Add declarations for external libraries to resolve 'Cannot find name' errors.
declare var saveAs: (blob: Blob, filename: string) => void;
declare var JSZip: any;

document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let baseSettings: any = null;
    let parameterList: string[] = [];
    let parameterTypes: { [key: string]: string } = {};
    // Fix: Define an interface for generated settings objects to provide strong typing.
    interface SettingItem {
        x: any;
        y: any;
        z: any;
        fileName: string;
        settings: any;
        batchName: string;
    }
    let generatedSettings: SettingItem[] = [];
    let zEnabled = false;
    const scheduleParameters = new Set([
        'strength_schedule', 'cfg_scale_schedule', 'noise_schedule', 'contrast_schedule',
        'zoom', 'angle', 'translation_x', 'translation_y', 'translation_z',
        'rotation_3d_x', 'rotation_3d_y', 'rotation_3d_z', 'perspective_flip_theta',
        'perspective_flip_phi', 'perspective_flip_gamma', 'perspective_flip_fv'
    ]);

    // DOM Elements
    // Fix: Cast DOM elements to their specific types to resolve multiple property access errors.
    const dropZone = document.getElementById('dropZone') as HTMLElement;
    const settingsFileInput = document.getElementById('settingsFile') as HTMLInputElement;
    const fileInfoDiv = document.getElementById('fileInfo') as HTMLElement;
    const batchNameTemplateInput = document.getElementById('batchNameTemplate') as HTMLInputElement;
    const xParamSelect = document.getElementById('xParam') as HTMLSelectElement;
    const yParamSelect = document.getElementById('yParam') as HTMLSelectElement;
    const zParamSelect = document.getElementById('zParam') as HTMLSelectElement;
    const enableZCheckbox = document.getElementById('enableZ') as HTMLInputElement;
    const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
    const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
    const fileListDiv = document.getElementById('fileList') as HTMLElement;

    // --- File Upload Handling ---
    const handleFile = (file?: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Fix: Cast reader result to string for JSON.parse, as it can be string or ArrayBuffer.
                baseSettings = JSON.parse(e.target!.result as string);
                populateParameterDropdowns();
                (document.getElementById('globalSettings') as HTMLElement).style.display = 'block';
                fileInfoDiv.textContent = `Loaded: ${file.name}`;
                fileInfoDiv.style.display = 'block';
                updateBatchNamePreview();
            } catch (error: any) {
                alert('Error parsing settings file: ' + error.message);
                fileInfoDiv.style.display = 'none';
            }
        };
        reader.readAsText(file);
    };

    dropZone.addEventListener('click', () => settingsFileInput.click());
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer!.files;
        if (files.length > 0) {
            // Fix: The 'files' property of an HTMLInputElement is read-only. This line would cause an error and is not necessary.
            // settingsFileInput.files = files;
            handleFile(files[0]);
        }
    });
    // Fix: Cast event target to HTMLInputElement to safely access the 'files' property.
    settingsFileInput.addEventListener('change', e => handleFile((e.target as HTMLInputElement).files?.[0]));


    // --- Batch Name Template ---
    const insertVariable = (variable: string) => {
        // Fix: Use nullish coalescing for safer access to selectionStart/End.
        const cursorPos = batchNameTemplateInput.selectionStart ?? 0;
        const textBefore = batchNameTemplateInput.value.substring(0, cursorPos);
        const textAfter = batchNameTemplateInput.value.substring(batchNameTemplateInput.selectionEnd ?? 0);
        batchNameTemplateInput.value = textBefore + variable + textAfter;
        batchNameTemplateInput.focus();
        batchNameTemplateInput.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
        updateBatchNamePreview();
    };

    // Fix: Cast button to HTMLElement to access the dataset property.
    document.querySelectorAll('.variable-btn').forEach(button => {
        button.addEventListener('click', () => insertVariable((button as HTMLElement).dataset.variable ?? ''));
    });

    const getFirstValueFromInputs = (selector: string): any => {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (!input) return '';
        const value = input.value.trim();
        if (!value) return '';
        try {
            const parsedValues = parseRange(value);
            return parsedValues.length > 0 ? parsedValues[0] : '';
        } catch (e) {
            return value;
        }
    };

    const generateBatchName = (template: string, params: { xParam: string; yParam: string; zParam: string | null; xValue: any; yValue: any; zValue: any; }) => {
        if (!baseSettings) return template;

        const now = new Date();
        const timestring = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');

        const variables = {
            timestring: timestring,
            seed: getNestedProperty(baseSettings, 'seed') ?? -1,
            seed_behavior: getNestedProperty(baseSettings, 'seed_behavior') ?? 'iter',
            w: getNestedProperty(baseSettings, 'W') ?? 512,
            h: getNestedProperty(baseSettings, 'H') ?? 512,
            x_param: params.xParam ? params.xParam.split('.').pop() : 'x_param',
            x_value: params.xValue ?? 'x_val',
            y_param: params.yParam ? params.yParam.split('.').pop() : 'y_param',
            y_value: params.yValue ?? 'y_val',
            z_param: params.zParam ? params.zParam.split('.').pop() : 'z_param',
            z_value: params.zValue ?? 'z_val',
            steps: getNestedProperty(baseSettings, 'steps') ?? 20,
            cfg_scale: getNestedProperty(baseSettings, 'cfg_scale') ?? 7,
            sampler: getNestedProperty(baseSettings, 'sampler') ?? 'Euler a',
            strength: getNestedProperty(baseSettings, 'strength') ?? 0.75,
            max_frames: getNestedProperty(baseSettings, 'max_frames') ?? 120
        };

        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
        return result;
    };
    
    const updateBatchNamePreview = () => {
        if (!baseSettings) return;
        const template = batchNameTemplateInput.value;
        const preview = generateBatchName(template, {
            xParam: xParamSelect.value,
            yParam: yParamSelect.value,
            zParam: zEnabled ? zParamSelect.value : '',
            xValue: getFirstValueFromInputs('.x-value') || 'X_VAL',
            yValue: getFirstValueFromInputs('.y-value') || 'Y_VAL',
            zValue: zEnabled ? getFirstValueFromInputs('.z-value') || 'Z_VAL' : 'Z_VAL'
        });
        (document.getElementById('batchNamePreview') as HTMLElement).textContent = preview;
    };

    batchNameTemplateInput.addEventListener('input', updateBatchNamePreview);

    // --- Parameter Handling ---
    const getParameterList = (settings: object, prefix = ''): string[] => {
        let params: string[] = [];
        for (const [key, value] of Object.entries(settings)) {
            const paramName = prefix ? `${prefix}.${key}` : key;
            if (key === 'prompts' || typeof value === 'function') continue;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                params = params.concat(getParameterList(value, paramName));
            } else {
                params.push(paramName);
            }
        }
        return params.sort();
    };

    const populateParameterDropdowns = () => {
        if (!baseSettings) return;
        parameterList = getParameterList(baseSettings);
        const optionsHTML = ['<option value="">Select Parameter</option>']
            .concat(parameterList.map(param => {
                const scheduleIndicator = isScheduleParameter(param) ? ' (Schedule)' : '';
                return `<option value="${param}">${param}${scheduleIndicator}</option>`;
            })).join('');
        xParamSelect.innerHTML = yParamSelect.innerHTML = zParamSelect.innerHTML = optionsHTML;
    };

    const getNestedProperty = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };
    
    const setNestedProperty = (obj: any, path: string, value: any) => {
        const parts = path.split('.');
        const last = parts.pop()!;
        const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
        target[last] = value;
    };

    const updateParamInfo = (axis: 'x' | 'y' | 'z') => {
        // Fix: Cast dynamically accessed element to HTMLSelectElement.
        const param = (document.getElementById(`${axis}Param`) as HTMLSelectElement).value;
        const infoDiv = document.getElementById(`${axis}ParamInfo`) as HTMLElement;
        if (!param || !baseSettings) {
            infoDiv.innerHTML = '';
            return;
        }
        const value = getNestedProperty(baseSettings, param);
        const type = typeof value;
        parameterTypes[param] = type;
        
        let infoText = `<strong>Type:</strong> ${type}`;
        if (isScheduleParameter(param)) {
            infoText += ' <strong>(Schedule)</strong>';
        }
        if (value !== undefined) {
            infoText += `, <strong>Current:</strong> ${JSON.stringify(value)}`;
        }
        infoDiv.innerHTML = infoText;
        updateBatchNamePreview();
    };
    
    xParamSelect.addEventListener('change', () => updateParamInfo('x'));
    yParamSelect.addEventListener('change', () => updateParamInfo('y'));
    zParamSelect.addEventListener('change', () => updateParamInfo('z'));

    // --- Z-Axis Toggle ---
    const toggleZAxis = () => {
        zEnabled = enableZCheckbox.checked;
        (document.getElementById('zParamGroup') as HTMLElement).style.display = zEnabled ? 'block' : 'none';
        (document.getElementById('zValues') as HTMLElement).style.display = zEnabled ? 'block' : 'none';
        updateBatchNamePreview();
    };
    enableZCheckbox.addEventListener('change', toggleZAxis);

    // --- Value Parsing & Handling ---
    const parseRange = (rangeStr: string): (string | number | boolean)[] => {
        rangeStr = rangeStr.trim();
        if (rangeStr.toLowerCase() === 'true') return [true];
        if (rangeStr.toLowerCase() === 'false') return [false];

        if (rangeStr.includes(',')) {
             return rangeStr.split(',').map(s => parseParameterValue(s.trim()));
        }

        const countMatch = rangeStr.match(/^(\-?\d*\.?\d+)-(\-?\d*\.?\d+)\s*\[\s*(\d+)\s*\]$/);
        if (countMatch) {
            const start = parseFloat(countMatch[1]), end = parseFloat(countMatch[2]), count = parseInt(countMatch[3]);
            if (count < 2) return [start];
            return Array.from({length: count}, (_, i) => parseFloat((start + i * (end - start) / (count - 1)).toFixed(10)));
        }

        const incrementMatch = rangeStr.match(/^(\-?\d*\.?\d+)-(\-?\d*\.?\d+)\s*\(\s*([+\-]?\d*\.?\d+)\s*\)$/);
        if (incrementMatch) {
            const start = parseFloat(incrementMatch[1]), end = parseFloat(incrementMatch[2]), increment = parseFloat(incrementMatch[3]);
            if (increment === 0) throw new Error("Increment cannot be zero.");
            const result = [];
            for (let v = start; (increment > 0 ? v <= end : v >= end); v += increment) {
                result.push(parseFloat(v.toFixed(10)));
            }
            return result;
        }

        const simpleRangeMatch = rangeStr.match(/^(\-?\d*\.?\d+)-(\-?\d*\.?\d+)$/);
        if (simpleRangeMatch) {
            const start = parseFloat(simpleRangeMatch[1]), end = parseFloat(simpleRangeMatch[2]);
            const result = [];
            for (let i = start; start <= end ? i <= end : i >= end; i += (start <= end ? 1 : -1)) {
                result.push(i);
            }
            return result;
        }
        return [parseParameterValue(rangeStr)];
    };
    
    const parseParameterValue = (value: string): (string | number | boolean) => {
        if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return value;
    };
    
    const validateValueInput = (input: HTMLInputElement) => {
        const value = input.value.trim();
        if (!value) {
            input.classList.remove('invalid-input');
            return;
        }
        try {
            parseRange(value);
            input.classList.remove('invalid-input');
        } catch (e) {
            input.classList.add('invalid-input');
        }
    };

    const addValueInput = (type: 'x' | 'y' | 'z') => {
        const container = document.getElementById(`${type}ValueFields`) as HTMLElement;
        const div = document.createElement('div');
        div.className = 'input-group';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Value or Range';
        input.className = `value-input ${type}-value`;
        input.addEventListener('input', () => {
            validateValueInput(input);
            updateBatchNamePreview();
        });
        div.innerHTML = `<button type="button" class="remove-btn">Remove</button>`;
        div.prepend(input);
        container.appendChild(div);
    };

    document.getElementById('addXValueBtn')!.addEventListener('click', () => addValueInput('x'));
    document.getElementById('addYValueBtn')!.addEventListener('click', () => addValueInput('y'));
    document.getElementById('addZValueBtn')!.addEventListener('click', () => addValueInput('z'));

    document.getElementById('value-containers')!.addEventListener('click', (e) => {
        // Fix: Cast event target to HTMLElement to safely access classList and parentElement.
        const target = e.target as HTMLElement;
        if (target.classList.contains('remove-btn')) {
            const group = target.parentElement;
            if (group && group.parentElement && group.parentElement.children.length > 1) { // Prevent removing the last one
                group.remove();
                updateBatchNamePreview();
            }
        }
    });
    
    document.querySelectorAll('.value-input').forEach(input => {
        input.addEventListener('input', () => {
            validateValueInput(input as HTMLInputElement);
            updateBatchNamePreview();
        });
    });

    const isScheduleParameter = (paramName: string) => scheduleParameters.has(paramName.split('.').pop()!);
    const formatScheduleValue = (paramName: string, value: any) => isScheduleParameter(paramName) ? `0: (${value})` : value;

    // --- Generation & Display ---
    const generateSettings = () => {
        if (!baseSettings) return alert('Please upload a settings file first.');
        const xParam = xParamSelect.value, yParam = yParamSelect.value, zParam = zEnabled ? zParamSelect.value : null;
        if (!xParam || !yParam || (zEnabled && !zParam)) return alert('Please select parameters for all enabled axes.');

        const getValuesFromInputs = (selector: string) => {
            let values: (string | number | boolean)[] = [];
            document.querySelectorAll(selector).forEach(input => {
                const value = (input as HTMLInputElement).value.trim();
                if (value) {
                    try {
                        values = values.concat(parseRange(value));
                    } catch (e: any) {
                        throw new Error(`Invalid format in one of the inputs: "${value}"`);
                    }
                }
            });
            return [...new Set(values)]; // Deduplicate
        };
        
        const spinner = document.getElementById('loadingSpinner') as HTMLElement;
        generateBtn.disabled = true;
        spinner.style.display = 'inline-block';
        generateBtn.textContent = 'Generating...';

        setTimeout(() => {
            try {
                const xValues = getValuesFromInputs('.x-value');
                const yValues = getValuesFromInputs('.y-value');
                const zValues = zEnabled ? getValuesFromInputs('.z-value') : [null];
                if (xValues.length === 0 || yValues.length === 0 || (zEnabled && zValues.length === 0)) {
                    throw new Error('Please add at least one value for each enabled axis.');
                }

                generatedSettings = [];
                for (const zValue of zValues) {
                    for (const yValue of yValues) {
                        for (const xValue of xValues) {
                            const settings = JSON.parse(JSON.stringify(baseSettings));
                            setNestedProperty(settings, xParam, formatScheduleValue(xParam, xValue));
                            setNestedProperty(settings, yParam, formatScheduleValue(yParam, yValue));
                            if (zEnabled && zValue !== null && zParam) {
                                setNestedProperty(settings, zParam, formatScheduleValue(zParam, zValue));
                            }
                            const batchName = generateBatchName(batchNameTemplateInput.value, { xParam, yParam, zParam, xValue, yValue, zValue });
                            settings.batch_name = batchName;
                            
                            const fileName = `${xParam.replace(/\./g, '_')}_${xValue}_${yParam.replace(/\./g, '_')}_${yValue}${zEnabled && zValue !== null && zParam ? `_${zParam.replace(/\./g, '_')}_${zValue}` : ''}.txt`;

                            generatedSettings.push({ x: xValue, y: yValue, z: zValue, fileName, settings, batchName });
                        }
                    }
                }
                displayResults();
            } catch (error: any) {
                alert(`Generation failed: ${error.message}`);
            } finally {
                generateBtn.disabled = false;
                spinner.style.display = 'none';
                generateBtn.textContent = 'Generate Plot Settings';
            }
        }, 10);
    };

    const displayResults = () => {
        (document.getElementById('results') as HTMLElement).style.display = 'block';
        // Fix: Convert number to string for textContent, which expects a string.
        (document.getElementById('fileCount') as HTMLElement).textContent = generatedSettings.length.toString();
        fileListDiv.innerHTML = '';

        if (zEnabled) {
            // Fix: Type zGroups to resolve errors when accessing properties like .length and .forEach.
            const zGroups = generatedSettings.reduce((acc, item) => {
                const key = String(item.z);
                (acc[key] = acc[key] || []).push(item);
                return acc;
            }, {} as Record<string, SettingItem[]>);
            
            Object.entries(zGroups).forEach(([zValue, items]) => {
                const zDiv = document.createElement('div');
                zDiv.className = 'z-group';
                zDiv.innerHTML = `<h3>Z: ${zParamSelect.value.split('.').pop()} = ${zValue}</h3>
                                <p>${items.length} files in this group</p>
                                <button class="download-z-btn" data-z-value="${zValue}">Download This Z Group (.zip)</button>`;
                items.forEach(item => {
                    const div = document.createElement('div');
                    div.innerHTML = `<p><strong>File:</strong> ${item.fileName}</p>
                                     <p><strong>X:</strong> ${item.x}, <strong>Y:</strong> ${item.y}</p>
                                     <button class="download-single-btn" data-filename="${item.fileName}">Download</button>`;
                    zDiv.appendChild(div);
                });
                fileListDiv.appendChild(zDiv);
            });
        } else {
            generatedSettings.forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `<p><strong>File:</strong> ${item.fileName}</p>
                                 <p><strong>X:</strong> ${item.x}, <strong>Y:</strong> ${item.y}</p>
                                 <button class="download-single-btn" data-filename="${item.fileName}">Download</button>`;
                fileListDiv.appendChild(div);
            });
        }
    };
    
    generateBtn.addEventListener('click', generateSettings);

    // --- Downloading ---
    const downloadSingleSetting = (fileName: string) => {
        const item = generatedSettings.find(i => i.fileName === fileName);
        if (item) {
            const blob = new Blob([JSON.stringify(item.settings, null, 4)], { type: 'application/json' });
            saveAs(blob, item.fileName);
        }
    };

    const downloadZGroup = (zValue: string) => {
        const items = generatedSettings.filter(item => String(item.z) === String(zValue));
        if (items.length === 0) return;
        
        const zip = new JSZip();
        const zParamShort = zParamSelect.value.split('.').pop();
        const folderName = `z_${zParamShort}_${zValue}`;
        
        items.forEach(item => zip.file(item.fileName, JSON.stringify(item.settings, null, 4)));
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => saveAs(content, `deforum_plot_${folderName}.zip`));
    };

    const downloadAllSettings = () => {
        if (generatedSettings.length === 0) return;
        const zip = new JSZip();
        if (zEnabled) {
            const zGroups = generatedSettings.reduce((acc, item) => {
                const key = String(item.z);
                (acc[key] = acc[key] || []).push(item);
                return acc;
            }, {} as Record<string, SettingItem[]>);
            const zParamShort = zParamSelect.value.split('.').pop();
            Object.entries(zGroups).forEach(([zValue, items]) => {
                const folderName = `z_${zParamShort}_${zValue}`;
                items.forEach(item => zip.file(`${folderName}/${item.fileName}`, JSON.stringify(item.settings, null, 4)));
            });
        } else {
            generatedSettings.forEach(item => zip.file(item.fileName, JSON.stringify(item.settings, null, 4)));
        }
        
        const timestampMatch = generatedSettings[0].batchName.match(/^\d{14}/);
        const zipName = timestampMatch ? `deforum_xyz_plot_${timestampMatch[0]}` : 'deforum_xyz_plot_settings';
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => saveAs(content, `${zipName}.zip`));
    };
    
    downloadBtn.addEventListener('click', downloadAllSettings);

    fileListDiv.addEventListener('click', (e) => {
        // Fix: Cast event target to HTMLElement and safely access dataset properties.
        const target = e.target as HTMLElement;
        if (target.classList.contains('download-single-btn')) {
            const filename = target.dataset.filename;
            if (filename) {
                downloadSingleSetting(filename);
            }
        } else if (target.classList.contains('download-z-btn')) {
            const zValue = target.dataset.zValue;
            if (zValue) {
                downloadZGroup(zValue);
            }
        }
    });
});
