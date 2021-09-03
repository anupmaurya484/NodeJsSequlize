import React, { Fragment, useState, useEffect } from 'react';
import Stats from './Stats';
import { Input, } from 'reactstrap';
import constants from '../../../../config';

const getType = type => {
    switch (type) {
        case constants.TYPE_GDRIVE: return "Google Drive";
        case constants.TYPE_ONEDRIVE: return "One Drive";
        case constants.TYPE_NINTEX: return "Nintex";
        default: return type;
    }
}

const Second = props => {

    const { userLevel, connection_lists, state } = props;
    return (
        <div>
            {state.connection_type != "" &&
                <div className="row pt-3 pb-3">
                    <div className="col-lg-4">
                        <div className={"card"}>
                            <div className="no-gutters align-items-center row">
                                <div className="col-md-4 pl-2">
                                    <img src={connection_lists[state.connection_type].logo} alt="Skote" className="img-fluid card-img" />
                                </div>
                                <div className="col-md-8">
                                    <div className="card-body">
                                        <div className="card-title">{getType(state.connection_type)}</div>
                                        <p className="card-text">{connection_lists[state.connection_type].description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8 Ninte">
                        {state.connection_type != constants.TYPE_NINTEX &&
                            <Fragment>
                                <p>client id: {state.clientId}</p>
                                <p>Login:{state.login}</p>
                                <div className="alert alert-success" role="alert" > Connection successfull </div>
                            </Fragment>
                        }
                        {state.connection_type == constants.TYPE_NINTEX &&
                            <Fragment>
                                {(userLevel < 7) && 
                                <div>
                                    <label>User ID</label>
                                    <Input name='userId' disabled type='text' value={props.userId} disabled onChange={props.inputChangeHandler} /></div>}
                                {(userLevel >= 7) &&
                                 <div>
                                 <i className="fa fa-id-badge fa-2x prefix mr-2" aria-hidden="true"></i>
                                     <label>User ID</label>
                                 <Input name='userId' icon='id-badge' style={{'margin-bottom': '10px'}} disabled type='text'  value={props.userId} onChange={props.inputChangeHandler} /></div>
                                 }
                              <i className="fa fa-key fa-2x prefix mr-1"></i>
                                <lable>Access Token</lable>
                                <Input name='accessToken' type='text' style={{'margin-top': '8px'}} value={props.state.auth_token.accessToken} onChange={props.inputChangeHandler} />
                            </Fragment>
                        }

                    </div>
                </div>
            }
            <Stats
                step={2}
                {...props}
                handleNextStep={() => props.nextStep()}
                isEnable={state.connection_type == constants.TYPE_NINTEX ? (props.state.auth_token.accessToken != "") : true}
                history={props.history} />
        </div>
    );
};


export default Second;