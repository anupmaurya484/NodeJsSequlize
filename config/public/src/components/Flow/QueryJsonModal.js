import React, { useState, useEffect } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { Container, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Button } from 'reactstrap';

function QueryJsonModal({onClickVariables, variablesLists, action, show, toggle, handleActionUpdate, onClose, i }) {
    const [jsonData, setJsonData] = useState(action ? action.jsonData : undefined)
    const [query, setQuery] = useState(action ? action.query : undefined)
    const [saveTo, setSaveTo] = useState(action ? action.variable : undefined)
    const [formatType, setformatType] = useState(action ? action.formatType : undefined)

    useEffect(() => {
        if (action) {
            setJsonData(('jsonData' in action) ? action.jsonData : undefined)
            setQuery(('query' in action) ? action.query : undefined)
            setSaveTo(('variable' in action) ? action.variable : undefined)
            setformatType(('formatType' in action) ? action.formatType : undefined)
        }

        // componentWillUnmount
        return () => {
            console.log('unmounting...')
        }
    }, [action])

    function handleSave(e) {
        action.jsonData = jsonData
        action.query = query
        action.variable = saveTo
        action.formatType = formatType;
        action.type = 'queryJson';
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        console.log(e.target.id, e.target.value)
        switch (e.target.id) {
            case 'jsonData':
                setJsonData(e.target.value)
                break;
            case 'query':
                setQuery(e.target.value)
                break;
            case 'saveTo':
                setSaveTo(e.target.value)
                break;
        }
    }

    console.log(jsonData);

    if (!show) { return null; }
    return (
        <Modal centered size="lg" isOpen={show} toggle={toggle('Query Json')} >
            <ModalHeader toggle={toggle('Query Json')} className="modal-header"><><h5>{action ? action.name : null}</h5></></ModalHeader>
            <ModalBody>
                <Row>
                    <Col md='3'>
                        Save as variable
                        <span className="required-star">*</span>
                    </Col>
                    <Col md='9'>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                value={saveTo}
                                id="saveTo"
                                onChange={handleChange}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md='3'>
                        Format type
                        <span className="required-star">*</span>
                    </Col>
                    <Col md='9'>
                        <div className="form-group">
                            <select className="form-control form-select-modified" id="formatType" name="formatType" value={formatType} onChange={(e) => setformatType(e.target.value)} >
                                <option>Select..</option>
                                <option value="1">JSON Data</option>
                                <option value="2">Variable</option>
                            </select>
                        </div>
                    </Col>
                </Row>

                {formatType == 1 &&
                    <Row>
                        <Col md='3'>
                            Json Data
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <JSONInput
                                    id='jsonData'
                                    placeholder={typeof jsonData == 'string' ? {} : jsonData}
                                    onChange={(e) => !e.error && setJsonData(e.jsObject)}
                                    colors={{ string: "#DAA520" }}
                                    height='300px'
                                    width='100%'
                                />
                            </div>
                        </Col>
                    </Row>
                }

                {formatType == 2 &&
                    <Row className="mb-3">
                        <Col md='3'>
                            Variable List
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <select id="jsonData" value={jsonData} onChange={handleChange} className="form-control form-select-modified" >
                                <option>Select..</option>
                                {variablesLists.map((x, i) => (
                                    <option key={i} value={x.variable}>{x.variable}</option>
                                ))}
                            </select>
                            <p className="text-right pt-2 text-info"><a onClick={onClickVariables}>Insert Variable</a></p>
                        </Col> 
                    </Row>
                }


                <Row>
                    <Col md='3'>
                        Query
                        <span className="required-star">*</span>
                    </Col>
                    <Col md='9'>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                value={query}
                                id="query"
                                onChange={handleChange}
                            />
                        </div>
                    </Col>
                </Row>
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

export default QueryJsonModal