import React, { Component } from 'react';
import { Form } from 'react-formio';
import { Toast } from '../../utils/helperFunctions';

const scheduleFormSchema = require('./ScheduleFormSchema.json');

class ScheduleFormModal extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    onSubmit = (e) => {
        Toast("Addig schedule..", "info");
        const payload = {
            title: e.data.title,
            description: e.data.description
        }

        this.props.scheduleSubmit(payload)
    }

    render() {
        return (
            <Form
                form={scheduleFormSchema}
                onSubmit={(e) => this.onSubmit(e)}
            />
        )
    }

}

export default ScheduleFormModal