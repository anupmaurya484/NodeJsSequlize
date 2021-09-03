import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Stats from './StatsStep';
import '../TenantRequest.css';

const validationSchema = Yup.object().shape({
    address: Yup.string().required("Address is a required field."),
    city: Yup.string().required("City is a required field."),
    state: Yup.string().required("State is a required field."),
    country: Yup.string().required("Country is a required field."),
    zip_code: Yup.string().required("zip code name is a required field."),
    mobile_number: Yup.string().required("mobile number is a required field."),
});

// let config2 = config
const SecondStep = props => {
    
    const [state, updateState] = useState({
        address: "",
        city: '',
        state: '',
        country: '',
        zip_code: '',
        mobile_number: "",
    });

    useEffect(() => {
        updateState({
            ...state,
            address: (props.data && props.data.address) ? state.address : "",
            city: (props.data && props.data.city) ? state.city : "",
            state: (props.data && props.data.state) ? state.state : "",
            country: (props.data && props.data.country) ? state.country : "",
            zip_code: (props.data && props.data.zip_code) ? state.zip_code : "",
            mobile_number: (props.data && props.data.mobile_number) ? state.mobile_number : "",
        });
    }, [])

    const initState = {
        address: state.address,
        city: state.city,
        state: state.state,
        country: state.country,
        zip_code: state.zip_code,
        mobile_number: state.mobile_number,
    }

    return (
        <>
            <h1 className="m-auto w-75">Tenant Postal Address</h1>
            <Formik
                initialValues={initState}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={(values) => {
                    props.handleNext(values, 2, props);
                }}>
                {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                    <Form id="LoginFormData">
                        <div className="m-auto w-75 form mb-5 pt-5 pb-3 body-content">
                            <div className="form-group">
                                <span className="Country-label">Address<label className='required'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="address"
                                    name="address"
                                    maxLength="256"
                                    value={values.address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='address' component='div' />
                            </div>
                            <div className="form-group">
                                <span className="Country-label">City<label className='required'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="city"
                                    name="city"
                                    maxLength="256"
                                    value={values.city}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='city' component='div' />
                            </div>
                            <div className="form-group">
                                <span className="Country-label">State<label className='required'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="state"
                                    name="state"
                                    maxLength="256"
                                    value={values.state}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='state' component='div' />
                            </div>
                            <div className="form-group">
                                <span className="Country-label">State<label className='required'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="country"
                                    name="country"
                                    maxLength="256"
                                    value={values.country}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='country' component='div' />
                            </div>
                            <div className="form-group">
                                <span className="Country-label">Zip Code<label className='required'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="zip_code"
                                    name="zip_code"
                                    maxLength="256"
                                    value={values.zip_code}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='zip_code' component='div' />
                            </div>
                            <div className="form-group">
                                <span className="Country-label">Mobile Number<label className='required'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="mobile_number"
                                    name="mobile_number"
                                    maxLength="256"
                                    value={values.mobile_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='mobile_number' component='div' />
                            </div>
                        </div>
                        <div className="justify-content-between">
                            <Button size="sm" type="button" onClick={props.previousStep} className='btn btn-primary float-left'>{'Previous'}</Button>
                            <Button size="sm" type="submit" className='btn btn-primary float-right'>{'Next'}</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );



};


export default SecondStep;