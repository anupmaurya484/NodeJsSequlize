
import React, { Component, Fragment } from 'react';
import { Row, Col, Card, Button, CardTitle, CardHeader } from 'reactstrap';
import { FormattedMessage } from 'react-intl';

class EmailSetup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            is_edit_info: false,
            smtp_config: "",
            temp_smtp_config: "",
        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({ smtp_config: props.smtp_config })
    }


    setEditMode(is_edit_info) {
        if (is_edit_info) {
            this.setState({ is_edit_info: is_edit_info, 'temp_smtp_config': this.state.smtp_config })
        } else {
            this.setState({ is_edit_info: false, smtp_config: this.state['temp_smtp_config'], 'temp_smtp_config': undefined })
        }
    }

    handleInputChange(type, e) {
        const { name, value, type: inputType, checked } = e.target
        const final_value = (inputType === "checkbox") ? checked : value
        this.setState({ [type]: { ...this.state[type], [name]: final_value } });
    }

    saveData = () => {
        this.setState({ is_edit_info: false });
        this.props.saveData(this.state.smtp_config);
    }


    render() {
        const { smtp_config, is_edit_info } = this.state;
        return (
            <Fragment>
                <div className="text-center">
                    <h2><FormattedMessage id="setting.smtp_config" /></h2>
                </div>
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-end">
                            {!is_edit_info && <span className="material-icons cursor-pointer" onClick={() => this.setEditMode(true)}>
                                create
                            </span>}
                            {is_edit_info && <Fragment><span className="material-icons cursor-pointer" onClick={(e) => this.saveData(e)}>
                                save
                            </span>
                                <span className="material-icons cursor-pointer" onClick={() => this.setEditMode(false)}>
                                    close
                            </span>
                            </Fragment>
                            }
                        </div>
                    </CardHeader>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.server" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                smtp_config.smtp_server :
                                <input className="form-control" onChange={event => this.handleInputChange('smtp_config', event)} name="smtp_server" value={smtp_config.smtp_server} type="text" />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.port" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                smtp_config.smtp_port :
                                <input className="form-control" onChange={event => this.handleInputChange('smtp_config', event)} name="smtp_port" value={smtp_config.smtp_port} type="text" />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.from_mail" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                smtp_config.smtp_fromMail :
                                <input className="form-control" onChange={event => this.handleInputChange('smtp_config', event)} name="smtp_fromMail" value={smtp_config.smtp_fromMail} type="text" />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.authentication_user" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                smtp_config.user :
                                <input className="form-control" onChange={event => this.handleInputChange('smtp_config', event)} name="user" value={smtp_config.user} type="text" />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={4}><FormattedMessage id="setting.authentication_password" />{is_edit_info && <span className='required-star'>*</span>}</Col>
                        <Col xs={12} md={8}>
                            {!is_edit_info ?
                                '********' :
                                <input className="form-control" onChange={event => this.handleInputChange('smtp_config', event)} value={smtp_config.pass} name="pass" type="password" />
                            }</Col>
                    </Row>
                </Card>
            </Fragment>

        )
    }
}


export default EmailSetup;