export const taskConfig = {
    "Functions": {
        "log_message": {
            "schema": {
                "type": "object",
                "required": ["message"],
                "title": "Log message",
                "properties": {
                    "message": { "type": "string", "title": "Message", "is_variable": true   }
                }
            },
            "uiSchema": {
                "message": { "ui:widget": "textarea" }
            },
            "title": "Log message",
            "name": "log_message",
            "description": "log a message to log database...",
            "type": "function",
            "icon": "history",
            "enabled": true,
            "_comment_enabled": "if 'no', it will not available in the task palette",
            "input": 1,
            "output": 1,
            "branch": 0,
            "code": ["task_log_message({'msg': message})"]
        },
        "create_variable": {
            "title": "Create/Set variable",
            "name": "create_variable",
            "description": "Create and/or set variable value",
            "type": "function",
            "icon": "subscript",
            "enabled": true,
            "_comment_enabled": "",
            "input": 1,
            "output": 1,
            "branch": 0,
            "schema": {
                "type": "object",
                "required": ["name"],
                "title": "Create/Set variable value",
                "properties": {
                    "name": {
                        "title": "Variable name",
                        "type": "string"
                    },
                    "type": {
                        "type": "string",
                        "title": "Type",
                        "enum": ["string", "number", "boolean", "object", "array"],
                        "enumNames": ["String", "Number", "Boolean", "Object", "Array"],
                        "default": "string"
                    },
                    "value": {
                        "title": "Value",
                        "type": "string"
                    }
                },
                "required": ["name", "type"]
            },
            "uiSchema": {
                "value": { "ui:widget": "textarea", "ui:options": { rows: 4 }, "ui:help": "Math expression supported for number type https://mathjs.org/docs/expressions/syntax.html" }
            }
        },
        "set_variables": {
            "schema": {
                "title": "Set variables",
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "var": {
                            "title": "Variable",
                            "type": "string",
                            "enum": ["<WF_Variables_setting>"]
                        },
                        "val": {
                            "title": "Value",
                            "type": "string"
                        }
                    }
                },
                //"default": [{ "var": "var1", "value": "value1" }]
            },
            "uiSchema": {
                "items": { "val": { "ui:widget": "textarea", "ui:options": { rows: 2 } } }
            },
            "title": "Set variables",
            "name": "set_variables",
            "description": "set variables",
            "type": "function",
            "icon": "superscript",
            "enabled": true,
            "_comment_enabled": "",
            "input": 1,
            "output": 1,
            "branch": 0,
            "code": ["task_log_message({'msg': message})"]
        }
    },
    "Services": {
        "send_email": {
            "title": "Send email",
            "name": "send_email",
            "description": "Send email service",
            "type": "service",
            "icon": "envelope",
            "enabled": true,
            "_comment": "if enabled:false, it will not available in the task palette",
            "input": 1,
            "output": 1,
            "branch": 0,
            "schema": {
                "type": "object",
                "required": [],
                "title": "Send email",
                "properties": {
                    "to": { "type": "string", "title": "To", "format": "email", "is_variable": true  },
                    "cc": { "type": "string", "title": "CC","is_variable": true  },
                    "bcc": { "type": "string", "title": "BCC","is_variable": true  },
                    "subject": { "type": "string", "title": "Subject","is_variable": true  },
                    "body": { "type": "string", "title": "body","is_variable": true  }

                }
            },
            "uiSchema": {
                "body": {
                    "ui:widget": "textarea",
                    "ui:options": { "rows": 4 }
                }
            },
            "code": ["task_send_email({'to': to, 'subject': subject, 'body': body})"]
        },
        "assign_a_task": {
            "title": "Assign a task",
            "name": "assign_a_task",
            "description": "Assign a task and get response",
            "icon": "check-square",
            "type": "get-response",
            "mode": "pause-resume",
            "enabled": true,
            "_comment_enabled": "",
            "input": 1,
            "output": 2,
            "branch": 2,
            "schema": {
                "title": "Assign a task",
                "description": "Assign a task and wait for user(s)' response",
                "type": "object",
                "required": ["taskName", "doThisOnDue"],
                "properties": {
                    "taskName": { "type": "string", "title": "Task name","is_variable": true, "description": "Short name for task" },
                    "taskDesc": { "type": "string", "title": "Task description","is_variable": true },
                    "outcomes": {
                        "type": "array",
                        "title": "Outcomes",
                        "items": [{ "type": "string", "default": "Approve" }, { "type": "string", "default": "Reject" }]
                    },
                    "customOutcomes": {
                        "type": "array",
                        "maxItems": 1,
                        "title": "Other outcomes",
                        "items": { "type": "string" }
                    },
                    "assignee": {
                        "type": "object",
                        "title": "Assignee",
                        "required": ["assignee"],
                        "properties": {
                            "assignee": { "type": "string", "title": "Assignee", "is_variable": true }
                        }
                    },
                    "message": {
                        "type": "object",
                        "title": "Message",
                        "required": ["subject", "message"],
                        "properties": {
                            "subject": { "type": "string", "title": "Subject", "default": "You\'ve got a Glozic Task", "is_variable": true },
                            "message": { "type": "string", "title": "Message", "default": "Please review and approve", "is_variable": true }
                        }
                    },
                    "criteria": {
                        "type": "string",
                        "title": "Completion criteria",
                        "description": "Criteria of task completion",
                        "enumNames": ["First response", "Majority or reject", "All must agreed"],
                        "enum": ["Anyone", "Majority", "All"],
                        "default": "Anyone"
                    },
                    "dueDate": {
                        "type": "integer",
                        "title": "Due in __ day(s)",
                        "default": 3,
                        "minimum": 1
                    },
                    "doThisOnDue": {
                        "type": "string",
                        "title": "Action on due",
                        "enum": ["Escalate", "Auto-complete", "Remind"],
                        "default": "Remind"
                    },
                },
                "dependencies": {
                    "doThisOnDue": {
                        "oneOf": [
                            {
                                "properties": {
                                    "doThisOnDue": { "enum": ["Auto-complete"] },
                                    "autoComplete": {
                                        "type": "string",
                                        "title": "Auto complete",
                                        "enum": ["Approve", "Reject", "Other Outcome"]
                                    }
                                }
                            },
                            {
                                "properties": {
                                    "doThisOnDue": { "enum": ["Escalate"] },
                                    "escalation": {
                                        "type": "object",
                                        "title": "Escalation",
                                        "properties": {
                                            "assignees": { "type": "string", "title": "Assignees", "format": "email" },
                                            "subject": { "type": "string", "title": "Subject" },
                                            "message": { "type": "string", "title": "Message" }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            "uiSchema": {
                "taskDesc": { "ui:widget": "textarea", "ui:options": { "rows": 2 } },
                "outcomes": { "ui:options": { orderable: false, removable: false, addable: false }, "ui:readonly": true },
                "customOutcomes": { "ui:options": { orderable: false } },
                "assignee": {
                    "assignee": { "ui:widget": "textarea", "ui:options": { "row": 2 } }
                },
                "message": {
                    "message": { "ui:widget": "textarea", "ui:options": { "rows": 4 } }
                },
                "criteria": { "ui:widget": "radio", "ui:options": { "inline": true } },
                "doThisOnDue": { "ui:widget": "radio", "ui:options": { "inline": true } },
                "escalation": {
                    "message": { "ui:widget": "textarea", "ui:options": { "rows": 3 } }
                }
            },
            "branches": [
                {
                    "condition": false,
                    "name": "No_Branch",
                    "actions": []
                },
                {
                    "condition": true,
                    "name": "Yes_Branch",
                    "actions": []
                }
            ]
        }
    },
    "Logic and controls": {
        "IF_ELSE": {
            "schema": {
                "type": "object",
                "required": [],
                "title": "IF ELSE",
                "properties": {
                    "operand1": { "type": "string", "title": "Variable", "enum": ["<WF_Variables_setting>"] },
                    "operator": { "type": "string", "title": "Operator", "enum": ["==", "!=", "in", "<", ">"] },
                    "operand2": { "type": "string", "title": "Value" }
                }
            },
            "uiSchema": {},
            "title": "If Else",
            "name": "IF_ELSE",
            "description": "IF_ELSE(CMP, branch_if_true, branch_if_false)",
            "type": "logic",
            "icon": "question",
            "enabled": true,
            "input": 1,
            "output": 2,
            "branch": 2,
            "code": ["IF(",
                "   CMP((lambda o, e: o.data[var], val, operator), ",
                "   [branch0], ",
                "   [branch1]",
                ")"
            ],
            "branches": [
                {
                    "condition": false,
                    "name": "No_Branch",
                    "actions": []
                },
                {
                    "condition": true,
                    "name": "Yes_Branch",
                    "actions": []
                }
            ]
        },
        "WHILE": {
            "schema": {
                "type": "object",
                "required": ["operand1", "operand2"],
                "title": "WHILE",
                "properties": {
                    "operand1": { "type": "string", "title": "Variable", "enum": ["<WF_Variables_setting>"] },
                    "operator": { "type": "string", "title": "Operator", "enum": ["==", "!=", "in", "<", ">", "<=", ">="], "default": "==" },
                    "operand2": { "type": "string", "title": "Value" }
                }
            },
            "uiSchema": {},
            "title": "While",
            "name": "WHILE",
            "description": "WHILE(CMP, branch)",
            "type": "logic",
            "icon": "retweet",
            "enabled": true,
            "input": 1,
            "output": 1,
            "branch": 1,
            "code": [
                "WHILE(",
                "   CMP((lambda o, e: o.data[var], val, operator), ",
                "   [branch0]",
                ")"
            ],
            "branches": [
                {
                    "condition": true,
                    "name": "While_branch",
                    "actions": []
                }
            ],
            "wrapper": true
        },
        "BRANCH": {
            "schema": {
                "type": "object",
                "required": [],
                "title": "Parallel Branches",
                "properties": {
                    "var": { "type": "string", "title": "var", "enum": ["<WF_Variables>"] },
                    "operator": { "type": "string", "title": "Operator", "enum": ["==", "!=", "in", "<", ">"] },
                    "val": { "type": "string", "title": "Val", "enum": ["<WF_Values>"] }

                }
            },
            "uiSchema": {},
            "branches": [
                {
                    "name": "branch0",
                    "actions": []
                },
                {
                    "name": "branch1",
                    "actions": []
                }
            ],
            "title": "Parallel branches",
            "name": "BRANCH",
            "description": "IF_ELSE(CMP, branch_if_true, branch_if_false)",
            "type": "logic",
            "icon": "random",
            "enabled": true,
            "input": 1,
            "output": 2,
            "branch": 2,
            "code": ["IF(",
                "   CMP((lambda o, e: o.data[var], val, operator), ",
                "   [branch0], ",
                "   [branch1]",
                ")"
            ]
        },
        "FLEXIBLE_OUTPUT": {
            "title": "FLEXIBLE_OUTPUT",
            "name": "FLEXIBLE_OUTPUT",
            "description": "Flexible branch",
            "type": "logic",
            "enabled": false,
            "input": 1,
            "output": 2,
            "branch": 2,
            "schema": {
                "type": "object",
                "required": [],
                "title": "FLEXIBLE_OUTPUT",
                "properties": {
                    "config": {
                        "type": "object",
                        "required": [],
                        "title": "Config",
                        "properties": {
                            "var": { "type": "string", "title": "var", "enum": ["<WF_Variables>"] }
                        }
                    },
                    "branches": {
                        "type": "array",
                        "title": "Branches",
                        "items": {
                            "removable": false,
                            "type": "object",
                            "properties": {
                                "branchname": {
                                    "title": "Branch name",
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            },
            "uiSchema": {},
            "branches": [
                {
                    "name": "While_branch0",
                    "actions": []
                },
                {
                    "name": "While_branch1",
                    "actions": []
                }
            ],
            "defaultFormData": {
                "config": "",
                "branches": [
                    { "branchname": "branch1" },
                    { "branchname": "default" }
                ]
            }
        }
    },
    "Integration": {
        "Call a web service": {
            "actionID": "ff5fbcf2-43a3-47b4-95b6-adbac3e0c4e1",
            "title": "Call a web service",
            "name": "Call web service",
            "description": "Call a web service",
            "type": "service",
            "icon": "plug",
            "enabled": true,
            "schema": {
                "type": "object",
                "required": [],
                "title": "Call a web service",
                "properties": {
                    "url": { "type": "string", "title": "Request URL" },
                    "method": { "type": "string", "title": "Method", "enum": ["GET", "POST", "PATCH", "DELETE", "PUT"] },
                    "requestHeader": { "type": "string", "title": "Request headers" },
                    "requestContent": { "type": "string", "title": "Request content" },
                    "responseCode": { "type": "string", "title": "Response code", "enum": ["<WF_Variables_setting>"] },
                    "responseHeader": { "type": "string", "title": "Response headers", "enum": ["<WF_Variables_setting>"] },
                    "responseContent": { "type": "string", "title": "Response content", "enum": ["<WF_Variables_setting>"] }
                }
            },
            "uiSchema": [
                {
                    "key": "Request headers",
                    "type": "textarea"
                }, {
                    "key": "Request content",
                    "type": "textarea"
                }
            ],
            "input": 1,
            "output": 1,
            "branch": 0
        },
        "query_JSON": {
            "actionID": "ff5fbcf2-43a3-47b4-95b6-adbac3e0c4e2",
            "title": "Query JSON",
            "name": "Query JSON",
            "description": "Query JSON",
            "type": "function",
            "icon": "filter",
            "enabled": true,
            "schema": {
                "type": "object",
                "required": [],
                "title": "Call a web service",
                "properties": {
                    "source": { "type": "string", "title": "Request URL" },
                    "path": { "type": "string", "title": "JSONPath Expression" },
                    "firstResult": { "type": "string", "title": "First result", "enum": ["<WF_Variables_setting>"] },
                    "allResults": { "type": "string", "title": "All results", "enum": ["<WF_Variables_setting>"] },
                }
            },
            "uiSchema": {
                "source": {
                    "ui:widget": "textarea",
                    "ui:placeholder": "Type your JSON string content here"
                }
            },
            "input": 1,
            "output": 1,
            "branch": 0
        }
    }
}