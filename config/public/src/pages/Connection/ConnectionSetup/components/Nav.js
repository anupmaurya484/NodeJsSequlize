import React, { Fragment, useState, useEffect } from 'react';

const Nav = (props) => {
    const dots = [];
    for (let i = 1; i <= props.totalSteps; i += 1) {
        const isActive = props.currentStep === i;
        dots.push((
            <span
                key={`step-${i}`}
                className={`dot ${isActive ? 'active' : ''}`}
            >&bull;</span>
        ));
    }

    return (
        <div className="step-nav">{dots}</div>
    );
};


export default Nav;