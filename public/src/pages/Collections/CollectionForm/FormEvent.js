import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axios from '../../../utils/axiosService';
import { Button, MDBInput, MDBCol, MDBRow} from 'mdbreact';
import * as ACT from '../../../actions';
import API from '../../../config';
import { Toast, isEmptyString } from '../../../utils/helperFunctions';
import './CreateForm.css';

const apiUrl = API.API_URL;

class FormEvent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEventCreatedSwitchOn: false,
            isURLExtWorkflowConnected: undefined,
            apiUrlText: '',
            apiBody: undefined, // apiBody is set on handleConnectAPIURL method
            apiParameters: undefined, // apiParameters is set on handleConnectAPIURL method
            isEventModifiedSwitchOn: false,
            isModifiedURLExtWorkflowConnected: undefined,
            modifiedApiUrlText: '',
            modifiedApiBody: undefined,
            modifiedApiParameters: undefined,
            IsModalConfirmation: false,
            collection: {
                _id: '',
                collectionName: "",
                collectionDescription: "",
                formschema: { "display": "form" }
              }
        }
    }

    componentDidMount(){
        this.componentUpdate(this.props);
    }

    componentWillReceiveProps(props){
      this. componentUpdate(props);
    }

    componentUpdate(props){
        const {createdActionAPI,modifiedActionAPI,collection} = props;
        let {
            isEventCreatedSwitchOn,
            isURLExtWorkflowConnected,
            openApiTitle,
            apiUrlText,
            apiBody,
            apiParameters,
            isEventModifiedSwitchOn,
            isModifiedURLExtWorkflowConnected,
            modifiedOpenApiTitle,
            modifiedApiUrlText,
            modifiedApiBody,
            modifiedApiParameters
        } = this.state

        if (createdActionAPI) {
            isEventCreatedSwitchOn = createdActionAPI.isActive
            isURLExtWorkflowConnected = true
            openApiTitle = createdActionAPI.openApiTitle
            apiUrlText = createdActionAPI.openApiUrl
            apiBody = createdActionAPI.body
            apiParameters = createdActionAPI.parameters
        }

        if (modifiedActionAPI) {
            isEventModifiedSwitchOn = modifiedActionAPI.isActive
            isModifiedURLExtWorkflowConnected = true
            modifiedOpenApiTitle = modifiedActionAPI.openApiTitle
            modifiedApiUrlText = modifiedActionAPI.openApiUrl
            modifiedApiBody = modifiedActionAPI.body
            modifiedApiParameters = modifiedActionAPI.parameters
        }
        
        this.setState({
            collection : collection,
            isEventCreatedSwitchOn,
            isURLExtWorkflowConnected,
            openApiTitle,
            apiUrlText,
            apiBody,
            apiParameters,
            isEventModifiedSwitchOn,
            isModifiedURLExtWorkflowConnected,
            modifiedOpenApiTitle,
            modifiedApiUrlText,
            modifiedApiBody,
            modifiedApiParameters
        });
    }

    render() {
        const {
            isEventCreatedSwitchOn,
            isURLExtWorkflowConnected,
            openApiTitle,
            apiUrlText,
            apiBody,
            apiParameters,
            isEventModifiedSwitchOn,
            isModifiedURLExtWorkflowConnected,
            modifiedOpenApiTitle,
            modifiedApiUrlText,
            modifiedApiBody,
            modifiedApiParameters
        } = this.state

        const createdEventApi = {
            actionType: 'created',
            isEventSwitchOn: isEventCreatedSwitchOn,
            isURLConnected: isURLExtWorkflowConnected,
            openApiTitle: openApiTitle,
            apiUrlText: apiUrlText,
            apiBody: apiBody,
            apiParameters: apiParameters,
            toggleSwitchEvent: this.toggleSwitchEventCreated,
            changeApiUrlText: this.handleApiUrlText,
            handleConnectApiURL: this.handleConnectApiURL,
            handleInputProperties: this.handleInputCreatedApiProperties,
            handleSaveEventAPI: this.handleSaveCreatedEventAPI
        }

        const modifiedEventApi = {
            actionType: 'modified',
            isEventSwitchOn: isEventModifiedSwitchOn,
            isURLConnected: isModifiedURLExtWorkflowConnected,
            openApiTitle: modifiedOpenApiTitle,
            apiUrlText: modifiedApiUrlText,
            apiBody: modifiedApiBody,
            apiParameters: modifiedApiParameters,
            toggleSwitchEvent: this.toggleSwitchEventModified,
            changeApiUrlText: this.handleModifiedApiUrlText,
            handleConnectApiURL: this.handleConnectModifiedApiURL,
            handleInputProperties: this.handleInputModifiedApiProperties,
            handleSaveEventAPI: this.handleSaveModifiedEventAPI
        }

        return (
            <div id="modal-form-event">
                {this.renderEventContainer(createdEventApi)}
                {this.renderEventContainer(modifiedEventApi)}
            </div>
        )
    }

    renderEventContainer(input) {
        const {
            actionType,
            isEventSwitchOn,
            isURLConnected,
            openApiTitle,
            apiUrlText,
            apiBody,
            apiParameters,
            toggleSwitchEvent,
            changeApiUrlText,
            handleConnectApiURL,
            handleInputProperties,
            handleSaveEventAPI
        } = input

        return (
            <Fragment id="modal-form-event">
      <MDBRow className='bordered-container event-container my-2'>
                <MDBCol md='12'>
                    <div className="custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" id={"customSwitch1" + actionType} checked={isEventSwitchOn}
                            onChange={toggleSwitchEvent} />
                        <label className="custom-control-label" htmlFor={"customSwitch1" + actionType}>Starts when documents are {actionType}</label>
                    </div>
                </MDBCol>
                {
                    isEventSwitchOn &&
                    <Fragment>
                        <MDBCol md='12' className='bordered-container url-container'>
                            <MDBRow className="m-b-0">
                                <MDBCol md='1'>
                                    <span>URL</span>
                                </MDBCol>
                                <MDBCol md='11'>
                                    <textarea className="textarea-url" value={apiUrlText} onChange={changeApiUrlText}>
                                    </textarea>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol md='1'>

                                </MDBCol>
                                <MDBCol md='8'>
                                    {
                                        isURLConnected &&
                                        <span className="connected-label">
                                            [Connected]
								</span>
                                    }
                                    {
                                        isURLConnected === false &&
                                        <span className="error-label">
                                            [Error]
								</span>
                                    }
                                </MDBCol>
                                <MDBCol md='3' className='text-right'>
                                    <Button color="cyan" className='custom-btn' disable={isEmptyString(apiUrlText)} onClick={handleConnectApiURL}>
                                        Connect
                 </Button>
                                </MDBCol>
                            </MDBRow>
                        </MDBCol>
                        {
                            isURLConnected &&

                            <MDBRow className=" bordered-container parameters-containers" style={{ width: "100%", marginTop: "10px" }}>
                                <MDBCol md='12' className="parameters-container">
                                    <div className="col s12 zero-padding border-bottom">
                                        <span>{openApiTitle}</span>
                                    </div>
                                </MDBCol>
                                {
                                    apiParameters &&
                                    apiParameters.length > 0 &&
                                    apiParameters.map((parameter, paramIdx) => (
                                        <div key={paramIdx} className="col s12">
                                            <p className="parameter-name">{parameter.name}</p>
                                            {
                                                parameter.properties.map((property, propIdx) => (
                                                    <MDBCol md='12' key={propIdx} >
                                                        <MDBRow>
                                                            <MDBCol md='4' >
                                                                <span className="col s12 property-name">{property.name}</span>
                                                                <span className="col s12 property-type">{property.type}</span>
                                                            </MDBCol>
                                                            <MDBCol md='8' className="event-input">
                                                                <MDBInput
                                                                    className="m-0"
                                                                    id={`input-${actionType}-${parameter.name}-${property.name}`}
                                                                    value={apiBody[parameter.name][property.name]}
                                                                    onChange={e => handleInputProperties(parameter.name, property.name)} />
                                                            </MDBCol>
                                                        </MDBRow>
                                                    </MDBCol>
                                                ))
                                            }
                                        </div>
                                    ))
                                }

                                <MDBCol md='12' className='text-right'>
                                    <Button color="cyan" className='custom-btn' disable={isURLConnected} onClick={handleSaveEventAPI}>
                                        Save
                 </Button>
                                </MDBCol>
                            </MDBRow>
                        }

                    </Fragment>
                }

            </MDBRow>
      
            </Fragment>
        )
    }

    toggleSwitchEventCreated = () => {
        const { isEventCreatedSwitchOn } = this.state
        const collection = this.state.collection;
        const formId = collection._id;
        const actionType = 'created'
        axios.apis('PATCH', `/api/v1-toggle-external-api?formId=${formId}&actionType=${actionType}`, { isActive: !isEventCreatedSwitchOn })
            .then(response => {
                Toast(response.data.message)
            })
            .catch(error => console.error(error))

        this.setState({ isEventCreatedSwitchOn: !isEventCreatedSwitchOn })
    }

    toggleSwitchEventModified = () => {
        const { isEventModifiedSwitchOn } = this.state
        const actionType = 'modified';
        const collection = this.state.collection;
        const formId = collection._id;

        axios.apis('PATCH', `/api/v1-toggle-external-api?formId=${formId}&actionType=${actionType}`, { isActive: !isEventModifiedSwitchOn })
            .then(response => {
                Toast(response.data.message)
            })
            .catch(error => console.error(error))

        this.setState({ isEventModifiedSwitchOn: !isEventModifiedSwitchOn })
    }

    handleModifiedApiUrlText = (event) => {
        this.setState({ modifiedApiUrlText: event.target.value })
    }

    handleApiUrlText = (event) => {
        this.setState({ apiUrlText: event.target.value })
    }

    handleConnectApiURL = () => {
        const { apiUrlText } = this.state

        axios.apis('GET', `/api/v1-ping-open-api?url=${apiUrlText}`)
            .then(data => {
                Toast(data.message)
                // if API URL valid, retrieve the API parameters
                if (data.success) {
                    axios.apis('GET', `/api/v1-retrieve-external-workflow-parameters?url=${apiUrlText}`)
                        .then(res_data => {
                            const { openApiTitle, apiBody, apiParameters } = res_data
                            this.setState({ openApiTitle, apiBody, apiParameters })
                        })
                        .catch(e2 => console.error(e2))
                }

                this.setState({
                    isURLExtWorkflowConnected: data.success
                })
            })
            .catch(e => console.error(e))
    }

    handleConnectModifiedApiURL = () => {
        const { modifiedApiUrlText } = this.state

        axios.apis('GET', `/api/v1-ping-open-api?url=${modifiedApiUrlText}`)
            .then(data => {
                Toast(data.message)

                // if API URL valid, retrieve the API parameters
                if (data.success) {
                    axios.apis('GET', `/api/v1-retrieve-external-workflow-parameters?url=${modifiedApiUrlText}`)
                        .then(data2 => {
                            const {
                                openApiTitle: modifiedOpenApiTitle,
                                apiBody: modifiedApiBody,
                                apiParameters: modifiedApiParameters
                            } = data2

                            this.setState({ modifiedOpenApiTitle, modifiedApiBody, modifiedApiParameters })
                        })
                        .catch(e2 => console.error(e2))
                }

                this.setState({
                    isModifiedURLExtWorkflowConnected: data.success
                })
            })
            .catch(e => console.error(e))
    }

    handleInputModifiedApiProperties = (parameter, property) => {
        const { modifiedApiBody } = this.state
        const value = document.getElementById(`input-modified-${parameter}-${property}`).value

        const newApiBody = {
            ...modifiedApiBody,
            [parameter]: {
                ...modifiedApiBody[parameter],
                [property]: value
            }
        }
        this.setState({ modifiedApiBody: newApiBody })
    }

    handleSaveCreatedEventAPI = () => {
        const { openApiTitle, apiUrlText: openApiUrl, apiBody } = this.state

        const collection = this.state.collection;
        const formId = collection._id;

        const data = { openApiTitle, formId, openApiUrl, apiBody }

        axios.apis('POST', `/api/v1-save-external-workflow?action_type=created`, data)
            .then(data => {
                Toast(data.message)
            })
            .catch(e => console.error(e))
    }

    handleSaveModifiedEventAPI = () => {
        const {
            modifiedOpenApiTitle: openApiTitle,
            modifiedApiUrlText: openApiUrl,
            modifiedApiBody: apiBody
        } = this.state
        const collection = this.state.collection;
        const formId = collection._id;
        const data = { formId, openApiTitle, openApiUrl, apiBody }

        axios.apis('POST', `/api/v1-save-external-workflow?action_type=modified`, data)
            .then(data => {
                Toast(data.message)
            })
            .catch(e => console.error(e))
    }

    handleInputCreatedApiProperties = (parameter, property) => {
        const { apiBody } = this.state
        const value = document.getElementById(`input-created-${parameter}-${property}`).value

        const newApiBody = {
            ...apiBody,
            [parameter]: {
                ...apiBody[parameter],
                [property]: value
            }
        }

        this.setState({ apiBody: newApiBody })
    }
}

const mapStateToProps = ({ user, form }) => ({
    user,
    collectionList: form.collectionList
})

const mapDispatchToProps = (dispatch) => ({
    setCollectionList: (collections) => dispatch(ACT.setCollectionList(collections))
})

export default connect(mapStateToProps, mapDispatchToProps)(FormEvent)