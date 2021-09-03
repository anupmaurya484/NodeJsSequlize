import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardFooter, CardHeader, Col, Row, Table } from 'reactstrap';
import './InstallPage.css';
import { FormattedMessage } from 'react-intl';
import ModalConfirmation from '../../../../components/ModalConfirmation';
import moment from 'moment';

class InstallPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data ? this.props.data : {},
            logs: this.props.logs ? this.props.logs.logs.map(log => JSON.parse(log)) : [],
            actionsLog: undefined,
            IsModalConfirmation: false,
        }
    }

    handelConfirm = async (response) => {
        const that = this;
        const { selected_id } = this.state;
        if (response) {
            const { User_data } = this.props.user
            const userId = User_data._id
            const result = await this.props.DeleteApplists({ _id: selected_id });
            const result2 = result.res == 200 ? await this.props.loadApps({ _id: userId }) : result.res;
            this.setState({ IsModalConfirmation: false })
        } else {
            this.setState({ IsModalConfirmation: false })
        }
    }

    componentDidMount = async () => {
        const { logs } = this.state;
        var newLogs = [];
        var tempLogs = new Promise((resolve, reject) => {
            logs.forEach(async (ele, i, array) => {
                var log = newLogs.find(entry => entry['actionId'] === ele['actionId'])
                if (log) {
                    var idx = newLogs.findIndex(el => el['actionId'] === ele['actionId'])
                    //log.start = ele.status === 'Start'? ele.timestamp: log.start;
                    log.end = ele.status === 'End' ? ele.timestamp : log.end;
                    if (['Custom', 'Waiting'].includes(ele.status)) log.log = ele.log;
                    newLogs.splice(idx, 1, log)
                } else {
                    log = {}
                    log.actionId = ele.actionId ? ele.actionId : "";
                    log.activity = ele.activity;
                    log.start = (ele.status == 'Start') ? ele.timestamp : log.start;
                    newLogs.push(log)
                }
                if (i === array.length - 1) resolve(newLogs)
            });
        });
        console.log(await tempLogs)
        this.setState({ actionsLog: await tempLogs })

    }

    render() {
        const { data, logs, actionsLog, IsModalConfirmation} = this.state;
        return (
            <Fragment>
                <Row>
                    <Col sm="8">
                        <Card>
                            <CardHeader className="d-flex">
                                <h5 className="p-2 w-75"><strong><FormattedMessage id="installpage.application_name" /></strong></h5>
                            </CardHeader>
                            <CardBody style={{ "height": "200px" }}>
                                <Row>
                                    <Col sm="6"><dl><dt><FormattedMessage id="installpage.application_id" />: </dt><dd></dd></dl>
                                    </Col>
                                    <Col sm="6"><dl><dt><FormattedMessage id="installpage.status" />:</dt><dd></dd></dl>
                                    </Col>
                                    <Col sm="6"><dl><dt><FormattedMessage id="installpage.application_name" />:</dt><dd></dd></dl></Col>
                                    <Col sm="6"><dl><dt><FormattedMessage id="installpage.description" />:</dt><dd></dd></dl></Col>
                                    <Col sm="6"><dl><dt><FormattedMessage id="installpage.install_version" />:</dt><dd></dd></dl></Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm="4">
                        <Card>
                            <CardHeader>
                                <h5 className="p-2"><strong><FormattedMessage id="installpage.state" /></strong></h5>
                            </CardHeader>
                            <CardBody style={{ "height": "200px" }}>
                                <Row>
                                    <Col sm="6"><strong><FormattedMessage id="installpage.version" />:</strong> </Col>
                                    <Col sm="6"><i className="material-icons float-right" style={{"fontSize": "25px", "vertical-align": "middle"}}>accessibility</i></Col>
                                    {/* <Col sm="12"><strong>End:</strong> </Col>
                                    <Col sm="12"><strong>Duration:</strong>
                                        minute(s)</Col> */}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col sm="12">
                        <Card >
                            <CardHeader>
                                <h5 className="p-2"><strong><FormattedMessage id="installpage.application_version" /></strong></h5>
                            </CardHeader>
                            <CardBody>
                                <Table>
                                    <thead>
                                        <th>#</th>
                                        <th><FormattedMessage id="installpage.version" /></th>
                                        <th><FormattedMessage id="installpage.status" /></th>
                                        <th><FormattedMessage id="installpage.install_date" /></th>
                                        <th><FormattedMessage id="installpage.roll_back" /></th>
                                    </thead>
                                    <tbody className='scrollit' >
                                        
                                            <tr>
                                                <td>1</td>
                                                <td>1.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>2.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>3.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>4.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>5.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>6.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>7.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>8.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>9.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>10.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>11.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>12.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>13.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>14.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>15.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>16.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>17.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>18.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>19.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>20.0</td>
                                                <td>installed</td>
                                                <td>may 6th 2021</td>
                                                <td><i class="fa fa-repeat" onClick={() => this.setState({IsModalConfirmation: true})} aria-hidden="true"></i></td>
                                            </tr>
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Rall Back" text="Are you sure you want to rallback this version?" onClick={(response) => this.handelConfirm(response)} />
            </Fragment>
        )
    }


}

// InstancePage.propTypes = {
//     data: PropTypes.object,
//     logs: PropTypes.object
// }

export default InstallPage;