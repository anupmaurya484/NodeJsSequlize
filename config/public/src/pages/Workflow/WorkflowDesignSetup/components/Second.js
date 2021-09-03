import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';
import Form from "@rjsf/core";
import { Button, Table } from 'reactstrap';
import { config } from '../../../../utils/workflow.config';

let config2 = config
const Second = props => {

    const [state, updateState] = useState({
        currentVariableEdit: null,
        currentIndex: null
    });

    const handleEditVariable = (index) => {
        updateState({
            ...state,
            currentVariableEdit: props.variables[index],
            currentIndex: index
        });
    }

    const validate = (formData, errors) => {
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

    const submit = (e) => {
        e.formData.value = e.formData.type == 'string' ? e.formData.defaultValueString : e.formData.type == 'number' ? e.formData.defaultValueNumber :
            e.formData.type == 'boolean' ? (e.formData.defaultValueBoolean ? true : false) : e.formData.type == 'object' ? JSON.parse(e.formData.defaultValueObject) : JSON.parse(e.formData.defaultValueArray);
        if (!state.currentVariableEdit) props.handleAddVariable(e.formData);
        else {
            props.handleUpdateVariable(state.currentIndex, e.formData);
        }
    }

    return (
        <div className="designer-flowchart-variables">
            <legend className="text-center" id="root__title">Variables Setting</legend>

            <div className="designer-flowchart-variables-title">
                <span>Variables</span>
                <span className="plus fa fa-plus-circle" onClick={() => props.toggleSettingVariableForm(true)} />
            </div>
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
                                props.variables.map((v, i) => {
                                    var defaultValue = v.type == 'string' ? v.defaultValueString : v.type == 'number' ? v.defaultValueNumber :
                                        v.type == 'boolean' ? (v.defaultValueBoolean ? "True" : "False") : v.type == 'object' ? v.defaultValueObject : v.defaultValueArray;
                                    return (
                                        <tr key={i}>
                                            <td>{v.name}</td>
                                            <td>{v.type}</td>
                                            <td>{defaultValue}</td>
                                            <td><span onClick={() => handleEditVariable(i)}><i className="material-icons" >edit</i></span></td>
                                            <td><span onClick={() => props.handleRemoveVariable(i)}><i className="material-icons" >delete</i></span></td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </div>
                <div className={`form-variable-setting ${props.displayVariableForm ? '' : 'hide'}`}>
                    <div className="mask" onClick={() => props.toggleSettingVariableForm(false)} />
                    <div className={`form-variable-setting-inner`}>
                        <Form schema={props.schema.schema}
                            uiSchema={props.schema.uiSchema}
                            formData={state.currentVariableEdit ? state.currentVariableEdit : {}}
                            onChange={(e) => console.log('change:', e)}
                            onSubmit={submit}
                            validate={validate}
                            liveValidate
                            showErrorList={false}
                            onError={e => console.log("errors", e)} >
                            <div>
                                <Button type="submit">Submit</Button>
                                <Button type="button" onClick={() => props.toggleSettingVariableForm(false)}>Cancel</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>

            <Stats
                step={2}
                {...props}
                handleNextStep={() => props.nextStep()}
                isEnable={true}
                history={props.history} />
        </div>
    );
};


export default Second;