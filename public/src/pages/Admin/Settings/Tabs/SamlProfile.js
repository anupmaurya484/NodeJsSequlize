
import React, { Component } from 'react';
import { Row, Col, Card, Button, CardHeader, CardBody, Collapse, Modal, ModalHeader, ModalBody, ModalFooter, Fragment } from 'reactstrap';
import axios from 'axios';
import Dropzone from "react-dropzone";
import OauthPopup from 'react-oauth-popup';
import OneLoginPng from '../../../../assets/images/saml/onelogin.png';
import GooglePng from '../../../../assets/images/saml/google.png';
import azurePng from '../../../../assets/images/saml/azure.png';
// import oktaPng from '../../../../assets/images/saml/okta.png';
// import pingonePng from '../../../../assets/images/saml/pingone.png';
import auth0 from '../../../../assets/images/saml/auth0.png';
import xmlLogPng from '../../../../assets/images/xml-logo.png';
import XMLParser from 'react-xml-parser';

const idpLists = [{
    idp_type: "1",
    name: "OneLogin",
    logo: OneLoginPng,
    description: "",
    is_active: true,
    helpLink: <a href="https://portal.glozic.dev/public/page-layout?id=60d0811179c60a001f81c551" target="_blank">(View Tutorial)</a>
}, {
    idp_type: "2",
    name: "Google workspace",
    logo: GooglePng,
    description: "",
    is_active: true,
    helpLink: <a href="https://portal.glozic.dev/public/page-layout?id=60d097556dbdda0020af5429" target="_blank"> (View Tutorial)</a>
}, {
    idp_type: "3",
    name: "Azure",
    logo: azurePng,
    description: "",
    is_active: true,
    helpLink: <a href="https://portal.glozic.dev/public/page-layout?id=60d0811179c60a001f81c551" target="_blank"> (View Tutorial)</a>
},
{
    idp_type: "4",
    name: "Auth0",
    logo: auth0,
    description: "",
    is_active: true,
    helpLink: <a href="https://portal.glozic.dev/public/page-layout?id=60d0811179c60a001f81c551" target="_blank"> (View Tutorial)</a>
}];

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return {
        displaySize: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i],
        sizeType: sizes[i],
        filesize: parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
    }
};

