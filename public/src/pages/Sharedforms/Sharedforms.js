
//Import Package 
import React, { Component, Fragment } from 'react'
import queryString from 'query-string';
import { Row, Col, Card, Button, Modal, ModalHeader, ModalBody, CardHeader, CardBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, } from 'reactstrap';
import runClientSideActions from '../../utils/ActionEvent';
import CustomToggle from '../../components/CustomToggle';
import { connect } from 'react-redux';
import { Form } from 'react-formio';
import moment from 'moment';

//Import functions
import axios from '../../utils/axiosService';
import { Toast, GetAppName,fullUrlPathPDF } from '../../utils/helperFunctions';
import { GetSharedforms, GetSharedformTableView, GetSharedformRecords, DeleteSharedformRecords } from "../../actions/sharedForm.actions";

//Import CSS
import "./index.css";

class SharedForms extends Component {
    constructor(props) {
        super()
        this.state = {
            is_call_api: false,
            id: "",
            records: [],
            column: [],
            tableViewConfig: [],
            count: 0,
            total_page: 0,
            current_page: 1,
            is_open_recod_model: false,

            //Form.io keys
            formschema: null,
            formType: false,
            submission: { isNew: true, data: {} },
            varVault: {},
            collectionformsId: "",
            isPublicPage: false,
            collectionName: '',
            createdActionAPI: null,
            collectionID: null,
            formLanguage: null, //to be loaded by loadFormData
            formOptions: { readOnly: false },    //to be set in loadFormData, passed in the <Form options={formOptions} /> component
            is_refersh_form: false,
            external_redirect_url: "",
            internal_redirect_url: "",
            multipleSubmissions: false,
            collectionformsId: "",
            record_id: undefined,
            isPublicAccessForm: false,
            is_view_form: -1,
            temp_submission: "",
        }
    }

    componentDidMount() {
        //Call Onload function for Get intial datas
        this.loadSharedForms();
    }

    //Get ShareForm Lists 
    loadSharedForms = async () => {
        try {
            const { id } = queryString.parse(location.search);
            const { name } = queryString.parse(location.search);
            const { app_id, User_data } = this.props.user;
            const { current_page } = this.state;
            var column = [], tableViewConfig = {};
            var current_pages = current_page ? current_page : 1;
            var payload = { "id": id, "page": current_pages, "limit": 10, "search": "", userId: User_data._id }
            const resdata = await this.props.GetSharedformRecords(payload);
            const resviewtable = await this.props.GetSharedformTableView({ id: id });
            //debugger
            if (resviewtable.status) {
                column = [];
                resviewtable.data[0].properties.map((x, i) => {
                    if (x.visible) {
                        column.push(x.key);
                        tableViewConfig[x.key] = {
                            "displayName": x.title,
                            "order": i + 1,
                            "showInTable": x.visible
                        }
                    }
                });
            } else {
                column = Object.keys(resdata.data[0]);
                column.map((x, i) => {
                    tableViewConfig[x] = {
                        "displayName": x,
                        "order": i + 1,
                        "showInTable": true
                    }
                })
            }
            if (resdata.data.length > 0) {
                this.setState({
                    id: id,
                    is_call_api: true,
                    collectionName: name,
                    records: resdata.data,
                    count: resdata.count,
                    total_page: resdata.page,
                    current_page: current_pages,
                    column: column,
                    tableViewConfig: tableViewConfig
                })
            } else {
                this.setState({
                    id: id,
                    is_call_api: true,
                    collectionName: name,
                    column: column,
                    tableViewConfig: tableViewConfig
                })
            }

            this.loadFormDefinition(id, true);

        } catch (err) {
            console.log(err.message);
        }
    }

