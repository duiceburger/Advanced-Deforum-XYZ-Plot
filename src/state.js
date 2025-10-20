// src/state.js

let state = {
    baseSettings: {},
    parameterList: [],
    generatedSettings: [],
};

export const getBaseSettings = () => state.baseSettings;

export const setBaseSettings = (settings) => {
    state.baseSettings = settings;
    state.parameterList = Object.keys(settings).sort();
};

export const updateBaseSetting = (key, value) => {
    if (state.baseSettings) {
        state.baseSettings[key] = value;
    }
};

export const getParameterList = () => state.parameterList;

export const addParameter = (param) => {
    if (!state.parameterList.includes(param)) {
        state.parameterList.push(param);
        state.parameterList.sort();
    }
};

export const getGeneratedSettings = () => state.generatedSettings;

export const setGeneratedSettings = (settings) => {
    state.generatedSettings = settings;
};
