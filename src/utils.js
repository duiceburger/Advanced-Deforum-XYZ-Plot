// src/utils.js
import { PARAM_TYPES } from './constants.js';

export function getParamType(paramName) {
    if (!paramName) return 'UNKNOWN';
    if (PARAM_TYPES.BOOLEAN.includes(paramName)) return 'BOOLEAN';
    if (PARAM_TYPES.SAMPLER.includes(paramName)) return 'SAMPLER';
    if (PARAM_TYPES.PROMPTS.includes(paramName)) return 'PROMPTS';
    if (paramName.endsWith('_schedule') || paramName === 'cfg_scale') return 'SCHEDULE';
    return 'NUMERIC';
}

export function parseValueString(str) {
    if (str === null || str === undefined || str.trim() === '') return [];
    str = str.trim();

    // Helper to round numbers to a high precision to avoid floating point artifacts
    const preciseRound = (num, decimalPlaces = 10) => {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(num * factor) / factor;
    };

    // Format: 1-5 (+2)
    const stepMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)\s*\(\s*\+\s*(-?[\d\.]+)\s*\)$/);
    if (stepMatch) {
        const [, start, end, step] = stepMatch.map(parseFloat);

        if (isNaN(start) || isNaN(end) || isNaN(step)) {
            console.warn(`Invalid number in stepped range format: "${str}"`);
            return [];
        }
        if (step === 0) {
            console.warn(`Step cannot be zero in range: "${str}"`);
            return [start];
        }
        if ((end > start && step < 0) || (start > end && step > 0)) {
            console.warn(`Step direction conflicts with range direction: "${str}"`);
            return [];
        }

        const values = [];
        const increasing = end > start;
        // Use a small epsilon to handle floating point inaccuracies at the boundary
        const boundary = increasing ? end + 1e-9 : end - 1e-9;
        for (let i = start; increasing ? i <= boundary : i >= boundary; i += step) {
            values.push(preciseRound(i));
        }
        return values;
    }

    // Format: 1-10 [5]
    const countMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)\s*\[\s*(\d+)\s*\]$/);
    if (countMatch) {
        const [, start, end] = countMatch.map(parseFloat);
        const count = parseInt(countMatch[3], 10);

        if (isNaN(start) || isNaN(end) || isNaN(count)) {
            console.warn(`Invalid number in ranged count format: "${str}"`);
            return [];
        }
        if (count < 0) {
            console.warn(`Count cannot be negative: "${str}"`);
            return [];
        }
        if (count === 0) return [];
        if (count === 1) return [start];
        
        const values = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) {
            values.push(preciseRound(start + i * step));
        }
        return values;
    }

    // Format: 1-5 (integer steps only)
    const rangeMatch = str.match(/^(-?\d+)\s*-\s*(-?\d+)$/);
    if (rangeMatch) {
        const [, start, end] = rangeMatch.map(parseInt);
        if (start > end) {
            console.warn(`Start of simple range is greater than end: "${str}"`);
            return [];
        }
        const values = [];
        for (let i = start; i <= end; i++) {
            values.push(i);
        }
        return values;
    }
    
    // Universal item processor for lists and single items
    const processItem = (s) => {
        const val = s.trim();
        if (val === '') return null;
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
        // Use isFinite which is more robust than just checking for numbers
        if (isFinite(val)) { 
            return parseFloat(val);
        }
        return val; // Return as a string if it's not a number or boolean
    };

    // Format: 1, 2, 5 OR true, false, value
    if (str.includes(',')) {
        return str.split(',').map(processItem).filter(v => v !== null);
    }

    // Format: 7 OR true OR "some value"
    const singleValue = processItem(str);
    return singleValue !== null ? [singleValue] : [];
}


export function populateSelect(element, options, defaultValue) {
    element.innerHTML = '';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = String(opt).charAt(0).toUpperCase() + String(opt).slice(1);
        element.appendChild(option);
    });
    if (defaultValue) {
        element.value = defaultValue;
    }
}

