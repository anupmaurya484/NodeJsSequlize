import React, { Fragment, useState, useEffect } from 'react';
import OauthPopup from "react-oauth-popup";
import { Button } from 'reactstrap';

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
    
        <div className="mt-4">
            <hr />
            <div className="justify-content-between d-flex">
                <Button className="btn btn-danger mr-auto"  onClick={()=> history.goBack()}>Cancel</Button>

                {step != 1 &&
                    <Button type="button" className="btn btn-primary float-right mr-2" onClick={previousStep}>Previous</Button>
                }

                {(step == 1 && ConnectionUrl != "NINTEX" && ConnectionUrl) &&
                    <OauthPopup url={ConnectionUrl} onClose={onClose} onCode={handleOauthResponse}>
                        <Button type="button" className='btn btn-primary float-right'>Next</Button>
                    </OauthPopup>
                }

                {(step != 4 && (!(step == 1 && ConnectionUrl != "NINTEX" && ConnectionUrl))) &&
                    <Button type="button" className='btn btn-primary float-right' onClick={handleNextStep} disabled={!isEnable}>Next</Button>
                }

                {step == 4 &&
                    <Button type="button" className='btn btn-success float-right' onClick={nextStep}>Finish</Button>
                }
            </div>

        </div>
    );


export default Stats;