class SamlProfile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showSetupModal: false,
            authentication_profile_type: "0",
            is_verify_connection: false,
            requestPayload: false,
            saml_admin_email: "",
            isCopied: "",
            steps: 1,
            saml_auth: {
                idp_type: "",
                is_setuped: false,
                entry_point: "",
                key: ""
            },
            idp_config: {
                idp_type: "",
                is_setuped: false,
                entry_point: "",
                key: "",
                metadata_url: "",
                upload_metadata_file: []
            }
        }
    }

    getEntityId = () => {
        const tenant = this.props.GetTenantName();
        const domain = window.location.hostname.replace(tenant, "").replace(".", "");
        const company_id = this.props.user.User_data.company.company_id;
        return (company_id + "_" + domain)
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({
            authentication_profile_type: props.authentication_profile_type,
            saml_auth: {
                idp_type: props.selected_idp_type,
                entry_point: props.entry_point,
                key: props.key,
                is_setuped: props.is_setuped,
            },
            idp_config: {
                idp_type: props.idp_type,
                entry_point: props.entry_point,
                key: props.key,
                is_setuped: props.is_setuped,
                metadata_url: "",
                upload_metadata_file: []
            }
        });
    }

    handleAcceptedFiles = async (e) => {
        try {
            const { isExternalProfile } = this.props;
            let idp_config = this.state.idp_config;
            let files = [e.target.files[0]];
            files.map(file =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    formattedSize: formatBytes(file.size).displaySize,
                    sizeType: formatBytes(file.size).sizeType,
                    filesize: formatBytes(file.size).filesize
                })
            );

            const xml_data = await axios.get(files[0].preview);
            var xmlJSON = new XMLParser().parseFromString(xml_data.data);
            var entryPoint = "", keys = [], entity_id = xmlJSON.attributes.entityID;

            if (idp_config.idp_type == 3) {
                const Signature = xmlJSON.children.find(x => x.name == "Signature");
                const SSODescriptor = xmlJSON.children.find(x => x.name == "IDPSSODescriptor");
                SSODescriptor.children.forEach(x => {
                    if (x.attributes.Binding == "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST") {
                        entryPoint = x.attributes.Location;
                    }
                })
                Signature.children.forEach(x => {
                    // if (x.name == "SignatureValue") {
                    //     keys.push(x.value)
                    // }
                    if (x.name == "KeyInfo") {
                        x.children.forEach(y => {
                            y.children.forEach(z => {
                                keys.push(z.value);
                            })
                        });
                    }
                })
            } else {
                xmlJSON.children[0].children.forEach(x => {
                    if (x.attributes.Binding == "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST") {
                        entryPoint = x.attributes.Location;
                    }
                    if (x.attributes.use == "signing") {
                        keys.push(x.children[0].children[0].children[0].value)
                    }
                });
            }


            const requestPayload = {
                is_setuped: true,
                entry_point: entryPoint,
                domain: window.location.hostname,
                metadata_entity_id: entity_id,
                entity_id: this.getEntityId(),
                idp_type: idp_config.idp_type,
                callback: this.props.baseapiurl + '/auth/saml/' + (isExternalProfile ? "external/" : "") + 'callback',
                key: keys
            };

            console.log(requestPayload);
            if ((idp_config.idp_type == 1 && entryPoint.search("onelogin.com") >= 0) ||
                (idp_config.idp_type == 2 && entryPoint.search("google.com") >= 0) ||
                (idp_config.idp_type == 3 && entryPoint.search("microsoftonline.com") >= 0) ||
                (idp_config.idp_type == 4 && entryPoint.search("auth0.com") >= 0)
            ) {
                this.setState({ requestPayload: requestPayload })
            } else {
                this.props.Toast("Metadata URL OR File is not vailid, Please try again.", "error");
            }
            // this.readxmlToJson(files[0].preview);
            this.setState({ idp_config: { ...idp_config, upload_metadata_file: files, metadata_url: files[0].preview } })
        } catch (err) {
            console.log(err.message);
            this.props.Toast("Metadata URL File is not vailid, Please try again.", "error");
        }
    }

    verifyMetadata = async () => {
        try {
            this.setState({ steps: 2, is_setuped: true });
            let requestPayload = this.state.requestPayload;
            requestPayload["saml_admin_email"] = this.state.saml_admin_email;
            this.props.saveAccessIdp(this.state.requestPayload);
        } catch (err) {
            this.props.Toast("Metadata URL File is not vailid, Please try again.", "error");
        }
    }

    onCopyText = (name) => {
        const that = this;
        var copyText = document.getElementById(name);
        copyText.select();
        document.execCommand("copy");
        that.setState({ isCopied: name });
        setTimeout(() => that.setState({ isCopied: "" }), 3000);
    }

    onSelectedIdp = (e) => {
        console.log(e.target.name);
        const idp_type = this.props.isExternalProfile ? e.target.name.replace("_isExternalProfile", "") : e.target.name;

        let idp_config = this.state.idp_config;
        this.setState({
            steps: 1,
            idp_config: { ...idp_config, idp_type: idp_type },
            is_verify_connection: false,
            requestPayload: false,
            saml_admin_email: "",
        });
        console.log(idp_type);
        this.props.onSelectedipd(idp_type)
    }

    handleOauthResponse = (e) => {
        console.log(e);
    }

    onClose = (e) => {
        if (localStorage.getItem("=SEZYZYZ")) {
            console.log(localStorage.getItem("=SEZYZYZ"))
            this.setState({ is_verify_connection: true, saml_admin_email: localStorage.getItem("=SEZYZYZ") });
            localStorage.removeItem("=SEZYZYZ")
        }
    }

    getUrl(data) {
        const { isExternalProfile } = this.props;
        return this.props.baseapiurl + '/auth/saml/' + (isExternalProfile ? "external/" : "") + "login?verifykey=" + btoa(JSON.stringify(data))
    }

    render() {
        const { authentication_profile_type, idp_config, showSetupModal, saml_auth } = this.state;
        const { activeIndex, open, isExternalProfile } = this.props;
        const that = this, samlProfileWidth = isExternalProfile ? "94.40%" : "100%";

        return (
            <div className="saml-profile pl-2 position-relative" style={{ 'width': samlProfileWidth }}>
                {showSetupModal && this.SetupSaml()}
                {!this.props.isExternalProfile &&
                    <div className="form-check Tenant-profile">
                        <input checked={authentication_profile_type == 2} onClick={() => this.props.setState({ authentication_profile_type: 2 })} className="form-check-input  position-static" type="radio" name="blankRadio" id="blankRadio1" value="option1" aria-label="..." />
                        <label className="form-check-label Auth-label ml-1" for="exampleRadios1">
                            SAML Authentication Profile
                        </label>
                    </div>
                }



                <Card className={`${isExternalProfile ? '' : 'saml-select'} text-left  border Auth-card shadow-card rounded-lg`}>
                    <CardHeader className="border-bottom Auth-card-header rounded-top p-0">
                        <div className={`${authentication_profile_type == 2 ? '' : 'disabledDiv'} d-flex justify-content-between`}>
                            <label className="form-select form-select-lg pl-2"><strong>Identity providers</strong></label>

                                <div className="header-policy">
                                    <span onClick={() => this.props.onOpenClose({ open: (open == activeIndex ? -1 : activeIndex) })} aria-expanded={open} className='mr-2'>
                                        {open == activeIndex && <i class="fa fa-angle-up fa-2x" aria-hidden="true"></i>}
                                        {open != activeIndex && <i class="fa fa-angle-down fa-2x" aria-hidden="true"></i>}
                                    </span>
                                </div>

                            
                        </div>
                    </CardHeader>
                    {((isExternalProfile && open == activeIndex) || (!isExternalProfile && !open && !activeIndex)) &&
                        <CardBody className={`${authentication_profile_type == 2 ? '' : 'disabledDiv'}`}>
                            {idpLists.map((x, i) => {
                                console.log(x.idp_type == idp_config.idp_type, x.name, x.idp_type);
                                const idp_type = isExternalProfile ? (x.idp_type + "_isExternalProfile") : x.idp_type;
                                const idp_config_idp_type = isExternalProfile ? (idp_config.idp_type + "_isExternalProfile") : idp_config.idp_type


                                return (
                                    <Row key={i}>
                                        <Col xs="9" className="d-flex">
                                            <span className="w-48 avatar gd-primary"><img src={x.logo} width="50px" height="50px" alt="." /></span>
                                            <div className="flex ml-4" > <span>{x.name}</span>
                                                <div className="item-except text-muted text-sm h-1x">{x.helpLink}</div>
                                                {!x.is_active && <span className="text-danger">coming soon</span>}
                                            </div>
                                        </Col>
                                        <Col xs="1" className="d-flex">
                                            {x.is_active &&
                                                <div className="form-check" >
                                                    <input
                                                        type="radio"
                                                        value={idp_type}
                                                        name={idp_type}
                                                        checked={(idp_type == idp_config_idp_type)}
                                                        onChange={this.onSelectedIdp}
                                                        className="form-check-input" />
                                                    <label className="form-check-label"></label>
                                                </div>
                                            }
                                        </Col>
                                        <Col xs="2">
                                            {x.is_active &&
                                                <button className={(saml_auth.is_setuped && saml_auth.idp_type == x.idp_type) ? 'btn btn-primary' : 'btn btn-danger'} disabled={x.idp_type != idp_config.idp_type} onClick={() => that.setState({
                                                    idp_config: { ...idp_config, idp_type: x.idp_type },
                                                    is_verify_connection: false,
                                                    requestPayload: false,
                                                    saml_admin_email: "",
                                                    showSetupModal: true,
                                                    steps: 1
                                                })}>Setup</button>
                                            }
                                        </Col>
                                    </Row>
                                )
                            })
                            }
                        </CardBody>
                    }
                </Card>

                {isExternalProfile &&
                    <div onClick={() => this.props.deleteExternal()} className='ml-2 minus-button position-absolute' style={{ "top": "3px", "right": "-29px" }}>
                        <a className="delete" ><i class="material-icons text-danger"><i class="fa fa-trash " aria-hidden="true" /></i></a>
                    </div>
                }

            </div>
        )
    }

    SetupSaml = () => {
        const that = this;
        const { showSetupModal, idp_config, isCopied, steps, is_verify_connection, saml_admin_email } = this.state;
        const { isExternalProfile } = this.props;

        const idp = idpLists.find(x => x.idp_type == idp_config.idp_type);
        const ServiceProviderList = [{
            label: "Audience (EntityID)",
            value: this.getEntityId(),
            id: 'entity_id'
        }, {
            label: "Recipient",
            value: this.props.baseapiurl + '/auth/saml/' + (isExternalProfile ? "external/" : "") + 'callback',
            id: 'recipient'
        }, {
            label: "ACS (Consumer)",
            value: this.props.baseapiurl + '/auth/saml/' + (isExternalProfile ? "external/" : "") + 'callback',
            id: 'consumer'
        }];

        if (this.props.AppDeveloperMode()) {
            return (
                <Modal className="modal-md modal-dialog-centered bg-dangar" isOpen={showSetupModal} toggle={() => that.setState({ showActionModal: !showSetupModal })} >
                    <ModalHeader toggle={() => that.setState({ showSetupModal: !showSetupModal })} className="modal-header">
                        <strong><h5 className="text-info">Please use live environment for SAML setup</h5></strong>
                    </ModalHeader>
                </Modal>
            )
        } else {
            return (
                <Modal className="modal-lg" isOpen={showSetupModal} toggle={() => that.setState({ showActionModal: !showSetupModal })} >
                    <ModalHeader toggle={() => that.setState({ showSetupModal: !showSetupModal })} className="modal-header">
                        <strong><h5>Setup {idp.name} IDP</h5></strong>
                    </ModalHeader>
                    <ModalBody>
                        {steps == 1 &&
                            <div>
                                <Row className="mt-1 mb-1">
                                    <Col xs="3" className="d-flex">
                                        <span className="w-48 avatar gd-primary"><img src={idp.logo} width="50px" height="50px" alt="." /></span>
                                    </Col>
                                    <Col xs="7" className="d-flex">
                                        <p className="text-center"><strong><h3>service provider details</h3></strong></p>
                                    </Col>
                                    <Col xs="2">{idp.helpLink}</Col>
                                </Row>

                                <hr />
                                {ServiceProviderList.map((x, i) => (
                                    <Row className="mt-1 mb-1" key={i}>
                                        <Col xs="3" className="d-flex">
                                            <span className="Country-label">{x.label}</span><br />
                                        </Col>
                                        <Col xs="7" className="d-flex">
                                            <input
                                                style={{ "backgroundColor": "#edebeb" }}
                                                readonly
                                                data-autoselect=""
                                                id={x.id}
                                                value={x.value}
                                                className="form-control"
                                                type="text"
                                                name={x.id}
                                            />
                                        </Col>
                                        <Col xs="2">
                                            <div className="input-group-button">
                                                <clipboard-copy value={x.value} onClick={() => this.onCopyText(x.id)} style={{ fontSize: "20px" }} tabindex="0" role="button">
                                                    <i class="fa fa-clone" aria-hidden="true"></i>
                                                </clipboard-copy>
                                            </div>
                                            {isCopied == x.id && <span className="text-success">copied.</span>}
                                        </Col>
                                    </Row>
                                ))}
                                <hr />
                                <div>
                                    <p className="text-center"><strong><h3>connection metadata form</h3></strong></p>
                                    <Row className="mt-1 mb-1">
                                        <Col xs="3" className="d-flex">
                                            <span className="Country-label">Upload Metadata File</span><br />
                                        </Col>
                                        <Col xs="7">
                                            {idp_config.upload_metadata_file.length == 0 &&
                                                <Dropzone accept="application/xml" getFilesFromEvent={acceptedFiles => { that.handleAcceptedFiles(acceptedFiles) }} >
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone border-dashed">
                                                            <div className="dz-message needsclick mt-2" {...getRootProps()} >
                                                                <input {...getInputProps()} />
                                                                <div className="mb-3">
                                                                    <i class="display-4 text-muted bx bxs-cloud-upload fa fa-upload" aria-hidden="true"></i>
                                                                </div>
                                                                <h4>Drop files here or click to upload.</h4>
                                                                <h6>Accept only .XML file</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                            }
                                            {idp_config.upload_metadata_file.map((f, i) => {
                                                return (
                                                    <Card
                                                        className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                                                        key={i + "-file"}
                                                    >
                                                        <div className="p-2">
                                                            <Row className="align-items-center">
                                                                <Col className="col-auto">
                                                                    <img
                                                                        data-dz-thumbnail=""
                                                                        height="80"
                                                                        className="avatar-sm rounded bg-light"
                                                                        alt={f.name}
                                                                        src={xmlLogPng}
                                                                    />
                                                                </Col>
                                                                <Col xs="8">
                                                                    <a href={f.preview} target="_blank" className="text-muted font-weight-bold"> {f.name}</a>
                                                                    <p className="mb-0"> <strong>{f.formattedSize != 0 && f.formattedSize}</strong></p>
                                                                </Col>
                                                                <Col>
                                                                    <i class="fa fa-trash" aria-hidden="true" onClick={() => this.setState({ idp_config: { ...idp_config, upload_metadata_file: [], metadata_url: "" } })}></i>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Card>
                                                )
                                            })}
                                        </Col>
                                        <Col xs="2"></Col>
                                    </Row>
                                    <Row className="mt-2 mb-1">
                                        <Col xs="3" className="d-flex">
                                            <span className="Country-label"> </span><br />
                                        </Col>
                                        <Col>
                                            <OauthPopup url={this.getUrl(this.state.requestPayload)} onClose={this.onClose} onCode={this.handleOauthResponse}>
                                                <button type="button" disabled={!this.state.requestPayload} className="btn btn-secondary btn-sm float-right">verify connection</button>
                                            </OauthPopup>
                                            {saml_admin_email && <p><span className="text-success"><strong>{saml_admin_email}</strong></span> has been verified to access with admin account </p>}
                                        </Col>
                                        <Col xs="2"></Col>

                                    </Row>
                                </div>
                            </div>
                        }

                        {steps == 2 &&
                            <div>
                                <h4 className="text-center">setup completed</h4>
                                <div className="swal2-icon swal2-success swal2-animate-success-icon" style={{ "display": "flex" }}>
                                    <div className="swal2-success-circular-line-left" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div>
                                    <span className="swal2-success-line-tip"></span>
                                    <span className="swal2-success-line-long"></span>
                                    <div className="swal2-success-ring"></div>
                                    <div className="swal2-success-fix" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div>
                                    <div className="swal2-success-circular-line-right" style={{ "backgroundColor": "rgb(255, 255, 255)" }}></div>
                                </div>
                            </div>
                        }

                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => that.setState({ showSetupModal: !showSetupModal })}>close</button>
                        {steps == 1 && <button disabled={!is_verify_connection} type="button" className="btn btn-primary btn-sm" onClick={this.verifyMetadata}>submit</button>}
                    </ModalFooter>
                </Modal >
            )
        }

    }

}

export default SamlProfile