
//Import Packages
import React, { Component, Fragment, useState, useEffect } from 'react';
import StepWizard from 'react-step-wizard';
import { connect } from 'react-redux';

//Import File 
import { GetAppName, GetTenantName } from '../../../utils/helperFunctions';
import { updateWorkflowSetting, updateWorkflowVariables, removeVariable, updateVariable, addVariable, toggleSettingVariableForm } from '../../../actions/workflowSetting.action';
import { saveWorkflow } from '../../../actions/workflow';
import { getTaskData } from '../Designer/Designer.module'
import { config } from '../../../utils/workflow.config';
import axiosService from '../../../utils/axiosService';
import First from './components/First';
import Second from './components/Second';
import Progress from './components/Progress';
import Last from './components/Last';
import Nav from './components/Nav';
import Third from './components/Third';
import "./WorkflowDesignSetup.scss";

class WorkflowDesignSetup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            workflowSettingId: "",
            showConnectSuccess: 0,
            is_progress_complete: false,
            permission: { read: [], readAl: [], write: [], design: [] },
            options: []
        },
            this.nodes = {};
    }

    componentDidMount = async () => {
        var { options } = this.state;
        if (this.props.user.User_data.isTenantUser) {
            const users = await axiosService.apis('GET', `/api/users`, auth.headers)
            options = users.map((member) => ({ value: member._id, label: member.email }));
        } else {
            options = this.props.user.User_data.team.members.map((member) => ({ value: member.id, label: member.email }));
            options.unshift({ value: this.props.user.User_data._id, label: this.props.user.User_data.email })
        }
        this.setState({ options });
    }

    onClose = (code) => {
        console.log("code: ", code)
        console.log("closed!");
    }

    handleChangeWorkflowSetting = (e) => {
        //console.log('-====-------> handleChangeWorkflowSetting', e)
        this.props.updateWorkflowSetting(e.formData);
    }

    handleChangePermissionSetting = (inputName, e) => {
        let { permission } = this.state;
        if (inputName == 'permissionRead') {
            permission.read = e
        } else if (inputName == 'permissionDesign') {
            permission.design = e
        }
        this.setState({ permission })
    }

    saveFlowchart = async () => {
        let { permission } = this.state;
        try {
            // let data = {
            //     "workflowName": this.props.workflowSettingReducer.detail.workflowName,
            //     "workflowDescription": this.props.workflowSettingReducer.detail.workflowDescription,
            //     "isPublished": 0,
            //     "definition": {
            //         "variables": this.props.workflowSettingReducer.variables,
            //         "actions": [],
            //         "settings": this.props.workflowSettingReducer.detail
            //     },
            //     "permission": { "read": [], "design": [] }
            // }

            // let temPermission = {};
            // temPermission.read = permission.read ? (permission.read.map((member) => ({ id: member.value, email: member.label }))) : [];
            // temPermission.design = permission.design ? (permission.design.map((member) => ({ id: member.value, email: member.label }))) : [];
            // data._id = "";
            // data["createdTime"] = new Date();
            // data["createdBy"] = this.props.user.User_data._id;
            // data["modifiedTime"] = new Date();
            // data["modifiedBy"] = this.props.user.User_data._id;
            // data["permission"] = temPermission;
            // data["IsNotLoader"] = true;
            // console.log(data);
            // console.log(this.props.workflowSettingReducer.detail);
            // const resData = await this.props.saveWorkflow(data);
            // console.log(resData);
            this.setState({ is_complete: true })
        } catch (err) {
            console.log(err.message)
            this.setState({ is_complete: false })
        };
    }

    gotoWorkflowSetup = () => {
        console.log(this.state);
        let { permission } = this.state;
        this.props.updateWorkflowPermission(permission);
        //window.location.href = `${GetAppName(this.props.user)}/workflow?id=` + this.state.workflowSettingId
    }


    render() {
        const { showConnectSuccess, is_progress_complete, is_complete, permission, options } = this.state;
        const props = this.props;
        return (
            <div className='row WorkflowDesignSetup'>
                <div className={`col-12`}>
                    <StepWizard initialStep={1} nav={<Nav />}>
                        <First
                            data={this.props.workflowSettingReducer.detail}
                            history={props.history}
                            onClose={this.props.onHandeHide}
                            handleNext={this.handleChangeWorkflowSetting}
                            showConnectSuccess={showConnectSuccess} />
                        <Second
                            history={props.history}
                            toggleSettingVariableForm={this.props.toggleSettingVariableForm}
                            displayVariableForm={this.props.workflowSettingReducer.displayVariableForm}
                            schema={config.workflowVariable}
                            onClose={this.props.onHandeHide}
                            variables={this.props.workflowSettingReducer.variables}
                            handleRemoveVariable={this.props.removeVariable}
                            handleAddVariable={this.props.addVariable}
                            handleUpdateVariable={this.props.updateVariable}
                        />
                        <Third
                            handleChange={this.handleChangePermissionSetting}
                            permission={permission}
                            onClose={this.props.onHandeHide}
                            options={options}
                            history={props.history}
                            saveFlowchart={this.saveFlowchart}
                        />
                        <Last
                            gotoWorkflowSetup={this.gotoWorkflowSetup}
                            onClose={this.props.onHandeHide}
                            history={props.history}
                            is_complete={is_complete} />
                    </StepWizard>
                </div>

                {showConnectSuccess == 2 &&
                    <div className={`col-12 mt-1 text-center`}>
                        <div className="alert alert-danger">
                            <strong>Error!</strong> Connection Failed, Please try again!.
                        </div>
                    </div>
                }
            </div>
        )
    }

}


const mapStateToProps = (state) => {
    return {
        workflowSettingReducer: state.workflowSetting,
        User_data: state.user.User_data,
        user: state.user
    };
}

const mapDispatchToProps = {
    saveWorkflow,
    updateWorkflowSetting,
    updateWorkflowVariables,
    updateVariable,
    addVariable,
    removeVariable,
    toggleSettingVariableForm,
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowDesignSetup);
