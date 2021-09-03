import React, { Component } from "react";
import AceEditor from 'react-ace';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Tagify } from '../../../components/InputComponent';
import JSONInput from 'react-json-editor-ajrm'
import {
    Row,
    Col,
    Card,
    Container,
    CardBody,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    CardHeader,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Collapse
} from 'reactstrap';
import PageActions from './PageActions';
import { GetTenantName } from '../../../utils/helperFunctions';
import CustomToggle from '../../../components/CustomToggle';
import axios from '../../../utils/axiosService';
import auth from "../../../actions/auth";
import { Toast, whitelistVariable, rexExpFunction } from '../../../utils/helperFunctions';


class PageLayoutFormData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventsConfig: [],
            sharepointList: [],
            collectionList: [],
            actionsConfig: [],
            extSources: [],
            viewField: [],
            selectFilterIndex: -1,
            showVarModal: false,
            actionType: 'event',
            selectVariable: null,
            isVarError: false,
            dataSrc: {
                i: -1,
                url: "",
                type: "Web request",
                var: "",
                verified: false,
                filters: []
            },
            actionsFlow: undefined,
            actionsFlowIdx: 0,
            showVariable: false,
            showActionModal: false,
            editRow: -1,
            editName: "",
            editDesc: ""
        };
    }

    componentDidMount() {
        this.componentUpdate(this.props);
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props);
    }

    componentUpdate(props) {
        const { EventsConfig, ActionsConfig, viewField, ExtSources } = props;
        this.setState({
            eventsConfig: EventsConfig,
            actionsConfig: ActionsConfig,
            extSources: ExtSources,
            viewField: viewField
        });
    }

    handleAddActionFlow = (rowNumber) => {
        const { actionsConfig } = this.state;
        actionsConfig.push({ name: "ManualAction" + rowNumber, description: "Actions to be triggered manually", type: "manual", actions: [] });
        this.setState({ actionsConfig, editRow: rowNumber, editName: "ManualAction" + rowNumber, editDesc: "Actions to be triggered manually" })
    }

    handleInputChange(e) {
        const { name, value } = e.target;
        console.log(name, value)
        this.setState({ [name]: value });
    }

    updateDataSrc = (item, i, targetName) => (event) => {
        var { dataSrc } = this.state;
        const action = targetName ? targetName : event.target.name;
        console.log("Event Name for item..: ", action, item, i);
        if (item.type == "Sharepoint") {
            this.onloadData('GetShareConnectionList', 'sharepointList');
        } else if (["Collection", "Object"].includes(item.type)) {
            this.onloadData('GetCollectionList', 'collectionList');
        }

        switch (action) {
            case "Add":
                dataSrc = { "i": -1, "url": "", "var": "", "type": "Web request", "connId": "", "defaultValue": "", "filters": [] };
                this.setState({ dataSrc, dataSrcModal: true });
                break;
            case "Edit":
                this.setState({ dataSrc: JSON.parse(JSON.stringify({ "i": i, "url": item.url, "var": item.var, "type": item.type, "connId": item.connId, "defaultValue": item.defaultValue, "filters": item.filters || [] })), dataSrcModal: true });
                break;
            case "Delete":
                dataSrc = { "i": i, "url": item.url, "var": item.var, "type": item.type, "connId": item.connId, "filters": item.filters || [] };
                this.setState({ dataSrc, dataSrcModal: true });
            default:
        }
    }

    onloadData = async (apiName, stateName) => {
        try {
            let Lists = await axios.apis('GET', `/api/` + apiName + "?appId=" + this.props.AppId, auth.headers)
            if (stateName == "sharepointList") {
                this.setState({ [stateName]: Lists })
            } else if (Lists.status) {
                this.setState({ [stateName]: Lists.data })
            }

        } catch (err) {
            console.log(err.message)
        }
    }

    handleChange = (e) => {
        let { dataSrc, isVarError } = this.state;
        isVarError = false;

        console.log(e.target.validity.patternMismatch);

        if (e.target.validity.patternMismatch) {
            isVarError = true;
        }

        dataSrc[e.target.id] = e.target.value;
        if (e.target.id == "type" && e.target.value == "Sharepoint") {
            this.onloadData('GetShareConnectionList', 'sharepointList');
        } else if (e.target.id == "type" && ["Object", "Collection"].includes(e.target.value)) {
            this.onloadData('GetCollectionList', 'collectionList');
        }
        this.setState({ dataSrc, isVarError })
    }

    onChangeDefault = (defaultValue) => {
        try {
            let dataSrc = this.state.dataSrc;
            dataSrc["defaultValue"] = defaultValue;
            this.setState({ dataSrc: dataSrc })
        } catch (err) {
            console.log(err);
        }
    }

    handleAddUpdateDataSrc = (event) => {
        var { extSources, dataSrc } = this.state;
        var action = (dataSrc.i == -1) ? "Add" : (event.target.name == "Delete") ? "Delete" : "Update";

        switch (action) {
            case "Add":
                if (!extSources.find(x => x.var.toLowerCase() == dataSrc.var.toLowerCase())) {
                    extSources.push({
                        url: dataSrc.url,
                        var: dataSrc.var,
                        verified: dataSrc.verified,
                        type: dataSrc.type,
                        filters: dataSrc.filters || [],
                        connId: dataSrc.type != "Web request" ? dataSrc.connId : "",
                        tenant: GetTenantName(),
                        defaultValue: dataSrc.defaultValue,
                        options: JSON.stringify(this.getDataModal())
                    });
                    this.setState({ dataSrc, dataSrcModal: false });
                    this.props.saveActionsConfig(extSources, 'variable');
                } else {
                    Toast("Variable is already exist.", 'error')
                }
                break;
            case "Delete":
                extSources.splice(dataSrc.i, 1);
                this.setState({ dataSrc, dataSrcModal: false })
                this.props.saveActionsConfig(extSources, 'variable');
                break;
            default:
                extSources.splice(dataSrc.i, 1, {
                    url: dataSrc.url,
                    var: dataSrc.var,
                    verified: dataSrc.verified,
                    type: dataSrc.type,
                    filters: dataSrc.filters || [],
                    connId: dataSrc.type != "Web request" ? dataSrc.connId : "",
                    tenant: GetTenantName(),
                    defaultValue: dataSrc.defaultValue,
                    options: JSON.stringify(this.getDataModal())
                });
                this.setState({ dataSrc, dataSrcModal: false });
                this.props.saveActionsConfig(extSources, 'variable');
                break;
        }
    }


    handleVerifyDataSrc = (event) => {
        var that = this;
        var { dataSrc } = this.state;

        var reqData = {
            url: dataSrc.url,
            method: 'GET',
            connId: dataSrc.connId,
            dataSrcType: dataSrc.type,
            tenant: GetTenantName()
        }

        axios.apis('POST', `/api/webrequest`, reqData)
            .then(res => {
                if (res.statusCode == 200) {
                    dataSrc.verified = true;
                    dataSrc['statusCode'] = res.statusCode;
                    that.setState({ dataSrc, jsonData: JSON.stringify(res, null, 2) });
                } else {
                    dataSrc.verified = true;
                    dataSrc['statusCode'] = 201;
                    that.setState({ dataSrc, jsonData: JSON.stringify(res, null, 2) });
                }
            }).catch(e => {
                console.error(e)
                dataSrc.verified = true;
                dataSrc['statusCode'] = 201;
                that.setState({ dataSrc, jsonData: JSON.stringify({ error: e.message }, null, 2) });
            });
    }

    getDataModal = () => {
        const type = this.state.dataSrc["type"];
        let data = [];
        if (["Collection", "Object"].includes(type) && this.state.dataSrc["connId"] != "") {
            const collectionData = this.state.collectionList.find(x => x.id == this.state.dataSrc["connId"])
            if (collectionData) {
                data = collectionData.viewTables;
                if (collectionData.viewTables && collectionData.viewTables.length != 0) {
                    var temp = collectionData.viewTables.filter(x => x.visible);
                    var columns = [];
                    columns.push({
                        "dataField": 'documentId',
                        "text": 'documentId',
                        "sort": true
                    });
                    temp.forEach(element => {
                        columns.push({
                            "dataField": element.key,
                            "text": element.title,
                            "sort": true
                        });
                    });
                    data = { columns: columns }
                }
            }
        }
        return data;
    }

    onAddFilter = () => {
        const { dataSrc } = this.state;
        let filter = dataSrc.filters || [];
        filter.push({ field: "", operator: "", value: "" });
        console.log(filter);
        this.setState({ dataSrc: { ...dataSrc, filters: filter } })
    }

    onDeleteFilter = () => {
        const { dataSrc } = this.state;
        let filter = dataSrc.filters || [];
        filter.pop({ field: "", operator: "", value: "" });
        this.setState({ dataSrc: { ...dataSrc, filters: filter } })
    }

    handleChangefilters = (e, i) => {
        const { dataSrc } = this.state;
        dataSrc.filters[i][e.target.name] = e.target.value;
        let filter = dataSrc.filters;
        this.setState({ dataSrc: { ...dataSrc, filters: filter } });
    }

    onLoadVariables = (e, i) => {
        this.setState({ showVarModal: true, selectFilterIndex: i })
    }

    selectVariable = () => {
        const { dataSrc, selectFilterIndex, selectVariable } = this.state;
        dataSrc.filters[selectFilterIndex]["value"] = "{{" + selectVariable.var + "}}";
        let filter = dataSrc.filters;
        this.setState({ dataSrc: { ...dataSrc, filters: filter }, selectVariable: null, showVarModal: false });
    }

    render() {

        const {
            showVariable,
            jsonData,
            sharepointList,
            eventsConfig,
            extSources,
            actionsConfig,
            viewField,
            actionsFlow,
            actionsFlowIdx,
            actionType,
            showActionModal,
            editDesc,
            editName,
            editRow,
            dataSrcModal,
            selectVariable,
            collectionList,
            isVarError
        } = this.state;

        const user = this.props.user
        const that = this;
        const actionsLength = actionsConfig && actionsConfig.length;
        const connectionUrl = (this.state.dataSrc["type"] == "Sharepoint" || this.state.dataSrc["type"] == "Web request");
        const dataModal = this.getDataModal();

        const system_variables = [{
            "title": 'First Name',
            'ejs': `{{form.user.firstname}}`,
            'js': `form.user.firstname`
        }, {
            "title": 'Last Name',
            'ejs': `{{form.user.lastname}}`,
            'js': `form.user.lastname`
        }, {
            "title": 'Gender',
            'ejs': `{{form.user.gender}}`,
            'js': `form.user.gender`
        }, {
            "title": 'Role',
            'ejs': `{{form.user.level}}`,
            'js': `form.user.level`
        }, {
            "title": 'Email Address',
            'ejs': `{{form.user.email}}`,
            'js': `form.user.email`
        }, {
            "title": 'Profile Img',
            'ejs': `{{form.user.profile_img}}`,
            'js': `form.user.profile_img`
        }, {
            "title": 'Mobile',
            'ejs': `{{form.user.mobile}}`,
            'js': `form.user.mobile`
        }, {
            "title": 'Account Block',
            'ejs': `{{form.user.is_locked}}`,
            'js': `form.user.is_locked`
        }, {
            "title": 'Address',
            'ejs': `{{form.user.address}}`,
            'js': `form.user.address`
        }, {
            "title": 'city',
            'ejs': `{{form.user.city}}`,
            'js': `form.user.city`
        }, {
            "title": 'country',
            'ejs': `{{form.user.country}}`,
            'js': `form.user.country`
        },{
            "title": 'Notify Email',
            'ejs': `{{form.user.is_notify_email}}`,
            'js': `form.user.is_notify_email`
        },{
            "title": 'Notify Mobile',
            'ejs': `{{form.user.is_notify_mobile}}`,
            'js': `form.user.is_notify_mobile`
        },{
            "title": 'Notify Whatsapp',
            'ejs': `{{form.user.is_notify_whatsapp}}`,
            'js': `form.user.is_notify_whatsapp`
        }];

        return (
            <React.Fragment>
                <Modal className="modal-lg" isOpen={showActionModal} toggle={() => that.setState({ showActionModal: !showActionModal })} >
                    <ModalHeader toggle={() => that.setState({ showActionModal: !showActionModal })} className="modal-header"><h5>Edit actions</h5></ModalHeader>
                    <ModalBody>
                        <PageActions
                            user={user}
                            AppId={this.props.AppId}
                            extvariables={extSources}
                            eventsConfig={eventsConfig}
                            actionsConfig={actionsConfig}
                            pageLayoutFormSchema={viewField}
                            actionsFlow={actionsFlow}
                            actionsFlowIdx={actionsFlowIdx}
                            actionType={actionType}
                            saveActionsConfig={this.props.saveActionsConfig} />
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => that.setState({ showActionModal: !showActionModal })}>Close</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => that.setState({ showActionModal: !showActionModal })}>Save changes</button>
                    </ModalFooter>
                </Modal>

                {/* Show System Variables */}
                <Modal className="modal-lg SysVarModal" isOpen={showVariable} toggle={() => that.setState({ showVariable: false })} >
                    <ModalHeader toggle={() => that.setState({ showVariable: false })} className="modal-header">System Variables</ModalHeader>
                    <ModalBody>
                        <table>
                            <thead>
                                <tr className="table100-head">
                                    <th className="column2">Name</th>
                                    <th className="column3">Embedded Js</th>
                                    <th className="column4">JavaScript</th>
                                </tr>
                            </thead>
                            <tbody>
                                {system_variables.map(x =>
                                    <tr>
                                        <td className="column2">{x.title}</td>
                                        <td className="column3">{x.ejs}</td>
                                        <td className="column4">{x.js}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => that.setState({ showVariable: false })}>Close</button>
                    </ModalFooter>
                </Modal>

                {/* Open variable data Modal */}
                {
                    this.state.dataSrcModal &&
                    <Modal className="modal-lg modal-form" isOpen={this.state.dataSrcModal} toggle={() => this.setState({ dataSrcModal: false })}>
                        <form onSubmit={this.handleAddUpdateDataSrc}>
                            <ModalHeader toggle={() => this.setState({ dataSrcModal: false })}>Add/Edit Data</ModalHeader>
                            <ModalBody>
                                <Container>
                                    <Row>
                                        <Col md='3'>Type
                                            <span className="required-star">*</span>
                                        </Col>
                                        <Col md='9'>
                                            <div className="form-group">
                                                <select
                                                    className="form-control form-select-modified form-select"
                                                    value={this.state.dataSrc["type"]}
                                                    id="type"
                                                    onChange={this.handleChange}>
                                                    <option key='1' value='Web request'>Web Request</option>
                                                    <option key='2' value='Sharepoint'>Sharepoint</option>
                                                    <option key='3' value='Json'>Json Data</option>
                                                    <option key='4' value='Collection'>Collection</option>
                                                    <option key='5' value='Input Variable'>Input</option>
                                                    <option key='6' value='Object'>Object</option>
                                                    <option key='7' value='Text'>Text</option>
                                                    <option key='8' value='TextExpression'>Text Expression</option>
                                                    <option key='9' value='Number'>Number</option>
                                                    <option key='10' value='NumberExpression'>Number Expression</option>
                                                    <option key='10' value='CheckboxExpression'>Checkbox Expression</option>
                                                    <option key='11' value='DatetimeExpression'>Datetime Expression</option>
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>

                                    {this.state.dataSrc["type"] == "Text" &&
                                        <Row>
                                            <Col md='3'>Text <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9' className="mb-3">
                                                <textarea
                                                    className="form-control"
                                                    value={this.state.dataSrc["defaultValue"]}
                                                    id="defaultValue"
                                                    onChange={this.handleChange} />
                                            </Col>
                                        </Row>
                                    }

                                    {(['TextExpression', 'NumberExpression', 'CheckboxExpression', 'DatetimeExpression'].includes(this.state.dataSrc["type"])) &&
                                        <Row>
                                            <Col md='3'>{this.state.dataSrc["type"]}<span className="required-star">*</span>
                                            </Col>
                                            <Col md='9' className="mb-3">
                                                <Tagify
                                                    id="defaultValue"
                                                    name="defaultValue"
                                                    value={this.state.dataSrc["defaultValue"] ? this.state.dataSrc["defaultValue"] : ""}
                                                    onChange={(e) => this.setState({ dataSrc: { ...this.state.dataSrc, defaultValue: e } })}
                                                    whitelist={whitelistVariable(JSON.parse(JSON.stringify(extSources)))} />
                                            </Col>
                                        </Row>
                                    }

                                    {this.state.dataSrc["type"] == "Number" &&
                                        <Row>
                                            <Col md='3'>Text <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9' className="mb-3">
                                                <input
                                                    type="number"
                                                    id="defaultValue"
                                                    name="defaultValue"
                                                    className="form-control"
                                                    value={this.state.dataSrc["defaultValue"]}
                                                    onChange={this.handleChange} />
                                            </Col>
                                        </Row>
                                    }

                                    {this.state.dataSrc["type"] == "Sharepoint" && sharepointList.length != 0 &&
                                        <Row>
                                            <Col md='3'>Connection
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <div className="form-group">
                                                    <select className="form-control form-select-modified" id="connId" name="default_path" onChange={this.handleChange} value={this.state.dataSrc["connId"]}>
                                                        <option >Select..</option>
                                                        {sharepointList.map((x, i) => <option key={i} value={x.value}>{x.name}</option>)}
                                                    </select>
                                                </div>
                                            </Col>
                                        </Row>
                                    }

                                    {((['Object', "Collection"].includes(this.state.dataSrc["type"])) && collectionList.length != 0) &&
                                        <Row>
                                            <Col md='3'>Collection
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <div className="form-group">
                                                    <select className="form-control form-select-modified" id="connId" name="default_path" onChange={this.handleChange} value={this.state.dataSrc["connId"]}>
                                                        <option >Select..</option>
                                                        {collectionList.map((x, i) => <option key={i} value={x.id}>{x.name}</option>)}
                                                    </select>
                                                </div>
                                            </Col>
                                        </Row>
                                    }

                                    {(this.state.dataSrc["type"] == "Input Variable") &&
                                        <Row>
                                            <Col md='3'>
                                                Query String
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={this.state.dataSrc["defaultValue"]}
                                                        id="defaultValue"
                                                        rows="4"
                                                        onChange={this.handleChange} />
                                                </div>
                                            </Col>
                                        </Row>
                                    }

                                    {(['Object', "Collection"].includes(this.state.dataSrc["type"]) && this.state.dataSrc["connId"]) &&
                                        <Row>
                                            <Col md='3'>object schema
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <AceEditor
                                                    name="data"
                                                    mode="json"
                                                    width="100%"
                                                    height="250px"
                                                    readOnly={true}
                                                    value={JSON.stringify(dataModal, null, 2)}
                                                    setOptions={{
                                                        enableBasicAutocompletion: true,
                                                        enableLiveAutocompletion: true,
                                                        enableSnippets: true
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    }

                                    {(['Object', "Collection"].includes(this.state.dataSrc["type"]) && dataModal.columns && this.state.dataSrc["connId"]) &&
                                        <Row className="mt-3 mb-3">
                                            <Col md='3' >filters
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <Row className="mt-3 mb-3">
                                                    <Col md='3'>
                                                        <button className="btn btn-sm btn-primary" type="button" onClick={this.onAddFilter}> Add</button>
                                                    </Col>
                                                </Row>
                                                {(this.state.dataSrc["filters"] && this.state.dataSrc["filters"].length != 0) && this.state.dataSrc["filters"].map((x, i) => {
                                                    return (
                                                        <Row className="mt-3 mb-3" key={i}>
                                                            <Col md='3' className="border">
                                                                <div className="form-group mt-2">
                                                                    <select className="form-control form-select-modified" id="field" name="field" onChange={(e) => that.handleChangefilters(e, i)} value={x.field}>
                                                                        <option >Select Field..</option>
                                                                        {dataModal.columns.map((x, k) => <option key={k} value={x.dataField}>{x.text}</option>)}
                                                                    </select>
                                                                </div>
                                                            </Col>
                                                            <Col md='3' className="border">
                                                                <div className="form-group mt-2">
                                                                    <select className="form-control form-select-modified" id="operator" name="operator" onChange={(e) => this.handleChangefilters(e, i)} value={x.operator}>
                                                                        <option >Operator</option>
                                                                        <option value="equalTo">equalTo</option>
                                                                    </select>
                                                                </div>
                                                            </Col>
                                                            <Col md='5' className="border">
                                                                <div className="form-group mt-2 position-relative">
                                                                    <input
                                                                        onChange={(e) => this.handleChangefilters(e, i)}
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={x.value}
                                                                        id="value"
                                                                        name="value"
                                                                        rows="4" />
                                                                    <i class="fa fa-plus" onClick={(e) => this.onLoadVariables(e, i)} style={{ "position": "absolute", "top": "12px", "right": "10px", "cursor": "pointer" }} aria-hidden="true"></i>
                                                                </div>
                                                            </Col>
                                                            <Col md='1'>
                                                                <div className="form-group mt-3 position-relative">
                                                                    <Button color='danger' className='btn btn-sm rounded-pill' onClick={this.onDeleteFilter}><i class="fa fa-trash" aria-hidden="true"></i></Button>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    )
                                                })}
                                            </Col>
                                        </Row>
                                    }
                                    <Row>
                                        <Col md='3'>
                                            Save as variable<span className="required-star">*</span>
                                        </Col>
                                        <Col md='9'>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={this.state.dataSrc["var"]}
                                                    id="var"
                                                    pattern="[a-z]+"
                                                    maxlength="50"
                                                    required-star={true}
                                                    onChange={this.handleChange}
                                                />
                                                {isVarError && <span className="required-star">Please enter only small alphabet.</span>}
                                            </div>
                                        </Col>
                                    </Row>

                                    {(this.state.dataSrc["type"] == "Sharepoint" || this.state.dataSrc["type"] == "Web request") &&
                                        <Row>
                                            <Col md='3'>
                                                URL
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <div className="form-group">
                                                    <textarea
                                                        className="form-control"
                                                        value={this.state.dataSrc["url"]}
                                                        id="url"
                                                        rows="4"
                                                        onChange={this.handleChange} />
                                                </div>
                                            </Col>

                                        </Row>
                                    }

                                    {((this.state.dataSrc["type"] == "Json")) &&
                                        <Row>
                                            <Col md='3'>JSON
                                                <span className="required-star">*</span>
                                            </Col>
                                            <Col md='9'>
                                                <JSONInput
                                                    id='jsonData'
                                                    placeholder={typeof this.state.dataSrc["defaultValue"] == 'string' ? {} : this.state.dataSrc["defaultValue"]}
                                                    onChange={(e) => !e.error && this.onChangeDefault(e.jsObject)}
                                                    colors={{ string: "#DAA520" }}
                                                    height='300px'
                                                    width='100%' />

                                            </Col>
                                        </Row>
                                    }

                                    {this.state.dataSrc.verified &&
                                        <Row>
                                            {this.state.dataSrc.statusCode == 200 &&
                                                <Col className="text-success text-center" md="12" style={{ fontSize: "25px", verticalAlign: "middle" }}><span>Connection verified </span><i className="material-icons"  >check</i></Col>
                                            }

                                            {this.state.dataSrc.statusCode != 200 &&
                                                <Col className="text-danger text-center" md="12" style={{ fontSize: "25px", verticalAlign: "middle" }}><span>Connection verify failed</span><i className="material-icons"  >check</i></Col>
                                            }

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
                                </Container>
                            </ModalBody>
                            <ModalFooter>
                                <Container>
                                    <Row>
                                        <Col md='4' className='text-left'>
                                            {(this.state.dataSrc.i !== -1) && <Button color="danger" className='custom-btn' name="Delete" onClick={this.handleAddUpdateDataSrc}>Delete</Button>}
                                        </Col>
                                        <Col md='8' className='text-right'>
                                            <Button color="secondary" className='custom-btn mr-2' onClick={() => this.setState({ dataSrcModal: false })}>Close</Button>
                                            {connectionUrl && <Button color="primary" className='custom-btn mr-2' type="submit" name="Verify" onClick={this.handleVerifyDataSrc}>Verify</Button>}
                                            {connectionUrl && <Button color="primary" disabled={!(this.state.dataSrc.statusCode == 200)} className='custom-btn  mr-2' type="submit" name="Submit">Submit</Button>}
                                            {!connectionUrl && <Button color="primary" className='custom-btn  mr-2' type="submit" name="Submit">Submit</Button>}
                                        </Col>
                                    </Row>
                                </Container>
                            </ModalFooter>
                        </form>
                    </Modal>
                }

                {/* Select Variables */}
                <Modal className="modal-sm" isOpen={this.state.showVarModal} toggle={() => this.setState({ showVarModal: false })}>
                    <ModalHeader toggle={() => this.setState({ showVarModal: false })}>Select Insert variable</ModalHeader>
                    <ModalBody>
                        <Container>
                            <ListGroup className="pointer">
                                {extSources && extSources.filter(x => x.type == "Input Variable").map((item, index) => (
                                    <ListGroupItem onClick={(e) => this.setState({ selectVariable: item })}>{"{{" + item.var + "}}"} {(selectVariable && item.var == selectVariable.var) && <i className="fa fa-check-circle float-right" aria-hidden="true" style={{ 'color': '#34c38f' }}></i>} </ListGroupItem>
                                ))}
                            </ListGroup>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Container>
                            <Row>
                                <Button color="secondary" className='custom-btn mr-2' onClick={() => this.setState({ showVarModal: false, selectVariable: null })}>Close</Button>
                                <Button color="secondary" disabled={!selectVariable} className='custom-btn mr-2' onClick={this.selectVariable}>Select</Button>
                            </Row>
                        </Container>
                    </ModalFooter>
                </Modal>

                <div>
                    <Row>
                        <Col lg="12" className="py-3">
                            <Card className="card border shadow-none rounded-lg">
                                <CardHeader className="card-header border-bottom">
                                    <div className="d-flex justify-content-end">
                                        <div className="mr-auto pt-2">Variables</div>
                                        <div className="p-0">
                                            <button onClick={() => this.setState({ dataSrcModal: true, dataSrc: { i: -1, url: "", type: "Web request", var: "", verified: false, "filters": [] } })}
                                                className="btn btn-sm btn-primary rounded-pill px-3">
                                                Add
                                            </button>
                                        </div>
                                        <div className="ml-3">
                                            {/* <i className={col1 ? "fa fa-angle-up fa-2x" : "fa fa-angle-down fa-2x"} aria-hidden="true" onClick={() => { this.setState({ col1: !this.state.col1 }) }}></i> */}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="px-3 py-2">
                                    {extSources && extSources.map((item, index) =>
                                        <Row key={index}>
                                            <Col sm="9">
                                                <p><strong>{item.var}</strong><br />({item.type})</p>
                                            </Col>
                                            <Col style={{ "alignItems": "center", "display": "flex" }}>
                                                {(item.var != 'user') ?
                                                    <div className="ml-5 mr-0 pointer"><span onClick={this.updateDataSrc(item, index, 'Edit')}><i class="fa fa-cog" aria-hidden="true"></i></span></div>
                                                    // Use The dropdown In future
                                                    // <UncontrolledDropdown className="is-app-toggle CustomToggle ml-5 mr-0" setActiveFromChild>
                                                    //     <DropdownToggle tag={configToggle}  onClick={this.updateDataSrc(item, index, 'Edit')}/>
                                                    //     <DropdownMenu size="sm" title="" right>
                                                    //         <DropdownItem name="Edit" className="d-flex" onClick={this.updateDataSrc(item, index, 'Edit')}><div className="d-flex" ><i className="pointer text-success material-icons mr-2" data-toggle="tooltip" title="Edit">call_missed_outgoing</i>Edit</div></DropdownItem>
                                                    //         <DropdownItem name="Delete" className="d-flex" onClick={this.updateDataSrc(item, index, 'Delete')} ><div className="d-flex" ><i className="pointer text-danger material-icons mr-2" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</div></DropdownItem>
                                                    //     </DropdownMenu>
                                                    // </UncontrolledDropdown>
                                                    :
                                                    <div className="ml-5 mr-0 pointer"><span onClick={() => this.setState({ showVariable: true })} className="material-icons">help</span></div>
                                                }
                                            </Col>
                                        </Row>
                                    )}
                                    {!extSources.length &&
                                        <p>There are no variables</p>

                                    }
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg="12" className="py-3">
                            <Card className="card border shadow-none rounded-lg">
                                <CardHeader className="card-header border-bottom">
                                    <div className="d-flex justify-content-end">
                                        <div className="mr-auto pt-2">Page Events</div>
                                        <div className="p-0">
                                            {/* <button className="btn btn-sm btn-primary"> Add </button> */}
                                        </div>
                                        <div className="ml-3">
                                            {/* <i className={col2 ? "fa fa-angle-up fa-2x" : "fa fa-angle-down fa-2x"} aria-hidden="true" onClick={() => { this.setState({ col2: !this.state.col2 }) }}></i> */}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Collapse isOpen={true} className="px-3 py-2">
                                    <Row>
                                        <Col sm="8" className='d-flex align-content-center flex-wrap'>
                                            <span><strong>Page being loaded</strong></span>
                                            <span>Actions to be triggered when page being loaded.</span>
                                        </Col>
                                        <Col style={{ "alignItems": "center", "display": "flex" }}>
                                            <Button
                                                onClick={() => that.setState({
                                                    actionType: 'event',
                                                    actionsFlow: (actionsConfig.length > 0) ? actionsConfig[0] : undefined,
                                                    actionsFlowIdx: 0,
                                                    showActionModal: !showActionModal
                                                })}
                                                variant="secondary"
                                                size="sm"
                                                className="btn btn-sm btn-light border rounded-pill shadow-sm ml-4 px-3">
                                                Design
                                            </Button>
                                        </Col>
                                    </Row>
                                </Collapse>
                            </Card>
                        </Col>

                        <Col lg="12" className="py-3">
                            <Card className="card shadow-none border">
                                <CardHeader className="card-header ">
                                    <div className="d-flex justify-content-end">
                                        <div className="mr-auto pt-2">Actions</div>
                                        <div className="p-0">
                                            <button
                                                disabled={editRow > -1}
                                                onClick={() => that.handleAddActionFlow(actionsLength)}
                                                className="btn btn-sm btn-primary rounded-pill px-3">
                                                Add
                                            </button>
                                        </div>
                                        <div className="has-row ml-3">
                                            {/* <i className={col3 ? "fa fa-angle-up fa-2x" : "fa fa-angle-down fa-2x"} aria-hidden="true" onClick={() => { this.setState({ col3: !this.state.col3 }) }} ></i> */}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Collapse isOpen={true} className="px-3 py-2">
                                    {actionsConfig && actionsConfig.map((e, i) => {
                                        return editRow == i ? (
                                            <Row key={i} className="">
                                                <Col sm="9">
                                                    <p>
                                                        <input
                                                            style={{ width: '100%' }}
                                                            className="form-control"
                                                            id="editName"
                                                            type="text"
                                                            value={editName}
                                                            maxLength="256"
                                                            name="editName"
                                                            onChange={event => this.handleInputChange(event)} />    </p>
                                                    <p>
                                                        <input
                                                            style={{ width: '100%' }}
                                                            className="form-control"
                                                            id="editDesc"
                                                            type="text"
                                                            value={editDesc}
                                                            maxLength="256"
                                                            name="editDesc"
                                                            onChange={event => this.handleInputChange(event)} /></p>
                                                </Col>
                                                <Col style={{ "alignItems": "center", "display": "flex" }}>
                                                    <UncontrolledDropdown className="is-app-toggle CustomToggle ml-5" setActiveFromChild>
                                                        <DropdownToggle tag={CustomToggle} />
                                                        <DropdownMenu size="sm" title="" right>
                                                            <DropdownItem className="d-flex" onClick={() => { e.name = editName; e.description = editDesc; that.setState({ actionsConfig, editRow: -1 }) }}><span className="d-flex"><i className="fa fa-floppy-o fa-2x text-success mr-2" aria-hidden="true"></i>Save</span></DropdownItem>
                                                            <DropdownItem className="d-flex" onClick={() => { that.setState({ editRow: -1 }) }}><span className="d-flex"><i className="fa fa-ban fa-2x text-danger mr-2" data-toggle="tooltip" title="Cancel"></i>Cancel</span></DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>

                                                </Col>
                                            </Row>
                                        ) : (
                                            <Row key={i} className="">
                                                <Col sm="9" className='d-flex align-content-around flex-wrap mb-2'>
                                                    <span className=''><b>{e.name}</b></span>
                                                    <span>{e.description}</span>
                                                </Col>
                                                <Col style={{ "alignItems": "center", "display": "flex" }}>
                                                    <UncontrolledDropdown className="is-app-toggle CustomToggle ml-5" setActiveFromChild>
                                                        <DropdownToggle tag={CustomToggle} />
                                                        <DropdownMenu size="sm" title="" right>
                                                            <DropdownItem className="d-flex" onClick={() => {
                                                                that.setState({ editName: e.name, editDesc: e.description, editRow: i })
                                                            }}><span className="d-flex"><i className="pointer text-danger material-icons mr-2" data-toggle="tooltip" title="View">call_missed_outgoing</i>Edit</span></DropdownItem>
                                                            <DropdownItem className="d-flex" onClick={() => that.setState({
                                                                actionType: 'manual',
                                                                actionsFlow: actionsConfig[i],
                                                                actionsFlowIdx: i,
                                                                showActionModal: !showActionModal
                                                            })}>
                                                                <span className="d-flex">
                                                                    <i className="pointer text-success material-icons mr-2" data-toggle="tooltip" title="View">camera_front</i>Design</span></DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </Col>
                                            </Row>
                                        )
                                    })
                                    }
                                    {!actionsConfig.length &&
                                        <p>There are no actions</p>
                                    }
                                </Collapse>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </React.Fragment >
        )
    }
}

export default PageLayoutFormData;


