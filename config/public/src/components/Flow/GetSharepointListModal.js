import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import axios from '../../utils/axiosService';
import { Container, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Button } from 'reactstrap';
import { Toast, GetTenantName } from '../../utils/helperFunctions';
import auth from '../../actions/auth';

function GetSharepointListModal({ action, show, toggle, handleActionUpdate, onClose, i }) {
    const [j, setJ] = useState(action ? action.j : -1)
    const [url, setUrl] = useState(action ? action.url : undefined)
    const [verified, setVerified] = useState(action ? action.verified : false)
    const [variable, setVariable] = useState(action ? action.variable : undefined)
    const [type, setType] = useState(action ? action.type : 'Web request')
    const [connId, setConnId] = useState(action ? action.connId : undefined)
    const [spList, setSpList] = useState([])
    const [jsonData, setJsonData] = useState("")

    useEffect(() => {
        if (action) {
            setJ(('j' in action) ? action.j : -1)
            setUrl(('url' in action) ? action.url : undefined)
            setVerified(('verified' in action) ? action.verified : false)
            setVariable(('variable' in action) ? action.variable : undefined)
            setType(('type' in action) ? action.type : 'Sharepoint')
            setConnId(('connId' in action) ? action.connId : undefined)
            setSpList([])
        }
        onloadSharePoint()

        // componentWillUnmount
        return () => {
            console.log('unmounting...')
        }
    }, [action])

    function handleSave(e) {
        action.j = j
        action.url = url
        action.verified = verified
        action.variable = variable
        action.type = type
        action["tenant"] = GetTenantName()
        action.connId = connId
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    const handleConnection = async () => {
        try {
            var reqData = {
                url: url,
                method: 'GET',
                connId: connId,
                dataSrcType: type,
                tenant: GetTenantName()
            }
            const res = await axios.apis('POST', `/api/webrequest`, reqData);
            if (res) {
                setJsonData(JSON.stringify(res, null, 2));
                setVerified(true)

            }
        } catch (err) {
            console.error(err.message)
        }
    }

    function handleChange(e) {
        console.log(e.target.id, e.target.value)
        switch (e.target.id) {
            case 'j':
                setJ(e.target.value)
                break;
            case 'url':
                setUrl(e.target.value)
                break;
            case 'verified':
                setVerified(e.target.value)
                break;
            case 'variable':
                setVariable(e.target.value)
                break;
            case 'type':
                setType(e.target.value)
                if (e.target.value == "Sharepoint") {
                    console.log('target id is type')
                    onloadSharePoint()
                }
                break;
            case 'connId':
                setConnId(e.target.value)
        }
    }

    const onloadSharePoint = async () => {
        try {
            let sharepointList = await axios.apis('GET', `/api/GetShareConnectionList`, auth.headers)
            setSpList(sharepointList)
        } catch (err) {
            console.log(err.message)
        }

    }

    if (!show) { return null; }
    return (
        <Modal centered size="lg" isOpen={show} toggle={toggle('Get Sharepoint List')} >
            <ModalHeader toggle={toggle('Get Sharepoint List')} className="modal-header"><h5>{action ? action.name : null}</h5></ModalHeader>
            <ModalBody>
                <Row>
                    <Col ms='3'>
                        Save as variable
                        <span className="required-star">*</span>
                    </Col>
                    <Col md='9'>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                value={variable}
                                id="variable"
                                onChange={handleChange}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md='3'>
                        URL
                        <span className="required-star">*</span>
                    </Col>
                    <Col md={verified ? '8' : '9'}>
                        <div className="form-group">
                            <textarea
                                className="form-control form-textarea-modified"
                                value={url}
                                id="url"
                                rows="4"
                                onChange={handleChange}
                            />
                        </div>
                    </Col>
                    {verified &&
                        <Col md='1'>
                            <i className="fas fa-check"></i>
                        </Col>
                    }
                </Row>

                <Row>
                    <Col md='3'>
                        Type
                        <span className="required-star">*</span>
                    </Col>
                    <Col md='9'>
                        <div className="form-group">
                            <select
                                className="form-control form-select-modified"
                                value={type}
                                id="type"
                                onChange={handleChange}
                            >
                                <option key='1' value='Web request'>Web Request</option>
                                <option key='2' value='Sharepoint'>Sharepoint</option>
                            </select>
                        </div>
                    </Col>
                </Row>
                {(type == "Sharepoint" && (spList.length != 0 || connId)) &&
                    <Row>
                        <Col md='3'>Connection
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <select className="form-control form-select-modified" id="connId" name="default_path" onChange={handleChange} value={connId}>
                                    <option >Select..</option>
                                    {spList.map((x, i) => <option key={i} value={x.value}>{x.name}</option>)}
                                </select>
                            </div>
                        </Col>
                    </Row>
                }

                {verified &&
                    <Row>
                        <Col className="text-success text-center" md="12" style={{ fontSize: "25px", verticalAlign: "middle" }}><span>Connection verified </span><i className="material-icons"  >check</i></Col>
                        {jsonData &&
                            <Col>
                                <AceEditor
                                    name="data"
                                    mode="json"
                                    width="100%"
                                    height="250px"
                                    readOnly={true}
                                    value={jsonData}
                                    setOptions={{
                                        enableBasicAutocompletion: true,
                                        enableLiveAutocompletion: true,
                                        enableSnippets: true
                                    }}
                                />
                            </Col>
                        }

                    </Row>
                }

            </ModalBody>
            <ModalFooter>
                <Container>
                    <Row>
                        <Col md='4' className='text-left'>
                            {(i !== -1) && <Button color="danger" className='custom-btn' name="Delete" onClick={e => handleDelete(e)}>Delete</Button>}
                        </Col>
                        <Col md='8' className='text-right'>
                            <Button color="secondary" className='custom-btn' onClick={e => { onClose(e, action.name) }}>Close</Button>
                            <Button color="primary" className='custom-btn ml-2' type="submit" name="Verify" onClick={e => handleConnection(e)}>Verify</Button>
                            <Button color="primary" disabled={!verified} className='custom-btn ml-2' type="submit" name="Submit" onClick={e => handleSave(e)}>Submit</Button>
                        </Col>
                    </Row>
                </Container>
            </ModalFooter>
        </Modal>
    )
}

export default GetSharepointListModal