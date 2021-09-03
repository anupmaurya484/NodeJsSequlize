
import React, { Component, Fragment } from 'react';
import { Row, Col, Card, CardTitle, CardHeader, CardBody, Collapse, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import SamlProfile from '../SamlProfile';
import ModalConfirmation from '../../../../../components/ModalConfirmation';
import { Formik, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    profile_name: Yup.string().required("profile Name is a required field."),
    profile_type: Yup.string().required("profile Type is a required field.")
});


class ExternalAccess extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataForm: {
                profile_name: "",
                profile_type: "2",
            },
            is_edit_info: false,
            showAccessModal: false,
            external_access_profiles: [],
            isEditPassword: -1,
            old_secutiry_password: null,
            isSaved: false,
            IsModalConfirmation: false,
            deleteIndexId: -1,

        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({ external_access_profiles: props.external_access_profiles })
    }

    handleCheckChangePassword(type, index) {
        debugger
        var secutiry_password = this.state.external_access_profiles[index].secutiry_password;
        secutiry_password[type] = !secutiry_password[type];
        this.state.external_access_profiles[index].secutiry_password = secutiry_password;
        this.setState({ external_access_profiles: this.state.external_access_profiles });
    }


    handleInputChangePassword = (type, { target }, index) => {
        debugger
        const { password_criteria_option } = this.props;
        var secutiry_password = this.state.external_access_profiles[index].secutiry_password;
        if (type == "strength_level") {
            secutiry_password = password_criteria_option[target.value];
        } else {
            secutiry_password.password_criteria[type] = target.value;
        }
        this.state.external_access_profiles[index].secutiry_password = secutiry_password;
        this.setState({ external_access_profiles: this.state.external_access_profiles });
    }

    revertChange = (index) => {
        this.state.external_access_profiles[index].secutiry_password = this.state.old_secutiry_password;
        this.setState({
            isEditPassword: !this.state.isEditPassword,
            external_access_profiles: this.state.external_access_profiles
        });
    }

    addNewProfile = (dataForm) => {
        let { external_access_profiles } = this.state;
        if (dataForm.profile_name && dataForm.profile_type) {
            if (dataForm.profile_type == "1") {
                external_access_profiles.push({
                    uuid: this.props.uuidv4(),
                    secutiry_password: this.props.password_criteria_option[3],
                    access_profile_name: dataForm.profile_name,
                    authentication_profile_type: dataForm.profile_type
                });
            } else {
                external_access_profiles.push({
                    saml_auth: {
                        idp_type: "",
                        entry_point: "",
                        key: "",
                        is_setuped: false
                    },
                    uuid: this.props.uuidv4(),
                    access_profile_name: dataForm.profile_name,
                    authentication_profile_type: dataForm.profile_type
                });
            }
            this.setState({ showAccessModal: false, external_access_profiles: external_access_profiles })
        }
    }

    saveAccessIdp(data) {
        this.setState({ saml_auth: data, selected_idp_type: data.idp_type });
        // this.SavePasswordSecurity('save');
    }

    saveSamlProfile = (data, index, type) => {
        if (type == 1) {
            this.state.external_access_profiles[index].saml_auth = data.saml_auth;
            this.state.external_access_profiles[index].selected_idp_type = data.selected_idp_type;
        } else {
            this.state.external_access_profiles[index].saml_auth.idp_type = data.selected_idp_type;
        }
        this.setState({ external_access_profiles: this.state.external_access_profiles });
    }

    deleteExternal = (index) => {
        this.setState({ deleteIndexId: index, IsModalConfirmation: true })
    }

    handelConfirm(response) {
        const that = this;
        const { deleteIndexId } = this.state;
        if (response) {
            this.state.external_access_profiles.splice(deleteIndexId, 1);
            this.setState({ external_access_profiles: this.state.external_access_profiles, IsModalConfirmation: false, deleteIndexId: -1 });
        } else {
            this.setState({ IsModalConfirmation: false, deleteIndexId: -1 })
        }
    }



    render() {

        const that = this;
        const { isEditPassword, external_access_profiles, showAccessModal, isSaved, IsModalConfirmation } = this.state;
        const { strength_level, GetTenantName, Toast } = this.props;

        return (
            <Card>
                {showAccessModal && this.addAccessProfile()}
                {IsModalConfirmation && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}
                <CardHeader className='d-flex justify-content-between'>
                    <CardTitle>External Access</CardTitle>
                    <div>
                        <button className='btn btn-secondary btn-md mr-3 align-middle' onClick={() => this.setState({ showAccessModal: true })}>Add</button>
                        <button className='btn btn-secondary btn-md mr-3 align-middle' onClick={() => this.props.onSaveExternal(external_access_profiles)} disabled={external_access_profiles.length==0}>Save</button>
                    </div>

                </CardHeader>
                <CardBody className='mt-4'>
                    {external_access_profiles.map((element, i) => {
                        const secutiry_password = element.secutiry_password;
                        return (
                            <div className="mb-3">
                                <div className="form-check Tenant-profile">
                                    <strong class="form-check-label Auth-label" for="exampleRadios1">
                                        {i + 1} &nbsp;&nbsp; {element.access_profile_name}
                                    </strong>
                                </div>

                                {element.authentication_profile_type == 1 &&
                                    <div className='d-flex align-items-center default-saml-div  position-relative'>
                                        <div className={`external-password-policy-div ml-4 pl-2`} style={{ 'width': '92%' }}>
                                            <Card className="text-left  border Auth-card shadow-card rounded-lg">
                                                <CardHeader className="border-bottom Auth-card-header rounded-top">
                                                    <div className="align-items-center d-flex justify-content-between ">
                                                        <label className="ml-2">Password Policy</label>
                                                        <span onClick={() => this.setState({ open: (this.state.open == i ? -1 : i) })} aria-expanded={open} className='mr-2'>
                                                            {this.state.open == i && <i class="fa fa-angle-up fa-2x" aria-hidden="true"></i>}
                                                            {this.state.open != i && <i class="fa fa-angle-down fa-2x" aria-hidden="true"></i>}
                                                        </span>
                                                    </div>
                                                </CardHeader>
                                                <Collapse isOpen={this.state.open === i} style={{ 'width': '100%' }}>
                                                    <CardBody>
                                                        <div className="d-flex justify-content-end header-policy">
                                                            {(isEditPassword != i) && <span className="material-icons cursor-pointer" onClick={() => this.setState({ isEditPassword: i, old_secutiry_password: external_access_profiles[i].secutiry_password })}>
                                                                create
                                                            </span>}
                                                            {(isEditPassword == i) &&
                                                                <Fragment>
                                                                    <span className="material-icons cursor-pointer" onClick={(e) => this.setState({ isEditPassword: !this.state.isEditPassword })}>
                                                                        save
                                                                    </span>
                                                                    <span className="material-icons cursor-pointer" onClick={(e) => this.revertChange(i)}>
                                                                        close
                                                                    </span>
                                                                </Fragment>
                                                            }
                                                        </div>

                                                        <Row style={{ borderRadius: "4px" }}>
                                                            <Col md="9" style={{ padding: "6px" }}><span className='w-100'>Default password strength levels </span></Col>
                                                            <Col md="3" style={(isEditPassword != i) ? { textAlign: "right" } : {}}>
                                                                {(isEditPassword != i) ?
                                                                    <span className='w-100'>{strength_level[secutiry_password.strength_level]} </span>
                                                                    :
                                                                    <select value={secutiry_password.strength_level} onChange={event => that.handleInputChangePassword('strength_level', event, i)} className="form-control" >
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
                                                                        onClick={event => that.handleCheckChangePassword('is_retry_attempts', i)}
                                                                        disabled={(isEditPassword != i) ? "disabled" : ""} />
                                                                    <label className="custom-control-label w-100" htmlFor="defaultChecked2">Maximum retry attempts before account is locked</label>
                                                                </div>
                                                            </Col>

                                                            <Col md="2" style={(isEditPassword != i) ? { textAlign: "right" } : {}}>
                                                                {(isEditPassword != i) ?
                                                                    <span className='w-100'>{secutiry_password.password_criteria.retry_attempts}</span>
                                                                    :
                                                                    <input
                                                                        type="text"
                                                                        maxLength="2"
                                                                        className="form-control"
                                                                        id="formGroupExampleInput"
                                                                        value={secutiry_password.password_criteria.retry_attempts}
                                                                        onChange={event => that.handleInputChangePassword('retry_attempts', event, i)}
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
                                                                        onClick={event => that.handleCheckChangePassword('is_alphanumeric_charaters', i)}
                                                                        disabled={(isEditPassword != i) ? "disabled" : ""} />
                                                                    <label className="custom-control-label w-100" htmlFor="defaultChecked3">Alphanumeric charaters(a..z,A..Z)</label>
                                                                </div>
                                                            </Col>
                                                            <Col md="2" style={(isEditPassword != i) ? { textAlign: "right" } : {}}>
                                                                {(isEditPassword != i) ?
                                                                    <span className='w-100'>{secutiry_password.password_criteria.alphanumeric_charaters} </span>
                                                                    :

                                                                    <input
                                                                        type="text"
                                                                        maxlength="2"
                                                                        className="form-control"
                                                                        id="formGroupExampleInput"
                                                                        value={secutiry_password.password_criteria.alphanumeric_charaters}
                                                                        onChange={event => that.handleInputChangePassword('alphanumeric_charaters', event, i)}
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
                                                                        disabled={(isEditPassword != i) ? "disabled" : ""} />
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
                                                                        disabled={(isEditPassword != i) ? "disabled" : ""} />

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
                                                                        disabled={(isEditPassword != i) ? "disabled" : ""} />
                                                                    <label className="custom-control-label w-100" htmlFor="defaultChecked6">Special characters({"~!@#$%^&*()[]{}<>?+_"})</label>
                                                                </div>
                                                            </Col>
                                                            <Col md="2" style={(isEditPassword != i) ? { textAlign: "right" } : {}}>
                                                                {(isEditPassword != i) ?
                                                                    <span className='w-100'>{secutiry_password.password_criteria.special_characters} </span>
                                                                    :

                                                                    <input
                                                                        type="text"
                                                                        maxlength="2"
                                                                        className="form-control"
                                                                        id="formGroupExampleInput"
                                                                        value={secutiry_password.password_criteria.special_characters}
                                                                        onChange={event => that.handleInputChangePassword('special_characters', event, i)} />
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
                                                                        onClick={event => that.handleCheckChangePassword('is_minimum_password', i)}
                                                                        disabled={(isEditPassword != i) ? "disabled" : ""} />
                                                                    <label className="custom-control-label w-100" htmlFor="defaultChecked7">Minimum password length</label>
                                                                </div>
                                                            </Col>
                                                            <Col md="2" style={(isEditPassword != i) ? { textAlign: "right" } : {}}>
                                                                {(isEditPassword != i) ?
                                                                    <span className='w-100 font-weight-bold'>{secutiry_password.password_criteria.minimum_password}</span>
                                                                    :
                                                                    <input
                                                                        type="text"
                                                                        maxlength="2"
                                                                        className="form-control"
                                                                        id="formGroupExampleInput"
                                                                        value={secutiry_password.password_criteria.minimum_password}
                                                                        onChange={event => that.handleInputChangePassword('minimum_password', event, i)}
                                                                    />
                                                                }
                                                            </Col>
                                                        </Row>

                                                    </CardBody>
                                                </Collapse>
                                            </Card>
                                        </div>
                                        <div onClick={() => this.deleteExternal(i)} className='ml-2 minus-button position-absolute' style={{ "top": "15px", "right": "25px" }}>
                                            <a className="delete" ><i class="material-icons text-danger"><i class="fa fa-trash " aria-hidden="true" /></i></a>
                                        </div>
                                    </div>
                                }

                                {(element.authentication_profile_type == 2) &&
                                    <div className='ml-4'>
                                        < SamlProfile
                                            deleteExternal={() => this.deleteExternal(i)}
                                            isExternalProfile={true}
                                            onOpenClose={() => this.setState({ open: (this.state.open == i ? -1 : i) })}
                                            activeIndex={i}
                                            open={this.state.open}
                                            saveAccessIdp={this.saveAccessIdp}
                                            isSaved={isSaved}
                                            AppDeveloperMode={this.props.AppDeveloperMode}
                                            baseapiurl={this.props.baseapiurl}
                                            user={this.props.user}
                                            GetTenantName={GetTenantName}
                                            Toast={Toast}
                                            setState={(data) => this.saveSamlProfile(data, i, 1)}
                                            onSelectedipd={(name) => this.saveSamlProfile({ selected_idp_type: name }, i, 2)}
                                            authentication_profile_type={element.authentication_profile_type}
                                            selected_idp_type={element.selected_idp_type}
                                            is_setuped={element.saml_auth.is_setuped}
                                            idp_type={element.saml_auth.idp_type}
                                            entry_point={element.saml_auth.entry_point}
                                            key={element.saml_auth.key}
                                        />
                                    </div>
                                }
                            </div>
                        )
                    })}

                    {external_access_profiles.length == 0 && <strong className="text-center"><p>No Any External Access Setup!</p><strong></strong></strong>}

                </CardBody>
            </Card>
        )
    }

    addAccessProfile() {
        const { showAccessModal, dataForm } = this.state;
        const that = this;
        return (
            <Modal className="modal-md" isOpen={showAccessModal} toggle={() => this.setState({ showAccessModal: !showAccessModal })} >
                <ModalHeader toggle={() => this.setState({ showAccessModal: !showAccessModal })} className="modal-header">
                    Add External Profile
                </ModalHeader>
                <ModalBody>
                    <Formik
                        initialValues={dataForm}
                        validationSchema={validationSchema}
                        validateOnChange
                        validateOnBlur
                        onSubmit={(values) => {
                            const data = {
                                profile_name: values.profile_name,
                                profile_type: "2",
                            }
                            this.addNewProfile(data);
                        }}>
                        {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                            <Form>
                                <div className="Access-requist form-group" style={{ paddingLeft: '2px' }}>
                                    <label class="form-check-label Auth-label" for="exampleRadios1">
                                        <b>Profile Name<span className='required-star'>*</span>:</b>
                                    </label><br />
                                    <input className='mt-2 form-control' type='text' id="profile_name" name="profile_name" value={values.profile_name} onChange={handleChange} onBlur={handleBlur} />
                                    <ErrorMessage className="validation-error" name='profile_name' component='div' />
                                    <br />
                                    <label class="form-check-label Auth-label" for="exampleRadios1">
                                        <b>Profile Type<span className='required-star'>*</span>:</b>
                                    </label><br />
                                    <select className='mt-2 form-control form-select-modified' name="profile_type" value={values.profile_type} id="profile_type" onChange={handleChange} onBlur={handleBlur} >
                                        <option value=''>Select Profile Type</option>
                                        {/* <option value='1'>Profile Policy</option> */}
                                        <option value='2'>SAML Configuration</option>
                                    </select>
                                    <ErrorMessage className="validation-error" name='profile_type' component='div' />
                                </div>
                                <div className='col-lg-12 mt-4' style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                                    <Button type="button" className="btn btn-secondary  float-left" onClick={() => this.setState({ showAccessModal: !showAccessModal })}>close</Button>
                                    <Button type="submit" className="btn btn-primary  float-right">submit</Button>
                                </div>
                            </Form>
                        )}

                    </Formik>
                </ModalBody>
            </Modal >
        )
    }
}

export default ExternalAccess;