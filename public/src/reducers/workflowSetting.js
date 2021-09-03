import {
    UPDATE_WORKFLOW_SETTING,
    UPDATE_WORKFLOW_VARIABLES,
    UPDATE_VARIABLE,
    REMOVE_VARIABLE,
    ADD_VARIABLE,
    TOGGLE_SETTING_VARIABLE_FORM
} from '../actions/workflowSetting.action';

const initial = {
    detail: {
        "workflowName": "",
        "workflowDescription": ""
    },
    variables: [],
    displayVariableForm: false
}

const workflowSetting = (state = initial, action) => {
    console.log(action)
  switch (action.type) {
      case UPDATE_WORKFLOW_SETTING: return Object.assign({}, state, {detail: action.payload});
      case UPDATE_WORKFLOW_VARIABLES: return Object.assign({}, state, {variables: action.payload});
      case ADD_VARIABLE: return Object.assign({}, state, {variables: [
          ...state.variables,
          action.payload
      ], displayVariableForm: false});
      case REMOVE_VARIABLE: return Object.assign({}, state, {variables: [
          ...state.variables.slice(0, action.payload),
          ...state.variables.slice(action.payload + 1)
      ]});
      case UPDATE_VARIABLE: return Object.assign({}, state, {variables: [
          ...state.variables.slice(0, action.payload.index),
          action.payload.data,
          ...state.variables.slice(action.payload.index + 1)
      ], displayVariableForm: false});
      case TOGGLE_SETTING_VARIABLE_FORM: return Object.assign({}, state, {displayVariableForm: action.payload});
      default: return state;
  }
}

export default workflowSetting;
