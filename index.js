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
        selectParamsSection: document.getElementById('selectParamsSection'),
        defineValuesSection: document.getElementById('defineValuesSection'),
        generateSection: document.getElementById('generateSection'),
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

    const promptsElements = {
        section: document.getElementById('promptsSection'),
        animatePrompts: document.getElementById('animatePrompts'),
        fixedPromptsContainer: document.getElementById('fixedPromptsContainer'),
        animatedPromptsContainer: document.getElementById('animatedPromptsContainer'),
        positivePrompt: document.getElementById('positivePrompt'),
        negativePrompt: document.getElementById('negativePrompt'),
        animatedPromptsFields: document.getElementById('animatedPromptsFields'),
        addKeyframeBtn: document.getElementById('addKeyframeBtn'),
    };

    const commonSettingsElements = {
        section: document.getElementById('commonSettings'),
        max_frames: document.getElementById('max_frames'),
        fps: document.getElementById('fps'),
        durationDisplay: document.getElementById('durationDisplay'),
        sampler: document.getElementById('sampler'),
        seed: document.getElementById('seed'),
        seed_behavior: document.getElementById('seed_behavior'),
        steps: document.getElementById('steps'),
        noise_type: document.getElementById('noise_type'),
        border_mode: document.getElementById('border_mode'),
        strength_schedule: document.getElementById('strength_schedule'),
        cfg_scale_schedule: document.getElementById('cfg_scale_schedule'),
        noise_schedule: document.getElementById('noise_schedule'),
        diffusion_cadence: document.getElementById('diffusion_cadence'),
        color_coherence: document.getElementById('color_coherence'),
    };

    const animationElements = {
        modeRadios: document.querySelectorAll('input[name="animation_mode"]'),
        container2D: document.getElementById('animationMode2DContainer'),
        container3D: document.getElementById('animationMode3DContainer'),
        zoom_2d: document.getElementById('zoom_2d'),
        translation_x_2d: document.getElementById('translation_x_2d'),
        translation_y_2d: document.getElementById('translation_y_2d'),
        rotation_2d: document.getElementById('rotation_2d'),
        translation_x_3d: document.getElementById('translation_x_3d'),
        translation_y_3d: document.getElementById('translation_y_3d'),
        translation_z_3d: document.getElementById('translation_z_3d'),
        rotation_3d_x: document.getElementById('rotation_3d_x'),
        rotation_3d_y: document.getElementById('rotation_3d_y'),
        rotation_3d_z: document.getElementById('rotation_3d_z'),
    };

    const SAMPLERS = [
        'euler', 'euler_a', 'lms', 'heun', 'dpm_2', 'dpm_2_a', 'dpmpp_2s_a', 
        'dpmpp_2m', 'dpmpp_sde', 'ddim', 'uni_pc'
    ];
    const SEED_BEHAVIORS = ['iter', 'fixed', 'random'];
    const BORDER_MODES = ['wrap', 'replicate', 'reflect', 'zeros'];
    const NOISE_TYPES = ['uniform', 'perlin'];

    const PARAM_DESCRIPTIONS = {
        "strength_schedule": "Controls how much the new frame is influenced by the previous one. Higher values mean more change.",
        "cfg_scale": "Controls how strongly the prompt influences the image. Higher values mean stricter adherence to the prompt.",
        "seed": "The starting noise pattern. Different seeds produce different images for the same prompt.",
        "steps": "Number of diffusion steps. More steps can increase detail but also take longer.",
        "zoom": "Simulates camera zoom. Positive values zoom in, negative values zoom out.",
        "translation_x": "Moves the frame left (negative) or right (positive).",
        "translation_y": "Moves the frame up (negative) or down (positive).",
        "translation_z": "Moves the frame forward (positive) or backward (negative) in 3D mode.",
        "rotation_2d": "Rotates the frame clockwise (positive) or counter-clockwise (negative) in 2D mode.",
        "rotation_3d_x": "Rotates the frame around the X-axis (tilts up/down).",
        "rotation_3d_y": "Rotates the frame around the Y-axis (pans left/right).",
        "rotation_3d_z": "Rotates the frame around the Z-axis (rolls clockwise/counter-clockwise).",
        "sampler": "The algorithm used for the diffusion process (e.g., 'euler a', 'dpm++').",
        "animation_mode": "The type of animation, like '2D' or '3D'.",
        "max_frames": "The total number of frames in the animation.",
        "fps": "Frames Per Second. Controls the speed of the final video.",
        "color_coherence": "Tries to maintain consistent colors between frames.",
        "noise_schedule": "Controls the amount of noise added at different stages of the animation.",
        "prompts": "The text descriptions for the AI to generate images from. Can be keyframed for animation."
    };

    const PARAMETER_GROUPS = {
        "Prompts": ["prompts"],
        "Special Parameters": ["sampler"],
        "Favorites": [
            "strength_schedule", "cfg_scale", "seed", "seed_behavior", "steps",
            "zoom", "translation_x", "translation_y", "translation_z",
            "rotation_2d", "rotation_3d_x", "rotation_3d_y", "rotation_3d_z", "noise_schedule"
        ],
        "Run & Animation": ["animation_mode", "max_frames", "fps"],
        "2D Motion": [
            "zoom",
            "translation_x",
            "translation_y",
            "rotation_2d"
        ],
        "3D Motion": [
            "translation_x",
            "translation_y",
            "translation_z",
            "rotation_3d_x",
            "rotation_3d_y",
            "rotation_3d_z",
            "perspective_flip_theta",
            "perspective_flip_phi",
            "perspective_flip_gamma",
            "perspective_flip_fv"
        ],
        "Cohesion & Consistency": [
            "strength_schedule", "color_coherence", "diffusion_cadence",
            "use_horizontal_flip", "use_vertical_flip", "optical_flow_cadence", "optical_flow_redo_generation"
        ],
        "Noise": ["noise_schedule", "noise_type", "perlin_init", "perlin_mode", "perlin_w", "perlin_h", "perlin_octaves", "perlin_persistence"],
        "Seed": ["seed", "seed_behavior", "seed_iter_N"],
        "CFG & Sampling": ["cfg_scale", "steps", "seed_resize_from_w", "seed_resize_from_h"],
        "Image Dimensions": ["W", "H"],
    };

    const PARAM_TYPES = {
        BOOLEAN: ['use_horizontal_flip', 'use_vertical_flip', 'normalize_latent_vectors'],
        SAMPLER: ['sampler'],
        PROMPTS: ['prompts'],
    };

    function getParamType(paramName) {
        if (!paramName) return 'UNKNOWN';
        if (PARAM_TYPES.BOOLEAN.includes(paramName)) return 'BOOLEAN';
        if (PARAM_TYPES.SAMPLER.includes(paramName)) return 'SAMPLER';
        if (PARAM_TYPES.PROMPTS.includes(paramName)) return 'PROMPTS';
        if (paramName.endsWith('_schedule')) return 'SCHEDULE';
        return 'NUMERIC';
    }


    // --- File Handling & UI Progression ---
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
        if (e.target.files) {
            handleFiles(e.target.files);
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
            const result = e.target?.result;
            if (typeof result !== 'string' || result.trim() === '') {
                alert('Error: The selected file is empty or could not be read.');
                resetUIState();
                return;
            }

            const contentWithoutComments = result.replace(/^(?!\s*["'])s*\/\/[^\r\n]*|(?<!:)\/\/[^\r\n]*/gm, '').replace(/^\s*#.*/gm, '');

            try {
                baseSettings = JSON.parse(contentWithoutComments);
                if (typeof baseSettings !== 'object' || baseSettings === null) {
                    throw new Error("Parsed content is not a valid object.");
                }
                parameterList = Object.keys(baseSettings).sort();

                // Manually add parameters that might not be in all settings files but are supported by the UI
                ['rotation_2d'].forEach(p => {
                    if (!parameterList.includes(p)) {
                        parameterList.push(p);
                    }
                });
                parameterList.sort();

                populateParameters();
                elements.fileInfo.textContent = `Loaded: ${file.name}`;
                elements.fileInfo.style.display = 'block';
                promptsElements.section.style.display = 'block';
                commonSettingsElements.section.style.display = 'block';
                elements.selectParamsSection.style.display = 'block';
                elements.defineValuesSection.style.display = 'block';
                elements.generateSection.style.display = 'block';
                
                populateCommonSettings();
                initializePromptsUI();
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
        promptsElements.section.style.display = 'none';
        commonSettingsElements.section.style.display = 'none';
        elements.selectParamsSection.style.display = 'none';
        elements.defineValuesSection.style.display = 'none';
        elements.generateSection.style.display = 'none';
        ['xParam', 'yParam', 'zParam'].forEach(id => {
            const select = document.getElementById(id);
            if (select) select.innerHTML = '<option value="">Select Parameter</option>';
        });
    }

    // --- Prompts Section ---
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

    promptsElements.addKeyframeBtn.addEventListener('click', () => addKeyframeRow());
    
    function togglePromptView() {
        const isAnimated = promptsElements.animatePrompts.checked;
        
        if (isAnimated) {
            // If the animated container was hidden, it means we're switching TO animated prompts.
            // So, we pre-populate it from the fixed prompts.
            if (promptsElements.animatedPromptsContainer.style.display === 'none') {
                const positive = promptsElements.positivePrompt.value.trim();
                const negative = promptsElements.negativePrompt.value.trim();
                const combined = negative ? `${positive} --neg ${negative}` : positive;
                
                // Clear any old keyframes and create the new one from the fixed prompts.
                promptsElements.animatedPromptsFields.innerHTML = '';
                addKeyframeRow('0', combined);

                // Add a second, empty keyframe for convenience if the first one had content.
                if (combined) {
                    addKeyframeRow('', '');
                }
            }
        }
        
        promptsElements.animatedPromptsContainer.style.display = isAnimated ? 'block' : 'none';
        promptsElements.fixedPromptsContainer.style.display = isAnimated ? 'none' : 'block';
    }

    function initializePromptsUI() {
        const prompts = baseSettings.prompts || { "0": "" };
        const keys = Object.keys(prompts).sort((a,b) => parseInt(a,10) - parseInt(b,10));

        if (keys.length > 1 || (keys.length === 1 && keys[0] !== "0")) {
            // Animated prompts
            promptsElements.animatePrompts.checked = true;
            promptsElements.animatedPromptsFields.innerHTML = '';
            keys.forEach(key => addKeyframeRow(key, prompts[key]));
        } else {
            // Fixed prompt
            promptsElements.animatePrompts.checked = false;
            const promptString = prompts[keys[0] || "0"] || "";
            
            let separator = ' --neg ';
            let parts = promptString.split(separator);
            if (parts.length === 1) {
                separator = ' -neg '; // Fallback for older format
                parts = promptString.split(separator);
            }

            promptsElements.positivePrompt.value = parts[0].trim();
            promptsElements.negativePrompt.value = (parts.length > 1) ? parts[1].trim() : "";
        }
        
        togglePromptView();
    }
    
    function getPromptsObject() {
        if (promptsElements.animatePrompts.checked) {
            const prompts = {};
            const rows = promptsElements.animatedPromptsFields.querySelectorAll('.keyframe-row');
            rows.forEach(row => {
                const frameInput = row.querySelector('.keyframe-frame');
                const promptInput = row.querySelector('.keyframe-prompt');
                const frame = frameInput.value.trim();
                const prompt = promptInput.value.trim();
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

    promptsElements.animatePrompts.addEventListener('change', togglePromptView);


    // --- Common Settings Section ---
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
    
    function populateSelect(element, options, defaultValue) {
        element.innerHTML = '';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
            element.appendChild(option);
        });
        element.value = defaultValue;
    }

    function populateCommonSettings() {
        // Simple value fields
        commonSettingsElements.max_frames.value = baseSettings.max_frames || '';
        commonSettingsElements.fps.value = baseSettings.fps || '';
        commonSettingsElements.seed.value = baseSettings.seed || '';
        commonSettingsElements.steps.value = baseSettings.steps || '';
        commonSettingsElements.strength_schedule.value = baseSettings.strength_schedule || '';
        commonSettingsElements.cfg_scale_schedule.value = baseSettings.cfg_scale || '';
        commonSettingsElements.noise_schedule.value = baseSettings.noise_schedule || '';
        commonSettingsElements.diffusion_cadence.value = baseSettings.diffusion_cadence || '';
        commonSettingsElements.color_coherence.value = baseSettings.color_coherence || '';

        // Dropdowns
        populateSelect(commonSettingsElements.seed_behavior, SEED_BEHAVIORS, baseSettings.seed_behavior || 'iter');
        populateSelect(commonSettingsElements.border_mode, BORDER_MODES, baseSettings.border_mode || 'wrap');
        populateSelect(commonSettingsElements.noise_type, NOISE_TYPES, baseSettings.noise_type || 'uniform');
        
        // Sampler Dropdown
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
    
    function toggleAnimationModeView() {
        const selectedMode = document.querySelector('input[name="animation_mode"]:checked').value;
        baseSettings.animation_mode = selectedMode;
        if (selectedMode === '2D') {
            animationElements.container2D.style.display = 'block';
            animationElements.container3D.style.display = 'none';
        } else { // 3D
            animationElements.container2D.style.display = 'none';
            animationElements.container3D.style.display = 'block';
        }
    }
    
    // Add event listeners for common settings
    Object.keys(commonSettingsElements).forEach(key => {
        const element = commonSettingsElements[key];
        if (element && element.tagName) { // Check if it's an HTML element
            element.addEventListener('input', (e) => {
                const value = e.target.value;
                // Try to convert to number if it's not a schedule-like string
                if (key !== 'strength_schedule' && key !== 'cfg_scale_schedule' && key !== 'noise_schedule' && key !== 'diffusion_cadence' && key !== 'color_coherence') {
                    const numValue = parseFloat(value);
                    baseSettings[key] = isNaN(numValue) ? value : numValue;
                } else {
                    baseSettings[key] = value;
                }
                
                if (key === 'max_frames' || key === 'fps') {
                    updateDuration();
                }
                 updateBatchNamePreview();
            });
        }
    });

    Object.keys(animationElements).forEach(key => {
        const element = animationElements[key];
        if (element && element.tagName) { // Check if it's an HTML element
             element.addEventListener('input', (e) => {
                let paramName = e.target.id;
                // Map 2D/3D specific IDs back to the generic param name in baseSettings
                if (paramName.endsWith('_2d')) {
                    paramName = (paramName === 'zoom_2d') ? 'zoom' : paramName.replace('_2d', '');
                } else if (paramName.endsWith('_3d')) {
                    paramName = paramName.replace('_3d', '');
                }
                baseSettings[paramName] = e.target.value;
            });
        }
    });

    animationElements.modeRadios.forEach(radio => {
        radio.addEventListener('change', toggleAnimationModeView);
    });

    // --- Parameter Selection ---
    function populateParameters() {
        const selects = [elements.xParam, elements.yParam, elements.zParam];
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Parameter</option>'; // Clear existing
            Object.keys(PARAMETER_GROUPS).forEach(groupName => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = groupName;
                PARAMETER_GROUPS[groupName].forEach(param => {
                    // Only add if it exists in the base file or is a special case
                    if (parameterList.includes(param) || ['sampler', 'prompts'].includes(param)) {
                        const option = document.createElement('option');
                        option.value = param;
                        option.textContent = param;
                        optgroup.appendChild(option);
                    }
                });
                if (optgroup.children.length > 0) {
                   select.appendChild(optgroup);
                }
            });
        });
        
        // Populate sampler multi-selects
        const samplerSelects = document.querySelectorAll('.sampler-value-select');
        samplerSelects.forEach(select => {
            select.innerHTML = '';
            SAMPLERS.forEach(sampler => {
                const option = document.createElement('option');
                option.value = sampler;
                option.textContent = sampler;
                select.appendChild(option);
            });
        });
    }

    elements.enableZ.addEventListener('change', () => {
        const enabled = elements.enableZ.checked;
        elements.zParamGroup.style.display = enabled ? 'block' : 'none';
        elements.zValues.style.display = enabled ? 'block' : 'none';
        updateBatchNamePreview();
    });

    ['x', 'y', 'z'].forEach(axis => {
        const paramSelect = elements[`${axis}Param`];
        paramSelect.addEventListener('change', (e) => {
            updateParamUI(axis, e.target.value);
            updateBatchNamePreview();
        });
        const promptModeSelect = document.getElementById(`${axis}PromptMode`);
        promptModeSelect.addEventListener('change', () => updateParamUI(axis, paramSelect.value));
    });

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

        if (paramType === 'SAMPLER') {
            valueFields.style.display = 'none';
            samplerContainer.style.display = 'block';
            promptOptions.style.display = 'none';
        } else if (paramType === 'PROMPTS') {
            valueFields.style.display = 'block';
            samplerContainer.style.display = 'none';
            promptOptions.style.display = 'block';
            const mode = document.getElementById(`${axis}PromptMode`).value;
            firstInput.placeholder = mode === 'append' 
                ? 'e.g., cinematic lighting, 4k' 
                : 'e.g., {"0": "a new prompt"}';
        } else {
            valueFields.style.display = 'block';
            samplerContainer.style.display = 'none';
            promptOptions.style.display = 'none';
            
            if (paramType === 'BOOLEAN') {
                firstInput.placeholder = 'e.g., true, false';
            } else if (paramType === 'SCHEDULE') {
                firstInput.placeholder = 'e.g., "0: (0.5), 100: (0.8)"';
            } else {
                firstInput.placeholder = 'Value or Range';
            }
        }
    }
    
    function updateParamInfo(axis, paramName) {
        const infoEl = elements[`${axis}ParamInfo`];
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
        const description = PARAM_DESCRIPTIONS[paramName] || "No description available for this parameter.";
        reminderEl.innerHTML = `
            <strong>${paramName}</strong>
            <em>${description}</em>
            <small>Enter the values you want to test for this parameter below.</small>
        `;
        reminderEl.style.display = 'block';
    }


    // --- Value Definition ---
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

    function parseValueString(str) {
        if (!str || str.trim() === '') return [];
        str = str.trim();

        if (str.includes(',')) {
            return str.split(',').map(s => s.trim()).map(val => isNaN(parseFloat(val)) || !isFinite(val) ? val : parseFloat(val));
        }

        const stepMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)\s*\(\s*\+\s*(-?[\d\.]+)\s*\)$/);
        if (stepMatch) {
            const [, start, end, step] = stepMatch.map(parseFloat);
            const values = [];
            for (let i = start; i <= end; i += step) {
                values.push(parseFloat(i.toPrecision(10)));
            }
            return values;
        }

        const countMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)\s*\[\s*(\d+)\s*\]$/);
        if (countMatch) {
            const [, start, end] = countMatch.map(parseFloat);
            const count = parseInt(countMatch[3], 10);
            if (count <= 1) return [start];
            const values = [];
            const step = (end - start) / (count - 1);
            for (let i = 0; i < count; i++) {
                values.push(parseFloat((start + i * step).toPrecision(10)));
            }
            return values;
        }

        const rangeMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)$/);
        if (rangeMatch) {
            const [, start, end] = rangeMatch.map(parseFloat);
            const values = [];
            for (let i = start; i <= end; i++) {
                values.push(i);
            }
            return values;
        }

        return [isNaN(parseFloat(str)) || !isFinite(str) ? str : parseFloat(str)];
    }

    function getValuesForAxis(axis) {
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


    // --- Batch Name Template ---
    function updateBatchNamePreview() {
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

    elements.batchNameTemplate.addEventListener('input', updateBatchNamePreview);
    elements.variableButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('variable-btn')) {
            const variable = e.target.dataset.variable;
            elements.batchNameTemplate.value += variable;
            elements.batchNameTemplate.focus();
            updateBatchNamePreview();
        }
    });

    // --- Generation Logic ---
    function generate() {
        elements.loadingSpinner.style.display = 'inline-block';
        elements.generateBtn.disabled = true;
        elements.results.style.display = 'none';
        elements.fileList.innerHTML = '';
        generatedSettings = [];

        setTimeout(() => {
            try {
                const xParam = elements.xParam.value;
                const yParam = elements.yParam.value;
                const zParam = elements.enableZ.checked ? elements.zParam.value : null;

                const xValues = getValuesForAxis('x');
                const yValues = getValuesForAxis('y');
                const zValues = zParam ? getValuesForAxis('z') : [null];

                if (!xParam || !yParam) throw new Error("X and Y-Axis parameters must be selected.");
                if (xValues.length === 0 || yValues.length === 0) throw new Error("X and Y-Axis must have at least one value.");
                if (zParam && zValues.length === 0) throw new Error("Z-Axis must have at least one value when enabled.");
                
                const commonOverrides = {};
                // Grab all values from common settings section
                Object.keys(commonSettingsElements).forEach(key => {
                    const el = commonSettingsElements[key];
                    if (el && el.value !== undefined && el.id !== 'durationDisplay') {
                         const val = el.value;
                         const numVal = parseFloat(val);
                         commonOverrides[key] = (String(val) === String(numVal)) ? numVal : val;
                    }
                });
                
                // Motion params
                const selectedMode = document.querySelector('input[name="animation_mode"]:checked').value;
                commonOverrides.animation_mode = selectedMode;
                const container = selectedMode === '2D' ? animationElements.container2D : animationElements.container3D;
                container.querySelectorAll('input').forEach(input => {
                    let paramName = input.id;
                    if (paramName.endsWith('_2d')) paramName = (paramName === 'zoom_2d') ? 'zoom' : paramName.replace('_2d', '');
                    else if (paramName.endsWith('_3d')) paramName = paramName.replace('_3d', '');
                    commonOverrides[paramName] = input.value;
                });
                commonOverrides.cfg_scale = commonOverrides.cfg_scale_schedule;
                delete commonOverrides.cfg_scale_schedule;

                const basePrompts = getPromptsObject();

                for (const zVal of zValues) {
                    for (const yVal of yValues) {
                        for (const xVal of xValues) {
                            const newSettings = { ...baseSettings, ...commonOverrides };
                            
                            // Start with base prompts, then apply axis modifications
                            let currentPrompts = JSON.parse(JSON.stringify(basePrompts)); // deep copy

                            // Apply X, Y, Z axis prompt modifications
                            [
                                { param: xParam, value: xVal, axis: 'x' },
                                { param: yParam, value: yVal, axis: 'y' },
                                { param: zParam, value: zVal, axis: 'z' }
                            ].forEach(({ param, value, axis }) => {
                                if (param === 'prompts') {
                                    const mode = document.getElementById(`${axis}PromptMode`).value;
                                    if (mode === 'override') {
                                        try {
                                            currentPrompts = JSON.parse(value);
                                        } catch (e) {
                                            console.warn(`Invalid JSON in prompt override for ${axis}-axis:`, value);
                                            // Keep previous prompts if parse fails
                                        }
                                    } else { // append
                                        for (const frame in currentPrompts) {
                                            currentPrompts[frame] += `, ${value}`;
                                        }
                                    }
                                } else if (param) {
                                    newSettings[param] = value;
                                }
                            });
                            
                            newSettings.prompts = currentPrompts;
                             
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
                displayResults();
            } catch (error) {
                alert(`Generation failed: ${error.message}`);
                console.error(error);
            } finally {
                elements.loadingSpinner.style.display = 'none';
                elements.generateBtn.disabled = false;
            }
        }, 10);
    }
    
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
            strength: cleanValue(settings.strength_schedule),
            max_frames: settings.max_frames,
        };

        for (const [key, value] of Object.entries(replacements)) {
            template = template.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        return template + '.txt';
    }


    function displayResults() {
        elements.fileCount.textContent = generatedSettings.length;
        elements.fileList.innerHTML = '';
        
        generatedSettings.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.textContent = file.filename;
            elements.fileList.appendChild(fileDiv);
        });

        elements.results.style.display = 'block';
    }

    elements.generateBtn.addEventListener('click', generate);

    elements.downloadBtn.addEventListener('click', () => {
        const zip = new JSZip();
        generatedSettings.forEach(file => {
            zip.file(file.filename, file.content);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, 'deforum_plot_settings.zip');
        });
    });

});