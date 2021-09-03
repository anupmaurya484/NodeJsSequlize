import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosService';
import { GetTenantName, isValidJson } from '../../utils/helperFunctions';
import { Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Container, Button } from 'reactstrap';
import auth from "../../actions/auth";
import JSONInput from 'react-json-editor-ajrm';
import SimpleBar from "simplebar-react";
import AceEditor from 'react-ace';

import API from '../../config';

function CallWebServiceModal({ action, show, toggle, handleActionUpdate, onClose, i, AppId }) {
    const iscollectionForm = window.location.pathname == "/design/dashboard/create-form" ? true : false;
    const [apiUrl, setApiUrl] = useState(action ? (action.apiUrl || "") : "")
    const [reqMethod, setReqMethod] = useState(action ? (action.reqMethod || "") : '');
    const [reqHeaders, setReqHeaders] = useState(action ? (action.reqHeaders || "") : "");
    const [reqBody, setReqBody] = useState(action ? (action.reqBody || "") : "");
    const [variable, setVariable] = useState(action ? (action.variable || "") : '');
    const [requestType, setRequestType] = useState(action ? (action.requestType || 1) : 1);
    const [isRequestHeaders, setIsRequestheaders] = useState(action ? (action.isRequestHeaders || false) : false);
    const [isRequestBody, setIsRequestBody] = useState(action ? (action.isRequestBody || false) : false);
    const [isRequestBodyAssociated, setIsRequestBodyAssociated] = useState(action ? (action.isRequestBodyAssociated || false) : false);
    const [collectionId, setCollectionId] = useState(action ? (action.collectionId || "") : "");
    const [collectionLists, setcollectionLists] = useState([]);


    useEffect(() => {
        if (action) {
            setApiUrl(('apiUrl' in action) ? (action.apiUrl || "") : "");
            setReqMethod(('reqMethod' in action) ? (action.reqMethod || "") : "");
            setReqHeaders(('reqHeaders' in action) ? (action.reqHeaders || "") : "");
            setReqBody(('reqBody' in action) ? (action.reqBody || "") : "");
            setVariable(('variable' in action) ? (action.variable || "") : "");
            setRequestType(('requestType' in action) ? (action.requestType || 1) : 1);
            setIsRequestheaders(('isRequestHeaders' in action) ? (action.isRequestHeaders || false) : false);
            setIsRequestBody(('isRequestBody' in action) ? (action.isRequestBody || false) : false);
            setIsRequestBodyAssociated(('isRequestBodyAssociated' in action) ? (action.isRequestBodyAssociated || false) : false);
            setCollectionId(('collectionId' in action) ? (action.collectionId || "") : "");
        }

        //Load Collection
        onloadData();


        // componentWillUnmount
        return () => {
            console.log('unmounting...')
        }
    }, [action])



    function handleSave(e) {
        action.apiUrl = apiUrl
        action.reqMethod = reqMethod
        action.reqHeaders = reqHeaders
        action.reqBody = reqBody
        action.variable = variable
        action.requestType = requestType
        action.isRequestHeaders = isRequestHeaders
        action.isRequestBody = isRequestBody
        action.isRequestBodyAssociated = isRequestBodyAssociated
        action.collectionId = collectionId
        action.tenant = GetTenantName()
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        switch (e.target.id) {
            case 'reqBody':
                setReqBody(e.target.value)
                break;
            case 'reqHeaders':
                setReqHeaders(e.target.value)
                break;
            case 'apiUrl':
                setApiUrl(e.target.value)
                break;
            case 'reqMethod':
                setReqMethod(e.target.value)
                break;
            case 'variable':
                setVariable(e.target.value)
            case 'collectionId':
                const collectionData = collectionLists.find(x => x.id == e.target.value);
                if (collectionData) {
                    setApiUrl("{{domain}}/collection/" + collectionData.name)
                }
                setCollectionId(e.target.value)
        }
    }

    function updateJsonField(stringValue, field) {
        var objValue = undefined;
        try {
            objValue = JSON.parse(stringValue)
        } catch (err) {
            alert(`${field} is not valid JSON\nError : ` + err)
            return stringValue
        }

        return objValue
    }

    async function onloadData() {
        try {
            let resData = await axios.apis('GET', `/api/GetCollectionList` + "?appId=" + AppId, auth.headers)
            if (resData.status) {
                console.log();
                setcollectionLists(resData.data)
            }
        } catch (err) {
            console.log(err.message)
        }
    }

    async function handlChangeAceEditor(value, type) {
        value = (value == "") ? "" : value;
        if (isValidJson(value)) {
            if (type == 'reqHeaders') {
                setReqHeaders(JSON.parse(value))
            } else if (type == 'reqBody') {
                setReqBody(JSON.parse(value))
            }
        } else {

        }
    }


    if (!show) { return null; }


    return (
        < div className="call-web-service-side-menu-setting">
            <div className="side-menu right-bar overflow">
                <SimpleBar style={{ 'max-width': '100%', 'overflowX': 'hidden', 'overflowY': 'hidden' }}>
                    <div data-simplebar className="h-100">
                        <div className="mb-2 d-flex justify-content-between" style={{ borderBottom: "1px solid #dcdbdb" }}>
                            <label title="Collection Setting" className='mt-2 mr-5' style={{ fontSize: "18px" }}>Call Web Service (End Point)</label>
                            <div>
                                <button type="button" className="btn btn-primary btn-sm mr-2" onClick={e => handleSave(e)}>Save changes</button>
                                <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={e => { onClose(e, action.name) }} >Close</button>
                                <button type="button" className='btn btn-secondary btn-sm' onClick={e => handleDelete(e)}>Delete</button>
                            </div>

                        </div>
                        <Container>
                            <div className="form-group">
                                <label htmlFor="variable">
                                    <strong>Save as variable</strong>
                                    <span className="required-star">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={variable}
                                    id="variable"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="d-flex form-group">
                                <div className="material-selectfield">
                                    <label>
                                        <strong>Method</strong>
                                        <span className="required-star">*</span>
                                    </label>
                                    <select className="browser-default form-select-modified custom-select"
                                        id="reqMethod" value={reqMethod} onChange={handleChange}
                                        required>
                                        <option >Select..</option>
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PATCH">PATCH</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                                <div className="w-100">
                                    <label htmlFor="variable">
                                        <strong>Request URL</strong>
                                        <span className="required-star">*</span>
                                    </label>
                                    <input
                                        readOnly={requestType == '2'}
                                        type="text"
                                        className="form-control w-100"
                                        value={apiUrl}
                                        id="apiUrl"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={'form-group ' + ((requestType == '1') ? '' : 'disabledDiv')}>
                                <div className="d-flex justify-content-between">
                                    <label><strong> Request Headers </strong><span className="required-star">*</span> </label>
                                    <div class="form-check">
                                        <input
                                            onClick={() => setIsRequestheaders(!isRequestHeaders)}
                                            checked={isRequestHeaders}
                                            class="form-check-input"
                                            type="checkbox" value=""
                                            id="flexCheckDefault6" />
                                        <label class="form-check-label" for="flexCheckDefault6">
                                            Allow Headers
                                        </label>
                                    </div>
                                </div>
                                <div className={(!isRequestHeaders) ? 'disabledDiv' : ''}>
                                    <AceEditor
                                        id="eConfigCondHeaders"
                                        name="eConfigCondHeaders"
                                        mode="json"
                                        width="100%"
                                        height="175px"
                                        readOnly={false}
                                        placeholder=""
                                        value={reqHeaders && JSON.stringify(reqHeaders, null, 2)}  //{eventsConfig[value]?JSON.stringify(eventsConfig[value].conditions, null, 2):undefined}
                                        onChange={(e) => handlChangeAceEditor(e, 'reqHeaders')}
                                        setOptions={{
                                            enableBasicAutocompletion: true,
                                            enableLiveAutocompletion: true,
                                            enableSnippets: true
                                        }}
                                    />
                                </div>
                            </div>

                            {["POST", "PATCH", "PUT"].includes(reqMethod) &&
                                <div class="form-check form-group">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="flexCheckDefault4"
                                        onClick={() => setIsRequestBodyAssociated(!isRequestBodyAssociated)}
                                        checked={isRequestBodyAssociated == 1} />
                                    <label class="form-check-label" for="flexCheckDefault4">
                                        Allow request body from associated forms
                                    </label>
                                </div>
                            }


                            {(!isRequestBodyAssociated && ["POST", "PATCH", "PUT"].includes(reqMethod)) &&
                                <div className="form-group">
                                    <div className="mb-2" >
                                        <label><strong> Request Body</strong> <span className="required-star">*</span> </label>
                                        <div class="form-check">
                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                onClick={() => setIsRequestBody(!isRequestBody)}
                                                checked={isRequestBody == 1}
                                                id="flexCheckDefault3" />
                                            <label class="form-check-label" for="flexCheckDefault3">
                                                Allow Body
                                            </label>
                                        </div>

                                    </div>

                                    <div className={(!isRequestBodyAssociated && isRequestBody) ? '' : 'disabledDiv'}>
                                        <AceEditor
                                            id="eConfigCondHeaders"
                                            name="eConfigCondHeaders"
                                            mode="json"
                                            width="100%"
                                            height="175px"
                                            readOnly={false}
                                            placeholder=""
                                            value={reqBody && JSON.stringify(reqBody, null, 2)}  //{eventsConfig[value]?JSON.stringify(eventsConfig[value].conditions, null, 2):undefined}
                                            onChange={(e) => handlChangeAceEditor(e, 'reqBody')}
                                            setOptions={{
                                                enableBasicAutocompletion: true,
                                                enableLiveAutocompletion: true,
                                                enableSnippets: true
                                            }}
                                        />
                                    </div>
                                </div>
                            }
                        </Container>
                    </div>
                </SimpleBar>
            </div >
            <div className="left-bar-overlay"></div>
        </div >

    )
}

export default CallWebServiceModal