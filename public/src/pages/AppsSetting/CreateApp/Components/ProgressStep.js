import React, { Fragment, useState, useEffect } from 'react';

const ProgressStep = (props) => {
    const [state, updateState] = useState({
        isActiveClass: '',
        timeout: null,
    });

    useEffect(() => {
        const { timeout } = state;
        console.log("isActive", props.isActive, timeout);
        if (props.isActive && !timeout) {
            updateState({
                isActiveClass: 'loaded',
                timeout: setTimeout(() => {
                    props.nextStep();
                }, 3000),
            });
        } else if (!props.isActive && timeout) {
            clearTimeout(timeout);
            updateState({
                isActiveClass: '',
                timeout: null,
            });
        }
    });

    return (
        <div className='progress-wrapper'>
            <p className='text-center'>Progress...</p>
            <div className={`progress ${state.isActiveClass}`}>
                <div className={`progress-bar-striped`} />
            </div>
        </div>
    );
};

export default ProgressStep;