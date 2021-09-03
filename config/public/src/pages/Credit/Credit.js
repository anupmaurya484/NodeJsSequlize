import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledDropdown, Card } from "reactstrap";

// Import Tabs
import BillingDetails from './Tabs/BillingDetails';
import BillingAlert from './Tabs/BillingAlert';
import BillingHistory from './Tabs/BillingHistory';
import BillingSettings from './Tabs/BillingSettings';
import PaymentMethods from './Tabs/PaymentMethods';
import PromoCode from './Tabs/PromoCode';
// css file
import './Credit.css';
class Credit extends Component {
  constructor() {
    super()
    this.state = {
      active_tab: 1,
    }
  }
  render() {
    let { active_tab } = this.state;

    return (
      <Fragment>
        <div className='credit-page'>
          <div className='credit-heading d-flex justify-content-between page-header mb-3'>
            <div>
              <h3><b>My Wallet</b></h3>
            </div>
            <div className='balance'>
              <h2>$0.00</h2>
              {/* <p>Free Tier</p> */}
            </div>
          </div>
          <Row>
            <Col xs={12} md={2} className="pl-0">
              <div className="flex-column nav">
                <span onClick={() => this.setState({ active_tab: 1 })} className={"d-flex nav-link" + (active_tab === 1 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">account_circle</span>Billing Details</span>
                <span onClick={() => this.setState({ active_tab: 2 })} className={"d-flex nav-link" + (active_tab === 2 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">toggle_on</span>Billing Alert</span>
                <span onClick={() => this.setState({ active_tab: 3 })} className={"d-flex nav-link" + (active_tab === 3 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">lock</span>Payments Method</span>
                <span onClick={() => this.setState({ active_tab: 4 })} className={"d-flex nav-link" + (active_tab === 4 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">vpn_key</span>Billing Settings</span>
                <span onClick={() => this.setState({ active_tab: 5 })} className={"d-flex nav-link" + (active_tab === 5 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">vpn_key</span>Promo code</span>
                <span onClick={() => this.setState({ active_tab: 6 })} className={"d-flex nav-link" + (active_tab === 6 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">vpn_key</span>Billing history</span>
              </div>
            </Col>
            <Col xs={12} md={10} className="details">
              {/* Company details*/}
              {active_tab === 1 &&
                <BillingDetails
                />

              }

              {/* Email configuration */}
              {active_tab === 2 &&
                <BillingAlert
                />
              }

              {/* Security database Start */}
              {active_tab === 3 &&
                <PaymentMethods
                />
              }

              {/* Security password Start */}

              {active_tab === 4 &&
                <BillingSettings
                />
              }

              {active_tab === 5 &&
                <PromoCode
                />
              }

              {active_tab === 6 &&
                <BillingHistory
                />
              }
            </Col>
          </Row>
        </div>
      </Fragment>
    );
  }
}

export default Credit;