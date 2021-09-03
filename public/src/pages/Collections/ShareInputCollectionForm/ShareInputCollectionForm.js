import React, { Component, Fragment } from 'react';
import { Alert, Button, Breadcrumb, Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, Container, DropdownType } from 'reactstrap';
import queryString from 'query-string';
import { connect } from 'react-redux';
import * as ACT from '../../../actions';
import { GetAppName, Toast, GetTenantName, fullUrlPathPDF } from '../../../utils/helperFunctions';
import FormioInput from '../../../components/FormioInput'
import axios from '../../../utils/axiosService';
import runClientSideActions from '../../../utils/ActionEvent';
import './ShareInputCollectionForm.css';
import { resolve } from 'path';

let blockDuplicateCall = 0;

class ShareCollectionForm extends Component {
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
            is_refersh_form: true,
            redirect_url: "",
            is_load: false
        }
    }

    componentWillMount = async () => {
        try {
            const { location } = this.props;
            const { id: formId, record_id, sharing } = queryString.parse(location.search);
            const res = await axios.apis('GET', `/api/GetFormCollectionAnonymous/${formId}/${sharing}`)
            if (this.props.user.isLoggedIn || res.is_anonymous_form || (this.props.user.ShareForm && this.props.user.ShareForm.verifyOtp)) {
                const { location } = this.props;
                const { id, sharing } = queryString.parse(location.search);
                this.loadFormDefinition(id, sharing);
            } else {
                const payload = {
                    formId: formId,
                    sharing: sharing
                }
                this.props.SetShareForm(payload);
                if (GetTenantName() != "portal") {
                    this.props.history.push("/public/access-otp-form");
                } else {
                    this.props.history.push("/login");
                }
            }

        } catch (err) {
            console.log(err.message);
        }
    }


    loadInputdata = async (formId, recordId) => {
        return new Promise(async (resolve, reject) => {
            try {
                var { submission, formOptions } = this.state;
                const res = await axios.apis('GET', `/api/record?id=${formId}&record_id=${recordId}&sharing=${sharing}`);
                let data = res
                data.isNew = false;
                submission.isNew = false;
                submission.data = data;
                formOptions.readOnly = data.createdBy == this.props.user.User_data._id ? false : true;
                console.log(formOptions)
                this.setState({ submission });
                resolve(true);
            } catch (err) {
                console.log(err.message);
                resolve(true);
            }
        });
    }

    setLanguage = (lang) => {
        var { formLanguage, formOptions, is_refersh_form, formschema } = this.state;
        const that = this;
        var compIdx = formschema.components.findIndex(x => x.key === "_varComp");

        formOptions.i18n.lng = lang;
        formschema.components[compIdx].language = lang;

        var formOptions = {
            language: lang,
            i18n: formOptions.i18n
        }

        that.setState({ formLanguage, formOptions, is_refersh_form: false });
        is_refersh_form = true;
        setTimeout(() => that.setState({ is_refersh_form, formschema }), 100);
    };

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
                dataActionsConfig,
                extSources,
                hostname
            } = formDef;

            if (formLanguage) {
                var formOptions = {
                    language: formLanguage.language,
                    i18n: formLanguage.i18n,
                }
            }

            formschema = JSON.parse(formschema);

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

            formschema = { ...varComp, ...formschema };
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
                is_refersh_form: true,
                redirect_url: formDef.external_redirect_url,
                is_load: true
            });
        } catch (err) {
            console.log(err)
        }
    }

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
                    }else if (source.type == "Object") {
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

    loadInputdata = async (formId, recordId) => {
        return new Promise(async (resolve, reject) => {
            try {
                var { submission, formOptions } = this.state;
                const res = await axios.apis('GET', `/api/record?id=${formId}&record_id=${recordId}&sharing=false`);
                let data = res
                data.isNew = false;
                submission.isNew = false;
                submission["data"] = JSON.parse(JSON.stringify(data));
                formOptions.readOnly = data.createdBy == this.props.user.User_data._id ? false : true;
                this.setState({ submission });
                resolve(true);
            } catch (err) {
                console.log(err.message);
                resolve(true);
            }
        });
    }

    submitFormFields = async (reqResponse) => {
        try {
            const { createdActionAPI, collectionName, redirect_url, collectionformsId } = this.state,
                { location } = this.props,
                { id, sharing } = queryString.parse(location.search);

            const formId = id;

            let AddUrl = `/api/public-record?id=${formId}&sharing=${sharing}`,
                formFields = reqResponse.formFields,
                redirectUrl = (redirect_url && redirect_url != "") ? redirect_url : reqResponse.redirectUrl,
                url = AddUrl,
                rootPath = GetAppName(this.props.user)

            //console.log(formFields)
            formFields['login_user_id'] = this.props.user.isLoggedIn ? this.props.user.User_data._id : "";
            formFields['share_forms_id'] = collectionformsId;

            var res = await axios.apis('POST', url, formFields);
            if (res.success) {
                Toast('Thank you, your form submitted successfully', 'success');
                if (redirectUrl != "") {
                    window.location.href = redirectUrl;
                } else {
                    if (this.props.user.User_data) {
                        this.props.history.push('/shared-forms-list/shardformrecords?id=' + formId)
                    } else {
                        window.location.reload()
                    }
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    //Coll Custome Event's
    onCustomEvent = async (e) => {
        const that = this;
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

    render() {
        const { is_refersh_form, collectionID, collectionName, formLanguage, formOptions, submission, formschema, is_show_success } = this.state;

        if (!this.state.is_load) {
            return false
        } else {
            return (
                <div>
                    {formLanguage &&
                        <UncontrolledDropdown className="CustomToggle cutom-language-dropdown" setActiveFromChild>
                            <DropdownToggle caret color="white" size="sm">
                                {Object.values(formLanguage.options[formLanguage.options.findIndex(v => Object.keys(v)[0] === formOptions.language)])[0]}
                            </DropdownToggle>
                            <DropdownMenu right>
                                {formLanguage.options.map((option, i) => (
                                    <DropdownItem onClick={() => this.setLanguage(Object.keys(option)[0])} key={i}>{Object.values(option)[0]}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    }
                    {is_refersh_form && !is_show_success &&
                        <FormioInput
                            formschema={formschema}
                            formOptions={formOptions}
                            submission={submission}
                            submitFormFields={this.submitFormFields}
                            onCustomEvent={(e) => this.onCustomEvent(e)}
                        />
                    }
                </div>
            )
        }

    }
}


const mapStateToProps = ({ user, form }) => ({
    user
})

const mapDispatchToProps = (dispatch) => ({
    setDummyManagerAndDepartment: () => dispatch(ACT.setDummyManagerAndDepartment()),
    SetShareForm: (formId) => dispatch(ACT.SetShareForm(formId)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ShareCollectionForm)