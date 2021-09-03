
import React, { Component, Fragment } from 'react';
import { Row, Col, Card, CardHeader } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import API from '../../../../config';
import UploadImage from '../../../../components/UploadImage'
import '../Settings.css';
class CompanyProfile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            is_edit_info: false,
            company_logo: "",
            temp_company_info: "",
            company_id: null,
            company_info: {
                company_name: "",
                address: "",
                city: "",
                state: "",
                country: "",
                zip_code: ""
            },
            personal_info: {
                firstname: "",
                lastname: ""
            },
            isUploadLogo: false,
        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({ company_id: props.company_id, company_info: props.company_info, company_logo: this.props.company_logo })
    }

    setEditMode(is_edit_info) {
        if (is_edit_info) {
            this.setState({ is_edit_info: is_edit_info, 'temp_company_info': this.state.company_info })
        } else {
            this.setState({ is_edit_info: false, company_info: this.state['temp_company_info'], 'temp_company_info': undefined })
        }
    }

    handleInputChange(type, e) {
        const { name, value, type: inputType, checked } = e.target
        const final_value = (inputType === "checkbox") ? checked : value
        this.setState({ [type]: { ...this.state[type], [name]: final_value } });
    }

    async handleFileInput(files, is_from) {
        // is_from 1 for company 2 user  
        if (files) {
            console.log(this.state.company_id);
            const data = new FormData()
            data.append('file', files)
            const response = await this.props.UploadPhoto(data)
            if (response) {
                console.log(this.state.company_id);
                const id = this.state.company_id
                const payload = {
                    id,
                    logo_url: response.filename,
                    update_type: is_from
                }
                const response1 = await this.props.EditProfilePhoto(payload);
                console.log(response1);
                if (response1) {
                    const company_logo = response1.data.logo_url;
                    this.setState({ company_logo, isUploadLogo: false })
                }
            }
        } else {
            this.setState({ isUploadLogo: false })
        }
    }

    onRemoveImage = () => {
        this.props.RemoveProfilePhoto()
        this.setState({ company_logo: "", isUploadLogo: false })
    }

    saveData = () => {
        this.setState({ is_edit_info: false });
        let company_info = this.state.company_info;
        company_info['company_logo'] = this.state.company_logo;
        this.props.saveData(this.state.company_info);
    }

    render() {
        const { isUploadLogo, is_edit_info, company_info } = this.state;
        const company_logo = API.API_URL + '/download?filename=' + this.state.company_logo
     
        return (
            <Fragment>
                {isUploadLogo &&
                    <UploadImage
                        company_logo={company_logo}
                        onRemoveImage={(e) => this.onRemoveImage()}
                        onUpdateImage={(e) => this.handleFileInput(e, 1)}
                        onClose={() => this.setState({ isUploadLogo: false })} />}
                <div className="text-center company">
                    <h2>{company_info.company_name}</h2>
                </div>
                <Card>
                    <CardHeader>
                        <div className="d-flex ">
                            <div style={{ position: 'relative', width: "98%" }}>
                                <img src={company_logo} onError={(e) => { e.target.onerror = null; e.target.src = 'https://portal.glozic.com/assets/logo-small.png' }} alt="" height="22" />
                                {is_edit_info &&
                                    <span style={{ fontSize: "14px" }} className="material-icons cursor-pointer justify-content-end" onClick={(e) => this.setState({ isUploadLogo: true })}>create</span>
                                }
                            </div>
                            {!is_edit_info &&
                                <span class="material-icons cursor-pointer" onClick={() => this.setEditMode(true)}>create</span>}

                            {is_edit_info &&
                                <Fragment>
                                    <span className="material-icons cursor-pointer justify-content-end" onClick={this.saveData}>
                                        save
                                    </span>
                                    <span className="material-icons cursor-pointer justify-content-end" onClick={() => this.setEditMode(false)}>
                                        close
                                    </span>
                                </Fragment>
                            }
                        </div>
                    </CardHeader>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.company_name" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                company_info.company_name :
                                <input className="form-control" name="company_name" onChange={event => this.handleInputChange('company_info', event)} value={company_info.company_name} type="text" />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.address" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                company_info.address :
                                <input className="form-control" name="address" onChange={event => this.handleInputChange('company_info', event)} value={company_info.address} type="text" />
                            }
                        </Col>
                    </Row>


                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.city" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                company_info.city :
                                <input className="form-control" name="city" onChange={event => this.handleInputChange('company_info', event)} value={company_info.city} type="text" />
                            }
                        </Col>
                    </Row>


                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.state" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                company_info.state :
                                <input className="form-control" name="state" onChange={event => this.handleInputChange('company_info', event)} value={company_info.state} type="text" />
                            }
                        </Col>
                    </Row>


                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.country" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                company_info.country :
                                <input className="form-control" name="country" onChange={event => this.handleInputChange('company_info', event)} value={company_info.country} type="text" />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.zip_code" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                company_info.zip_code :
                                <input className="form-control" name="zip_code" onChange={event => this.handleInputChange('company_info', event)} value={company_info.zip_code} type="text" />
                            }
                        </Col>
                    </Row>

                </Card>
            </Fragment>

        )
    }
}


export default CompanyProfile;