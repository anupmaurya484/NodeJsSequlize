
//Import Packages
import React, { Component, Fragment } from 'react';
import { Row, Col, Button, Breadcrumb, Form, FormGroup, Input, Label } from 'reactstrap';

//Define Class
class CalendarViewConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            is_yearly: true,
            is_monthly: true,
            is_weekly: true,
            is_daily: true
        }
    }


    componentDidMount() {
        this.componentWillReceiveProps(this.props)
    }

    componentWillReceiveProps(props) {
        console.log(props.viewConfig);
        if (props && props.viewConfig) {
            this.setState({ ...props.viewConfig });
        }
    }


    handleCheckUpdatedStatus(e, type) {
        let state = this.state;
        state[type] = e.target.checked
        this.props.onChangeViewConfig(this.state);
    }

    render() {

        const { is_yearly, is_monthly, is_weekly, is_daily } = this.state;

        return (
            <span>
                <p>
                    <FormGroup check>
                        <Label check>
                            <Input checked={is_yearly} type="checkbox" onChange={event => this.handleCheckUpdatedStatus(event, 'is_yearly')} />{' '}
                            Do you want to display Lists calendar?
                        </Label>
                    </FormGroup>
                </p>
                <hr />
                <p>
                    <FormGroup check>
                        <Label check>
                            <Input checked={is_monthly} type="checkbox" onChange={event => this.handleCheckUpdatedStatus(event, 'is_monthly')} />{' '}
                            Do you want to display Monthly calendar?
                        </Label>
                    </FormGroup>
                </p>
                <hr />
                <p>
                    <FormGroup check>
                        <Label check>
                            <Input checked={is_weekly} type="checkbox" onChange={event => this.handleCheckUpdatedStatus(event, 'is_weekly')} />{' '}
                            Do you want to display Weekly calendar?
                        </Label>
                    </FormGroup>
                </p>
                <hr />

                <p>
                    <FormGroup check>
                        <Label check>
                            <Input checked={is_daily} type="checkbox" onChange={event => this.handleCheckUpdatedStatus(event, 'is_daily')} />{' '}
                            Do you want to display Daily calendar?
                        </Label>
                    </FormGroup>
                </p>
            </span >

        )
    }
}

export default CalendarViewConfig