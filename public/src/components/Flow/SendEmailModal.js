import React, { useState, useEffect } from 'react'
import {
    Row,
    Col,
    Button,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Container,
    Form
} from 'reactstrap'

import API from '../../config';

const apiUrl = API.API_URL;

function SendEmailModal({ action, show, toggle, handleActionUpdate, onClose, i }) {
    const [sendTo, setSendTo] = useState(action ? action.sendTo : undefined)
    const [sendType, setSendType] = useState(action ? action.sendType : 1)
    const [replyTo, setReplyTo] = useState(action ? action.replyTo : undefined)
    const [senderName, setSenderName] = useState(action ? action.SenderName : undefined)
    const [ccTo, setCcTo] = useState(action ? action.ccTo : undefined)
    const [bccTo, setBccTo] = useState(action ? action.bccTo : undefined)
    const [subject, setSubject] = useState(action ? action.subject : undefined)
    const [messageBody, setMessageBody] = useState(action ? action.messageBody : undefined)

    console.log('-->sendTo@CallEmailModal: ', sendTo);

    useEffect(() => {
        if (action) {
            setSendTo(('sendTo' in action) ? action.sendTo : undefined)
            setSendType(('sendType' in action) ? action.sendType : 1)
            setReplyTo(('replyTo' in action) ? action.replyTo : undefined)
            setSenderName(('senderName' in action) ? action.senderName : undefined)
            setCcTo(('ccTo' in action) ? action.ccTo : undefined)
            setBccTo(('bccTo' in action) ? action.bccTo : undefined)
            setSubject(('subject' in action) ? action.subject : undefined)
            setMessageBody(('messageBody' in action) ? action.messageBody : undefined)
        }
        console.log('1st useEffect called! sendTo: ', sendTo)
    }, [action])



    function handleSave(e) {
        action.sendTo = sendTo
        action.sendType = sendType
        action.replyTo = replyTo
        action.senderName = senderName
        action.ccTo = ccTo
        action.bccTo = bccTo
        action.subject = subject
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
                setSendTo(e.target.value)
                break;
            case 'replyTo':
                setReplyTo(e.target.value)
                break;
            case 'senderName':
                setSenderName(e.target.value)
                break;
            case 'ccTo':
                setCcTo(e.target.value)
                break;
            case 'bccTo':
                setBccTo(e.target.value)
                break;
            case 'subject':
                setSubject(e.target.value)
                break;
            case 'messageBody':
                setMessageBody(e.target.value)
        }
    }

    if (!show) { return null; }
    return (
        <Modal isOpen={show} toggle={toggle('Send Email')} size="lg" centered>
            <ModalHeader toggle={toggle('Send Email')}>
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
                                    rows="2"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Send method
                        </Col>
                        <Col md='9'>
                            <Form inline>
                                <Input gap onClick={() => setSendType(1)} checked={sendType === 1 ? true : false} label="All at once" type="radio"
                                    id="radio1" containerClass='mr-5' />
                                <Input gap onClick={() => setSendType(2)} checked={sendType === 2 ? true : false} label="One by one" type="radio"
                                    id="radio2" containerClass='mr-5' />
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Reply to
                            <span className='required-star'>*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={replyTo}
                                    id="replyTo"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Sender display name
                            <span className='required-star'>*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={senderName}
                                    id="senderName"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Cc
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={ccTo}
                                    id="ccTo"
                                    rows="1"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Bcc
                        </Col>
                        <Col md="9">
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={bccTo}
                                    id="bccTo"
                                    rows="1"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Subject
                            <span className='required-star'>*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={subject}
                                    id="subject"
                                    onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='3'>
                            Message body
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <textarea
                                    className="form-control"
                                    value={messageBody}
                                    id="messageBody"
                                    rows="4"
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

export default SendEmailModal