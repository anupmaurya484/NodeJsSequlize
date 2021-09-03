import React, { Fragment, useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import Stats from './StatsStep';

const LastStep = (props) => {

    return (
        <div>
            <div className="form mb-5 pt-5 pb-3 body-content text-center">
                {props.is_complete ?
                    <Fragment>
                        <h4>Tenannt Request Sent Successfully</h4>
                        <div className="swal2-icon swal2-success swal2-animate-success-icon" style={{ "display": "flex" }}>
                            {/* <div className="swal2-success-circular-line-left" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div> */}
                            <span className="swal2-success-line-tip"></span>
                            <span className="swal2-success-line-long"></span>
                            <div className="swal2-success-ring"></div>
                            {/* <div className="swal2-success-fix" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div> */}
                            {/* <div className="swal2-success-circular-line-right" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div> */}
                        </div>
                    </Fragment>
                    :
                    <Fragment>
                        <h1 className="display-3">Tenant request failed. Please try again!</h1>
                        <div className="swal2-icon swal2-error swal2-animate-error-icon" style={{ "display": "flex" }}>
                            <span className="swal2-x-mark"><span className="swal2-x-mark-line-left">
                            </span><span className="swal2-x-mark-line-right"></span></span>
                        </div>
                    </Fragment>
                }
            </div>
            <div className="justify-content-between">
                <Button size="sm" type="button" onClick={()=> window.location.href="/home/tenantrequest"} className='btn btn-primary float-right'>{'Finish'}</Button>
            </div>
        </div>
    );
};

export default LastStep;