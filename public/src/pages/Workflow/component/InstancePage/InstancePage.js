import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardFooter, CardHeader, Col, Row, Table } from 'reactstrap';
import './InstancePage.scss';
import moment from 'moment';

class InstancePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data ? this.props.data : {},
            logs: this.props.logs ? this.props.logs.logs.map(log => JSON.parse(log)) : [],
            actionsLog: undefined
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
        const { data, logs, actionsLog } = this.state;
        return (
            <Fragment>
                <Row>
                    <Col sm="8">
                        <Card>
                            <CardHeader className="d-flex">
                                <h5 className="p-2 w-75"><strong>Instance details</strong></h5>
                            </CardHeader>
                            <CardBody style={{ "height": "200px" }}>
                                <Row>
                                    <Col sm="6"><dl><dt>Instance ID: </dt><dd>{data.id}</dd></dl>
                                    </Col>
                                    <Col sm="6"><dl><dt>Status:</dt><dd>{data.data.state}</dd></dl>
                                    </Col>
                                    <Col sm="6"><dl><dt>Workflow Name:</dt><dd>{data.data.workflowName}</dd></dl></Col>
                                    <Col sm="6"><dl><dt>Description:</dt><dd>{data.data.workflowDescription}</dd></dl></Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm="4">
                        <Card>
                            <CardHeader>
                                <h5 className="p-2"><strong>State</strong></h5>
                            </CardHeader>
                            <CardBody style={{ "height": "200px" }}>
                                <Row>
                                    <Col sm="12"><strong>Start:</strong> {data.data.start && moment(data.data.start).format("MMM Do YYYY, h:mm a")}</Col>
                                    <Col sm="12"><strong>End:</strong> {data.data.end && moment(data.data.end).format("MMM Do YYYY, h:mm a")}</Col>
                                    <Col sm="12"><strong>Duration:</strong> {data.data.start && data.data.end &&
                                        moment(data.data.end).diff(moment(data.data.start), 'minutes')} minute(s)</Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col sm="12">
                        <Card>
                            <CardHeader>
                                <h5 className="p-2"><strong>Logs</strong></h5>
                            </CardHeader>
                            <CardBody>
                                <Table>
                                    <thead>
                                        <th>Sequence</th>
                                        <th>Action Name</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Detail</th>
                                    </thead>
                                    <tbody>
                                        {actionsLog && actionsLog.map((log, i) => (
                                            <tr>
                                                <td>{i}</td>
                                                <td>{log.activity}</td>
                                                <td>{log.start && moment(log.start).format("MMM Do YYYY, h:mm a")}</td>
                                                <td>{log.end && moment(log.end).format("MMM Do YYYY, h:mm a")}</td>
                                                <td>{log.log}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Fragment>
        )
    }


}

InstancePage.propTypes = {
    data: PropTypes.object,
    logs: PropTypes.object
}

export default InstancePage;