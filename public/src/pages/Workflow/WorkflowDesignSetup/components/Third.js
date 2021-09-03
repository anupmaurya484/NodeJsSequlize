import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';
import PermissionSetting from '../../component/PermissionSetting'

const Third = props => {

    const handleSubmitTaskForm = (nodeId, e) => {
        props.nextStep();
        props.saveFlowchart();
    }


    return (
        <div>
            <div className="designer-flowchart-permission">
                <legend className="text-center" id="root__title">Permission  Setting</legend>
                <PermissionSetting handleChange={props.handleChange} permission={props.permission} options={props.options} />
            </div>
            <Stats
                handleNextStep={handleSubmitTaskForm}
                step={3}
                {...props}
                isEnable={true}
                history={props.history} />
        </div>
    );
};


export default Third;