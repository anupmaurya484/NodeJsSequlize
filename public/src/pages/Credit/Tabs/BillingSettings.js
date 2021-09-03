import React, { Component, Fragment } from "react";
import { Card, CardBody, ModalBody, Modal, Col, Row, Button } from "reactstrap";
import { Formik, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  selectCountry: Yup.string().required("country name is a required field."),
  setAdd1: Yup.string().required("Address is a required field."),
  setAdd2: Yup.string().required("Address is a required field."),
  city: Yup.string().required("city name is a required field."),
  selectState: Yup.string().required("state is a required field."),
  zipCode: Yup.string().required("Zip/postal code is a required field."),
  phonenum: Yup.string().required("phone number code is a required field."),
  
});

const initState = {
  selectCountry: "",
  setAdd1: "",
  setAdd2: "",
  city: "",
  selectState: "",
  zipCode: "",
  phonenum: ""
};

class BillingSettings extends Component {
  constructor() {
    super();
    this.state = {
      seteditaddModal: false,
    };
  }
  render() {
    const { seteditaddModal } = this.state;
    return (
      <Fragment>
        <Card>
          <CardBody>
            <div className="BillSetting-heading">
              <h2>Billing Settings</h2>
            </div>
            <div className="">
              <span className="font-weight-bold">ADDRESS</span>
              <p>
                This address appears on your monthly invoice and should be the
                legal address of your home or business
              </p>
              <div className="d-flex justify-content-between">
                <p>118, manipurshottam,surat, GJ - 394520,IN</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => this.setState({ seteditaddModal: true })}
                >
                  Edit Address
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        <Modal
          size="md"
          isOpen={seteditaddModal}
          toggle={() => this.setState({ seteditaddModal: false })}
        >
          <ModalBody toggle={() => this.setState({ seteditaddModal: false })}>
            <h4>Edit address</h4>
            <p>
              This address appears on your monthly invoice and should be the
              legal address of your home or business.
            </p>
            <Formik
              initialValues={initState}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={(values) => {
                const data = {
                  selectCountry: values.selectCountry,
                  setAdd1: values.setAdd1,
                  setAdd2: values.setAdd2,
                  city: values.city,
                  selectState: values.selectState,
                  zipCode: values.zipCode,
                  phonenum: values.phonenum
                };
                console.log(data);
                this.setState({ seteditaddModal: false });
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
                  <div className="mt-4">
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
                      <input
                        className="form-control"
                        type="varchar"
                        placeholder="Phone number"
                        Name="phonenum"
                        id="phonenum"
                        value={values.phonenum}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage
                        className="validation-error"
                        name="phonenum"
                        component="div"
                      />
                    </div>
                    <div className="mt-3">
                      <Button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                      >
                        Save Address
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

export default BillingSettings;
