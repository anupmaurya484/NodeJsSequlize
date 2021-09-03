import React, { Component, Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';

class BillingDetails extends Component {
    state = {  }
    render() { 
        return ( 
            <Fragment>
                <Card>
                    <CardBody>
                        <h2>Estimated Costs for this billing period</h2>
                        <p>This is the current costs for your usage this billing period. A breakdown of your costs is available below </p>
                        <h1>$0.00</h1>
                    </CardBody>
                </Card>
            </Fragment>
         );
    }
}
 
export default BillingDetails;