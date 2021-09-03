import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Container } from 'reactstrap'
import { Toast, isEmptyString } from '../../utils/helperFunctions';
import axios from '../../utils/axiosService';
import API from '../../config';

const apiUrl = API.API_URL;

function CallNintexActionModal({ action, show, toggle, handleActionUpdate, onClose, i }) {
    const [url, setUrl] = useState(action ? action.url : undefined)
    const [method, setMethod] = useState(action ? action.method : undefined)
    const [apiUrlText, setApiUrlText] = useState(action ? action.openApiUrl : undefined)
    const [openApiTitle, setOpenApiTitle] = useState(action ? action.openApiTitle : undefined)
    const [apiParameters, setApiParameters] = useState(action ? action.parameters : undefined)
    const [apiBody, setApiBody] = useState(action ? action.body : undefined)
    const [isURLConnected, setIsURLConnected] = useState(false)

    //var token = /(?<=[\?\&])(.*?)(?=(=([^&#]*)|&|#|$))/.exec(apiUrlText);
    console.log('-->isURLConnected@CallNintexActionModal: ', isURLConnected);
    //console.log('--->apiUrlText: ', apiUrlText);

    useEffect(() => {
        if (action) {
            setUrl(('url' in action) ? action.url : undefined)
            setMethod(('method' in action) ? action.method : undefined)
            setApiUrlText(('openApiUrl' in action) ? action.openApiUrl : undefined)
            setOpenApiTitle(('openApiTitle' in action) ? action.openApiTitle : undefined)
            setApiParameters(('parameters' in action) ? action.parameters : undefined)
            setApiBody(('body' in action) ? action.body : undefined)
        }

        console.log('1st useEffect called! apiBody: ', apiBody)
    }, [action])

    useEffect(() => {
        setIsURLConnected(!show ? false : isURLConnected)
        console.log('2nd useEffect called! isURLConnected: ', isURLConnected)
    }, [action])

    function handleSave(e) {
        action.url = url
        action.method = method
        action.openApiUrl = apiUrlText
        action.openApiTitle = openApiTitle
        action.body = apiBody
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        setApiUrlText(e.target.value)
    }

    function handleConnectApiURL() {
        axios.apis('GET', `/api/v1-ping-open-api?url=${apiUrlText}`)
            .then(data => {
                Toast(data.message)
                // if API URL valid, retrieve the API parameters
                if (data.success) {
                    axios.apis('GET', `/api/v1-retrieve-external-workflow-parameters?url=${apiUrlText}`)
                        .then(res_data => {
                            console.log('res_data: ', res_data)
                            setUrl(url !== undefined ? url : res_data.url)
                            setMethod(method !== undefined ? method : 'post') //hardcoded this to POST now...
                            setOpenApiTitle(openApiTitle !== undefined ? openApiTitle : res_data.openApiTitle)
                            setApiBody(apiBody !== undefined ? apiBody : res_data.apiBody)
                            setApiParameters(apiParameters !== undefined ? apiParameters : res_data.apiParameters)
                            console.log('(@@)openApiTitle: ', openApiTitle)
                            console.log('(@@)apiBody: ', apiBody)
                            console.log('(@@)apiParameters: ', apiParameters)
                        })
                        .catch(e2 => console.error(e2))
                }

                setIsURLConnected(data.success);
            })
            .catch(e => console.error(e))

        console.log('()isURLConnected: ', isURLConnected)
    }

    function handleInputProperties(parameter, property) {
        const value = document.getElementById(`input--${parameter}-${property}`).value

        const newApiBody = {
            ...apiBody,
            [parameter]: {
                ...apiBody[parameter],
                [property]: value
            }
        }

        setApiBody(newApiBody)
    }

    if (!show) { return null; }
    return (
        <Modal isOpen={show} toggle={toggle('Call Nintex Workflow')} size="lg" centered>
            <ModalHeader toggle={toggle('Call Nintex Workflow')}>
                {action ? action.name : null}
            </ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col md='1'>
                            <span>URL
                                <span className='required-star'>*</span>
                            </span>
                        </Col>
                        <Col md='11'>
                            <textarea
                                className="form-control"
                                id="apiUrl"
                                value={apiUrlText}
                                rows="2"
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md='1'>
                        </Col>
                        <Col md='8'>
                            {
                                isURLConnected &&
                                <span className="connected-label">
                                    [Connected]
                                </span>
                            }
                            {
                                isURLConnected === false &&
                                <span className="error-label">
                                    [Error]
                                </span>
                            }
                        </Col>
                        <Col md='3' className='text-right mt-1'>
                            <Button color="secondary" className='custom-btn' disable={isEmptyString(apiUrlText)} onClick={handleConnectApiURL}>
                                Connect
                            </Button>
                        </Col>
                    </Row>

                    {
                        isURLConnected &&
                        <Row className=" bordered-container parameters-containers" style={{ width: "100%", marginTop: "10px" }}>
                            <Col md='12' className="parameters-container">
                                <div className="col s12 zero-padding border-bottom">
                                    <span>{openApiTitle}</span>
                                </div>
                            </Col>
                            {
                                apiParameters &&
                                apiParameters.length > 0 &&
                                apiParameters.map((parameter, paramIdx) => (
                                    <div key={paramIdx} className="col s12">
                                        <p className="parameter-name">{parameter.name}</p>
                                        {
                                            parameter.properties.map((property, propIdx) => (
                                                <Col md='12' key={propIdx} >
                                                    <Row>
                                                        <Col md='4' >
                                                            <span className="col s12 property-name">{property.name}</span>
                                                            <span className="col s12 property-type">{property.type}</span>
                                                        </Col>
                                                        <Col md='8' className="event-input">
                                                            <Input
                                                                className="m-0"
                                                                id={`input--${parameter.name}-${property.name}`}
                                                                value={apiBody[parameter.name][property.name]}
                                                                onChange={e => handleInputProperties(parameter.name, property.name)} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            ))
                                        }
                                    </div>
                                ))
                            }
                        </Row>
                    }

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
                            <Button color="secondary" className='custom-btn ml-2' disable={!isURLConnected} onClick={e => handleSave(e)}>
                                Save
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </ModalFooter>
        </Modal>
    )
}

export default CallNintexActionModal