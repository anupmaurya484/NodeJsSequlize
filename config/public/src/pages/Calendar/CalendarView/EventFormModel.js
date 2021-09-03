
import React, { Component, Fragment } from 'react';
import { Form } from 'react-formio';
import { Toast, cronGenerator } from '../../../utils/helperFunctions';
import moment from 'moment';

//Define Class
class EventFormModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData : this.props.eventFormData
        }
    }

    onSubmit = (e) => {
        if (!e.data.startTime || e.data.startTime == "") {
            Toast("Start Time is required.", 'error');
        } else if (!e.data.endTime || e.data.endTime == "") {
            Toast("End Time is required.", 'error');
        } else if (!e.data.title || e.data.title == "") {
            Toast("Title is required.", 'error');
        } else {
            var startTimeStr = moment(e.data.startTime).hours() + ':' + moment(e.data.startTime).minutes();
            const reqPayload = {
                startDateTime: new Date(e.data.startTime).toISOString(),
                endDateTime: new Date(e.data.endTime).toISOString(),
                title: e.data.title,
                description: e.data.description,
                cronExp: e.data.isRepeating?cronGenerator(e.data.repeatsInterval, startTimeStr, e.data.days,undefined,e.data.weekdays):"",
                eventFormData: e.data
            }
            this.props.eventSubmit(reqPayload)
        }
    }

    render() {
        const { eventFormData } = this.state;
        console.log(this.props)
        const eventFormDesign = this.props.eventFormDesign
        return (
            <Form
                form={eventFormDesign}
                submission={{ data : eventFormData}}
                onSubmit={(e) => this.onSubmit(e)} 
            />
        )
    }
}

export default EventFormModel