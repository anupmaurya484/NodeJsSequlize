import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Modal,  ModalBody, ModalFooter, ModalHeader, Container } from 'reactstrap';
import API from '../../config';

const apiUrl = API.API_URL;

function SendSMSModal({ action, show, toggle, handleActionUpdate, onClose, i }) {
    const [sendTo, setSendTo] = useState(action ? action.sendTo : undefined)
    const [messageBody, setMessageBody] = useState(action ? action.messageBody : undefined)

    console.log('-->sendTo@CallSMSModal: ', sendTo);

    useEffect(() => {
        if (action) {
            setSendTo(('sendTo' in action) ? action.sendTo : undefined)
            setMessageBody(('messageBody' in action) ? action.messageBody : undefined)
        }
        console.log('1st useEffect called! sendTo: ', sendTo)
    }, [action])


    function handleSave(e) {
        action.sendTo = sendTo
        action.messageBody = messageBody
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        switch (e.target.id) {
            case 'sendTo':
                setSendTo(e.target.value);
                break;
            case 'messageBody':
                setMessageBody(e.target.value)
        }
    }

    function handleConnectApiURL() {

    }

    function handleInputProperties(parameter, property) {

    }

    if (!show) { return null; }
    return (
        <Modal isOpen={show} toggle={toggle('Send SMS')} size="lg" centered>
            <ModalHeader toggle={toggle('Send SMS')}>
                {action ? action.name : null}
            </ModalHeader>
            <ModalBody>
                <Container>
                    <Row>
                        <Col md='3'>
                            Send To
                            <span className='required-star'>*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={sendTo}
                                    id="sendTo"
                                    rows="1"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Message
                            <span className='required-star'>*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={messageBody}
                                    id="messageBody"
                                    rows="3"
                                    onChange={handleChange}
                                />
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

export default SendSMSModal