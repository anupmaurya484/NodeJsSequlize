import React, { Component, Fragment } from 'react';
const TitlePanel = ( props ) => (
    <Fragment>
        <div className="panel">
            <div className="panel-heading">
                <div className='panel-title'>
                    <h3>{props.title}</h3>
                </div>
            </div>
        </div>
    </Fragment>
)
export default TitlePanel

