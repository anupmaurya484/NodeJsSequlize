import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PopupForm.scss';
import logger from '../../helper/logger.helper';
import { config }  from '../../../../utils/workflow.config';
import Form from '@rjsf/core';
import TaskPaletteGroup from '../TaskPaletteGroup';

class PopupForm extends Component {
    constructor (props) {
        super(props);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            formData: {}
        }
    }

    handleToggle () {
        this.props.toggle();
    }

    onSubmit () {
        this.props.onSubmit(this.state.formData.name);
    }

    handleChange (e) {
        //console.log('handleChange form popup ', e)
        this.setState({formData: e.formData});
    }

    render () {
        //console.log(this.props.schema)
        return (
            <div className={`popupform ${this.props.isDisplay ? '': 'hide'}`} >
                <div className="popupform-inner" >
                    <div className="popupform-mask"></div>
                    <div className="popupform-content">
                        <div className="popupform-wrapper">
                            <Form schema={this.props.schema}
                            formData={this.state.formData}
                            onChange={(e) => this.handleChange(e)}
                            onSubmit={this.onSubmit}
                            onError={e => console.log("errors", e)} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
PopupForm.propTypes = {

}

PopupForm.defaultProps = {

}


export default PopupForm;
