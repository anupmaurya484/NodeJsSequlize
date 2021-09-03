import React, { Fragment, useState, useEffect } from 'react';
import { FormGroup, Label, Input, Col, Button } from 'reactstrap';
import { Formik, Form, ErrorMessage } from 'formik';
import { FormattedMessage } from 'react-intl';
import * as Yup from 'yup';
import Stats from './StatsStep';
import '../TenantRequest.css';

let validationObj = {
    company_name: Yup.string().required("company name is a required field."),
    email: Yup.string().email().matches(/^([\w-\.]+@(?!gmail.com)(?!yahoo.com)(?!hotmail.com)(?!yahoo.co.in)(?!aol.com)(?!abc.com)(?!xyz.com)(?!pqr.com)(?!rediffmail.com)(?!live.com)(?!outlook.com)(?!me.com)(?!msn.com)(?!ymail.com)([\w-]+\.)+[\w-]{2,4})?$/, 'Please Enter valid Business Email Address.').required("Email is a required field."),
    hostname: Yup.string().test('is-incorrect', 'hostname is invalid, Please correct.', async value => {
        console.log('running async validations')
        return !["intranet", "home", "www", "dashboard", "api", "history", "reports", "workflow", "public"].includes(value)
    }).matches(/^[a-zA-Z]+$/, 'Please input alphanumeric characters only').required("Email is a required field.")
        .required("domain name is a required field."),
    emailDomain: Yup.string().when('email', (email, schema) => {
        return schema.test({ test: emailDomain => !(email && email.split("@")[1] != emailDomain), message: "Your tenant business email and tenant email domain should be same, Please correct." })
    }).required("email Domain is a required field."),
}

