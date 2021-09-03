//Import Packages
import React, { Component, Fragment } from 'react';
import { Row, Col, Button, Breadcrumb, Form, FormGroup, Label, Input } from 'reactstrap';

//Define Class
class CalendarSettingFrom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calendarName: "",
            calendarDescription: "",
            calenderCatergory: "",
            eventsOverlaps: false,
            calenderLocation: "",
            calenderCapacity: 10,
            calenderEquipments: "",
            calendar_catergory: ['Asset', 'Venue', 'Room']
        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props)
        console.log(this.props.settingData);
    }

    componentWillReceiveProps(props) {
        if (props && props.settingData) {
            this.setState({
                calendarName: props.settingData.calendarName,
                calendarDescription: props.settingData.calendarDescription,
                calenderCatergory: props.settingData.calenderCatergory,
                eventsOverlaps: props.settingData.eventsOverlaps
            });
        }
    }

    onChange = (e, type) => {
        let state = this.state;
        if (type) {
            state.eventsOverlaps = e.target.checked
        } else {
            state[e.target.name] = e.target.value
        }

        this.props.onChangeSettingForm(state);
    }


    render() {
        const { calendarName, calendarDescription, calenderCatergory, eventsOverlaps, calender_location, calender_Capacity } = this.state;

        return (
            <Fragment>
                <Form onSubmit={this.onSubmit}>
                    <Row>
                        <Col md="12">
                            <FormGroup controlId="calendar_name">
                                <Label>Calendar Name</Label>
                                <Input type="text" value={calendarName} name="calendarName" maxLength="256" onChange={this.onChange} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row >
                        <Col md="12">
                            <FormGroup controlId="calendar_description">
                                <Label>Calendar Description</Label>
                                <Input type="text" value={calendarDescription} name="calendarDescription" maxLength="256" onChange={this.onChange} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row >
                        <Col md="12">
                            <FormGroup controlId="eventsOverlaps" check>
                                <Label>Allowed events overlaps </Label>
                                <Input
                                    type="switch"
                                    type="radio"
                                    className="ml-1"
                                    id="custom-switch"
                                    name="database_authentication"
                                    label=""
                                    checked={eventsOverlaps}
                                    onChange={event => this.onChange(event, 'eventsOverlaps',)}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
            </Fragment>
        )
    }
}

export default CalendarSettingFrom