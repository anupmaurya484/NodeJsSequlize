
import React, { Component, Fragment } from 'react';
import { Row, Col, Card, Button, CardTitle, CardHeader, CardBody, Collapse, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Toast, GetTenantName, checkTenatLogin, AppDeveloperMode, uuidv4 } from '../../../../utils/helperFunctions';
import ExternalAccess from './ExternalAccess';
import SamlProfile from './SamlProfile';
const strength_level = {
    "1": 'Strong',
    '2': 'Medium',
    '3': 'Low'
}

const password_criteria_option = {
    "1": {
        "strength_level": "1",
        "is_retry_attempts": true,
        "is_alphanumeric_charaters": true,
        "is_mixed_upper_lower": true,
        "is_one_number": true,
        "is_special_characters": true,
        "is_minimum_password": true,
        "password_criteria": {
            "retry_attempts": "3",
            "alphanumeric_charaters": "2",
            "special_characters": "2",
            "minimum_password": "8"
        }
    },
    '2': {
        "strength_level": "2",
        "is_retry_attempts": true,
        "is_alphanumeric_charaters": true,
        "is_mixed_upper_lower": true,
        "is_one_number": true,
        "is_special_characters": false,
        "is_minimum_password": true,
        "password_criteria": {
            "retry_attempts": "3",
            "alphanumeric_charaters": "1",
            "special_characters": "1",
            "minimum_password": "6"
        }
    },
    '3': {
        "strength_level": "3",
        "is_retry_attempts": false,
        "is_alphanumeric_charaters": true,
        "is_mixed_upper_lower": false,
        "is_one_number": true,
        "is_special_characters": false,
        "is_minimum_password": true,
        "password_criteria": {
            "retry_attempts": "3",
            "alphanumeric_charaters": "1",
            "special_characters": "2",
            "minimum_password": "3"
        }
    }
}

class ProfileAccess extends Component {

