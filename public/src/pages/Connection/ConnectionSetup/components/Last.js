import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';

const Last = (props) => {
    const onFinished = (e) => {
        props.history.goBack();
        //props.history.push(`/dashboard/connections`)
    };

    return (
        <div>
            <div className={'text-center'}>
                {props.is_complete ?
                    <Fragment>
                        <h1 className="display-3">Thank You!</h1>
                        <div className="swal2-icon swal2-success swal2-animate-success-icon" style={{ "display": "flex" }}>
                            <div className="swal2-success-circular-line-left" style={{ "backgroundColor": "#eff2f7" }}></div>
                            <span className="swal2-success-line-tip"></span>
                            <span className="swal2-success-line-long"></span>
                            <div className="swal2-success-ring"></div>
                            <div className="swal2-success-fix" style={{ "backgroundColor": "#eff2f7" }}></div>
                            <div className="swal2-success-circular-line-right" style={{ "backgroundColor": "#eff2f7" }}></div>
                        </div>
                    </Fragment>
                    :
                    <Fragment>
                        <h1 className="display-3">Connection Failed!</h1>
                        <div className="swal2-icon swal2-error swal2-animate-error-icon" style={{ "display": "flex" }}>
                            <span className="swal2-x-mark"><span className="swal2-x-mark-line-left">
                            </span><span className="swal2-x-mark-line-right"></span></span>
                        </div>
                    </Fragment>
                }

            </div>
            {props.is_complete && <p className="lead text-center">Your connection setup is completed.</p>}
            <Stats
                step={4}
                {...props}
                nextStep={onFinished}
                history={props.history} />
        </div>
    );
};


export default Last;