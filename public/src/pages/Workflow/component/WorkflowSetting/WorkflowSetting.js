import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './WorkflowSetting.scss';
import { config }  from '../../../../utils/workflow.config';
import Form from '@rjsf/core'; //"react-jsonschema-form";

class WorkflowSetting extends Component {
    constructor (props) {
        super(props);
        this.state = {
            display: false
        }
    }

    render () {
        let group = this.props.group;
        // console.log('=-------data -----> ', this.props.data)
        return (
            <div className="workflow-setting-container" >
                <div className="workflow-setting-inner">
                    <Form schema={config.workflowSettingSchema.schema}
                    uiSchema={config.workflowSettingSchema.uiSchema}
                    formData={this.props.data}
                    onChange={(e) => this.props.handleChange(e)}
                    onError={e => console.log("errors", e)} />
                </div>
            </div>
        )
    }
}
WorkflowSetting.propTypes = {

}

WorkflowSetting.defaultProps = {

}


export default WorkflowSetting;
