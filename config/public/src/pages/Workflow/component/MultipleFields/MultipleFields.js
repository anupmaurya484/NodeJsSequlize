import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './MultipleFields.scss';
import logger from '../../helper/logger.helper';
import { config }  from '../../../../utils/workflow.config';

import { Button, Col, FormGroup, Input } from 'reactstrap';

class MultipleFields extends Component {
    constructor (props) {
        super(props);
        this.state = {

        }
    }

    render () {
        let fields = this.props.fields;
        return (
            <div id="designer-fields-multiple"  >
                <div id="designer-fields-multiple-inner" >
                    {
                        fields[0].value.map((v, i) => {
                            let fieldsGroup = fields.map((field, j) => {
                                return (
                                    <FormGroup controlId={field.name} key={field.name}>
                                        <Col sm={2}>
                                            {field.title}
                                        </Col>
                                        <Col sm={10}>
                                        <Input
                                        type="text"
                                        placeholder={field.title}
                                        value={fields[j].value[i] || ''}
                                        onChange={e => this.props.update(this.props.node, i, field, j, e.target.value)}
                                        value={field.value[i] || ''} />
                                        </Col>
                                    </FormGroup>
                                )
                            })
                            return fieldsGroup;
                        })
                    }
                    <Button onClick={() => this.props.addNewVariable(this.props.node)} ><span className="fa fa-plus"/></Button>
                </div>
            </div>
        )
    }
}
MultipleFields.propTypes = {
    fields: PropTypes.array,
    update: PropTypes.func,
    node: PropTypes.string
}

MultipleFields.defaultProps = {

}


export default MultipleFields;
