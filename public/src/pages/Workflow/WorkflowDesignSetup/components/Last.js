import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';
import { Button } from 'reactstrap';

const Last = (props) => {

    return (
        <div>
            <div className={'text-center'}>
                {props.is_complete ?
                    <Fragment>
                        <h4>Workflow setup completed</h4>
                        <div className="swal2-icon swal2-success swal2-animate-success-icon" style={{ "display": "flex" }}>
                            <div className="swal2-success-circular-line-left" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div>
                            <span className="swal2-success-line-tip"></span>
                            <span className="swal2-success-line-long"></span>
                            <div className="swal2-success-ring"></div>
                            <div className="swal2-success-fix" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div>
                            <div className="swal2-success-circular-line-right" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div>
                        </div>
                    </Fragment>
                    :
                    <Fragment>
                        <h1 className="display-3">Workflow intial Failed!</h1>
                        <div className="swal2-icon swal2-error swal2-animate-error-icon" style={{ "display": "flex" }}>
                            <span className="swal2-x-mark"><span className="swal2-x-mark-line-left">
                            </span><span className="swal2-x-mark-line-right"></span></span>
                        </div>
                    </Fragment>
                }

            </div>
            {props.is_complete && <p className="lead text-center">You may start designing the workflow</p>}

            {/* {props.is_complete && <div style={{ margin: "0 auto", width: "245px" }}><Button type="button" className="btn btn-primary" onClick={props.gotoWorkflowSetup}>Goto Worflow Design</Button></div>} */}

            <Stats
                step={4}
                {...props}
                nextStep={props.gotoWorkflowSetup}
                history={props.history} />
        </div>
    );
};


export default Last;