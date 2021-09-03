import React, { useState, useEffect, Fragment } from 'react';
import { Container, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Button } from 'reactstrap';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';

function SetFormComponentModal({ onClickVariables, pageLayoutFormSchema, variablesLists, action, show, toggle, handleActionUpdate, onClose, i }) {
    const [comp, setComp] = useState(action ? action.comp : undefined)
    const [type, setType] = useState(action ? action.type : 'string')
    const [value, setValue] = useState(action ? action.value : undefined)

    useEffect(() => {

        if (action) {
            setComp(('comp' in action) ? action.comp : undefined)
            setType(('type' in action) ? action.type : 'string')
            setValue(('value' in action) ? action.value : undefined)
        }

        // componentWillUnmount
        return () => {
            console.log('unmounting...')
        }

    }, [action]);

    function handleSave(e) {
        action.comp = comp
        action.value = value
        action.type = type
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        switch (e.target.id) {
            case 'comp':
                setComp(e.target.value)
                break;
            case 'type':
                setType(e.target.value)
                break;
            case 'value':
                setValue(e.target.value)
                break;
        }
    }

    function handleAceChange(e) {
        setValue(e)
    }

    if (!show) { return null; }

    return (
        <Modal centered size="lg" isOpen={show} toggle={toggle('Set Form Component')} >
            <ModalHeader toggle={toggle('Set Form Component')} className="modal-header"><><h5>{action ? action.name : null}</h5></></ModalHeader>
            <ModalBody>
                <Row>
                    <Col md='3'>
                        Component
                        <span className="required-star">*</span>
                    </Col>
                    <Col md='9'>
                        <div className="form-group">
                            <select
                                className="form-control form-select-modified"
                                value={comp}
                                id="comp"
                                onChange={handleChange}>
                                <option value="0">Select</option>
                                {pageLayoutFormSchema.map((x, i) => (
                                    <option key={i} value={x.key}>{x.key}</option>
                                ))}
                            </select>
                        </div>
                    </Col>
                </Row>

                {pageLayoutFormSchema.some(x => (x.key == comp && x.title == "modal")) &&
                    <Row>
                        <Col md='3'>
                            Display
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <select className="browser-default custom-select form-select-modified" id="value" name="value" value={value} onChange={handleChange} required>
                                    <option key="string" value="0">Select</option>
                                    <option key="string" value="true">Show</option>
                                    <option key="integer" value="false">Hide</option>
                                </select>
                            </div>
                        </Col>
                    </Row>
                }

                {!pageLayoutFormSchema.some(x => (x.key == comp && x.title == "modal")) &&
                    <Fragment>
                        <Row>
                            <Col md='3'>
                                Source type
                                <span className="required-star">*</span>
                            </Col>
                            <Col md='9'>
                                <div className="form-group">
                                    <select className="browser-default form-select-modified custom-select"
                                        id="type" value={type} onChange={handleChange}
                                        required>
                                        <option key="string" value="string">String</option>
                                        <option key="integer" value="integer">Integer</option>
                                        <option key="numeric" value="numeric">Numeric</option>
                                        <option key="boolean" value="boolean">Boolean</option>
                                        <option key="object" value="object">Object</option>
                                        <option key="variable" value="variable">Variable</option>
                                    </select>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md='3'>
                                Value
                                <span className="required-star">*</span>
                            </Col>
                            <Col md='9'>
                                <div className="form-group">
                                    {['variable'].indexOf(type) > -1 &&
                                        <select name="value" id="value" value={value} onChange={handleChange} className="form-control  form-select-modified" >
                                            <option>Select..</option>
                                            {variablesLists.map((x, i) => (
                                                <option key={i} value={x.variable}>{x.variable}</option>
                                            ))}
                                        </select>
                                    }

                                    {['string'].indexOf(type) > -1 &&
                                        <textarea
                                            className="form-control"
                                            name="value"
                                            value={value}
                                            id="value"
                                            rows="2"
                                            onChange={handleChange}
                                        />}
                                    {["integer", "numeric"].indexOf(type) > -1 &&
                                        <input type="number"
                                            className="form-control"
                                            name="value"
                                            value={value}
                                            id="value"
                                            onChange={handleChange}
                                        />}
                                    {type == "object" &&
                                        <AceEditor
                                            name="value"
                                            id="value"
                                            mode="json"
                                            width="100%"
                                            height="250px"
                                            readOnly={false}
                                            value={value}
                                            highlightActiveLine={true}
                                            setOptions={{
                                                enableBasicAutocompletion: true,
                                                enableLiveAutocompletion: true,
                                                enableSnippets: false,
                                                showLineNumbers: true,
                                                tabSize: 2
                                            }}
                                            onChange={handleAceChange}
                                        />
                                    }
                                    {type == "boolean" &&
                                        <div className="form-group">
                                            <select className="browser-default custom-select form-select-modified"
                                                id="value" name="value" value={value} onChange={handleChange} required>
                                                <option key="string" value="string">True</option>
                                                <option key="integer" value="integer">False</option>
                                            </select>
                                        </div>
                                    }
                                </div>
                                {(onClickVariables && ['variable'].indexOf(type) > -1) && <p className="text-right pt-2 text-info"><a onClick={onClickVariables}>Insert Variable</a></p>}
                            </Col>
                        </Row>
                    </Fragment>

                }


            </ModalBody>
            <ModalFooter>
                <Container>
                    <Row>
                        <Col md='4' className='text-left'>
                            {(i !== -1) && <Button color="danger" className='custom-btn' name="Delete" onClick={e => handleDelete(e)}>Delete</Button>}
                        </Col>
                        <Col md='8' className='text-right'>
                            <Button color="secondary" className='custom-btn mr-2' onClick={e => { onClose(e, action.name) }}>Close</Button>
                            <Button color="primary" className='custom-btn' type="submit" name="Submit" onClick={e => handleSave(e)}>Submit</Button>
                        </Col>
                    </Row>
                </Container>
            </ModalFooter>
        </Modal>
    )
}

export default SetFormComponentModal