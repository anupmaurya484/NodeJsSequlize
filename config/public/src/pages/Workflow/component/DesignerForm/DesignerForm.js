import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './DesignerForm.scss';
import logger from '../../helper/logger.helper';
import { config } from '../../../../utils/workflow.config';
import { OverlayTrigger, Tooltip, Modal, ModalBody, ModalHeader, Table, Button } from 'reactstrap';
import TaskPaletteGroup from '../TaskPaletteGroup';
import MultipleFields from '../MultipleFields';
import Form from "@rjsf/bootstrap-4";


class DesignerForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: null
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentDidMount() {
        if (this.props.data)
            this.setState({ formData: this.props.data.configuration.properties })
    }

    handleSubmit(e) {
        if (this.props.data.datatype.type === 'Call a web service' || this.props.data.datatype.type === 'query_JSON') {
            this.props.handleSubmitTaskForm(this.props.data.nodeId, e);
        }
    }

    handleChange(e) {
        console.log(e);
        let self = this;
        let newData = Object.assign({}, e);
        this.props.update(this.props.data.nodeId, e.formData, this.removedIndex);
        this.removedIndex = null;
    }

    componentWillReceiveProps(newProps) {
        console.log(newProps);
        if (newProps.data)
            this.setState({ formData: newProps.data.configuration.properties })
        this.forceUpdate();
    }


    componentDidUpdate(prevProps, prevState) {

    }

    handleClick(e) {
        try {
            console.log(e.target)
            // //console.log('handleClick ', e.target.className.indexOf('glyphicon-remove') >= 0, e.target.childNodes && e.target.childNodes[0].className.indexOf('glyphicon-remove') >= 0)
            if (e.target.getAttribute('type') === 'submit') return;
            if (e.target.classList) {
                if (e.target.classList.contains('glyphicon-remove') || e.target.childNodes && e.target.childNodes.length && e.target.childNodes[0].classList.contains('glyphicon-remove')) {
                    let rowItem = e.target;
                    //console.log(rowItem)
                    while (!rowItem.classList.contains('array-item') && rowItem.getAttribute('id') !== 'designer-form-inner') {
                        rowItem = rowItem.parentElement;
                    }
                    let rowItemWrapper = rowItem.parentElement;
                    for (var i = 0; i < rowItemWrapper.childNodes.length; i++) {
                        if (rowItemWrapper.childNodes[i] === rowItem) this.removedIndex = i;
                    }
                }
            }
        } catch (err) {
            console.log(err.message);
        }



    }

    validate(formData, errors) {
        var validEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        var validPhone = /^\+?[1-9]\d{9,14}$/;
        var assignees = formData.assignee && formData.assignee.assignee && formData.assignee.assignee.split(/[,;]+/);
        var assigneeIsValid = assignees && assignees.map(e => validEmail.test(e.trim()) || validPhone.test(e.trim().replace(/[ -]/g, ''))).every(x => x === true)
        //console.log(assigneeIsValid)
        //var isEmail = formData.assignee && validEmail.test(formData.assignee.assignee)
        if (!assigneeIsValid) {
            formData.assignee && errors.assignee.assignee.addError("Not a valid email/mobile");
        }
        return errors;
    }




    CustomVariableButton = (props) => {
        const { id, classNames, help, description, errors, children, schema } = props;
        const { ShowVariableListsModel } = this.state;
        return (
            <div className={classNames}>
                {/* {(id == "root_message" || id == "root_value") && } */}
                {/* schema.type !== "object" && description */}
                {children}
                {errors}
                {help}
            </div>
        );
    }

    onSelectedVariables = (id, name) => {
        let { formData } = this.state;
        console.log(document.getElementById(id).selectionStart);
        var value = document.getElementById(id).value;
        value = value.substr(0, document.getElementById(id).selectionStart) + "<<" + name + ">>" + value.substr(document.getElementById(id).selectionStart)
        document.getElementById(id).value = value;
        document.getElementById(id).focus();
        if (formData) {
            debugger
            var TempIds = id.split("_")
            if (TempIds.length >= 3) {
                formData[TempIds[1]][TempIds[2]] = value;
            } else {
                formData[TempIds[1]] = value;
            }
            this.setState({ formData: formData })
        }
    }


    ObjectFieldTemplate = (props) => {
        const { workflowSettingReducer } = this.props
        const that = this;
        console.log(props);
        return (
            <div>
                <div className="my-1"><h5>{props.title}</h5><hr className="border-0 bg-secondary my-1" style={{ height: "1px" }} /></div>
                <div className="mb-3">{props.description}</div>
                {props.properties.map(element => {
                    console.log(element["content"]["props"]["schema"]["is_variable"]);
                    return (
                        <div className="property-wrapper">
                            {element["content"]["props"]["schema"]["is_variable"] == true &&
                                <div className="variables-dropdown float-right mt-1">
                                    <label className="variables-dropbtn" >Variable</label>
                                    <div className="variables-dropdown-content">
                                        {(workflowSettingReducer && workflowSettingReducer.variables) && workflowSettingReducer.variables.map((v, i) => (<span onClick={() => that.onSelectedVariables((props.idSchema["$id"] + "_" + element['name']), v.name)}>{v.name}</span>))}
                                    </div>
                                </div>
                            }
                            {element.content}
                        </div>
                    )
                }
                )}
            </div>
        );
    }

    render() {
        const { ShowVariableListsModel, formData } = this.state;
        const { workflowSettingReducer } = this.props
        console.log(this.props)
        if (!this.props.data) return null;
        if (!formData) return null;

        let uiSchema = this.props.data.uiSchema || {
            branches: {
                "ui:options": {
                    orderable: false,
                    addable: true,
                    removable: true
                }
            }
        };
        return (
            <Fragment>
                <div id="designer-form-container" clasName={`${(this.props.data) ? '' : 'hide'}`}  >
                    <div id="designer-form-inner" className="animated fadeInRight" onClick={this.handleClick} >
                        <Form schema={this.props.data.schema}
                            formData={formData}
                            FieldTemplate={this.CustomVariableButton}
                            onChange={(e) => this.handleChange(e)}
                            onSubmit={e => this.handleSubmit(e)}
                            ObjectFieldTemplate={this.ObjectFieldTemplate}
                            uiSchema={uiSchema}
                            liveValidate
                            noHtml5Validate
                            validate={this.validate}
                            showErrorList={false}
                            onError={e => console.log("errors", e)} />
                    </div>
                </div>
            </Fragment>

        )
    }
}

DesignerForm.propTypes = {
    data: PropTypes.object,
    update: PropTypes.func,
    updateVar: PropTypes.func
}

DesignerForm.defaultProps = {

}


const mapStateToProps = (state) => {
    return {
        workflowSettingReducer: state.workflowSetting,
    }
}

export default connect(
    mapStateToProps,
    null
)(DesignerForm)
