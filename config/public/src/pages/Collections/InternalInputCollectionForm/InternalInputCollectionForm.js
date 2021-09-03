import React, { Component, Fragment } from 'react';
import { Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { connect } from 'react-redux';
import runClientSideActions from '../../../utils/ActionEvent';
import * as ACT from '../../../actions';
import { GetAppName, Toast, GetTenantName, fullUrlPathPDF, AppDesign, pdfHTMLStringReplace } from '../../../utils/helperFunctions';
import FormioInput from '../../../components/FormioInput'
import axios from '../../../utils/axiosService';
import API from '../../../config'
import './InternalInputCollectionForm.css';


let blockDuplicateCall = 0;

class InternalInputCollectionForm extends Component {
    constructor(props) {
        super()
        this.state = {
            selectedItem: '',
            submission: { isNew: true, data: {} },
            varVault: {},
            collectionformsId: "",
            formType: false,
            isPublicPage: false,
            collectionName: "",
            formschema: "",
            createdActionAPI: "",
            collectionID: null,
            formLanguage: null,
            formOptions: { readOnly: false },
            is_refersh_form: false,
            redirect_url: ""
        }
    }

    async componentWillMount() {
        try {
            const { location } = this.props;
            const { id, record_id } = queryString.parse(location.search);
            //Load Form Data 
            await this.loadFormDefinition(id);
            //Load Submitted Data
            if (record_id) await this.loadInputdata(id, record_id);
            //refesh form data
            this.setState({ is_refersh_form: true });

        } catch (err) {
            console.log(err.message);
        }
    }

    loadFormDefinition = async (formId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, record_id } = queryString.parse(location.search);

                let { submission, varVault } = this.state;
                let formDef = await axios.apis('GET', `/api/forms?id=${formId}&sharing=false`);
                let {
                    formschema,
                    createdActionAPI,
                    collectionName,
                    formLanguage,
                    formType,
                    dataEventsConfig,
                    dataActionsConfig,
                    extSources
                } = formDef;

                formschema = JSON.parse(formschema);

                var formOptions = {
                    language: formLanguage.language,
                    i18n: formLanguage.i18n,
                }

                if (formType == "pdf") {
                    formschema.settings.pdf.src = fullUrlPathPDF(formschema.settings.pdf.src)
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

                if (extSources) {
                    varComp.data = await this.loadExtData(extSources);
                    Object.keys(varComp.data).map(key => {
                        varVault[key] = JSON.stringify(varComp.data[key])
                    })
                }

                if (dataEventsConfig && dataEventsConfig[0] && !record_id) {
                    const resActionData = await runClientSideActions(dataEventsConfig[0].actions, { submission, varVault, formschema });
                    submission = resActionData.submission;
                    this.setState({ submission })
                }

                formschema = { ...varComp, ...formschema }
                formschema.components.push(varComp);

                this.setState({
                    dataActionsConfig: dataActionsConfig,
                    collectionformsId: formDef._id,
                    formType: formType,
                    isPublicPage: false,
                    collectionName: collectionName,
                    formschema: formschema,
                    createdActionAPI: createdActionAPI,
                    collectionID: formId,
                    formLanguage: formLanguage,
                    formOptions: formOptions,
                    redirect_url: formDef.internal_redirect_url,
                });

                resolve(true);
            } catch (err) {
                console.log(err)
                resolve(true);
            }
        })

    }

    loadInputdata = async (formId, recordId) => {
        return new Promise(async (resolve, reject) => {
            try {
                var { submission, formOptions } = this.state;
                const res = await axios.apis('GET', `/api/record?id=${formId}&record_id=${recordId}&sharing=false`);
                let data = res
                data.isNew = false;
                submission.isNew = false;
                submission["data"] = JSON.parse(JSON.stringify(data));
                formOptions.readOnly = (data.createdBy == this.props.user.User_data._id) ? false : true;
                this.setState({ submission });
                resolve(true);
            } catch (err) {
                console.log(err.message);
                resolve(true);
            }
        });
    }

    //Coll Custome Event's
    onCustomEvent = async (e) => {
        const that = this;
        debugger
        let { submission, varVault, formschema } = that.state;
        submission["data"] = { ...submission["data"], ...e.data };
        if (blockDuplicateCall != 1) {
            blockDuplicateCall = 1;
            const { dataActionsConfig } = this.state;
            const actionsCfg = dataActionsConfig.find(x => x.name == e.type)
            console.log("custom event triggered ", actionsCfg && actionsCfg.name)
            if (actionsCfg) {
                const resActionData = await runClientSideActions([...actionsCfg.actions], { submission, varVault, formschema })
                this.setState({ submission: resActionData.submission });
            } else {
                setTimeout(() => that.setState({ submission: submission }), 100)
            }
        }
        setTimeout(() => blockDuplicateCall = 0, 1000);
    }


    submitFormFields = async (reqResponse) => {
        try {
            const { createdActionAPI, collectionName, redirect_url, collectionformsId } = this.state,
                { location } = this.props,
                { id, record_id } = queryString.parse(location.search);

            const formId = id;

            const UpdateUrl = `/api/update-record?form_id=${formId}&record_id=${record_id}`;

            let AddUrl = `/api/record?id=${formId}`,
                formFields = reqResponse.formFields,
                redirectUrl = (redirect_url && redirect_url != "") ? redirect_url : reqResponse.redirectUrl,
                url = record_id ? UpdateUrl : AddUrl,
                rootPath = GetAppName(this.props.user)

            var res = await axios.apis('POST', url, formFields);
            if (res.success) {
                Toast('Thank you, your form submitted successfully', 'success');
                if (redirectUrl != "") {
                    window.location.href = redirectUrl;
                } else {
                    const path = `/collection/${formId}?name=${collectionName}`
                    this.props.history.push(AppDesign('path') + rootPath + path)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    setLanguage = (lang) => {
        var { formLanguage, formOptions, is_refersh_form, formschema } = this.state;
        const that = this;
        formOptions.i18n.lng = lang;
        is_refersh_form = false
        var compIdx = formschema.components.findIndex(x => x.key === "_varComp");
        formschema.components[compIdx].language = lang;
        var formOptions = {
            language: lang,
            i18n: formOptions.i18n
        }
        that.setState({ formLanguage, formOptions, is_refersh_form });
        is_refersh_form = true;
        setTimeout(() => that.setState({ is_refersh_form, formschema }), 100);
    };


    loadExtData(extSources) {
        return new Promise(async (resolve, reject) => {
            try {
                const that = this;
                var extData = {}, count = 0;
                while ((extSources.length - 1) >= count) {
                    console.log("count=>", count);
                    var source = extSources[count];
                    var index = count;
                    if (source.type == "Json") {
                        extData[source.var] = source.defaultValue
                    } else if (source.type == "Object") {
                        if (source.var == 'user') {
                            extData[source.var] = this.props.user.User_data
                        }
                    } else if (source.type == "Collection") {
                        var reqData = {
                            method: 'GET',
                            connId: source.connId,
                            dataSrcType: source.type,
                            tenant: source.tenant
                        }
                        const res = await axios.apis('POST', `/api/webRequestCollection`, reqData)
                        extData[source.var] = res.status ? res.result : [];
                    } else if (source.verified) {
                        var reqData = {
                            url: source.url,
                            method: 'GET',
                            connId: source.connId,
                            dataSrcType: source.type,
                            tenant: source.tenant
                        }
                        const res = await axios.apis('POST', `/api/webrequest`, reqData)
                        extData[source.var] = res
                    }
                    console.log(count);
                    count++;
                }
                resolve(extData);
            } catch (err) {
                console.log(err.message);
            }
        });
    }

    pdfCapture = () => {
		let html = "";
		if (this.state.formschema.display == "pdf") {
			debugger
			var iframe = document.getElementsByTagName('iframe');
			var innerDoc = (iframe[0].contentDocument) ? iframe[0].contentDocument : iframe[0].contentWindow.document;
			html = innerDoc.getElementsByTagName('html')[0].outerHTML
		} else {
			debugger
			var div = document.createElement("html");
			div.innerHTML = '<html><head><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"><link rel="stylesheet" href="https://unpkg.com/formiojs@latest/dist/formio.full.min.css"><script src="https://unpkg.com/formiojs@latest/dist/formio.full.min.js"></script></head><body style="padding: 20px;">' + document.getElementsByClassName("formio-view")[0].outerHTML + '</body></html>';
			html = div.outerHTML;
		}
		const { record_id, id } = queryString.parse(location.search);
		let filename = record_id ? record_id + '.pdf' : id + '.pdf';

		html = pdfHTMLStringReplace(html,this.state.submission.data)

		axios.apis('POST', `/api/generate-form-pdf`, { html: html, filename: filename })
			.then(response => {
                window.open(`${API.BASE_API_URL}/api/download-form-pdf?filename=` + filename);
			}).catch(error => console.error(error));
	}

    render() {
        const { is_refersh_form, formLanguage, formOptions, submission, formschema, is_show_success, formType } = this.state;

        return (
            <div>
                {formLanguage &&
                    <UncontrolledDropdown className="CustomToggle cutom-language-dropdown" setActiveFromChild>
                        <DropdownToggle caret color="white" size="sm" className="btn-secondary">
                            {Object.values(formLanguage.options[formLanguage.options.findIndex(v => Object.keys(v)[0] === formOptions.language)])[0]}
                        </DropdownToggle>
                        <DropdownMenu right>
                            {formLanguage.options.map((option, i) => (
                                <DropdownItem onClick={() => this.setLanguage(Object.keys(option)[0])} key={i}>{Object.values(option)[0]}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </UncontrolledDropdown>
                }

                {formType == "pdf" &&
                    <div class="d-flex justify-content-end">
                        <button onClick={() => this.pdfCapture()} className="btn btn-download custom-pdf-buton btn-secondary" style={{ "padding": "5px", "margin": "5px", color: "#fff", height: "30px" }}><i class="fa fa-download"></i> Download</button>
                    </div>
                }

                {is_refersh_form && !is_show_success &&
                    <FormioInput
                        formschema={formschema}
                        formOptions={formOptions}
                        submission={submission}
                        onCustomEvent={(e) => this.onCustomEvent(e)}
                        submitFormFields={this.submitFormFields}
                    />
                }
            </div>
        )
    }
}


const mapStateToProps = ({ user, form }) => ({
    user
})

const mapDispatchToProps = (dispatch) => ({
    setDummyManagerAndDepartment: () => dispatch(ACT.setDummyManagerAndDepartment())
})

export default connect(mapStateToProps, mapDispatchToProps)(InternalInputCollectionForm)