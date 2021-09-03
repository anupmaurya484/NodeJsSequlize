import {config} from '../utils/workflow.config';

export const UPDATE_WORKFLOW_SETTING = 'UPDATE_WORKFLOW_SETTING';
export const UPDATE_WORKFLOW_VARIABLES = 'UPDATE_WORKFLOW_VARIABLES';
export const ADD_VARIABLE = 'ADD_VARIABLE';
export const REMOVE_VARIABLE = 'REMOVE_VARIABLE';
export const UPDATE_VARIABLE = 'UPDATE_VARIABLE';
export const TOGGLE_SETTING_VARIABLE_FORM = 'TOGGLE_SETTING_VARIABLE_FORM';

export function toggleSettingVariableForm (isDisplay) {
    return {
        type: TOGGLE_SETTING_VARIABLE_FORM,
        payload: isDisplay
    }
}

export function updateWorkflowSetting (data) {
    return {
        type: UPDATE_WORKFLOW_SETTING,
        payload: data
    }
}

export function updateWorkflowVariables (data) {
    return {
        type: UPDATE_WORKFLOW_VARIABLES,
        payload: data
    }
}
export function addVariable (data) {
    return {
        type: ADD_VARIABLE,
        payload: data
    }
}

export function removeVariable (index) {
    return {
        type: REMOVE_VARIABLE,
        payload: index
    }
}

export function updateVariable (index, data) {
    return {
        type: UPDATE_VARIABLE,
        payload: {index, data}
    }
}