const FirstStep = props => {
    console.log(props.user);
    if (props.user && props.user.level == "8") {
        validationObj = {
            firstname: Yup.string().required("first name is a required field."),
            lastname: Yup.string().required("last name is a required field."),
            ...validationObj
        }
    }
    const validationSchema = Yup.object().shape(validationObj);

    const [state, updateState] = useState({
        firstname: '',
        lastname: '',
        emailDomain: '',
        company_name: "",
        email: "",
        emailDomain: "",
        hostname: "",
        isEmailUnique: false,
        isTenantUnique: false,
        isEmailDomain: false
    });

    useEffect(() => {
        console.log(props);
        updateState({
            ...state,
            firstname: (props.data && props.data.firstname) ? state.firstname : "",
            lastname: (props.data && props.data.lastname) ? state.lastname : "",
            company_name: (props.data && props.data.company_name) ? state.company_name : "",
            email: (props.data && props.data.email) ? state.email : "",
            emailDomain: (props.data && props.data.emailDomain) ? state.emailDomain : "",
            hostname: (props.data && props.data.hostname) ? state.hostname : "",
        });
    }, [])



    const _handleKeyDown = async ({ target }) => {
        if (target.value != "") {
            var payload = { name: target.name, value: target.value }
            const result = await props.CheckTenantValidForm(payload);
            const status = result.data;
            if (target.name == "email") {
                const emailDomain = status == false ? (target.value.split("@").length == 2 ? target.value.split("@")[1] : "") : ""
                updateState({ ...state, isEmailUnique: status, emailDomain: emailDomain });
            }
            if (target.name == "hostname") {
                updateState({ ...state, isTenantUnique: status });
            }
            if (target.name == "emailDomain") {
                updateState({ ...state, isEmailDomain: status });
            }
        }
    }

    let initState = {
        company_name: state.company_name,
        email: state.email,
        emailDomain: state.emailDomain,
        hostname: state.hostname,
    }
    if (props.user && props.user.level == "8") {
        initState = {
            firstname: state.firstname,
            lastname: state.lastname,
            ...initState
        }
    }

    const isLoginButtonDisabled = (state.isEmailUnique || state.isTenantUnique || state.inValidTenant || state.isEmailDomain);

    return (
        <>
            <h1>Tenant information</h1>
            <Formik
                initialValues={initState}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={(values) => {
                    props.handleNext(values, 1, props);
                }}>
                {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                    <Form id="LoginFormData">
                        <div className="form mb-5 pt-5 pb-3 body-content">
                            {(props.user && props.user.level == "8") &&
                                <div className="form-group">
                                    <span className="Country-label"><FormattedMessage id="Tenant.firstname" /><label className='required-star'>*</label></span><br />
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        maxLength="256"
                                        value={values.firstname}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <ErrorMessage className="validation-error" name='firstname' component='div' />
                                </div>

                            }
                            {(props.user && props.user.level == "8") &&
                                <div className="form-group">
                                    <span className="Country-label"><FormattedMessage id="Tenant.lastname" /><label className='required-star'>*</label></span><br />
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="lastname"
                                        name="lastname"
                                        maxLength="256"
                                        value={values.lastname}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <ErrorMessage className="validation-error" name='lastname' component='div' />
                                </div>
                            }

                            <div className="form-group">
                                <span className="Country-label">Tenant Business Name<label className='required-star'>*</label></span><br />
                                <input
                                    className="form-control"
                                    type="text"
                                    id="company_name"
                                    name="company_name"
                                    maxLength="256"
                                    value={values.company_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <ErrorMessage className="validation-error" name='company_name' component='div' />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Tenant Business Email</label><label className='required-star'>*</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="email"
                                    name="email"
                                    type="text"
                                    value={values.email}
                                    maxLength="256"
                                    onChange={handleChange}
                                    onBlur={(e) => { _handleKeyDown(e); handleBlur(e); }}
                                />
                                <ErrorMessage className="validation-error" name='email' component='div' />
                                {state.isEmailUnique === true && <p className="validation-error" style={{ margin: "5px" }}>Tenant Business Email Already Exist.</p>}
                            </div>
                            <div className="form-group">
                                <span className="Country-label">Tenant domain (<span>{props.getUrl().split("://")[0] + "://"+ (values.hostname ? values.hostname : "<tenant_domain>") +"." + props.getUrl().split("://")[1]}</span>)<label className='required-star'>*</label> </span><br />
                                <input
                                    className="form-control"
                                    id="hostname"
                                    name="hostname"
                                    type="text"
                                    value={values.hostname}
                                    maxLength="256"
                                    onBlur={(e) => { _handleKeyDown(e); handleBlur(e); }}
                                    onChange={handleChange}
                                />
                                <ErrorMessage className="validation-error" name='hostname' component='div' />
                                {state.isTenantUnique === true && <p className="validation-error" style={{ margin: "5px" }}>Tenant Domain Already Exist.</p>}
                                {state.inValidTenant === true && <p className="validation-error" style={{ margin: "5px" }}>Tenant Domain Not Valid.</p>}
                            </div>
                            <div className="form-group">
                                <span className="Country-label">Email Domain (Allow only Business email domain, Ex: abc.com) <label className='required-star'>*</label> </span><br />
                                <input
                                    id="emailDomain"
                                    name="emailDomain"
                                    type="text"
                                    className="form-control"
                                    value={values.emailDomain}
                                    maxLength="256"
                                    onChange={handleChange}
                                    onBlur={(e) => { _handleKeyDown(e); handleBlur(e); }} />
                                <ErrorMessage className="validation-error" name='emailDomain' component='div' />
                                {state.isEmailDomain === true && <p className="validation-error" style={{ margin: "5px" }}>Email Domain Already Exist.</p>}
                            </div>
                        </div>
                        <div className="justify-content-between">
                            <Button size="sm" type="submit" disabled={isLoginButtonDisabled} className='btn btn-primary float-right'>{'Next'}</Button>
                        </div>
                    </Form>
                )}

            </Formik>


        </>
    );
};

export default FirstStep;