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
    
    // Format: 1, 2, 5 OR true, false, value
    if (str.includes(',')) {
        return str.split(',').map(s => {
            const val = s.trim();
            if (val === '') return null;
            // isFinite is a good way to check if a string represents a number
            if (isFinite(val)) { 
                return parseFloat(val);
            }
            return val;
        }).filter(v => v !== null); // Remove empty values from "a,,b"
    }

    // Format: 7 OR true OR "some value"
    if (isFinite(str) && str.trim() !== '') {
        return [parseFloat(str)];
    }
    
    // Fallback to a single string value
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