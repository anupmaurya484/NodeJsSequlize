import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';
import { Input, } from 'reactstrap';

const Third = props => {

    const handleOnNext = (e) => {
        props.createConnection({ nextStep: props.nextStep });
    }
    return (
        <div>
            <div className="row pt-3 pb-3">
                <div className="col-lg-12">
                <i data-test="fa" className="fa fa-user fa-2x mr-2"></i>
                    <label>Title</label>
                    <Input
                        value={props.state.title}
                        name='title'
                        className='mb-2'
                        icon='user'
                        group
                        type='text'
                        validate
                        error='wrong'
                        success='right'
                        onChange={props.inputChangeHandler} />
                <i data-test="fa" className="fa fa-envelope fa-2x mr-2"></i> 
                    <label>Description</label>       
                    <Input
                        value={props.state.content}
                        name='content'
                        label='Description'
                        icon='envelope'
                        group
                        type="text"
                        validate
                        error='wrong'
                        success='right'
                        onChange={props.inputChangeHandler} />
                </div>
            </div>
            <Stats
                handleNextStep={handleOnNext}
                step={3}
                {...props}
                isEnable={props.state.title!="" && props.state.content!=""}
                history={props.history} />
        </div>
    );
};


export default Third;