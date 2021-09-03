import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Form from '@rjsf/core';

class TaskForm extends Component {
    constructor (props) {
        super(props);
        this.state = {
            display: false
        }
    }

    taskForm = {
        "schema": {
            "type": "object",
            "required": ['response'],
            "title": this.props.title,
            "properties": {
                "taskName": { type: 'string', title: 'Name' },
                "taskDesc": { type: 'string', title: 'Description' },
                "owner": { type: 'string', title: 'Assignee (Task Owner)' },
                "response": { 
                    type: 'string', 
                    title: 'Outcome', 
                    "enumName": ["Approve", "Reject"], 
                    "enum": ["approved", "rejected"] },
            }
        },
        "uiSchema": {
            "taskName": { "ui:readonly": true }, 
            "taskDesc": { "ui:readonly": true }, 
            "owner": { "ui:readonly": true }, 
            "response": { 
                "ui:readonly": this.props.data.data.status == "New"? false : true,
                "ui:widget": "radio", 
                "ui:options": { "inline":false } }
        }
    };

    render () {
        this.props.data && console.log(this.props.data)
        return (
            <Form schema={this.taskForm.schema}
            uiSchema={this.taskForm.uiSchema}
            formData={this.props.data && this.props.data.data}
            liveValidate
            showErrorList={false}
            onSubmit={e => this.props.onSubmit(e.formData)} >
                <div>
                    {this.props.data && this.props.data.data.status == "New" &&
                    <Button type="submit">Submit</Button>
                    }
                    {typeof this.props.onCloseTaskModal !== "undefined" &&
                    <Button type="button" onClick={() => this.props.onCloseTaskModal()}>Close</Button>
                    }
                </div>
            </Form>
        )
    }
}

TaskForm.propTypes = {
    title: PropTypes.string,
    data: PropTypes.object,
    onCloseTaskModal: PropTypes.func,
    onSubmit: PropTypes.func
}

TaskForm.defaultProps = {
    //data: {},
    onCloseTaskModal: undefined
}

export default TaskForm;