/**
 * Extracts a numeric value from a string, handling Deforum schedule formats like "0: (1.04)".
 * @param {string | number} value The value to parse.
 * @returns {number} The parsed numeric value, or NaN if not a number.
 */
function getNumericValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return NaN;
    // Match numbers in parentheses, like in "0: (1.2)"
    const match = value.match(/\(([^)]+)\)/);
    // Use the matched value or the original string
    const potentialNumber = match ? match[1].trim() : value.trim();
    // Check if it's a valid finite number
    if (isFinite(potentialNumber) && potentialNumber !== '') {
        return parseFloat(potentialNumber);
    }
    return NaN;
}

/**
 * Formats a start and end value into a suggested range string.
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} count The number of steps.
 * @returns {string} The formatted suggestion string, e.g., "0.2-0.9 [5]".
 */
function formatSuggestion(start, end, count = 5) {
    // Use a higher precision for rounding to avoid floating point artifacts
    const factor = Math.pow(10, 4);
    const s = Math.round(start * factor) / factor;
    const e = Math.round(end * factor) / factor;
    return `${s}-${e} [${count}]`;
}


/**
 * Generates a suggested value range string for a given parameter and its current value.
 * @param {string} paramName The name of the parameter (e.g., 'strength').
 * @param {string | number} currentValue The parameter's current value from the settings file.
 * @returns {string} A suggested value string (e.g., "0.2-0.9 [5]") or a helpful message.
 */
export function generateSuggestedValues(paramName, currentValue) {
    if (currentValue === undefined) {
        return 'Not available in base settings file.';
    }

    const paramType = getParamType(paramName);
    if (paramType === 'BOOLEAN') return 'true, false';
    if (paramType === 'SAMPLER') return `(Select from multi-choice list)`;
    if (paramType === 'PROMPTS') return `(Enter text prompts)`;

    const v = getNumericValue(currentValue);

    if (isNaN(v)) {
        // If parsing fails, it's likely a non-numeric string value.
        // Return it as-is, quoted, to indicate it's a string literal.
        return `"${String(currentValue)}"`;
    }

    // Use specific logic for known parameters
    switch (paramName) {
        case 'strength_schedule':
        case 'strength':
            return formatSuggestion(Math.max(0, v - 0.6), Math.min(1.0, v + 0.1));
        
        case 'cfg_scale_schedule':
        case 'cfg_scale':
            return formatSuggestion(Math.max(1, v - 5), v + 10);
            
        case 'steps':
            return formatSuggestion(Math.max(10, Math.round(v * 0.7)), Math.round(v * 1.8));
            
        case 'fps':
             return formatSuggestion(Math.max(10, Math.round(v - 9)), Math.round(v + 6));
             
        case 'zoom':
        case 'zoom_2d':
            return formatSuggestion(v - 0.04, v + 0.06);

        case 'translation_x':
        case 'translation_y':
        case 'translation_x_2d':
        case 'translation_y_2d':
        case 'translation_x_3d':
        case 'translation_y_3d':
        case 'rotation_2d':
        case 'rotation_3d_x':
        case 'rotation_3d_y':
        case 'rotation_3d_z':
            if (v === 0) return '-2, -1, 0, 1, 2';
            const range = Math.max(2, Math.ceil(Math.abs(v) * 1.5));
            return formatSuggestion(v - range, v + range);

        case 'translation_z':
        case 'translation_z_3d':
             if (v === 0) return '0-10 [5]';
             const z_range = Math.max(5, Math.ceil(Math.abs(v) * 1.5));
             return formatSuggestion(v - z_range, v + z_range);
             
        // Generic fallbacks for unhandled numeric types
        default:
            if (v === 0) return '-2, -1, 0, 1, 2';
            if (Math.abs(v) > 0 && Math.abs(v) <= 1) { // Likely a percentage/ratio
                 return formatSuggestion(Math.max(0, v - 0.5), Math.min(1.0, v + 0.5));
            }
            if (Number.isInteger(v)) { // Integer-like value
                 return formatSuggestion(Math.round(v * 0.5), Math.round(v * 1.5));
            }
            // Other floats
            return formatSuggestion(v * 0.5, v * 1.5);
    }
}