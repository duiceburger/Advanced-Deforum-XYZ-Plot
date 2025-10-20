// Deforum XYZ Plot Generator - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // State
    let baseSettings = {};
    let parameterList = [];
    let generatedSettings = [];

    // Element References
    const elements = {
        dropZone: document.getElementById('dropZone'),
        settingsFile: document.getElementById('settingsFile'),
        fileInfo: document.getElementById('fileInfo'),
        globalSettings: document.getElementById('globalSettings'),
        batchNameTemplate: document.getElementById('batchNameTemplate'),
        batchNamePreview: document.getElementById('batchNamePreview'),
        variableButtons: document.querySelector('.variable-buttons'),
        xParam: document.getElementById('xParam'),
        yParam: document.getElementById('yParam'),
        zParam: document.getElementById('zParam'),
        xParamInfo: document.getElementById('xParamInfo'),
        yParamInfo: document.getElementById('yParamInfo'),
        zParamInfo: document.getElementById('zParamInfo'),
        enableZ: document.getElementById('enableZ'),
        zParamGroup: document.getElementById('zParamGroup'),
        valueContainers: document.getElementById('value-containers'),
        xValues: document.getElementById('xValues'),
        yValues: document.getElementById('yValues'),
        zValues: document.getElementById('zValues'),
        addXValueBtn: document.getElementById('addXValueBtn'),
        addYValueBtn: document.getElementById('addYValueBtn'),
        addZValueBtn: document.getElementById('addZValueBtn'),
        generateBtn: document.getElementById('generateBtn'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        results: document.getElementById('results'),
        fileCount: document.getElementById('fileCount'),
        downloadBtn: document.getElementById('downloadBtn'),
        fileList: document.getElementById('fileList'),
    };

    // --- File Handling ---
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const highlight = () => elements.dropZone.classList.add('dragover');
    const unhighlight = () => elements.dropZone.classList.remove('dragover');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.dropZone.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        elements.dropZone.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        elements.dropZone.addEventListener(eventName, unhighlight, false);
    });

    elements.dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    elements.settingsFile.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
            handleFiles(target.files);
        }
    });

    function handleFiles(files) {
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (!result || result.trim() === '') {
                alert('Error: The selected file is empty.');
                resetUIState();
                return;
            }

            // More robust comment stripping that avoids breaking URLs
            const contentWithoutComments = result.replace(/^(?!\s*["'])s*\/\/[^\r\n]*|(?<!:)\/\/[^\r\n]*/gm, '').replace(/^\s*#.*/gm, '');

            try {
                baseSettings = JSON.parse(contentWithoutComments);
                if (typeof baseSettings !== 'object' || baseSettings === null) {
                    throw new Error("Parsed content is not a valid object.");
                }
                parameterList = Object.keys(baseSettings).sort();
                populateParameters();
                elements.fileInfo.textContent = `Loaded: ${file.name}`;
                elements.fileInfo.style.display = 'block';
                elements.globalSettings.style.display = 'block';
                updateBatchNamePreview();
            } catch (error) {
                console.error("Parsing error:", error);
                alert(`Error parsing settings file: ${error.message}. Please ensure it's a valid Deforum JSON/TXT file.`);
                resetUIState();
            }
        };
        reader.onerror = () => {
             alert('Error reading the file.');
             resetUIState();
        };
        reader.readAsText(file);
    }
    
    function resetUIState() {
        baseSettings = {};
        parameterList = [];
        elements.fileInfo.style.display = 'none';
        elements.globalSettings.style.display = 'none';
        ['xParam', 'yParam', 'zParam'].forEach(id => {
            const select = elements[id];
            select.innerHTML = '<option value="">Select Parameter</option>';
        });
    }

    // --- Parameter Population & UI ---
    function populateParameters() {
        const selects = [elements.xParam, elements.yParam, elements.zParam];
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Parameter</option>';
            parameterList.forEach(param => {
                const option = document.createElement('option');
                option.value = param;
                option.textContent = param;
                select.appendChild(option);
            });
        });
    }

    elements.enableZ.addEventListener('change', () => {
        const isEnabled = elements.enableZ.checked;
        elements.zParamGroup.style.display = isEnabled ? 'block' : 'none';
        elements.zValues.style.display = isEnabled ? 'block' : 'none';
    });

    function updateParamInfo(param, infoEl) {
        if (param && baseSettings[param] !== undefined) {
            const value = baseSettings[param];
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            infoEl.innerHTML = `Current value: <strong>${displayValue}</strong>`;
        } else {
            infoEl.innerHTML = '';
        }
    }

    elements.xParam.addEventListener('change', (e) => updateParamInfo((e.target as HTMLSelectElement).value, elements.xParamInfo));
    elements.yParam.addEventListener('change', (e) => updateParamInfo((e.target as HTMLSelectElement).value, elements.yParamInfo));
    elements.zParam.addEventListener('change', (e) => updateParamInfo((e.target as HTMLSelectElement).value, elements.zParamInfo));


    // --- Value Field Management ---
    function createValueInput(axis) {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <input type="text" placeholder="Value or Range" class="value-input ${axis}-value">
            <button type="button" class="remove-btn">Remove</button>
        `;
        return div;
    }

    elements.addXValueBtn.addEventListener('click', () => {
        document.getElementById('xValueFields').appendChild(createValueInput('x'));
    });
    elements.addYValueBtn.addEventListener('click', () => {
        document.getElementById('yValueFields').appendChild(createValueInput('y'));
    });
    elements.addZValueBtn.addEventListener('click', () => {
        document.getElementById('zValueFields').appendChild(createValueInput('z'));
    });

    elements.valueContainers.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('remove-btn')) {
            const inputGroup = target.parentElement;
            // Don't remove the last one
            if (inputGroup.parentElement.children.length > 1) {
                inputGroup.remove();
            }
        }
    });
    
    // Live validation
    elements.valueContainers.addEventListener('input', (e) => {
       const target = e.target as HTMLInputElement;
       if (target.classList.contains('value-input')) {
           try {
               parseRange(target.value);
               target.classList.remove('invalid-input');
           } catch {
               target.classList.add('invalid-input');
           }
       }
    });

    // --- Generation Logic ---
    function parseRange(str) {
        str = str.trim();
        if (str === '') return [];
        if (!isNaN(parseFloat(str)) && isFinite(str as any)) return [str];
        if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false') return [str];

        // Range with count: 1-10 [5]
        let match = str.match(/^(-?\d*\.?\d+)\s*-\s*(-?\d*\.?\d+)\s*\[\s*(\d+)\s*\]$/);
        if (match) {
            const start = parseFloat(match[1]);
            const end = parseFloat(match[2]);
            const count = parseInt(match[3], 10);
            if (count < 2) return [String(start)];
            const step = (end - start) / (count - 1);
            return Array.from({ length: count }, (_, i) => String(start + i * step));
        }

        // Range with step: 1-5 (+2)
        match = str.match(/^(-?\d*\.?\d+)\s*-\s*(-?\d*\.?\d+)\s*\(\+\s*(-?\d*\.?\d+)\s*\)$/);
        if (match) {
            const start = parseFloat(match[1]);
            const end = parseFloat(match[2]);
            const step = parseFloat(match[3]);
            if (step === 0) return [String(start)];
            const results = [];
            for (let i = start; (step > 0 ? i <= end : i >= end); i += step) {
                results.push(String(i));
            }
            return results;
        }
        
        // Simple range: 1-5
        match = str.match(/^(-?\d+)\s*-\s*(-?\d+)$/);
        if (match) {
            const start = parseInt(match[1], 10);
            const end = parseInt(match[2], 10);
            const length = Math.abs(end - start) + 1;
            const step = start < end ? 1 : -1;
            return Array.from({ length }, (_, i) => String(start + i * step));
        }
        
        // CSV: "val1, val2, val3"
        if (str.includes(',')) {
            return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        // Single string value
        return [str];
    }
    
    function getValuesFromInputs(className) {
        const inputs = document.querySelectorAll(`.${className}`);
        let allValues = [];
        inputs.forEach((input: HTMLInputElement) => {
            try {
                const parsed = parseRange(input.value);
                allValues = allValues.concat(parsed);
            } catch (e) {
                console.warn(`Could not parse value: ${input.value}`);
            }
        });
        return [...new Set(allValues)]; // Remove duplicates
    }

    elements.generateBtn.addEventListener('click', () => {
        elements.generateBtn.disabled = true;
        elements.loadingSpinner.style.display = 'inline-block';
        elements.generateBtn.innerHTML = 'Generating... <span class="spinner"></span>';
        
        // Use setTimeout to allow UI to update before heavy processing
        setTimeout(() => {
            try {
                generate();
            } catch(e) {
                console.error(e);
                alert("An error occurred during generation. Check the console for details.");
            } finally {
                elements.generateBtn.disabled = false;
                elements.loadingSpinner.style.display = 'none';
                elements.generateBtn.textContent = 'Generate Plot Settings';
            }
        }, 10);
    });

    function generate() {
        const xParam = elements.xParam.value;
        const yParam = elements.yParam.value;
        const zParam = elements.enableZ.checked ? elements.zParam.value : null;

        if (!xParam || !yParam) {
            alert('Please select both X and Y parameters.');
            return;
        }

        const xValues = getValuesFromInputs('x-value');
        const yValues = getValuesFromInputs('y-value');
        const zValues = zParam ? getValuesFromInputs('z-value') : [null];

        generatedSettings = [];

        for (const z of zValues) {
            for (const y of yValues) {
                for (const x of xValues) {
                    const newSettings = JSON.parse(JSON.stringify(baseSettings));
                    
                    const isXSchedule = xParam.includes('schedule');
                    const isYSchedule = yParam.includes('schedule');
                    const isZSchedule = zParam && zParam.includes('schedule');
                    
                    newSettings[xParam] = isXSchedule ? `0: (${x})` : (isNaN(x as any) ? x : parseFloat(x));
                    newSettings[yParam] = isYSchedule ? `0: (${y})` : (isNaN(y as any) ? y : parseFloat(y));

                    if (zParam && z !== null) {
                         newSettings[zParam] = isZSchedule ? `0: (${z})` : (isNaN(z as any) ? z : parseFloat(z));
                    }

                    const context = {
                        x_param: xParam,
                        x_value: x,
                        y_param: yParam,
                        y_value: y,
                        z_param: zParam || 'none',
                        z_value: z || 'none',
                        timestring: new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14),
                        ...baseSettings
                    };
                    
                    newSettings.batch_name = formatBatchName(elements.batchNameTemplate.value, context);

                    generatedSettings.push({
                        settings: newSettings,
                        x, y, z, xParam, yParam, zParam
                    });
                }
            }
        }
        displayResults();
    }
    
    // --- Batch Name Templating ---
    function formatBatchName(template, context) {
        return template.replace(/{([^}]+)}/g, (match, key) => {
            if (key in context) {
                let value = context[key];
                // Sanitize value for filenames
                if (typeof value === 'string') {
                   return value.replace(/[\\/:*?"<>|]/g, '_');
                }
                return value;
            }
            return match; // Keep placeholder if key not found
        });
    }
    
    function updateBatchNamePreview() {
        if (!parameterList.length) return;
        const xParam = elements.xParam.value || 'x_param';
        const yParam = elements.yParam.value || 'y_param';
        const zParam = elements.zParam.value || 'z_param';
        
        const firstX = document.querySelector('.x-value')?.value.split(',')[0].trim() || 'x_value';
        const firstY = document.querySelector('.y-value')?.value.split(',')[0].trim() || 'y_value';
        const firstZ = document.querySelector('.z-value')?.value.split(',')[0].trim() || 'z_value';

        const context = {
            x_param: xParam,
            x_value: parseRange(firstX)[0] || firstX,
            y_param: yParam,
            y_value: parseRange(firstY)[0] || firstY,
            z_param: zParam,
            z_value: parseRange(firstZ)[0] || firstZ,
            timestring: new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14),
            ...baseSettings
        };
        elements.batchNamePreview.textContent = formatBatchName(elements.batchNameTemplate.value, context);
    }
    
    [elements.batchNameTemplate, elements.xParam, elements.yParam, elements.zParam].forEach(el => {
        el.addEventListener('input', updateBatchNamePreview);
    });
    elements.valueContainers.addEventListener('input', updateBatchNamePreview);
    
    elements.variableButtons.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('variable-btn')) {
            const variable = target.dataset.variable;
            const input = elements.batchNameTemplate;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const text = input.value;
            input.value = text.substring(0, start) + variable + text.substring(end);
            input.focus();
            input.selectionStart = input.selectionEnd = start + variable.length;
            updateBatchNamePreview();
        }
    });


    // --- Results Display & Download ---
    function displayResults() {
        elements.fileList.innerHTML = '';
        elements.fileCount.textContent = generatedSettings.length.toString();

        if (generatedSettings.length === 0) {
            elements.results.style.display = 'none';
            return;
        }

        const zGroups = generatedSettings.reduce((acc, curr) => {
            const key = curr.z || 'default';
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {});

        for (const zValue in zGroups) {
            const group = zGroups[zValue];
            const zParam = group[0].zParam;

            if (zParam) {
                const zGroupEl = document.createElement('div');
                zGroupEl.className = 'z-group';
                const zTitle = document.createElement('h4');
                zTitle.textContent = `Z: ${zParam} = ${zValue} (${group.length} files)`;
                zGroupEl.appendChild(zTitle);
                elements.fileList.appendChild(zGroupEl);
                group.forEach(item => zGroupEl.appendChild(createFileEntry(item)));
            } else {
                group.forEach(item => elements.fileList.appendChild(createFileEntry(item)));
            }
        }

        elements.results.style.display = 'block';
    }

    function createFileEntry({ settings, x, y, z, xParam, yParam, zParam }) {
        const div = document.createElement('div');
        let title = `${xParam}: ${x}, ${yParam}: ${y}`;
        if (zParam) title += `, ${zParam}: ${z}`;
        div.textContent = title;
        return div;
    }

    elements.downloadBtn.addEventListener('click', async () => {
        if (generatedSettings.length === 0) return;

        const zip = new JSZip();
        generatedSettings.forEach(({ settings }) => {
            const filename = `${settings.batch_name}.txt`;
            const content = JSON.stringify(settings, null, 4);
            zip.file(filename, content);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'deforum_plot_settings.zip');
    });
});
