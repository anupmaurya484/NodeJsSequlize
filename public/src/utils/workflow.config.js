import { object } from 'prop-types';
import { taskConfig } from './taskConfig';

export const config = {
    MAXIMUM_NESTED: 5,
    logger: true,
    nodeGap: 60,
    nodeStartEndSize: 35,
    nodeWidthDefault: 160,
    nodeSizeDefault: 44,
    tabs: [
        {
            id: 'workflowSetting',
            title: 'Workflow Settings'
        },
        {
            id: 'workflowDesigner',
            title: 'Workflow Designer',
            active: true
        }
    ],
    SPECIAL_END_NODE: 'special_end_node',
    taskType: taskConfig,
    renameFormSchema: {
        "type": "object",
        "required": ["name"],
        "title": "Rename",
        "properties": {
            "name": { "type": "string", "title": "Name" }
        }
    },
    SAVE_FLOWCHART_API: 'https://app.opus272.com/api/workflow',
    LOAD_FLOWCHART_API: 'https://app.opus272.com/api/workflow',
    workflowSettingSchema: {
        schema: {
            "type": "object",
            "required": ['workflowName', 'workflowType', 'isActive', 'version'],
            "title": "Workflow Setting",
            "properties": {
                "workflowName": { type: 'string', title: 'Name' },
                "workflowDescription": { type: 'string', title: 'Description' },
            }
        },
        uiSchema: {
            "workflowDescription": { "ui:widget": "textarea"}
        }
    },
    workflowVariable: {
        schema: {
            "title": "Variables",
            "type": "object",
            "properties": {
                "name": { "type": "string", "title": "Name" },
                "type": {   
                    "type": "string", 
                    "title": "Type", 
                    "enum": ["string", "number", "boolean", "object", "array"], 
                    "enumNames": ["String", "Number", "Boolean", "Object", "Array"], 
                    "default": "string" 
                }
            },
            "required": [ "name", "type" ],
            "dependencies": {
                "type": {
                    "oneOf": [
                        {
                            "properties": {
                                "type": { "enum": ["string"] },
                                "defaultValueString": { "type": "string", "title": "Default value (string)" }
                            }                                               
                        },
                        {
                            "properties": {
                                "type": { "enum": ["number"] },
                                "defaultValueNumber": { "type": "number", "title": "Default value (number)" }
                            }
                        },
                        {
                            "properties": {
                                "type": { "enum": ["boolean"] },
                                "defaultValueBoolean": { "type": "boolean", "title": "Default value (boolean)" }
                            }
                        },
                        {
                            "properties": {
                                "type": { "enum": ["object"] },
                                "defaultValueObject": { "type": "string", "title": "Default value (Object)", "default": "{}" }
                            }
                        },
                        {
                            "properties": {
                                "type": { "enum": ["array"] },
                                "defaultValueArray": { "type": "string", "title": "Default value (Array)", "default": "[]" }
                            }
                        }
                    ]
                }
            }
        },
        uiSchema: {
            "defaultValueBoolean": { "ui:widget": "radio"},
            "defaultValueObject": { "ui:widget": "textarea"},
            "defaultValueArray": { "ui:widget": "textarea"}
            /*"dependencies": {
                "type": {
                    "oneOf": [
                        {
                            "properties": {
                                "type": {
                                    "enum": ["boolen"]
                                },
                                "defaultValue": {
                                    "ui:widget": "radio"
                                    }
                                }                                               
                            },
                        {
                            "properties": {
                                "type": {
                                    "enum": ["string"]
                                },
                                "defaultValue": {
                                    "ui:widget": "textarea"
                                    }
                                }
                            }
                    ]
                }
            }*/
        }
    }
}