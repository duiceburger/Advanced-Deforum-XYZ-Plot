// src/ui/file-handler.js
import { setBaseSettings, addParameter } from '../state.js';
import { elements } from '../dom.js';

const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

const highlight = () => elements.dropZone.classList.add('dragover');
const unhighlight = () => elements.dropZone.classList.remove('dragover');

function handleFile(file, onFileLoaded) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string' || result.trim() === '') {
            alert('Error: The selected file is empty or could not be read.');
            return;
        }

        const contentWithoutComments = result.replace(/^(?!\s*["'])s*\/\/[^\r\n]*|(?<!:)\/\/[^\r\n]*/gm, '').replace(/^\s*#.*/gm, '');

        try {
            const parsedSettings = JSON.parse(contentWithoutComments);
            if (typeof parsedSettings !== 'object' || parsedSettings === null) {
                throw new Error("Parsed content is not a valid object.");
            }
            
            setBaseSettings(parsedSettings);

            // Manually add parameters that might not be in all settings files but are supported
            addParameter('rotation_2d');
            addParameter('prompts');
            addParameter('sampler');
            
            onFileLoaded(file.name);
        } catch (error) {
            console.error("Parsing error:", error);
            alert(`Error parsing settings file: ${error.message}. Please ensure it's a valid Deforum JSON/TXT file.`);
        }
    };
    reader.onerror = () => {
         alert('Error reading the file.');
    };
    reader.readAsText(file);
}

export function initializeFileHandler(onFileLoaded) {
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
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0], onFileLoaded);
    });

    elements.settingsFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0], onFileLoaded);
        }
    });
}
