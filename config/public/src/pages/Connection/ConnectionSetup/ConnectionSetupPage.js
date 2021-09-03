//Import Packages
import React, { Fragment, useState, useEffect } from 'react';
import StepWizard from 'react-step-wizard';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { Container, Row, Col, Button } from "reactstrap";

//Import File 
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import constants from '../../../config';
import { GetAppName, GetTenantName } from '../../../utils/helperFunctions';
import axiosService from '../../../utils/axiosService';
import First from './components/First';
import Second from './components/Second';
import Progress from './components/Progress';
import Last from './components/Last';
import Nav from './components/Nav';
import Third from './components/Third';

//Connection Logos
import NintexImg from '../../../assets/images/collection/Nintex.jpg';
import GoogleDriveImg from '../../../assets/images/collection/GoogleDrive.jpg';
import OneDriveImg from '../../../assets/images/collection/OneDrive.png';
import sharepoint from '../../../assets/images/collection/sharepoint.jpg';
import './ConnectionSetup.css'

//Connection Url
let authStateParam = btoa(JSON.stringify({ origin: window.location.origin }));
let microsoftUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${constants.microsoftClientId}&scope=${encodeURIComponent(constants.microsoftScopes)}&response_type=code&redirect_uri=${encodeURIComponent(constants.microsoftRedirectUri)}&state=${authStateParam}`
let sharePointUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${constants.microsoftClientId}&scope=${encodeURIComponent(constants.microsoftScopes)}&response_type=code&redirect_uri=${encodeURIComponent(constants.microsoftRedirectUri)}&state=${authStateParam}`;
let googleUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${encodeURIComponent(constants.googleRedirectUri)}&response_type=code&scope=${constants.googleScopes} openid&openid.realm=&client_id=${constants.googleClientId}&access_type=offline&include_granted_scopes=true&prompt=consent&state=${authStateParam}`

//Connection List
const connection_lists = {
    nintex: { description: 'Nintex workflow cloud', logo: NintexImg },
    gdrive: { description: 'connection to google drive', logo: GoogleDriveImg },
    onedrive: { description: 'Microsoft one drive', logo: OneDriveImg },
    sharepoint: { description: 'Microsoft share point custom list folders', logo: sharepoint },
}


const ConnectionSetupPage = (props) => {

    const rootPath = GetAppName(props.user);
    const googleUrls = GetTenantName() == "portal" ? googleUrl : `${constants.authUrl}?url=${encodeURIComponent(googleUrl)}`
    const microsoftUrls = GetTenantName() == "portal" ? microsoftUrl : `${constants.authUrl}?url=${encodeURIComponent(microsoftUrl)}`
    const sharePointUrls = GetTenantName() == "portal" ? sharePointUrl : `${constants.authUrl}?url=${encodeURIComponent(sharePointUrl)}`
    const userLevel = props.user.User_data ? props.user.User_data.level : 0;
    const userId = props.user.User_data ? props.user.User_data._id : 0;
    const { connection_type: query_connection_type } = queryString.parse(props.location.search);
    console.log(query_connection_type);
    const [state, updateState] = useState({
        connection_type: query_connection_type ? query_connection_type : "",
        is_connection_fixed: query_connection_type ? true : false,
        title: '',
        content: '',
        connectionId: null,
        clientId: null,
        login: null,
        showConnectSuccess: 0,
        is_complete: false,
        is_progress_complete: false,
        auth_code: "",
        auth_token: {
            userId: userId,
            accessToken: "",
        }
    });

    const handleOauthResponse = async (e) => {
        try {
            let postData = {
                type: state.connection_type,
                code: e.code,
                createdBy: props.user.User_data._id
            };
            const response = await axiosService.apis("POST", `/api/createConnection`, postData);
            console.log(response);
            if (response.status) {
                if (response && response.profile) {
                    await updateState({
                        ...state,
                        connectionId: response.connectionId,
                        clientId: response.profile.id,
                        login: response.profile.email,
                        auth_code: e.code,
                        showConnectSuccess: 1
                    });
                    e.nextStep();
                }
            } else {
                updateState({ ...state, showConnectSuccess: 2 })
            }
        } catch (err) {
            console.log(err.message);
            updateState({ ...state, showConnectSuccess: 2 })
        }
    }

    const onConnectionTypeChange = (e) => {
        updateState({ ...state, connection_type: e });
    }

    const onClose = (code) => {
        console.log("code: ", code)
        console.log("closed!");
    }

    const createConnection = async (e) => {
        try {
            console.log(state);
            e.nextStep();
            // let self = this;
            const { auth_code, auth_token, title, content, connection_type } = state;
            let postData = {
                IsNotLoader: true,
                title: title,
                content: content,
                auth_token: auth_token,
                type: connection_type,
                code: auth_code,
                createdBy: props.user.User_data.id
            };
            var response = null
            if (state.connectionId) {
                response = await axiosService.apis("PUT", `/api/connections/${state.connectionId}`, postData)
            } else {
                response = await axiosService.apis("POST", `/api/createConnection`, postData)
            }
            await updateState({ ...state, is_complete: response.status, is_progress_complete: true });
        } catch (err) {
            console.log(err.message)
            await updateState({ ...state, is_complete: false, is_progress_complete: true });
            e.nextStep();
        }

    };

    const inputChangeHandler = event => {
        let value = event.target.value;
        let name = event.target.name;
        if (event.target.name == "accessToken") {
            let auth_token = state.auth_token;
            name.match(/^(userId|accessToken)$/) ? auth_token[name] = value : null;
            updateState({ ...state, auth_token })
        } else {
            updateState({ ...state, [event.target.name]: value });
        }
    };


    return (
        <Fragment>
          	<Breadcrumbs title="Connection Setup" breadcrumbItem="Dashboard" />
            <div className='container connection-setup'>
                <div className={'jumbotron'}>
                    <div className='row'>
                        <div className={`col-12`}>
                            <StepWizard initialStep={1} nav={<Nav />}>
                                <First
                                    is_connection_fixed={state.is_connection_fixed}
                                    history={props.history}
                                    onConnectionTypeChange={onConnectionTypeChange}
                                    onClose={onClose}
                                    handleOauthResponse={handleOauthResponse}
                                    googleUrls={googleUrls}
                                    microsoftUrls={microsoftUrls}
                                    sharePointUrls={sharePointUrls}
                                    connection_type={state.connection_type}
                                    showConnectSuccess={state.showConnectSuccess}
                                    connection_lists={connection_lists}
                                    rootPath={rootPath} />
                                <Second
                                    history={props.history}
                                    inputChangeHandler={inputChangeHandler}
                                    state={state}
                                    connection_lists={connection_lists}
                                    userLevel={userLevel}
                                    userId={userId}
                                />
                                 <Third
                                    history={props.history}
                                    createConnection={createConnection}
                                    inputChangeHandler={inputChangeHandler}
                                    state={state} />
                                <Progress
                                    isProgressComplete={state.is_progress_complete} /> 
                                <Last
                                    history={props.history}
                                    is_complete={state.is_complete} />
                            </StepWizard>
                        </div>
                        {state.showConnectSuccess == 2 &&
                            <div className={`col-12 mt-1 text-center`}>
                                <div className="alert alert-danger">
                                    <strong>Error!</strong> Connection Failed, Please try again!.
                            </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    );
}


const mapStateToProps = ({ user }) => ({
    user
})

export default connect(mapStateToProps, null)(ConnectionSetupPage)