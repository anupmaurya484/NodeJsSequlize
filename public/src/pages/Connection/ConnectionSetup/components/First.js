import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';

import constants from '../../../../config';

const First = props => {

    const onConnectionTypeChange = (e) => {
        console.log(props);
        props.onConnectionTypeChange(e)
    }

    const onClose = (e) => {
        props.onClose(e)
    }

    const handleOauthResponse = (e, params) => {
        console.log("wooooo a code", e);
        console.log("alright! the URLSearchParams interface from the popup url", params);
        props.handleOauthResponse({ code: e, nextStep: props.nextStep });
    }

    const { connectionId, googleUrls, microsoftUrls, sharePointUrls, connection_type, rootPath, showConnectSuccess, is_connection_fixed } = props;

    let ConnectionUrl = null;
    if (connection_type === constants.TYPE_GDRIVE) {
        ConnectionUrl = googleUrls
    } else if (connection_type === constants.TYPE_ONEDRIVE) {
        ConnectionUrl = microsoftUrls;
    } else if (connection_type === constants.TYPE_SHAREPOINT) {
        ConnectionUrl = sharePointUrls;
    } else if (connection_type === constants.TYPE_NINTEX) {
        ConnectionUrl = "NINTEX";
    }

    console.log(ConnectionUrl);

    return (
        <div>
            <div className="row pt-3 pb-3">
                <div className={"cursor-pointer col-lg-4 " + ((is_connection_fixed && (connection_type != constants.TYPE_NINTEX)) ? 'connection_fixed_blur' : '')} onClick={() => onConnectionTypeChange(constants.TYPE_NINTEX)}>
                    <div className={"card " + ((connection_type == constants.TYPE_NINTEX) ? "selected_connection" : " border ")}>
                        <div className="no-gutters align-items-center row">
                            <div className="col-md-4 pl-2">
                                <img src={props.connection_lists.nintex.logo} alt="Skote" style={{ 'width': '110px', 'height': '110px' }} className="img-fluid card-img" />
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <div className="card-title">Nintex</div>
                                    <p className="card-text">Nintex workflow cloud</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"cursor-pointer col-lg-4 " + ((is_connection_fixed && (connection_type != constants.TYPE_GDRIVE)) ? 'connection_fixed_blur' : '')} onClick={() => onConnectionTypeChange(constants.TYPE_GDRIVE)}>
                    <div className={"card " + ((connection_type == constants.TYPE_GDRIVE) ? "selected_connection" : " border ")}>
                        <div className="no-gutters align-items-center row">
                            <div className="col-md-4">
                                <img src={props.connection_lists.gdrive.logo} alt="Skote" className="img-fluid card-img" />
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <div className="card-title">Google drive</div>
                                    <p className="card-text">connection to google drive</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"cursor-pointer col-lg-4 " + ((is_connection_fixed && (connection_type != constants.TYPE_ONEDRIVE)) ? 'connection_fixed_blur' : '')} onClick={() => onConnectionTypeChange(constants.TYPE_ONEDRIVE)}>
                    <div className={"card " + ((connection_type == constants.TYPE_ONEDRIVE) ? "selected_connection" : " border ")}>
                        <div className="no-gutters align-items-center row">
                            <div className="col-md-4">
                                <img src={props.connection_lists.onedrive.logo} alt="Skote" className="img-fluid card-img" />
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <div className="card-title">One drive</div>
                                    <p className="card-text">Microsoft one drive</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"cursor-pointer col-lg-4 " + ((is_connection_fixed && (connection_type != constants.TYPE_SHAREPOINT)) ? 'connection_fixed_blur' : '')} onClick={() => onConnectionTypeChange(constants.TYPE_SHAREPOINT)}>
                    <div className={"card " + ((connection_type == constants.TYPE_SHAREPOINT) ? "selected_connection" : " border ")}>
                        <div className="no-gutters align-items-center row">
                            <div className="col-md-4">
                                <img src={props.connection_lists.sharepoint.logo} alt="Skote" className="img-fluid card-img" />
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <div className="card-title">Share point</div>
                                    <p className="card-text">Microsoft share point custom list folders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Stats
                step={1}
                {...props}
                ConnectionUrl={ConnectionUrl}
                onClose={onClose}
                handleOauthResponse={handleOauthResponse}
                handleNextStep={() => props.nextStep()}
                isEnable={ConnectionUrl == "NINTEX"}
                history={props.history}
            />

        </div >
    );
};

export default First;