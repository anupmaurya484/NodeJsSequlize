import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import Select from "react-select";
import { FormattedMessage } from 'react-intl';
import { Formik, Form, ErrorMessage } from 'formik';
import { VerifyConnectionSetup } from '../../../../actions/admin';
import { GetDataBase, Toast, ChangeDataName } from '../../../../utils/helperFunctions';
import * as Yup from 'yup';
import Stats from './StatsStep';
import '../TenantRequest.css';

const authenticationOptions = [{
    "label": "None",
    "value": "None"
}, {
    "label": "Username / Password",
    "value": "UP"
}];

const validationSchema = Yup.object().shape({
    connection_hostname: Yup.string().required("hostname is a required field."),
    post: Yup.string().required("post is a required field."),
    authentication: Yup.object().required("authentication is a required field."),
    databaseName: Yup.string().required("databaseName is a required field."),
});



// let config2 = config
const ThirdStep = props => {

    const [connectionType, updateConnectionType] = useState(1);
    const [connectionUrl, updateConnectionUrl] = useState("");


    const [state, updateState] = useState({
        is_system: false,
        database_url: "",
        dev_database_url: "",
        connection_hostname: "",
        post: "",
        username: "",
        password: "",
        databaseName: "",
        isVerify: false
    });

    useEffect(() => {
        updateState({
            ...state,
            is_system: (props.data && props.data.is_system) ? state.is_system : false
        });
    }, [])

    const VerifyConnection = (url) => {
        try {
            if (!state.is_system) {
                var database_url = (url ? (url + "?authSource=admin&readPreference=primary") : connectionUrl);
                var databaseName = GetDataBase(database_url)
                var dev_database_url = ChangeDataName(database_url, (databaseName + "-dev"))
                console.log(dev_database_url);
                updateState({ ...state, database_url, dev_database_url });
                const payload = {
                    database_url: database_url,
                    database_url_dev: dev_database_url
                }
                VerifyConnectionSetup(payload).then(response => {
                    if (response.status) {
                        updateState({ ...state, isVerify: true });
                        props.handleNext({ ...state, database_url, dev_database_url }, 3, props);
                    } else {
                        Toast(response.message, 'error');
                    }
                });
            } else {
                const payload = {
                    database_url: false,
                    database_url_dev: false
                }
                updateState({ ...state, isVerify: true });
                props.handleNext({ ...state, database_url, dev_database_url }, 3, props);
            }
        } catch (err) {
            console.log(err);
        }

    }

    const initState = {
        is_system: state.is_system,
        connection_hostname: state.connection_hostname,
        post: state.post,
        authentication: { "label": "None", "value": "None" },
        username: '',
        password: '',
        databaseName: '',
    }

    return (
        <>
            <h1 className="m-auto w-75">Tenant Database Setup</h1>
            <div className="mt-5 mb-4">
                <div className="custom-control custom-switch m-auto w-75 ">
                    <input type="checkbox" className="custom-control-input" id="customSwitch1" checked={state.is_system}
                        onChange={(e) => {
                            updateState({ ...state, is_system: e.target.checked })
                        }}

                    />
                    <label className="custom-control-label" htmlFor="customSwitch1"><FormattedMessage id="Tenant.system_assigned_database" /> ? {state.is_system}</label>
                </div>
            </div>
            <div className={(state.is_system ? 'disabledDiv' : '')}>
                <div className="d-flex w-75 m-auto">
                    <div className="custom-control custom-checkbox mr-2 mb-4 ">
                        <input checked={connectionType == 1} onClick={() => updateConnectionType(1)} type="checkbox" className="custom-control-input" id="defaultChecked1" />
                        <label className="custom-control-label w-100" for="defaultChecked1">connection url</label>
                    </div>
                    <div className="custom-control custom-checkbox mb-4">
                        <input checked={connectionType == 2} onClick={() => updateConnectionType(2)} type="checkbox" className="custom-control-input" id="defaultChecked2" />
                        <label className="custom-control-label w-100" for="defaultChecked2">Fill in connection fields individually</label>
                    </div>
                </div>


                <div className={`form-group m-auto w-75 ` + (connectionType == 2 ? 'disabledDiv' : '')}>
                    <span className="Country-label">connection url<label className='ml-1 required-star'>*</label></span><br />
                    <input
                        className="form-control"
                        type="text"
                        onChange={(e) => updateConnectionUrl(e.target.value)}
                        id="address"
                        name="address"
                        maxLength="256" />
                </div>

                <div className="or-seperator mt-5"><i>or</i></div>

                <Formik
                    initialValues={initState}
                    validationSchema={validationSchema}
                    validateOnChange
                    validateOnBlur
                    onSubmit={(values) => {
                        const url = "mongodb://" + encodeURIComponent(values.username) + ":" +
                            encodeURIComponent(values.password) + ((values.authentication.value != "None") ? ('@' + values.connection_hostname) : values.connection_hostname) + ":" +
                            values.post + "/" +
                            values.databaseName;
                        VerifyConnection(url);
                        console.log(values);
                        console.log(url);
                    }}>
                    {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                        <Form id="LoginFormData">
                            <div className={`m-auto w-75 form mb-5 pt-5 pb-3 body-content ` + (connectionType == 1 ? 'disabledDiv' : '')}>
                                <div className="form-group">
                                    <span className="Country-label">Host Name<label className='required-star'>*</label></span><br />
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="connection_hostname"
                                        name="connection_hostname"
                                        maxLength="256"
                                        value={values.connection_hostname}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <ErrorMessage className="validation-error" name='connection_hostname' component='div' />
                                </div>
                                <div className="form-group">
                                    <span className="Country-label">Port<label className='required-star'>*</label></span><br />
                                    <input
                                        className="form-control"
                                        type="number"
                                        id="post"
                                        name="post"
                                        maxLength="256"
                                        value={values.post}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <ErrorMessage className="validation-error" name='post' component='div' />
                                </div>

                                <div className="form-group">
                                    <span className="Country-label">Authentication Type<label className='required-star'>*</label></span><br />
                                    <Select
                                        id="authentication"
                                        name="authentication"
                                        isSearchable="true"
                                        options={authenticationOptions}
                                        value={values.authentication}
                                        onChange={e => setFieldValue('authentication', e)}
                                    />
                                    <ErrorMessage className="validation-error" name='authentication' component='div' />
                                </div>
                                {values.authentication.value != 'None' &&
                                    <div className="form-group">
                                        <span className="Country-label">Username<label className='required-star'>*</label></span><br />
                                        <input
                                            className="form-control"
                                            type="text"
                                            required
                                            id="username"
                                            name="username"
                                            maxLength="256"
                                            value={values.username}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <ErrorMessage className="validation-error" name='username' component='div' />
                                    </div>
                                }

                                {values.authentication.value != 'None' &&
                                    <div className="form-group">
                                        <span className="Country-label">Password<label className='required-star'>*</label></span><br />
                                        <input
                                            className="form-control"
                                            type="password"
                                            required
                                            id="password"
                                            name="password"
                                            maxLength="256"
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <ErrorMessage className="validation-error" name='password' component='div' />
                                    </div>
                                }

                                <div className="form-group">
                                    <span className="Country-label">Database Name<label className='required-star'>*</label></span><br />
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="databaseName"
                                        name="databaseName"
                                        maxLength="256"
                                        value={values.databaseName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <ErrorMessage className="validation-error" name='databaseName' component='div' />
                                </div>
                                {/* {state.database_url && <p><strong>"Live Database : &nbsp;</strong> {state.database_url}</p>}
                                {state.dev_database_url && <p><strong>"Dev Database :&nbsp;</strong>{state.dev_database_url}</p>} */}
                            </div>
                            {!state.is_system &&
                                <div className="justify-content-between">
                                    <Button size="sm" type="button" onClick={props.previousStep}  className='btn btn-primary float-left'>{'Previous'}</Button>
                                    {connectionType == 2 && <Button size="sm" type="submit" className='btn btn-primary float-right'>{'Verify'}</Button>}
                                    {connectionType == 1 && <Button size="sm" onClick={() => VerifyConnection()} type="button" className='btn btn-primary float-right'>{'Verify'}</Button>}
                                </div>
                            }
                        </Form>
                    )}
                </Formik>
            </div>

            {state.is_system &&
                <Button size="sm" type="button" className='btn btn-primary float-right' onClick={() => VerifyConnection()}>{'Next'}</Button>
            }

        </>
    );
};

export default ThirdStep;