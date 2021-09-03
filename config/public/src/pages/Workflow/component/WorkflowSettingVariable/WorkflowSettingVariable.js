import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './WorkflowSettingVariable.scss';
import { config }  from '../../../../utils/workflow.config';

import { Button, Table } from 'reactstrap';
import Form from "@rjsf/core";

class WorkflowSettingVariable extends Component {
    constructor (props) {
        super(props);
        this.state = {
            currentVariableEdit: null,
            currentIndex: null
        }
        this.submit = this.submit.bind(this);
        this.handleEditVariable = this.handleEditVariable.bind(this);
    }

    handleEditVariable (index) {
        this.setState({
            currentVariableEdit: this.props.variables[index],
            currentIndex: index
        });
    }

    componentWillReceiveProps (newProps) {

        if (!newProps.displayVariableForm && this.props.displayVariableForm) {
            this.setState({currentVariableEdit: null, currentIndex: null});
        }

    }

    componentDidUpdate (prevProps, prevState) {
        if (prevState.currentVariableEdit === null && this.state.currentVariableEdit) {
            this.props.toggleSettingVariableForm(true);
        }
    }

    validate(formData, errors) {
        if (formData.name && formData.name.match(/[<>!%@#$^*?_,~()]/)) {
            errors.name.addError("Variable name can not contain special character");
        } 
        if (formData.defaultValueObject) {
            try {
                if (formData.defaultValueObject.trim().length == 0) errors.defaultValueObject.addError("Invalid empty object");
                JSON.parse(formData.defaultValueObject);
            } catch (e) {
                errors.defaultValueObject.addError("Invalid object");
            }
        }
        if (formData.defaultValueArray) {
            try {
                var arrayObj = JSON.parse(formData.defaultValueArray);
                if (!Array.isArray(arrayObj)) {
                    errors.defaultValueArray.addError("Invalid array");
                }
            } catch (e) {
                errors.defaultValueArray.addError("Invalid array object");
            }
        }
        if (formData.pass1 !== formData.pass2) {
          errors.pass2.addError("Passwords don't match");
        }
        return errors;
      }

    submit (e) {
        e.formData.value = e.formData.type=='string'? e.formData.defaultValueString: e.formData.type=='number'? e.formData.defaultValueNumber:
            e.formData.type=='boolean'?(e.formData.defaultValueBoolean?true:false): e.formData.type=='object'? JSON.parse(e.formData.defaultValueObject):JSON.parse(e.formData.defaultValueArray);
        console.log(e.formData)
        if (!this.state.currentVariableEdit) this.props.handleAddVariable(e.formData);
        else {
            this.props.handleUpdateVariable(this.state.currentIndex, e.formData);
        }
    }

    render () {
        return (
            <div id="workflow-setting-variable-container" >
                <div id="workflow-setting-variable-inner" >
                    <Table bordered condensed hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Default value</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.props.variables.map((v, i) => {
                                    var defaultValue = v.type=='string'? v.defaultValueString: v.type=='number'? v.defaultValueNumber:
                                        v.type=='boolean'?(v.defaultValueBoolean?"True":"False"): v.type=='object'? v.defaultValueObject:v.defaultValueArray;
                                    return (
                                        <tr key={i}>
                                            <td>{v.name}</td>
                                            <td>{v.type}</td>
                                            <td>{defaultValue}</td>
                                            <td><span onClick={() => this.handleEditVariable(i)}><i className="material-icons" >edit</i></span></td>
                                            <td><span onClick={() => this.props.handleRemoveVariable(i)}><i className="material-icons" >delete</i></span></td>
                                        </tr>
                                )
                                })
                            }
                        </tbody>
                    </Table>
                </div>
                <div className={`form-variable-setting ${this.props.displayVariableForm ? '' : 'hide'}`}>
                    <div className="mask" onClick={() => this.props.toggleSettingVariableForm(false)} />
                    <div className={`form-variable-setting-inner`}>
                       <Form schema={this.props.schema.schema}
                        uiSchema={this.props.schema.uiSchema}
                        formData={this.state.currentVariableEdit? this.state.currentVariableEdit: {}}
                        onChange={(e) => console.log('change:', e)}
                        onSubmit={this.submit}
                        validate={this.validate}
                        liveValidate
                        showErrorList={false}
                        onError={e => console.log("errors", e)} >
                            <div>
                                <Button type="submit">Submit</Button>
                                <Button type="button" onClick={() => this.props.toggleSettingVariableForm(false)}>Cancel</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
}

WorkflowSettingVariable.propTypes = {
    handleRemoveVariable: PropTypes.func,
    handleAddVariable: PropTypes.func,
    handleUpdateVariable: PropTypes.func,
    toggleSettingVariableForm: PropTypes.func
}

WorkflowSettingVariable.defaultProps = {

}


export default WorkflowSettingVariable;