    //Form.io Functions
    loadFormDefinition = async (formId, sharing) => {
        try {
            const { record_id } = queryString.parse(location.search);
            let { submission, varVault } = this.state;
            let formDef = await axios.apis('GET', `/api/forms?id=${formId}&sharing=${sharing}`);
            let { 
                formschema, 
                createdActionAPI, 
                collectionName, 
                formLanguage, 
                formType, 
                dataEventsConfig,
                extSources
            } = formDef;

            if (formLanguage) {
                var formOptions = {
                    language: formLanguage.language,
                    i18n: formLanguage.i18n,
                    //readOnly : readOnly
                }
            }

            formschema = JSON.parse(formschema);
            if (formType == "pdf") {
                formschema.settings.pdf.src = fullUrlPathPDF(formschema.settings.pdf.src)
            }

            if (dataEventsConfig && dataEventsConfig[0] && !record_id) {
                const resActionData = await runClientSideActions(dataEventsConfig[0].actions, { submission, varVault, formschema });
                submission = resActionData.submission;
                this.setState({ submission })
            }

            const varComp = {
                "type": "var",
                "hidden": true,
                "key": "_varComp",
                "persistent": false,
                "tableView": false,
                "input": true,
                "label": "",
                "protected": false,
                "id": "ef2yqwq",
                "language": formLanguage ? formLanguage.language : "English",
                "user": this.props.user.User_data,
                "data": [],
                "isNew": this.state.submission.isNew,
                "customDefaultValue": "form.user = component.user; form.data = component.data; submission.isNew = component.isNew;"
            }

            if (extSources) varComp.data = await this.loadExtData(extSources);

            formschema.components.push(varComp);

            this.setState({
                collectionformsId: formDef._id,
                formType: formType,
                isPublicPage: false,
                collectionName: collectionName,
                formschema: formschema,
                createdActionAPI: createdActionAPI,
                collectionID: formId,
                formLanguage: formLanguage,
                formOptions: formOptions,
                is_refersh_form: true,
                external_redirect_url: formDef.external_redirect_url,
                internal_redirect_url: formDef.internal_redirect_url,
                multipleSubmissions: formDef.multipleSubmissions
            });

        } catch (err) {
            console.log(err)
        }
    }

    submitFormFields = async (formData) => {
        const { location } = this.props;
        const { id } = queryString.parse(location.search);
        const { createdActionAPI, isPublicAccessForm, collectionName, internal_redirect_url, external_redirect_url, collectionformsId, record_id } = this.state
        const formId = id, sharing = "true";
        let AddUrl = `/api/record?id=${formId}&sharing=${sharing}`;
        const UpdateUrl = `/api/update-record?form_id=${formId}&record_id=${record_id}&sharing=${sharing}`;
        let redirectUrl = "", formFields = formData.data, url = record_id ? UpdateUrl : AddUrl, rootPath = GetAppName(this.props.user);
        if ((isPublicAccessForm == true && external_redirect_url != "" && external_redirect_url) || (isPublicAccessForm == false && internal_redirect_url != "" && internal_redirect_url)) {
            redirectUrl = isPublicAccessForm == false ? internal_redirect_url : external_redirect_url;
        }

        formFields['share_forms_id'] = collectionformsId;
        var Objectkey = Object.keys(formFields)
        for (let i = 0; i < Objectkey.length; i++) {
            let key = Objectkey[i];
            if (formFields[key] && formFields[key].length && formFields[key].length > 0 && typeof formFields[key] == "object") {
                for (let j = 0; j < formFields[key].length; j++) {
                    if (formFields[key][j].url) {
                        var res_file = await this.uploadFile({ key: key, index: j, url: formFields[key][j].url, keyName: formFields[key][j].originalName.trim() });
                        //console.log(res_file);
                        formFields[key][j].url = res_file.filename;
                        formFields[key][j]['filename'] = res_file.filename;
                        formFields[key][j]['fileKey'] = res_file.fileKey;
                        formFields[key][j]['fileId'] = res_file.fileId;
                        formFields[key][j]['contentType'] = res_file.contentType;
                        formFields[key][j]['size'] = res_file.size;
                    }
                }
            }

            if (formFields[key] && typeof formFields[key] == "string" && redirectUrl != "") {
                redirectUrl = redirectUrl.replace("<<" + key + ">>", formFields[key]);
                redirectUrl = redirectUrl.replace("<<submission." + key + ">>", formFields[key]);
                redirectUrl = redirectUrl.replace("<<data." + key + ">>", formFields[key]);
            }
        }

        try {
            url = isPublicAccessForm == true ? `/api/public-record?id=${formId}&sharing=${sharing}` : url;
            var res = await axios.apis('POST', url, formFields);
            if (res.success) {
                if (redirectUrl != "") {
                    this.setState({ is_show_success: true, is_open_recod_model: false });
                    window.location.href = redirectUrl;
                } else {
                    this.setState({ is_show_success: true, is_open_recod_model: false });
                    this.loadSharedForms();
                }
            } else {
                this.setState({ is_show_success: true, is_open_recod_model: false });
            }
        } catch (err) {
            console.log(err)
        }
    }

