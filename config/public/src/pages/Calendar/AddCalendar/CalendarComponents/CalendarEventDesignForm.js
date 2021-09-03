import React, { Component, Fragment } from 'react';
import { Row, Col, Button, Modal, Form as ReactBootstrapForm } from 'reactstrap';
import { FormBuilder, Form } from 'react-formio';
import DatePicker from "react-datepicker";
import moment from 'moment'

const formOptions = {
  builder: {
    advanced: {
      components: {
        recaptcha: true,
        resource: false,
        file: {
          title: "File",
          key: "upload",
          icon: 'file',
          schema: {
            label: 'Upload',
            type: 'file',
            storage: "base64",
            key: 'upload',
            input: true
          }
        },
        form: false,
        unknown: true
      }
    },
    premium: false
  },
  editForm: {
    file: [
      {
        key: 'file',
        ignore: true
      },
    ]
  }
}

//Define Class
class CalendarEventDesignForm extends Component {
  constructor(props) {
    super(props);
    this.eventformschema = ""
    this.state = {
      current_step: 1,
      isLoad: true
    }
  }

  loadViewConfig(e, type) {
    this.props.onChangeEventDesignForm(this.eventformschema);
  }


  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(props) {
    if (props && props.eventformschema) {
      this.eventformschema = props.eventformschema != "" ? props.eventformschema : CalendarEventDesignFormSchema
      this.setState({isLoad : false})
    }
  }

  render() {
    const { current_step } = this.state;

    return (
      <Fragment>
        {/* <ul className="nav nav-pills">
          <li className="nav-item">
            <a className={`nav-link ${current_step === 1 ? "active" : ""}`} active id="designer" data-toggle="pill" onClick={() => this.setState({ current_step: 1 })}>Designer</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${current_step === 2 ? "active" : ""}`} id="preview" data-toggle="pill" onClick={() => this.setState({ current_step: 2 })}>Preview</a>
          </li>
        </ul> */}
        {current_step === 1 &&
          <FormBuilder
            onSaveComponent={(e) => this.loadViewConfig(e, 'save')}
            onDeleteComponent={(e) => this.loadViewConfig(e, 'delete')}
            form={this.eventformschema}
            options={formOptions}
            onChange={(schema) => { this.eventformschema = schema }} />
        }

        {current_step === 2 &&
          <Form
            form={this.eventformschema}
            onSubmit={(e) => console.log("onSubmit: ", e)} />
        }


      </Fragment>
    )
  }
}

export default CalendarEventDesignForm