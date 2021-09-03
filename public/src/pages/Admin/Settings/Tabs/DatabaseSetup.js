
import React, { Fragment, Component } from 'react';
import { Row, Col, Card, Button, CardTitle, CardHeader } from 'reactstrap';
import { hiddenDatabasePassword, AppDeveloperMode, GetDataBase } from '../../../../utils/helperFunctions';
import { FormattedMessage } from 'react-intl';

class DatabaseSetup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            database_config: "",
            is_edit_info: false
        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({ database_config: props.database_config })
    }

    render() {
        const { database_config, is_edit_info } = this.state;
        console.log(database_config);
        if (database_config == "") {
            return false;
        }


        return (
            <Fragment>
                <div className="text-center">
                    <h2><FormattedMessage id="setting.tenant_database" /></h2>
                </div>

                {!AppDeveloperMode() &&
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Database</CardTitle>
                        </CardHeader>
                        <Row>
                            <Col xs={12} md={4}><FormattedMessage id="setting.database_url" /><span className='required-star'>*</span></Col>
                            <Col xs={12} md={8}>
                                {!is_edit_info ?
                                    hiddenDatabasePassword(database_config.database_url) :
                                    <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="database_url" value={hiddenDatabasePassword(database_config.database_url)} type="text" />
                                }
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} md={4}><FormattedMessage id="setting.database_name" /><span className='required-star'>*</span></Col>
                            <Col xs={12} md={8}>
                                {!is_edit_info ?
                                    GetDataBase(database_config.database_url) :
                                    <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="user" value={database_config.database_name} type="text" />
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={4}><FormattedMessage id="setting.user" /><span className='required-star'>*</span></Col>
                            <Col xs={12} md={8}>
                                {!is_edit_info ?
                                    database_config.user :
                                    <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="user" value={database_config.user} type="text" />
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={4}><FormattedMessage id="setting.password" /><span className='required-star'>*</span></Col>
                            <Col xs={12} md={8}>
                                {!is_edit_info ? "***********" : <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="password" value={database_config.password} type="password" />}
                            </Col>
                        </Row>
                    </Card>
                }

                {AppDeveloperMode() &&
                    <Card>
                        <CardHeader>
                            <CardTitle>Dev Database</CardTitle>
                        </CardHeader>
                        {(database_config.dev_database_url && database_config.dev_database_url != "") ?
                            <>
                                <Row>
                                    <Col xs={12} md={4}><FormattedMessage id="setting.database_url" /><span className='required-star'>*</span></Col>
                                    <Col xs={12} md={8}>
                                        {!is_edit_info ?
                                            hiddenDatabasePassword(database_config.dev_database_url) :
                                            <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="database_url" value={hiddenDatabasePassword(database_config.database_url)} type="text" />
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} md={4}><FormattedMessage id="setting.database_name" /><span className='required-star'>*</span></Col>
                                    <Col xs={12} md={8}>
                                        {!is_edit_info ?
                                            GetDataBase(database_config.dev_database_url) :
                                            <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="user" value={database_config.database_name} type="text" />
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} md={4}><FormattedMessage id="setting.user" /><span className='required-star'>*</span></Col>
                                    <Col xs={12} md={8}>
                                        {!is_edit_info ?
                                            database_config.dev_user :
                                            <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="user" value={database_config.user} type="text" />
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} md={4}><FormattedMessage id="setting.password" /><span className='required-star'>*</span></Col>
                                    <Col xs={12} md={8}>
                                        {!is_edit_info ? "***********" : <input className="form-control" onChange={event => this.handleInputChange('database_config', event)} name="password" value={database_config.password} type="password" />}
                                    </Col>
                                </Row>

                            </>
                            :
                            <Row>
                                <Col xs={12} md={4}>Dev Database</Col>
                                <Col xs={12} md={8}>
                                    <Button>Setup Database</Button>
                                </Col>
                            </Row>
                        }
                    </Card>
                }
            </Fragment>
        )
    }
}


export default DatabaseSetup;