    uploadFile = async (file) => {
        const that = this;
        let result = await new Promise(async function (resolve, reject) {
            const nameStartIdx = file.url.indexOf(';name=') + 6
            const nameEndIdx = file.url.indexOf(';base64,')
            const filename = file.url.slice(nameStartIdx, nameEndIdx)

            const sBoundary = "---------------------------" + Date.now().toString(16)

            var date = new Date();
            const formFile = new FormData()
            formFile.append("file", dataURLtoBlob(file.url), filename.trim().replace("%", ''))

            // upload attachment file
            const config = {
                headers: {
                    'content-type': `multipart/form-data; boundary=${sBoundary}`,
                    'Authorization': auth.headers.headers.Authorization,
                },
                onUploadProgress: progressEvent => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    that.setState({
                        totalSize: progressEvent.total,
                        clientUploadProgress: progress
                    })
                }
            }

            try {
                var res = await axios.apis('POST', `/api/upload`, formFile)
                const { filename, fileId, contentType, size, message } = res
                resolve({ res: "0", filename: filename, fileKey: file.keyName, fileId, contentType, size, ...file });
            } catch (err) {
                resolve({ res: "1", filename: null })
            }
        });
        return result;
    }

    loadExtData(extSources) {
        return new Promise(function (resolve, reject) {
            var extData = {};
            extSources.forEach(function (source, index) {
                if (source.verified) {
                    fetch(source.url, {
                        headers: (source.header) ? source.header : {
                            'content-type': 'application/json'
                        },
                        mode: (source.mode) ? source.mode : 'cors',
                    })
                        .then(function (response) {
                            response.json().then(function (result) {
                                extData[source.var] = result;
                                //varComp.data = extData;
                                //that.setState({submission});
                                //console.log("submission: ", submission)
                            });
                        });
                }
            });
            resolve(extData);
        });
    }

    setLanguage = (lang) => {
        var { formLanguage, formOptions, is_refersh_form, formschema } = this.state;
        const that = this;
        formOptions.i18n.lng = lang;
        is_refersh_form = false
        //console.log(formOptions);
        var compIdx = formschema.components.findIndex(x => x.key === "_varComp");
        formschema.components[compIdx].language = lang;
        var formOptions = {
            language: lang,
            i18n: formOptions.i18n
        }
        that.setState({ formLanguage, formOptions, is_refersh_form });
        is_refersh_form = true;
        setTimeout(() => that.setState({ is_refersh_form, formschema }), 100);
        //console.log(formLanguage);
    };

    //Render Form Language
    renderFormLanguage = () => {
        const { formLanguage, formOptions } = this.state;
        const that = this;
        return (
            <UncontrolledDropdown size="sm" className="small-button">
                <DropdownToggle tag={'button'} className="btn btn-primary btn-lg mt-2 mr-5">
                    {Object.values(formLanguage.options[formLanguage.options.findIndex(v => Object.keys(v)[0] === formOptions.language)])[0]}
                </DropdownToggle >
                <DropdownMenu right>
                    {formLanguage.options.map((option, i) => (
                        <DropdownItem style={{ "minWidth": "50px !important" }} onClick={() => that.setLanguage(Object.keys(option)[0])} key={i}>{Object.values(option)[0]}</DropdownItem>
                    ))}
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }

    //Render FormIO Design
    renderFormio = (readOnly) => {
        let { formschema, formOptions, submission } = this.state;
        if (readOnly == true) {
            formOptions["readOnly"] = true;
        } else {
            delete formOptions["readOnly"]
        }
        return (<Form
            form={formschema}
            options={formOptions}
            submission={submission}
            onChange={(e) => this.setState({ temp_submission: e.data })}
            onSubmit={(e) => this.submitFormFields(e)} />)
    }

    onloadFormRecodDesign = (is_view_form, item) => {
        let submission = { data: JSON.parse(item.submissionsData) }
        submission["isNew"] = false;
        if (item.status == 1) {
            this.setState({ is_view_form: (is_view_form != this.state.is_view_form) ? is_view_form : -1, submission: submission, record_id: item._id });
        } else {
            this.setState({ is_open_recod_model: !this.state.is_open_recod_model, submission: submission, record_id: item._id });
        }
    }

    //Save Draf submit collection
    OnSaveSubmitCollection = () => {
        const reqPayload = { data: this.state.temp_submission, status: 0 };
        this.setState({ is_open_recod_model: false })
        // this.submitFormFields(reqPayload)
    }

    //Render Defaut Function
    render() {
        const { is_view_form, records, id, collectionName, is_call_api, is_open_recod_model, formLanguage, multipleSubmissions, is_refersh_form } = this.state;
        const that = this, rootPath = GetAppName(this.props.user);
        console.log(multipleSubmissions);

        var recordList = [];
        records.forEach((ele) => {
            recordList.push(ele)
            recordList.push(null)
        })

        return (
            <Fragment>
                <Modal size="xl" isOpen={is_open_recod_model} toggle={this.OnSaveSubmitCollection} className="TenantFormModel">
                    <ModalHeader toggle={this.OnSaveSubmitCollection} >
                        <h4 className={'title'}>
                            <b>{collectionName}</b>
                        </h4>
                        {formLanguage && this.renderFormLanguage()}
                    </ModalHeader>
                    <ModalBody>
                        {is_refersh_form && this.renderFormio(false)}
                    </ModalBody>
                </Modal>


                {is_call_api === true &&
                    <Row>
                        <Col>
                            <Card >
                                <CardHeader className="hideOverflow" style={{ textTransform: "capitalize", padding: '.75rem 1.25rem' }}>
                                    <b>{collectionName}</b>
                                    <div className="float-right">
                                        <Button className="float-right small-button ml-1" onClick={() => this.setState({ submission: { isNew: true }, is_open_recod_model: !is_open_recod_model, record_id: "" })} disabled={(!multipleSubmissions)} >New</Button>
                                        <Button className="float-right small-button" onClick={this.props.history.goBack}>Exit</Button>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="table-view">
                                        <div className="table-responsive" style={{ overflowY: "scroll" }}>
                                            <table className="table" id="table1" >
                                                <thead className="custome-table-thead">
                                                    <tr>
                                                        <th className="custome-table-th" width="600"><b>Submitted on</b></th>
                                                        <th className="custome-table-th" width="200"><b>Submitted by</b></th>
                                                        <th className="custome-table-th" width="100"><b>Status</b></th>
                                                        <th className="custome-table-th" width="100"><b>Action</b></th>
                                                    </tr>
                                                </thead>
                                                {(recordList && recordList.length != 0) &&
                                                    <tbody className="custome-table-tbody">
                                                        {recordList.map((ele, i) => {
                                                            if (ele) {
                                                                return (
                                                                    <tr key={i}>
                                                                        <td >{moment(ele.createdAt).format("DD MMM YYYY h:mm:ss a")}</td>
                                                                        <td className="text-capitalize">{this.props.user.User_data.firstname + "" + this.props.user.User_data.lastname}</td>
                                                                        <td > {ele.status == 1 ? "Submitted" : "Save Draft"}</td>
                                                                        <td ><Button className="float-left small-button" onClick={() => that.onloadFormRecodDesign(i, ele)}>{is_view_form === i ? "close" : "View"}</Button></td>

                                                                    </tr>
                                                                )
                                                            } else {
                                                                return (
                                                                    <tr>
                                                                        <td colSpan="4">
                                                                            {is_view_form === (i - 1) &&
                                                                                <Card>
                                                                                    <CardHeader className="TenantFormModel">
                                                                                        {formLanguage && that.renderFormLanguage()}
                                                                                    </CardHeader>
                                                                                    <CardBody>
                                                                                        {that.renderFormio(true)}
                                                                                    </CardBody>
                                                                                </Card>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }


                                                        })
                                                        }

                                                    </tbody>
                                                }
                                                {(records && records.length == 0) &&
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="4">
                                                                <center>
                                                                    <p>You have not submitted any <b>{collectionName}</b> form yet</p>
                                                                    <p>Your submitted froms will be show in this view if there is..</p>
                                                                </center>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                }
                                            </table>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                }

            </Fragment>
        )
    }
}

//Get States key
const mapStateToProps = ({ user }) => ({
    user
});

//Get Despatch Functions
const mapDispatchToProps = (dispatch) => ({
    GetSharedformRecords: (data) => dispatch(GetSharedformRecords(data)),
    GetSharedformTableView: (data) => dispatch(GetSharedformTableView(data)),
    DeleteSharedformRecords: (data) => dispatch(DeleteSharedformRecords(data)),
    GetSharedforms: (data) => dispatch(GetSharedforms(data)),
});

//Export class
export default connect(mapStateToProps, mapDispatchToProps)(SharedForms);