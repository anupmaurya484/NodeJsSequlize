import React, { Component, Fragment } from 'react';
import {Card,CardBody} from 'reactstrap';
import { Link } from "react-router-dom";

class BillingHistory extends Component {
    state = {}
    render() {
        return (
            <Fragment>
                <Card>
                    <CardBody>
                        <div className='history-heading'>
                            <h2>Billing history</h2>
                        </div>
                        <table className='Bill-hist'>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr>
                                    <td>March 01,2021</td>
                                    <td><Link to="#">Invoice for February 2021</Link></td>
                                    <td>$0.51</td>
                                    <td>Download:<Link to="#">PDF</Link>.<Link to="#" >CSV</Link></td>
                                </tr>
                                <tr>
                                    <td>February 10,2021</td>
                                    <td>payment(visa 9766)</td>
                                    <td>$0.51</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>March 01,2021</td>
                                    <td><Link to="#" >Invoice for sept 2020</Link ></td>
                                    <td>$0.51</td>
                                    <td>Download:<Link to="#">PDF</Link >.<Link to="#">CSV</Link ></td>
                                </tr>
                                <tr>
                                    <td>March 01,2021</td>
                                    <td>payment(visa 9766)</td>
                                    <td>$0.51</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>

                    </CardBody>
                </Card>
            </Fragment>
        );
    }
}

export default BillingHistory;