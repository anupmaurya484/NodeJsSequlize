import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosService';
import { Tagify } from '../../components/InputComponent';
import { GetTenantName, isValidJson, whitelistVariable } from '../../utils/helperFunctions';
import { Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Container, Button } from 'reactstrap';
import auth from "../../actions/auth";
import JSONInput from 'react-json-editor-ajrm';
import SimpleBar from "simplebar-react";
import AceEditor from 'react-ace';

import API from '../../config';

function CollectionOperationModal({ action, show, toggle, handleActionUpdate, onClose, i, AppId, variablesLists }) {
    const [reqBody, setReqBody] = useState(action ? (action.reqBody || "") : "");
    const [variable, setVariable] = useState(action ? (action.variable || "") : "");
    const [requestType, setRequestType] = useState(action ? (action.requestType || "1") : "1");
    const [isRequestBody, setIsRequestBody] = useState(action ? (action.isRequestBody || false) : false);
    const [isRequestBodyAssociated, setIsRequestBodyAssociated] = useState(action ? (action.isRequestBodyAssociated || false) : false);
    const [collectionId, setCollectionId] = useState(action ? (action.collectionId || "") : "");
    const [collectionLists, setcollectionLists] = useState([]);
    const [filters, setFilters] = useState(action ? (action.filters || "") : "");
    const [fetchRecordField, setFetchRecordFiled] = useState(action ? (action.fetchRecordField || "") : "");
    const [fetchRecordValue, setFetchRecordValue] = useState(action ? (action.fetchRecordValue || "") : "");



    useEffect(() => {
        if (action) {
            setReqBody(('reqBody' in action) ? (action.reqBody || "") : "");
            setVariable(('variable' in action) ? (action.variable || "") : "");
            setRequestType(('requestType' in action) ? (action.requestType || "1") : "1");
            setIsRequestBody(('isRequestBody' in action) ? (action.isRequestBody || false) : false);
            setIsRequestBodyAssociated(('isRequestBodyAssociated' in action) ? (action.isRequestBodyAssociated || false) : false);
            setCollectionId(('collectionId' in action) ? (action.collectionId || "") : "");
            setFilters(('filters' in action) ? (action.filters || "") : "");
            setFetchRecordFiled(('fetchRecordField' in action) ? (action.fetchRecordField || "") : "");
            setFetchRecordValue(('fetchRecordValue' in action) ? (action.fetchRecordValue || "") : "");
        }

        //Load Collection
        onloadData();

        return () => {
            console.log('unmounting...')
        }
    }, [action])



    function handleSave(e) {
        action.reqBody = reqBody
        action.variable = variable
        action.requestType = requestType
        action.isRequestBody = isRequestBody
        action.isRequestBodyAssociated = isRequestBodyAssociated
        action.collectionId = collectionId
        action.filters = filters
        action.fetchRecordField = fetchRecordField
        action.fetchRecordValue = fetchRecordValue
        action.type = "collection_operation"
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
            case 'variable':
                setVariable(e.target.value)
                break;
            case 'collectionId':
                setCollectionId(e.target.value)
                break;
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

    function handlChangeAceEditor(value, type) {
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

    function handleChangefilters(e, i, name) {
        let filter = filters != "" ? JSON.parse(filters) : [];
        filter[i][name || e.target.name] = name ? e : e.target.value;
        setFilters(JSON.stringify(filter))
    }

    function onDeleteFilter(i) {
        let filter = filters != "" ? JSON.parse(filters) : [];
        filter.splice(i, 1);
        setFilters(JSON.stringify(filter))
    }

    function onAddFilter() {
        let filter = filters != "" ? JSON.parse(filters) : [];
        filter.push({ field: "", operator: "", value: "" });
        setFilters(JSON.stringify(filter))
    }

    console.log(collectionLists.find(y => y.id == collectionId));

    if (!show) { return null; }

    const filtersData = filters != "" ? JSON.parse(filters) : []
    return (
        < div className="call-web-service-side-menu-setting">
            <div className="side-menu right-bar overflow">
                <SimpleBar style={{ 'max-width': '100%', 'overflowX': 'hidden', 'overflowY': 'hidden' }}>
                    <div data-simplebar className="h-100">
                        <div className="mb-2 d-flex justify-content-between" style={{ borderBottom: "1px solid #dcdbdb" }}>
                            <label title="Collection Setting" className='mt-2 mr-5' style={{ fontSize: "18px" }}>Collection Operation</label>
                            <div>
                                <button type="button" className="btn btn-primary btn-sm mr-2" onClick={e => handleSave(e)}>Save changes</button>
                                <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={e => { onClose(e, action.name) }} >Close</button>
                                <button type="button" className='btn btn-secondary btn-sm' onClick={e => handleDelete(e)}>Delete</button>
                            </div>
                        </div>
                        <Container>
                            <div className="d-flex form-group">
                                <div className="form-check mr-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        id="flexRadioDefault1"
                                        onClick={() => setRequestType('1')}
                                        checked={requestType == '1'}
                                    />
                                    <label className="form-check-label" for="flexRadioDefault1">
                                        Create
                                    </label>
                                </div>
                                <div className="form-check mr-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        id="flexRadioDefault2"
                                        onClick={() => setRequestType('2')}
                                        checked={requestType == '2'}
                                    />
                                    <label className="form-check-label" for="flexRadioDefault2">
                                        Read
                                    </label>
                                </div>
                                <div className="form-check mr-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        id="flexRadioDefault2"
                                        onClick={() => setRequestType('3')}
                                        checked={requestType == '3'}
                                    />
                                    <label className="form-check-label" for="flexRadioDefault2">
                                        Update
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        id="flexRadioDefault2"
                                        onClick={() => setRequestType('4')}
                                        checked={requestType == '4'}
                                    />
                                    <label className="form-check-label" for="flexRadioDefault2">
                                        Delete
                                    </label>
                                </div>
                            </div>

                            <div className="w-100 form-group">
                                <label>
                                    <strong>Select Collections</strong>
                                    <span className="required-star">*</span>
                                </label>
                                <select
                                    className="browser-default form-select-modified custom-select"
                                    id="collectionId"
                                    value={collectionId}
                                    onChange={handleChange}
                                    required>
                                    <option >Select..</option>
                                    {collectionLists.map(item =>
                                        <option value={item.id}>{item.name}</option>
                                    )}
                                </select>
                            </div>

                            {requestType == 2 &&
                                <div className="w-100 form-group">
                                    <label>
                                        <strong> Collections Filters</strong>
                                        <span className="required-star">*</span>
                                    </label>
                                    {collectionLists.find(y => y.id == collectionId) && filtersData.map((x, i) => {
                                        return (
                                            <Row className="ml-1" key={i}>
                                                <Col md='3' className="border">
                                                    <div className="form-group mt-2">
                                                        <select className="form-control form-select-modified" id="field" name="field" onChange={(e) => handleChangefilters(e, i)} value={x.field}>
                                                            <option >Select Field..</option>
                                                            <option key="documentId">documentId</option>
                                                            {collectionLists.find(y => y.id == collectionId).viewTables.map((x, k) => <option key={k} value={x.dataField}>{x.key}</option>)}
                                                        </select>
                                                    </div>
                                                </Col>
                                                <Col md='3' className="border">
                                                    <div className="form-group mt-2">
                                                        <select className="form-control form-select-modified" id="operator" name="operator" onChange={(e) => handleChangefilters(e, i)} value={x.operator}>
                                                            <option >Operator</option>
                                                            <option value="and">and</option>
                                                            <option value="or">or</option>

                                                        </select>
                                                    </div>
                                                </Col>
                                                <Col md='5' className="border pt-2">
                                                    <Tagify
                                                        textbox={true}
                                                        id={"value" + i}
                                                        name={"value" + i}
                                                        value={x.value ? x.value : ""}
                                                        onChange={(e) => handleChangefilters(e, i, 'value')}
                                                        whitelist={whitelistVariable(JSON.parse(JSON.stringify(variablesLists)), true)} />
                                                </Col>
                                                <Col md='1'>
                                                    <div className="form-group mt-3 position-relative">
                                                        <Button color='danger' className='btn btn-sm rounded-pill' onClick={() => onDeleteFilter(i)}><i class="fa fa-trash" aria-hidden="true"></i></Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        )
                                    })}
                                    <br />
                                    <button class="btn btn-sm btn-primary" type="button" onClick={() => onAddFilter()}> Add</button>
                                </div>
                            }

                            {["3", "4"].includes(requestType) &&
                                <div className="w-100 form-group">
                                    <label>
                                        <strong>Fetch Record </strong>
                                        <span className="required-star">*</span>
                                    </label>
                                    <Row className="ml-1">
                                        <Col md='3' className="border">
                                            <div className="form-group mt-2">
                                                <select className="form-control form-select-modified" id="field" name="field" onChange={(e) => setFetchRecordFiled(e.target.value)} value={fetchRecordField}>
                                                    <option >Select Field..</option>setFetchRecordFiled
                                                    <option key="documentId">documentId</option>
                                                    {collectionLists.find(y => y.id == collectionId) && collectionLists.find(y => y.id == collectionId).viewTables.map((x, k) => <option key={k} value={x.dataField}>{x.key}</option>)}
                                                </select>
                                            </div>
                                        </Col>
                                        <Col md='5' className="border">
                                            <div className="form-group mt-2 position-relative">
                                                <Tagify
                                                    textbox={true}
                                                    id={"fetchRecordValue"}
                                                    name={"fetchRecordValue"}
                                                    value={fetchRecordValue ? fetchRecordValue : ""}
                                                    onChange={(e) => setFetchRecordValue(e)}
                                                    whitelist={whitelistVariable(JSON.parse(JSON.stringify(variablesLists)), true)} />
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            }

                            {["1", "3"].includes(requestType) &&
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

                            {(!isRequestBodyAssociated && ["1", "3"].includes(requestType)) &&
                                <div className="form-group">
                                    <div className="mb-2" >
                                        <label><strong> Values </strong> <span className="required-star">*</span> </label>
                                    </div>
                                    <div>
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

                            <div className="form-group">
                                <label htmlFor="variable">
                                    <strong>Save response to variable</strong>
                                    <span className="required-star">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={variable}
                                    id="variable"
                                    onChange={handleChange} />
                            </div>

                        </Container>
                    </div>
                </SimpleBar>
            </div >
            <div className="left-bar-overlay"></div>
        </div >

    )
}

export default CollectionOperationModal