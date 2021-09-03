import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';
import { config } from '../../../../utils/workflow.config';
import Form from '@rjsf/core'; //"react-jsonschema-form";
import constants from '../../../../config';

const First = props => {

    const [state, updateState] = useState({
        formData: props.data
    });

    const handleChange = (e) => {
        updateState({
            ...state,
            formData: e.formData
        });
    }

    const onClose = (e) => {
        props.onClose(e)
    }

    const nextStep = (e) => {
        console.log(state.formData);
        props.handleNext(state);
        props.nextStep()
    }

    return (
        <div>
            <div className="pt-5 pb-3 form-group">
                <div className="first-step">
                    <div className="workflow-setting-container" >
                        <div className="workflow-setting-inner">
                            <Form schema={config.workflowSettingSchema.schema}
                                uiSchema={config.workflowSettingSchema.uiSchema}
                                formData={state.formData}
                                onChange={(e) => handleChange(e)}
                                onError={e => console.log("errors", e)} />
                        </div>
                    </div>
                </div>
            </div>
            <Stats
                step={1}
                {...props}
                onClose={onClose}
                handleNextStep={() => nextStep()}
                isEnable={state.formData.workflowDescription != "" && state.formData.workflowName != ""}
                history={props.history}
            />

        </div >
    );
};

export default First;