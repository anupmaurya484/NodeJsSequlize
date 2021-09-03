import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './JsonFileInput.scss';
import logger from '../../helper/logger.helper';
import { config }  from '../../../../utils/workflow.config';

import TaskPaletteGroup from '../TaskPaletteGroup';
import MultipleFields from '../MultipleFields';
import Form from "@rjsf/core";

class JsonFileInput extends Component {
    constructor (props) {
        super(props);
        this.state = {

        }
        this.handleChange = this.handleChange.bind(this);

    }
    handleChange (e) {
        let fileUpload = this.inputElement.files[0];
        let self = this;
        console.log(fileUpload)
        if (fileUpload && fileUpload.type.match(/json/)) {
            let fileReader = new FileReader();
            fileReader.onload = e => {
                // console.log('fileresult', fileReader.result)
                let jsonData;
                try {
                    jsonData = JSON.parse(fileReader.result);
                } catch (e) {
                    console.log('OOps, Invalid JSON format!');
                } finally {
                    if (jsonData) {
                        self.props.importedJsonFile(jsonData);
                    }
                }

            }
            fileReader.readAsText(fileUpload);
        }
        console.log('handleChange ', e)
    }
    componentWillReceiveProps (newProps) {
        if (newProps.isDisplay !== this.props.isDisplay) {
            this.inputElement.click();
        }
    }
    render () {
        console.log(this.props.isDisplay)
        return (
            <div id="json-file-input-container" className="hide"  >
                <div id="json-file-input-inner" >
                    <input type="file" ref={e => this.inputElement = e} className="json-file-input" onChange={this.handleChange}/>
                </div>
            </div>
        )
    }
}

JsonFileInput.propTypes = {}

JsonFileInput.defaultProps = {}

export default JsonFileInput;
