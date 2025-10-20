// Deforum XYZ Plot Generator - Main Application Orchestrator
import { elements } from './src/dom.js';
import { initializeFileHandler } from './src/ui/file-handler.js';
import { initializePrompts, getPromptsObject } from './src/ui/prompts.js';
import { populateCommonSettings, initializeCommonSettingsEventListeners } from './src/ui/common-settings.js';
import { initializePlotParams, getValuesForAxis } from './src/ui/plot-params.js';
import { initializeResults, displayResults, updateSuggestedTemplate, updateBatchNamePreview } from './src/ui/results.js';
import { initializeInitImage, populateInitImage, getInitImageSettings } from './src/ui/init-image.js';
import { generateSettings } from './src/core/generator.js';

document.addEventListener('DOMContentLoaded', () => {

    // Regenerates the template suggestion AND updates the preview.
    // Should be used when plot parameters change.
    const updateTemplateAndPreview = () => {
        updateSuggestedTemplate();
        updateBatchNamePreview();
    };
    
    // ONLY updates the preview based on the current template.
    // Used for variable clicks, manual edits, and common settings changes.
    const updatePreviewOnly = () => {
        updateBatchNamePreview();
    };


    const onFileLoaded = (fileName) => {
        // Update UI state to show all sections
        elements.fileInfo.textContent = `Loaded: ${fileName}`;
        elements.fileInfo.style.display = 'block';
        elements.promptsSection.style.display = 'block';
        elements.commonSettingsSection.style.display = 'block';
        elements.selectParamsSection.style.display = 'block';
        elements.defineValuesSection.style.display = 'block';
        elements.initImageSection.style.display = 'block';
        elements.generateSection.style.display = 'block';
        
        // Populate UI with data from the loaded file
        populateCommonSettings();
        initializePrompts();
        populateInitImage();
        // Changing a plot parameter should suggest a new template
        initializePlotParams(updateTemplateAndPreview);
        // Trigger initial suggestion
        updateTemplateAndPreview();
    };
    
    // Common settings changes should only update the preview, not overwrite the template
    initializeCommonSettingsEventListeners(updatePreviewOnly);
    
    // Initialize sections that are active from the start
    initializeFileHandler(onFileLoaded);
    initializeInitImage();
    // Variable button clicks and template edits should only update the preview
    initializeResults(updatePreviewOnly);

    // Wire up the main generate button
    elements.generateBtn.addEventListener('click', () => {
        elements.loadingSpinner.style.display = 'inline-block';
        elements.generateBtn.disabled = true;
        elements.results.style.display = 'none';

        // Use a timeout to allow the UI to update before the heavy generation logic starts
        setTimeout(() => {
            try {
                const generated = generateSettings(
                    getPromptsObject,
                    getValuesForAxis,
                    getInitImageSettings
                );
                displayResults(generated);
            } catch (error) {
                let userMessage = `Generation failed: ${error.message}`;

                const highlightError = (axis) => {
                    const input = document.querySelector(`.${axis}-value`);
                    if (input && input.offsetParent !== null) { // Check if visible
                        input.classList.add('invalid-input');
                        input.focus();
                        input.addEventListener('input', () => input.classList.remove('invalid-input'), { once: true });
                    }
                    const samplerSelect = document.getElementById(`${axis}SamplerValues`);
                    if (samplerSelect && samplerSelect.offsetParent !== null) { // Check if visible
                        samplerSelect.classList.add('invalid-input');
                        samplerSelect.focus();
                        samplerSelect.addEventListener('change', () => samplerSelect.classList.remove('invalid-input'), { once: true });
                    }
                };
                
                if (error.message.startsWith('X_AXIS_EMPTY')) {
                    userMessage = error.message.replace('X_AXIS_EMPTY: ', '');
                    highlightError('x');
                } else if (error.message.startsWith('Y_AXIS_EMPTY')) {
                    userMessage = error.message.replace('Y_AXIS_EMPTY: ', '');
                    highlightError('y');
                } else if (error.message.startsWith('Z_AXIS_EMPTY')) {
                    userMessage = error.message.replace('Z_AXIS_EMPTY: ', '');
                    highlightError('z');
                }
            
                alert(userMessage);
                console.error(error);
            } finally {
                elements.loadingSpinner.style.display = 'none';
                elements.generateBtn.disabled = false;
            }
        }, 10);
    });
});