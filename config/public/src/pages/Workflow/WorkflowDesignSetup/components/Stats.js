import React, { Fragment, useState, useEffect } from 'react';
import OauthPopup from "react-oauth-popup";
import { Button } from 'reactstrap';

const HrStyle = {
    "marginTop": "0.5rem !important",
    "marginBottom": "0.5rem !important"
}

const BtnStyle = {
    "height": "32px",
    "lineHeight": "0.5"
}

const FotterStyle = {
    "position": "absolute",
    "width": "100%",
    "bottom": "0px",
    "margin": "10px"
}
const Stats = ({
    currentStep,
    firstStep,
    goToStep,
    lastStep,
    nextStep,
    previousStep,
    totalSteps,
    step,
    ConnectionUrl,
    onClose,
    handleOauthResponse,
    handleNextStep,
    createConnection,
    history,
    isEnable,
}) => (
    <div style={FotterStyle}>
        <hr style={HrStyle} />
        <div className="justify-content-between d-flex" style={{"width": "98%"}}>
            {< Button className="btn btn-danger mr-auto" size="sm" onClick={onClose}>Cancel</Button>}

            {(step != 1) && <Button size="sm" type="button" className="btn btn-primary float-right" onClick={previousStep}>Previous</Button>}

            {(step != 4) && <Button size="sm" type="button" className='btn btn-primary float-right' onClick={handleNextStep} disabled={!isEnable}>{'Next'}</Button>}

            {step == 4 && <Button size="sm" type="button" className='btn btn-success float-right' onClick={nextStep}>Design</Button>}
        </div>

    </div >
);


export default Stats;