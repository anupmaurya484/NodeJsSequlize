import React, { Component } from "react";
import AceEditor from 'react-ace';
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    CardHeader,
    Container,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Collapse
} from 'reactstrap';
import JSONInput from 'react-json-editor-ajrm';
import { GetTenantName } from '../../../../utils/helperFunctions';
import CustomToggle from '../../../../components/CustomToggle';
import inProgressImage from '../../../../assets/images/in_progress.svg';
import CollectionAction from './CollectionAction';
import axios from '../../../../utils/axiosService';
import auth from "../../../../actions/auth";
import { Toast } from '../../../../utils/helperFunctions';
import './CollectionFormData.css';

class collectionFormData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventsConfig: [],
            sharepointList: [],
            collectionList: [],
            calenderList: [],
            actionsConfig: [],
            extSources: [],
            viewField: [],
            showVariable: false,
            actionType: 'event',
            actionsFlow: undefined,
            actionsFlowIdx: 0,
            showActionModal: false,
            dataSrcModal: false,
            dataSrc: { i: -1, url: "", type: "Web request", var: "", verified: false },
            editRow: -1,
            editName: "",
            jsonData: "",
            editDesc: "",
            col1: true,
            col2: true,
            col3: true,
            rotate: false,
        };
    }

    componentDidMount() {
        this.componentUpdate(this.props);
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props);
    }

    componentUpdate(props) {
        const { dataEventsConfig, dataActionsConfig, viewField, extSources } = props;
        let variableList = [...extSources];
        this.setState({
            eventsConfig: dataEventsConfig,
            actionsConfig: dataActionsConfig,
            extSources: variableList || [],
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


    handleChange = (e) => {
        let { dataSrc } = this.state;
        console.log(e.target.id, e.target.value)
        dataSrc[e.target.id] = e.target.value;
        if (e.target.id == "type" && e.target.value == "Sharepoint") {
            this.onloadData('GetShareConnectionList', 'sharepointList');
        } else if (e.target.id == "type" && e.target.value == "Collection") {
            this.onloadData('GetCollectionList', 'collectionList');
        } else if (e.target.id == "type" && e.target.value == "Calendar") {
            this.onloadData('GetCalendarList', 'calenderList');
        }
        this.setState({ dataSrc })
    }

    onloadData = async (apiName, stateName) => {
        try {
            let Lists = await axios.apis('GET', `/api/` + apiName, auth.headers)
            if (stateName == "sharepointList") {
                this.setState({ [stateName]: Lists })
            } else if (Lists.status) {
                this.setState({ [stateName]: Lists.data })
            }

        } catch (err) {
            console.log(err.message)
        }
    }

    updateDataSrc = (item, i, targetName) => (event) => {
        var { dataSrc } = this.state;
        const action = targetName ? targetName : event.target.name;
        console.log("Event Name for item..: ", action, item, i);
        if (item.type == "Sharepoint") {
            this.onloadData('GetShareConnectionList', 'sharepointList');
        } else if (item.type == "Collection") {
            this.onloadData('GetCollectionList', 'collectionList');
        } else if (item.type == "Calendar") {
            this.onloadData('GetCalendarList', 'calenderList');
        }
        switch (action) {
            case "Add":
                dataSrc = { "i": -1, "url": "", "var": "", "type": "Web request", "connId": "", "defaultValue": "" };
                this.setState({ dataSrc, dataSrcModal: true });
                break;
            case "Edit":
                dataSrc = { "i": i, "url": item.url, "var": item.var, "type": item.type, "connId": item.connId, "defaultValue": item.defaultValue };
                this.setState({ dataSrc, dataSrcModal: true });
                break;
            case "Delete":
                dataSrc = { "i": i, "url": item.url, "var": item.var, "type": item.type, "connId": item.connId };
                this.setState({ dataSrc, dataSrcModal: true });
            default:
        }
    }

    handleAddUpdateDataSrc = (event) => {
        var { extSources, dataSrc } = this.state;
        var action = (dataSrc.i == -1) ? "Add" : (event.target.name == "Delete") ? "Delete" : "Update";

        switch (action) {
            case "Add":
                if (!extSources.find(x => x.var.toLowerCase() == dataSrc.var.toLowerCase())) {
                    extSources.push({ url: dataSrc.url, var: dataSrc.var, verified: dataSrc.verified, type: dataSrc.type, connId: dataSrc.type != "Web request" ? dataSrc.connId : "", tenant: GetTenantName(), defaultValue: dataSrc.defaultValue });
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
                extSources.splice(dataSrc.i, 1, { url: dataSrc.url, var: dataSrc.var, verified: dataSrc.verified, type: dataSrc.type, connId: dataSrc.type != "Web request" ? dataSrc.connId : "", tenant: GetTenantName(), defaultValue: dataSrc.defaultValue });
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

    onChangeDefault = (defaultValue) => {
        try {
            let dataSrc = this.state.dataSrc;
            dataSrc["defaultValue"] = defaultValue;
            this.setState({ dataSrc: dataSrc })
        } catch (err) {
            console.log(err);
        }
    }

    getDataModal = () => {
        const type = this.state.dataSrc["type"];
        let data = [];
        if (type == "Collection" && this.state.dataSrc["connId"] != "") {
            const collectionData = this.state.collectionList.find(x => x.id == this.state.dataSrc["connId"])
            if (collectionData) {
                data = collectionData.viewTables;
                if (collectionData.viewTables && collectionData.viewTables.length != 0) {
                    var temp = collectionData.viewTables.filter(x => x.visible);
                    var columns = []
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

    render() {
        const { showVariable, jsonData, sharepointList, collectionList, calenderList, extSources, eventsConfig, actionsConfig, viewField, actionsFlow, actionsFlowIdx, actionType, showActionModal, editDesc, editName, editRow, col1, col2, col3 } = this.state;
        const user = this.props.user
        const that = this;
        const actionsLength = actionsConfig && actionsConfig.length;
        const connectionUrl = (this.state.dataSrc["type"] == "Sharepoint" || this.state.dataSrc["type"] == "Web request")
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
                        <CollectionAction
                            user={user}
                            extvariables={extSources}
                            eventsConfig={eventsConfig}
                            actionsConfig={actionsConfig}
                            pageLayoutFormSchema={viewField}
                            actionsFlow={actionsFlow}
                            onClickVariables={() => this.setState({ dataSrcModal: true })}
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
                {this.state.dataSrcModal &&
                    <Modal className="modal-lg" isOpen={this.state.dataSrcModal} toggle={() => this.setState({ dataSrcModal: false })}>
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
                                                <option key='4' value='Collection'>Collection Data</option>
                                                <option key='5' value='Calendar'>Calendar Data</option>
                                            </select>
                                        </div>
                                    </Col>
                                </Row>

                                {this.state.dataSrc["type"] == "Sharepoint" && sharepointList.length != 0 &&
                                    <Row>
                                        <Col md='3'>Connection
                                        <span className="required-star">*</span>
                                        </Col>
                                        <Col md='9'>
                                            <div className="form-group">
                                                <select className="form-control" id="connId" name="default_path" onChange={this.handleChange} value={this.state.dataSrc["connId"]}>
                                                    <option >Select..</option>
                                                    {sharepointList.map((x, i) => <option key={i} value={x.value}>{x.name}</option>)}
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>
                                }

                                {this.state.dataSrc["type"] == "Collection" &&
                                    <Row>
                                        <Col md='3'>collections
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

                                {this.state.dataSrc["type"] == "Calendar" &&
                                    <Row>
                                        <Col md='3'>Calendar
                                        <span className="required-star">*</span>
                                        </Col>
                                        <Col md='9'>
                                            <div className="form-group">
                                                <select className="form-control form-select-modified" id="connId" name="default_path" onChange={this.handleChange} value={this.state.dataSrc["connId"]}>
                                                    <option >Select..</option>
                                                    {calenderList.map((x, i) => <option key={i} value={x.id}>{x.name}</option>)}
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>
                                }

                                {(this.state.dataSrc["type"] == "Collection" && this.state.dataSrc["connId"]) &&
                                    <Row>
                                        <Col md='3'>Data Modal<span className="required-star">*</span>
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
                                                value={this.state.dataSrc["var"]}
                                                id="var"
                                                onChange={this.handleChange}
                                            />
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
                                                    onChange={this.handleChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                }


                                {this.state.dataSrc["type"] == "Json" &&
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
                                        {(this.state.dataSrc.i !== -1) && <Button color="secondary" className='custom-btn' name="Delete" onClick={this.handleAddUpdateDataSrc}>Delete</Button>}
                                    </Col>
                                    <Col md='8' className='text-right'>
                                        <Button color="secondary" className='custom-btn mr-2' onClick={() => this.setState({ dataSrcModal: false })}>Close</Button>
                                        {connectionUrl && <Button color="primary" className='custom-btn mr-2' type="submit" name="Verify" onClick={this.handleVerifyDataSrc}>Verify</Button>}
                                        {connectionUrl && <Button color="primary" disabled={!(this.state.dataSrc.statusCode == 200)} className='custom-btn  mr-2' type="submit" name="Submit" onClick={this.handleAddUpdateDataSrc}>Submit</Button>}
                                        {!connectionUrl && <Button color="primary" className='custom-btn  mr-2' type="submit" name="Submit" onClick={this.handleAddUpdateDataSrc}>Submit</Button>}
                                    </Col>
                                </Row>
                            </Container>
                        </ModalFooter>
                    </Modal>
                }

                <div className='Actions-card'>
                    <Row>
                        <Col lg='12' className="py-3">
                            <Card className="card border shadow-card rounded-lg">
                                <CardHeader className="border-bottom card-header rounded-top"  >
                                    <div className="d-flex justify-content-end">
                                        <div className="mr-auto pt-2">Variables</div>
                                        <div className="p-0">
                                            <button
                                                onClick={() => this.setState({ dataSrcModal: true, dataSrc: { i: -1, url: "", type: "Web request", var: "", verified: false }, })}
                                                className="btn btn-sm btn-primary rounded-pill px-3 ">
                                                Add
                                        </button>
                                        </div>
                                        <div className="ml-3">
                                            {/* <i className={col1 ? "fa fa-angle-up fa-2x" : "fa fa-angle-down fa-2x"} aria-hidden="true" onClick={() => { this.setState({ col1: !this.state.col1 }) }}></i> */}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Collapse isOpen={this.state.col1} className="px-3 py-2">
                                    {extSources && extSources.map((item, index) =>
                                        <Row key={index}>
                                            <Col sm="9">
                                                <p><strong>{item.var}</strong><br />({item.type})</p>
                                            </Col>
                                            <Col style={{ "alignItems": "center", "display": "flex" }}>
                                                {(item.var != 'user') ?
                                                    <UncontrolledDropdown className="is-app-toggle CustomToggle ml-5 mr-0" setActiveFromChild>
                                                        <DropdownToggle tag={CustomToggle} />
                                                        <DropdownMenu size="sm" title="" right>
                                                            <DropdownItem name="Edit" className="d-flex" onClick={this.updateDataSrc(item, index, 'Edit')}><div className="d-flex" ><i className="pointer text-success material-icons mr-2" data-toggle="tooltip" title="Edit">call_missed_outgoing</i>Edit</div></DropdownItem>
                                                            <DropdownItem name="Delete" className="d-flex" onClick={this.updateDataSrc(item, index, 'Delete')} ><div className="d-flex" ><i className="pointer text-danger material-icons mr-2" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</div></DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                    :
                                                    <div className="ml-5 mr-0 pointer"><span onClick={() => this.setState({ showVariable: true })} className="material-icons">help</span></div>
                                                }
                                            </Col>
                                        </Row>
                                    )}
                                    {!extSources.length && 
                                            <p>There are no variables</p>
                                    }
                                </Collapse>
                            </Card>
                        </Col>
                        <Col lg="12" className="py-3">
                            <Card className="card border shadow-card rounded-lg">
                                <CardHeader className="card-header border-bottom rounded-top">
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
                                <Collapse isOpen={this.state.col2} className="px-3 py-2">
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
                            <Card className="card shadow-card border rounded-lg">
                                <CardHeader className="card-header border-bottom rounded-top">
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
                                <Collapse isOpen={this.state.col3} className="px-3 py-2">
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
                                        <p>There are no Actions</p>
                                    }
                                </Collapse>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </React.Fragment>
        )
    }
}

export default collectionFormData;


