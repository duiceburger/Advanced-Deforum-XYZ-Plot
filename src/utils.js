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
    if (!str || str.trim() === '') return [];
    str = str.trim();

    // Check for complex range formats FIRST, as they contain characters that
    // would otherwise be interpreted as non-numeric strings.

    // Format: 1-5 (+2)
    const stepMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)\s*\(\s*\+\s*(-?[\d\.]+)\s*\)$/);
    if (stepMatch) {
        const [, start, end, step] = stepMatch.map(parseFloat);
        const values = [];
        if (step === 0) return [start];
        const increasing = end > start;
        for (let i = start; increasing ? i <= end + 1e-9 : i >= end - 1e-9; i += step) {
            // Use toPrecision to handle floating point arithmetic issues
            values.push(parseFloat(i.toPrecision(10)));
        }
        return values;
    }

    // Format: 1-10 [5]
    const countMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)\s*\[\s*(\d+)\s*\]$/);
    if (countMatch) {
        const [, start, end] = countMatch.map(parseFloat);
        const count = parseInt(countMatch[3], 10);
        if (count <= 1) return [start];
        const values = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) {
             // Use toPrecision to handle floating point arithmetic issues
            values.push(parseFloat((start + i * step).toPrecision(10)));
        }
        return values;
    }

    // Format: 1-5
    const rangeMatch = str.match(/^(-?[\d\.]+)\s*-\s*(-?[\d\.]+)$/);
    if (rangeMatch) {
        const [, start, end] = rangeMatch.map(parseFloat);
        const values = [];
        // Assumes integer steps for simple ranges, which is common.
        for (let i = start; i <= end; i++) {
            values.push(i);
        }
        return values;
    }
    
    // Format: 1, 2, 5 OR true, false, value
    if (str.includes(',')) {
        return str.split(',').map(s => {
            const val = s.trim();
            // isFinite is a good way to check if a string represents a number
            if (isFinite(val) && val !== '') { 
                return parseFloat(val);
            }
            return val;
        });
    }

    // Format: 7 OR true OR "some value"
    if (isFinite(str) && str.trim() !== '') {
        return [parseFloat(str)];
    }
    
    return [str];
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