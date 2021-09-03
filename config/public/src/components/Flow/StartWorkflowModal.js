import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosService';
import { Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Container} from 'reactstrap';

function StartWorkflowModal({ action, show, toggle, handleActionUpdate, onClose, i }) {
    const [workflowId, setWorkflowId] = useState(action ? action.workflowId : undefined)
    const [workflows, setWorkflows] = useState(undefined)


    useEffect(() => {
        if (action) {
            setWorkflowId(('workflowId' in action) ? action.workflowId : undefined)
        }

        try {
            axios.apis("GET", "/api/GetWorkflow").then(resData => {
                setWorkflows(resData)
            })
        } catch (err) {
            console.log(err)
        }

        // componentWillUnmount
        return () => {
            console.log('unmounting...')
        }
    }, [action])



    function handleSave(e) {
        action.workflowId = workflowId
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        switch (e.target.id) {
            case 'workflowId':
                setWorkflowId(e.target.value)
                break;
        }
    }

    if (!show) { return null; }
    return (
        <Modal className="start-workflow-modal" centered size="lg" isOpen={show} toggle={toggle('Start Workflow')} >
            <ModalHeader toggle={toggle('Start Workflow')} className="modal-header"><h5>{action ? action.name : null}</h5></ModalHeader>
            <ModalBody>
                <Row>
                    <Col md='2'>
                        <label htmlFor="workflow">
                            Workflow
                            <span className='required-star'>*</span>
                        </label>
                    </Col>
                    <Col md='10'>
                        <div>
                            <select className="browser-default custom-select form-select-modified"
                                id="workflowId" value={workflowId} onChange={handleChange}
                                required>
                                <option key="selectWorkflow" value="">Select a workflow..</option>
                                {workflows && workflows.data.map((wf, i) => { return (<option key={i} value={wf._id}>{wf.workflowName}</option>) })}
                            </select>
                        </div>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
            <Container>
                <Row>
                    <Col md="4" className="text-left">
                        <button type="button"  className="btn btn-danger mr-5 " onClick={e => handleDelete(e)}>Delete</button>
                    </Col>
                    <Col md="8" className="text-right">
                        <button type="button" className="btn btn-secondary btn-sm mr-3" onClick={e => { onClose(e, action.name) }}>Close</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={e => handleSave(e)}>Save changes</button>
                    </Col>
                </Row>
            </Container>
            </ModalFooter>
        </Modal>
    )
}

export default StartWorkflowModal