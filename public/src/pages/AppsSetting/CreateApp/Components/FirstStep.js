import React, { Fragment, useState, useEffect } from 'react';
import { FormGroup, Label, Input,Col } from 'reactstrap';
import Stats from './StatsStep';
import '../../AppSetting.css';

const FirstStep = props => {

    console.log(props.data.appName);
    const [state, updateState] = useState({
        appName: "",
        description: "",
        application_type: 1,
        formData: props.data
    });

    useEffect(() => {
        console.log(props);
        updateState({
            ...state,
            appName: props.data.appName,
            description: props.data.description,
            application_type: props.data.application_type,
        });

    }, [])

    const updateEvent = (e) => {
        updateState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const onClose = (e) => {
        props.onClose(e)
    }

    const nextStep = (e) => {
        props.handleNext(state, 'initial-setup');
        props.nextStep()
    }

    return (
        <>
            <div className="form mb-5 pt-5 pb-3 body-content">
                <div className="form-group">
                    <label for="appName">Application Name<span className='required-star'>*</span></label>
                    <input type="text" className="appName form-control" value={state.appName} name="appName" onChange={(e) => updateEvent(e)} id="appName" />
                </div>
                <div className="form-group">
                    <label for="desc">Description<span className='required-star'>*</span></label>
                    <input type="desc" className="desc form-control" value={state.description} name="description" onChange={(e) => updateEvent(e)} id="desc" />
                </div>
                <label for="desc">Application Type<span className='required-star'>*</span></label>

                <FormGroup row>
                   
                    <Col sm={{ size: 3 }}>
                        <FormGroup check>
                            <Label check><Input type="checkbox" name="application_type" value="1" id="1" onChange={(e) => updateEvent(e)} checked={state.application_type == 1} />Portal Application</Label>
                        </FormGroup>
                    </Col>
                    <Col sm={{ size: 3 }}>
                        <FormGroup check>
                            <Label check><Input type="checkbox" name="application_type" value="2" id="2" onChange={(e) => updateEvent(e)} checked={state.application_type == 2} />Standalone Application</Label>
                        </FormGroup>
                    </Col>


                    {/* <select className="form-control" value={state.application_type} name="application_type" onChange={(e) => updateEvent(e)} id="application_type" >
                        <option value="0">select</option>
                        <option value="1">Portal Application</option>
                        <option value="2">Standalone Application</option>
                    </select> */}
                </FormGroup>
            </div>

            <Stats
                step={1}
                {...props}
                onClose={onClose}
                handleNextStep={() => nextStep()}
                isEnable={state.description != "" && state.appName != "" && state.application_type != ""}
                history={props.history}
            />

        </>
    );
};

export default FirstStep;