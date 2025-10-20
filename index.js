// Deforum XYZ Plot Generator - Main Application Orchestrator
import { elements } from './src/dom.js';
import { initializeFileHandler } from './src/ui/file-handler.js';
import { initializePrompts, getPromptsObject } from './src/ui/prompts.js';
import { populateCommonSettings, initializeCommonSettingsEventListeners } from './src/ui/common-settings.js';
import { initializePlotParams, getValuesForAxis } from './src/ui/plot-params.js';
import { initializeResults, displayResults } from './src/ui/results.js';
import { generateSettings } from './src/core/generator.js';

document.addEventListener('DOMContentLoaded', () => {

    const onFileLoaded = (fileName) => {
        // Update UI state to show all sections
        elements.fileInfo.textContent = `Loaded: ${fileName}`;
        elements.fileInfo.style.display = 'block';
        elements.promptsSection.style.display = 'block';
        elements.commonSettingsSection.style.display = 'block';
        elements.selectParamsSection.style.display = 'block';
        elements.defineValuesSection.style.display = 'block';
        elements.generateSection.style.display = 'block';
        
        // Populate UI with data from the loaded file
        populateCommonSettings();
        initializePrompts();
        initializePlotParams();
        updateBatchNamePreview();
    };
    
    // Set up the batch name preview and link it to common settings changes
    const updateBatchNamePreview = () => initializeResults.updateBatchNamePreview();
    initializeCommonSettingsEventListeners(updateBatchNamePreview);
    
    // Initialize sections that are active from the start
    initializeFileHandler(onFileLoaded);
    initializeResults.initializeBatchNameTemplate(updateBatchNamePreview);

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
                    getValuesForAxis
                );
                displayResults(generated);
            } catch (error) {
                alert(`Generation failed: ${error.message}`);
                console.error(error);
            } finally {
                elements.loadingSpinner.style.display = 'none';
                elements.generateBtn.disabled = false;
            }
        }, 10);
    });
});