    constructor(props) {
        super(props);
        this.state = {
            secutiry_password: null,
            is_edit_info: false,
            authentication_profile_type: "1",
            selected_idp_type: 0,
            open_saml : false,
            isSaved: false,
            saml_auth: {
                idp_type: "",
                entry_point: "",
                key: "",
                is_setuped: false
            },
            adminConfig: "",
            showAccessModal: false,
            AddProfile: false,
            external_access_profiles: []
        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        const external_access_profiles = props.adminConfig.configuration.external_access_profiles
        this.setState({
            secutiry_password: props.secutiry_password || password_criteria_option[3],
            authentication_profile_type: props.authentication_profile_type,
            saml_auth: props.saml_auth,
            selected_idp_type: props.saml_auth.idp_type,
            adminConfig: props.adminConfig,
            external_access_profiles: external_access_profiles ? external_access_profiles : []
        });
    }

    SavePasswordSecurity = (type) => {
        let adminConfig = this.props.adminConfig;
        const saml_auth = this.state.saml_auth;
        const selected_idp_type = this.state.selected_idp_type;
        adminConfig.secutiry_password = this.state.secutiry_password;
        adminConfig.authentication_profile_type = this.state.authentication_profile_type;
        adminConfig.saml_auth = saml_auth;
        adminConfig.update_type = 'password';
        const isVailid = (adminConfig.authentication_profile_type == "2" && saml_auth.is_setuped && selected_idp_type == saml_auth.idp_type)
        if (isVailid || adminConfig.authentication_profile_type == "1") {
            if (this.state.isEditPassword || type == 'save') {
                this.props.EditSetting(adminConfig).then(resData => {
                    if (resData.status) {
                        Toast(resData.message, "success")
                    } else {
                        Toast(resData.message, "error")
                    }
                });
                this.setState({ isEditPassword: false, isSaved: true });
            } else {
                this.setState({ isEditPassword: true, old_secutiry_password: this.state.secutiry_password });
            }
        } else {
            Toast("SAML authentication profile is not setup.", "error")
        }
    }

    handleInputChangePassword = (type, { target }) => {
        var secutiry_password = this.state.secutiry_password;
        if (type == "strength_level") {
            secutiry_password = password_criteria_option[target.value];
        } else {
            secutiry_password.password_criteria[type] = target.value;
        }
        this.setState({ secutiry_password: secutiry_password });
    }

    handleCheckChangePassword(type) {
        var secutiry_password = this.state.secutiry_password
        secutiry_password[type] = !secutiry_password[type];
        this.setState({ secutiry_password: secutiry_password });
    }


    saveAccessIdp(data) {
        this.setState({ saml_auth: data, selected_idp_type: data.idp_type });
        // this.SavePasswordSecurity('save');
    }

    handleOptionChange(event) {
        event.preventDefault();
        this.setState({
            AddProfile: true
        });
        console.log('changed');
    }

    onSaveExternal = (data) => {
        console.log(data)
        let adminConfig = this.props.adminConfig;
        adminConfig["external_access_profiles"] = data;
        adminConfig["update_type"] = 'external_access_profiles';
        this.props.EditSetting(adminConfig).then(resData => {
            if (resData.status) {
                Toast(resData.message, "success")
            } else {
                Toast(resData.message, "error")
            }
        });
    }

    render() {
        const {
            secutiry_password,
            isEditPassword,
            authentication_profile_type,
            saml_auth,
            selected_idp_type,
            isSaved,
            external_access_profiles
        } = this.state;

        const that = this;
        if (!secutiry_password) return false;
        return (
            <Fragment>

                <div className="text-center">
                    <h2>Authentication Profiles</h2>
                </div>

                <Card>
                    <CardHeader className="d-flex justify-content-between">
                        <CardTitle>Tenant Access</CardTitle>
                        <button className='btn btn-secondary' onClick={() => this.SavePasswordSecurity('save')}>Save</button>
                    </CardHeader>
                    <CardBody className='mt-4'>
                        <div md="10" style={{ padding: "6px" }}>
                            <div className="form-check Tenant-profile">
                                <input className="form-check-input position-static" onClick={() => this.setState({ authentication_profile_type: 1 })} checked={authentication_profile_type == 1} type="radio" name="blankRadio" id="blankRadio1" value="option1" aria-label="..." />
                                <label class="form-check-label Auth-label" for="exampleRadios1">
                                    Default Authentication Profile
                                </label>
                            </div>
                            <div className={`${authentication_profile_type == 1 ? '' : 'disabledDiv'} password-policy-div`}>
                                <Card className="text-left  border Auth-card shadow-card rounded-lg">
                                    <CardHeader className="border-bottom Auth-card-header rounded-top">
                                        <div className="align-items-center d-flex justify-content-between ">
                                            <label className="ml-2">Password Policy</label>
                                            <span onClick={() => this.setState({ open: true, open: !this.state.open })} aria-expanded={open} className='mr-2'><i class="fa fa-angle-down fa-2x" aria-hidden="true"></i></span>
                                        </div>
                                    </CardHeader>
                                    <Collapse isOpen={this.state.open} style={{ 'width': '100%' }}>
                                        <CardBody>
                                            <div className="d-flex justify-content-end header-policy">
                                                {!this.state.isEditPassword && <span className="material-icons cursor-pointer" onClick={() => this.SavePasswordSecurity()}>
                                                    create
                                                </span>}
                                                {this.state.isEditPassword &&
                                                    <Fragment>
                                                        <span className="material-icons cursor-pointer" onClick={(e) => this.setState({ isEditPassword: -1 })}>
                                                            save
                                                        </span>
                                                        <span className="material-icons cursor-pointer" onClick={(e) => this.closePassword}>
                                                            close
                                                        </span>
                                                    </Fragment>
                                                }
                                            </div>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="9" style={{ padding: "6px" }}><span className='w-100'>Default password strength levels </span></Col>
                                                <Col md="3" style={!isEditPassword ? { textAlign: "right" } : {}}>
                                                    {!isEditPassword ?
                                                        <span className='w-100'>{strength_level[secutiry_password.strength_level]} </span>
                                                        :
                                                        <select value={secutiry_password.strength_level} onChange={event => that.handleInputChangePassword('strength_level', event)} className="form-control" >
                                                            <option value="1">Strong</option>
                                                            <option value="2">Medium</option>
                                                            <option value="3">Low</option>
                                                        </select>
                                                    }
                                                </Col>
                                            </Row>

                                            <Row style={{ marginBottom: "0px" }}>
                                                <Col md="8" style={{ padding: "6px" }}><span className='w-100 font-weight-bold'>Password criteria</span></Col>
                                                <Col style={{ "textAlign": "right", padding: "6px" }}><span className='w-100 font-weight-bold'>Minimum character</span></Col>
                                            </Row>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="10" style={{ padding: "6px" }}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            checked={secutiry_password.is_retry_attempts}
                                                            id="defaultChecked2"
                                                            onClick={event => that.handleCheckChangePassword('is_retry_attempts')}
                                                            disabled={!isEditPassword ? "disabled" : ""} />
                                                        <label className="custom-control-label w-100" htmlFor="defaultChecked2">Maximum retry attempts before account is locked</label>
                                                    </div>
                                                </Col>
                                                <Col md="2" style={!isEditPassword ? { textAlign: "right" } : {}}>
                                                    {!isEditPassword ?
                                                        <span className='w-100'>{secutiry_password.password_criteria.retry_attempts}</span>
                                                        :
                                                        <input
                                                            type="text"
                                                            maxLength="2"
                                                            className="form-control"
                                                            id="formGroupExampleInput"
                                                            value={secutiry_password.password_criteria.retry_attempts}
                                                            onChange={event => that.handleInputChangePassword('retry_attempts', event)}
                                                        />
                                                    }
                                                </Col>
                                            </Row>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="10" style={{ padding: "6px" }}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={secutiry_password.is_alphanumeric_charaters}
                                                            className="custom-control-input"
                                                            id="defaultChecked3"
                                                            onClick={event => that.handleCheckChangePassword('is_alphanumeric_charaters')}
                                                            disabled={!isEditPassword ? "disabled" : ""} />
                                                        <label className="custom-control-label w-100" htmlFor="defaultChecked3">Alphanumeric charaters(a..z,A..Z)</label>
                                                    </div>
                                                </Col>
                                                <Col md="2" style={!isEditPassword ? { textAlign: "right" } : {}}>
                                                    {!isEditPassword ?
                                                        <span className='w-100'>{secutiry_password.password_criteria.alphanumeric_charaters} </span>
                                                        :

                                                        <input
                                                            type="text"
                                                            maxlength="2"
                                                            className="form-control"
                                                            id="formGroupExampleInput"
                                                            value={secutiry_password.password_criteria.alphanumeric_charaters}
                                                            onChange={event => that.handleInputChangePassword('alphanumeric_charaters', event)}
                                                        />
                                                    }
                                                </Col>
                                            </Row>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="10" style={{ padding: "6px" }}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={secutiry_password.is_mixed_upper_lower}
                                                            className="custom-control-input"
                                                            id="defaultChecked4"
                                                            onClick={event => that.handleCheckChangePassword('is_mixed_upper_lower', i)}
                                                            disabled={!isEditPassword ? "disabled" : ""} />
                                                        <label className="custom-control-label w-100" htmlFor="defaultChecked4">Mixed of uppercase and lowercase</label>
                                                    </div>
                                                </Col>
                                                <Col></Col>
                                            </Row>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="10" style={{ padding: "6px" }}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={secutiry_password.is_one_number}
                                                            className="custom-control-input"
                                                            id="defaultChecked5"
                                                            onClick={event => that.handleCheckChangePassword('is_one_number', i)}
                                                            disabled={!isEditPassword ? "disabled" : ""} />

                                                        <label className="custom-control-label w-100" htmlFor="defaultChecked5">At least one number (0,9)</label>
                                                    </div>
                                                </Col>
                                                <Col></Col>
                                            </Row>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="10" style={{ padding: "6px" }}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={secutiry_password.is_special_characters}
                                                            className="custom-control-input"
                                                            id="defaultChecked6"
                                                            onClick={event => that.handleCheckChangePassword('is_special_characters', i)}
                                                            disabled={!isEditPassword ? "disabled" : ""} />
                                                        <label className="custom-control-label w-100" htmlFor="defaultChecked6">Special characters({"~!@#$%^&*()[]{}<>?+_"})</label>
                                                    </div>
                                                </Col>
                                                <Col md="2" style={!isEditPassword ? { textAlign: "right" } : {}}>
                                                    {!isEditPassword ?
                                                        <span className='w-100'>{secutiry_password.password_criteria.special_characters} </span>
                                                        :

                                                        <input
                                                            type="text"
                                                            maxlength="2"
                                                            className="form-control"
                                                            id="formGroupExampleInput"
                                                            value={secutiry_password.password_criteria.special_characters}
                                                            onChange={event => that.handleInputChangePassword('special_characters', event)}
                                                        />
                                                    }
                                                </Col>
                                            </Row>
                                            <Row style={{ borderRadius: "4px" }}>
                                                <Col md="10" style={{ padding: "6px" }}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={secutiry_password.is_minimum_password}
                                                            className="custom-control-input"
                                                            id="defaultChecked7"
                                                            onClick={event => that.handleCheckChangePassword('is_minimum_password')}
                                                            disabled={!isEditPassword ? "disabled" : ""} />
                                                        <label className="custom-control-label w-100" htmlFor="defaultChecked7">Minimum password length</label>
                                                    </div>
                                                </Col>
                                                <Col md="2" style={!isEditPassword ? { textAlign: "right" } : {}}>
                                                    {!isEditPassword ?
                                                        <span className='w-100 font-weight-bold'>{secutiry_password.password_criteria.minimum_password}</span>
                                                        :
                                                        <input
                                                            type="text"
                                                            maxlength="2"
                                                            className="form-control"
                                                            id="formGroupExampleInput"
                                                            value={secutiry_password.password_criteria.minimum_password}
                                                            onChange={event => that.handleInputChangePassword('minimum_password', event)}
                                                        />
                                                    }
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Collapse>
                                </Card>

                            </div>
                        </div>
                        <div md="10" className='mb-5 mt-5'>
                            {checkTenatLogin() &&
                                < SamlProfile
                                    onOpenClose={() => this.setState({ open_saml: !this.state.open_saml })}
                                    saveAccessIdp={this.saveAccessIdp}
                                    open={this.state.open_saml}
                                    isSaved={isSaved}
                                    AppDeveloperMode={AppDeveloperMode}
                                    baseapiurl={this.props.baseapiurl}
                                    user={this.props.user}
                                    GetTenantName={GetTenantName}
                                    Toast={Toast}
                                    setState={(state) => this.setState({ ...state })}
                                    onSelectedipd={(type) => this.setState({ saml_auth: { ...saml_auth, idp_type: type } })}
                                    authentication_profile_type={authentication_profile_type}
                                    selected_idp_type={selected_idp_type}
                                    is_setuped={saml_auth.is_setuped}
                                    idp_type={saml_auth.idp_type}
                                    entry_point={saml_auth.entry_point}
                                    key={saml_auth.key}
                                />
                            }

                        </div>
                    </CardBody>
                </Card>

                <ExternalAccess
                    uuidv4={uuidv4}
                    onSaveExternal={this.onSaveExternal}
                    checkTenatLogin={checkTenatLogin}
                    AppDeveloperMode={AppDeveloperMode}
                    GetTenantName={GetTenantName}
                    baseapiurl={this.props.baseapiurl}
                    Toast={Toast}
                    user={this.props.user}
                    strength_level={strength_level}
                    password_criteria_option={password_criteria_option}
                    external_access_profiles={external_access_profiles} />

            </Fragment>
        )
    }
}


export default ProfileAccess;