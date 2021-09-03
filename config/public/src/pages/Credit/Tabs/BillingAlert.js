import React, { Component, Fragment } from "react";
import { Card, CardBody, Modal, ModalBody, ModalHeader } from "reactstrap";

class BillingAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setAmountModal: false,
    };
  }
  render() {
    const { setAmountModal } = this.state;
    return (
      <Fragment>
        <Card>
          <CardBody>
            <div className="Alert-heading">
              <h2>Billing alerts</h2>
            </div>
            <div className="d-flex justify-content-between">
              <p>
                Set up automated billing alerts to receive emails when a
                specified usage amount is reached.
              </p>
              <div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio1"
                    value="option1"
                  />
                  <label class="form-check-label" for="inlineRadio1">
                    Yes
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio2"
                    value="option2"
                  />
                  <label class="form-check-label" for="inlineRadio2">
                    No
                  </label>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <div>
                <h5>
                  <b>USAGE AMOUNT</b>
                </h5>
                $10 USD
              </div>
              <div>
                <button className='btn btn-primary' onClick={() => this.setState({ setAmountModal: true })}>
                  Actions
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        <Modal
          isOpen={setAmountModal}
          toggle={() => this.setState({ setAmountModal: false })}
        >
          <ModalBody>
            <h4 className='mb-4'>Please enter a billing alert amount</h4>
            <p>
              You will receive an email whenever your monthly balance reaches
              the
              <br />
              specified amount below.
            </p>
            <div className="d-flex mb-3  align-items-baseline">
              <h5>$</h5>
              <input
                type="text"
                placeholder="Alert Amount (USD)"
                className="form-control"
              />
            </div>
            <button type="button" class="btn btn-primary btn-lg btn-block">Submit</button>
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

export default BillingAlert;
