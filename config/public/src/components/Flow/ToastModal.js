import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, ModalBody, ModalFooter, ModalHeader,  Container } from 'reactstrap';
import API from '../../config';

function ToastModal({ action, show, toggle, handleActionUpdate, onClose, i }) {
    const [message, setMessage] = useState(action ? action.message : undefined)
    const [color, setColor] = useState(action ? action.color : undefined)

    useEffect(() => {
        if (action) {
            setMessage(('sendTo' in action) ? action.message : undefined)
            setColor(('messageBody' in action) ? action.color : undefined)
        }
    }, [action])


    function handleSave(e) {
        action.message = message
        action.color = color
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        switch (e.target.id) {
            case 'message':
                setMessage(e.target.value);
                break;
            case 'color':
                setColor(e.target.value)
        }
    }

    function handleConnectApiURL() {

    }

    function handleInputProperties(parameter, property) {

    }

    if (!show) { return null; }
    return (
        <Modal isOpen={show} toggle={toggle('Toast')} size="lg" centered>
            <ModalHeader toggle={toggle('Toast')} >
                {action ? action.name : null}
            </ModalHeader>
            <ModalBody>
                <Container>
                    <Row>
                        <Col md='3'>
                            Message
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={message}
                                    id="message"
                                    rows="1"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Color
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <div>
                                <select className="browser-default form-select-modified custom-select"
                                    id="color" value={color} onChange={handleChange}
                                    required>
                                    <option key="info" value="info">Info</option>
                                    <option key="success" value="success">Success</option>
                                    <option key="warn" value="warn">Warning</option>
                                    <option key="error" value="error">Error</option>
                                    <option key="default" value="default">Default</option>
                                    <option key="dark" value="dark">Dark</option>
                                </select>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                <Container>
                    <Row>
                        <Col md='4' className='text-left'>
                            <Button color="danger" className='custom-btn' onClick={e => handleDelete(e)}>Delete</Button>
                        </Col>
                        <Col md='8' className='text-right'>
                            <Button color="secondary" className='custom-btn' onClick={e => { onClose(e, action.name) }}>Close</Button>
                            <Button color="secondary" className='custom-btn ml-2' onClick={e => handleSave(e)}>Save</Button>
                        </Col>
                    </Row>
                </Container>
            </ModalFooter>
        </Modal>
    )
}

export default ToastModal