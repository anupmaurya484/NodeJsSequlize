import React, { Component, Fragment } from "react";
import { Card, CardBody, Modal, ModalBody, Row, Col, Button, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown} from "reactstrap";
import { Formik, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import DefaultCardDropdown from '../../../components/InputComponent/DefaultCardDropdown';

const validationSchema = Yup.object().shape({
  date: Yup.string().required("expiry date is a required field."),
  carholderName: Yup.string().required("card holder name is a required field."),
  selectCountry: Yup.string().required("country name is a required field."),
  setAdd1: Yup.string().required("Address is a required field."),
  setAdd2: Yup.string().required("Address is a required field."),
  city: Yup.string().required("city name is a required field."),
  selectState: Yup.string().required("state is a required field."),
  zipCode: Yup.string().required("Zip/postal code is a required field."),
});

const initState = {
  date: "",
  carholderName: "",
  selectCountry: "",
  setAdd1: "",
  setAdd2: "",
  city: "",
  selectState: "",
  zipCode: "",
};

class PaymentMethods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setAddcardModal: false,
    };
  }
  render() {
    const { setAddcardModal } = this.state;
    return (
      <Fragment>
        <Card>
          <CardBody>
            <div className="paym-heading">
              <h2>Payment methods</h2>
            </div>
            <div className="d-flex justify-content-between align-items-baseline mb-2">
              <div>
                <p>
                  Please enter your preferred payment method below. You can use
                  a credit / debit card.
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => this.setState({ setAddcardModal: true })}
              >
                Add Card
              </button>
            </div>
            <p>
              Cards will be charged either at the end of the month or whenever
              your balance exceeds the usage threshold. All major credit /<br />
              debit cards accepted.
            </p>
            <div className="saved-card mb-3">
              <div className="d-flex">
                <span>
                  <b>Anup kumar maurya</b>xxxx-<b>0001</b>
                </span>
                <div>
                  <a href="#" class="badge badge-light p-1">
                    DEFAULT
                  </a>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-0">
                <p>Expires 11/2022 • Added on 26 Aug 2021</p>
                <DefaultCardDropdown />
              </div>
            </div>

            <div className="saved-card mb-3">
              <div className="d-flex">
                <span>
                  <b>Anup kumar maurya</b>xxxx-<b>0001</b>
                </span>
              </div>
              <div className="d-flex justify-content-between mt-0">
                <p>Expires 11/2022 • Added on 26 Aug 2021</p>
                <DefaultCardDropdown />
              </div>
            </div>

            <div className="saved-card mb-3">
              <div className="d-flex">
                <span>
                  <b>Anup kumar maurya</b>xxxx-<b>0001</b>
                </span>
              </div>
              <div className="d-flex justify-content-between mt-0">
                <p>Expires 11/2022 • Added on 26 Aug 2021</p>
                <DefaultCardDropdown />
              </div>
            </div>
          </CardBody>
        </Card>
        <Modal
          size="md"
          isOpen={setAddcardModal}
          toggle={() => this.setState({ setAddcardModal: false })}
        >
          <ModalBody toggle={() => this.setState({ setAddcardModal: false })}>
            <Formik
              initialValues={initState}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={(values) => {
                const data = {
                  date: values.date,
                  carholderName: values.carholderName,
                  selectCountry: values.selectCountry,
                  setAdd1: values.setAdd1,
                  setAdd2: values.setAdd2,
                  city: values.city,
                  selectState: values.selectState,
                  zipCode: values.zipCode,
                };
                console.log(data);
                this.setState({ setAddcardModal: false });
              }}
            >
              {({
                values,
                handleChange,
                handleBlur,
                isSubmitting,
                submitCount,
                setFieldValue,
              }) => (
                <Form>
                  <div className="EditCard-heading mb-3">
                    <h4>Edit card</h4>
                  </div>
                  <div>
                    <span>CARD DETAILS</span>
                    <div className="d-flex justify-content-between mt-1">
                      <div className="d-flex align-items-center">
                        <i
                          className="fa fa-cc-visa fa-2x"
                          aria-hidden="true"
                          style={{ color: "rgb(66, 96, 196)" }}
                        ></i>
                        <span className="ml-2">
                          <b>visa xxxx-0001</b>
                        </span>
                      </div>
                      <div>
                        <input
                          type="varchar"
                          placeholder="MM/YY"
                          name="date"
                          id="date"
                          value={values.date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-control"
                        />
                        <ErrorMessage
                          className="validation-error"
                          name="date"
                          component="div"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <input
                        className="form-control"
                        type="text"
                        name="carholderName"
                        id="carholderName"
                        placeholder="Cardholder name"
                        value={values.carholderName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage
                        className="validation-error"
                        name="carholderName"
                        component="div"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-weight-bold">BILLING ADDRESS</span>
                    <p>
                      please provide the billing address associated with the
                      card you've provided.
                    </p>
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="gridCheck"
                        />
                        <label className="form-check-label" for="gridCheck">
                          Billing address is the same as my account address
                        </label>
                      </div>
                    </div>
                    <select
                      className="custom-select form-select-modified"
                      id="selectCountry"
                      name="selectCountry"
                      value={values.selectCountry}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option selected>Select Your Country</option>
                      <option value="1">India</option>
                      <option value="2">USA</option>
                      <option value="3">AUS</option>
                    </select>
                    <ErrorMessage
                      className="validation-error"
                      name="selectCountry"
                      component="div"
                    />
                    <div className="mt-3">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Address Line 1"
                        Name="setAdd1"
                        id="setAdd1"
                        value={values.setAdd1}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage
                        className="validation-error"
                        name="setAdd1"
                        component="div"
                      />
                    </div>
                    <div className="mt-3">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Address Line 2"
                        Name="setAdd2"
                        id="setAdd2"
                        value={values.setAdd2}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage
                        className="validation-error"
                        name="setAdd2"
                        component="div"
                      />
                    </div>
                    <div className="mt-3">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="City"
                        id="city"
                        name="city"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage
                        className="validation-error"
                        name="city"
                        component="div"
                      />
                    </div>
                    <Row className="mt-3">
                      <Col md="6">
                        <select
                          className="custom-select form-select-modified"
                          id="selectState"
                          name="selectState"
                          value={values.selectState}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option selected>Select Your State</option>
                          <option value="1">Gujarat</option>
                          <option value="2">Uttarpradesh</option>
                          <option value="3">Maharashtra</option>
                        </select>
                        <ErrorMessage
                          className="validation-error"
                          name="selectState"
                          component="div"
                        />
                      </Col>
                      <Col md="6">
                        <div className="">
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Zip/Postal Code"
                            id="zipCode"
                            name="zipCode"
                            value={values.zipCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            className="validation-error"
                            name="zipCode"
                            component="div"
                          />
                        </div>
                      </Col>
                    </Row>
                    <div className="mt-3">
                      <Button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                      >
                        <i className="fa fa-lock mr-1" aria-hidden="true"></i>
                        Update Card Information
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

export default PaymentMethods;
