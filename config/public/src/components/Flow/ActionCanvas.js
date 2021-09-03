// Canvas to hold a list of actions (i.e. actions are placed in a placeholder)
import React, { Component, Fragment } from 'react';
import CardPlaceholder from './CardPlaceholder';
import ConnectorPlaceholder from './ConnectorPlaceholder';
//import ActionConnector from './ActionConnector'
import ActionCard from './ActionCard';
import StartWorkflowModal from './StartWorkflowModal';
import CallNintexActionModal from './CallNintexActionModal';
import CallWebServiceModal from './CallWebServiceModal';
import CollectionOperationModal from './CollectionOperationModal';
import SendEmailModal from './SendEmailModal';
import SendSMSModal from './SendSMSModal';
import GetSharepointListModal from './GetSharepointListModal';
import SetFormComponentModal from './SetFormComponentModal';
import QueryJsonModal from './QueryJsonModal';
import SqlQueryModal from './SqlQueryModal';
import ToastModal from './ToastModal';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
//import CanvasActionHolder from './CanvasActionHolder'
import {
    Card, CardBody, CardHeader, CardText, Row, Col, Button, Input,
    Modal, ModalHeader, ModalBody, ModalFooter, Container
} from 'reactstrap'

import '../../pages/Collections/CollectionForm/CreateForm.css';

const cardIcons = [
    { name: 'Start Workflow', icon: 'play-circle', template: { name: 'Start Workflow' } },
    { name: 'Call Nintex Workflow', icon: 'sitemap', template: { name: 'Call Nintex Workflow', type: 'Nintex' } },
    { name: 'Collection Operation', icon: 'database', template: { name: 'Collection Operation' } },
    { name: 'Call Web Service', icon: 'retweet', template: { name: 'Call Web Service' } },
    { name: 'Send Email', icon: 'envelope', template: { name: 'Send Email' } },
    { name: 'Send SMS', icon: 'at', template: { name: 'Send SMS' } },
    { name: 'Get Sharepoint List', icon: 'at', template: { name: 'Get Sharepoint List' } },
    { name: 'Set Form Component', icon: 'check-square', template: { name: 'Set Form Component' } },
    { name: 'Query Json', icon: 'code', template: { name: 'Query Json' } },
    { name: 'SQL Query', icon: 'database', template: { name: 'SQL Query' } },
    { name: 'Toast', icon: 'comment', template: { name: 'Toast' } }
];

const style = {
    border: '1px solid white',
    backgroundColor: 'white',
    cursor: 'arrow',
    width: '250px',
    height: '100%',
    verticalAlign: 'middle'
}

class ActionCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventID: props.eventID,
            actions: [],
            type: "event",
            nintexActionModal: false,
            pageLayoutFormSchema: [],
            modalSwitch: {
                'Collection Operation': false,
                'Start Workflow': false,
                'Call Nintex Workflow': false,
                'Call Web Service': false,
                'Send Email': false,
                'Send SMS': false,
                'Get Sharepoint List': false,
                'Set Form Component': false,
                'Query Json': false,
                'SQL Query': false,
                'Toast': false
            },
            selectedAction: undefined,
            currentIndex: undefined,
            startWorkflow: undefined,
            collectionOperation: undefined,
            callNintexWorkflow: undefined,
            callWebService: undefined,
            sendEmail: undefined,
            sendSMS: undefined,
            getSharepointList: undefined,
            setFormComponent: undefined,
            queryJson: undefined,
            sqlQuery: undefined,
            toast: undefined
        };
        this.renderNode = this.renderNode.bind(this);
        this.renderPlaceholder = this.renderPlaceholder.bind(this);
        this.renderPiece = this.renderPiece.bind(this);
        this.handleActionDropped = this.handleActionDropped.bind(this);
        this.actionConnector = this.actionConnector.bind(this);
        this.renderConnector = this.renderConnector.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleActionUpdate = this.handleActionUpdate.bind(this);
        this.onClose = this.onClose.bind(this)
    }

    componentDidMount(props) {
        this.componentUpdate(this.props);
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props);
    }

    componentUpdate(props) {
        const options = props.options;
        this.setState({
            pageLayoutFormSchema: props.pageLayoutFormSchema ? props.pageLayoutFormSchema : [],
            eventID: props.eventID,
            type: props.type ? props.type : "event",
            actions: props.actions || [],
            startWorkflow: options && options.actions.find(e => e.startWorkflow) && options.actions.find(e => e.startWorkflow).startWorkflow,
            callNintexWorkflow: options && options.actions.find(e => e.callNintexWorkflow) && options.actions.find(e => e.callNintexWorkflow).callNintexWorkflow,
            callWebService: options && options.actions.find(e => e.callWebService) && options.actions.find(e => e.callWebService).callWebService,
            collectionOperation: options && options.actions.find(e => e.collectionOperation) && options.actions.find(e => e.collectionOperation).collectionOperation,
            sendEmail: options && options.actions.find(e => e.sendEmail) && options.actions.find(e => e.sendEmail).sendEmail,
            sendSMS: options && options.actions.find(e => e.sendSMS) && options.actions.find(e => e.sendSMS).sendSMS,
            getSharepointList: options && options.actions.find(e => e.getSharepointList) && options.actions.find(e => e.getSharepointList).getSharepointList,
            setFormComponent: options && options.actions.find(e => e.setFormComponent) && options.actions.find(e => e.setFormComponent).setFormComponent,
            queryJson: options && options.actions.find(e => e.queryJson) && options.actions.find(e => e.queryJson).queryJson,
            sqlQuery: options && options.actions.find(e => e.sqlQuery) && options.actions.find(e => e.sqlQuery).sqlQuery,
            toast: options && options.actions.find(e => e.toast) && options.actions.find(e => e.toast).toast,
        });
    }

    renderNode(type) {
        return (
            <div className="d-flex justify-content-center .z-depth-1-half"
                style={{ width: '100%', height: '50%' }} key={type}>
                <button
                    type="button"
                    className="action-canvar-button btn btn-sm btn-light border rounded-pill shadow-sm mb-1">
                    {type}
                </button>
            </div>
        )
    }

    renderPlaceholder(i, action) {
        //const isCardHere = cardName? true: false;
        //const actCardName = isCardHere? cardName : null;
        const actionName = action !== null ? action.name : null;
        var icon = null;
        if (actionName !== null) {
            //const result = cardIcons.find( ({ name }) => name == actionName);
            //icon1 = result? result.icon: undefined;
            icon = cardIcons.find(x => x.name == actionName).icon;
            //console.log(theIcon);
        }

        return (
            <div
                key={"a" + i}
                onClick={this.toggle(actionName, i)} //{this.toggle('nintexActionModal', i)}
                className="d-flex justify-content-center .z-depth-1-half"
                style={{ width: '100%', height: '50%' }}
            >
                <CardPlaceholder y={i} handleActionDropped={this.handleActionDropped}>
                    {actionName !== null ? this.renderPiece(i, icon, actionName) : null}
                </CardPlaceholder>
            </div>
        )
    }

    renderPiece(y, icon, cardName) {
        return <ActionCard icon={icon} cardName={cardName} holderIndex={y} />
    }

    actionConnector = (i, color) => {

        return (
            <div className="d-flex justify-content-center .z-depth-1-half" style={{ width: '100%', height: '50%' }} key={i}>
                <ConnectorPlaceholder y={i} handleActionDropped={this.handleActionDropped}>
                    {this.renderConnector(color)}
                </ConnectorPlaceholder>
            </div>
        )
    }

    renderConnector(color) {
        return (
            <i className={`fa fa-arrow-down my-auto ${color}`} aria-hidden="true"></i>
        )
    }

    handleActionDropped(actionName, droppedIndex, itemIndex) {
        const { actions } = this.state;
        console.log(actions)
        if (itemIndex < 0 && droppedIndex < 10) {
            const cards = [
                { name: 'Start Workflow', icon: 'play-circle', template: { name: 'Start Workflow' } },
                {
                    name: 'Call Nintex Workflow', icon: 'sitemap', template: {
                        name: 'Call Nintex Workflow', type: 'Nintex'
                    }
                },
                { name: 'Collection Operation', icon: 'database', template: { name: 'Collection Operation' } },
                { name: 'Call Web Service', icon: 'retweet', template: { name: 'Call Web Service' } },
                { name: 'Send Email', icon: 'envelope', template: { name: 'Send Email' } },
                { name: 'Send SMS', icon: 'at', template: { name: 'Send SMS' } },
                { name: 'Get Sharepoint List', icon: 'at', template: { name: 'Get Sharepoint List' } },
                { name: 'Set Form Component', icon: 'check-square', template: { name: 'Set Form Component' } },
                { name: 'Query Json', icon: 'code', template: { name: 'Query Json' } },
                { name: 'SQL Query', icon: 'database', template: { name: 'SQL Query' } },
                { name: 'Toast', icon: 'comment', template: { name: 'Toast' } }
            ];
            const result = cards.find(({ name }) => name == actionName);
            const template = result ? result.template : undefined;
            //var actionIndex = actions.findIndex(m => m.key == (droppedIndex + 1));
            console.log("Adding (", actionName, ") from ", itemIndex, " to ", droppedIndex);
            actions.splice(droppedIndex, 0, template);
        } else {
            console.log("Moving (", actionName, ") from ", itemIndex, " to ", droppedIndex);
            if (droppedIndex > itemIndex) {
                actions.splice(droppedIndex - 1, 0, actions.splice(itemIndex, 1)[0])
            } else {
                actions.splice(droppedIndex, 0, actions.splice(itemIndex, 1)[0])
            }
        }
        this.setState({ actions: actions });
        this.props.actionsUpdated(actions)
    }

    /*
    toggle = (modalName, i) => () => {
        this.setState({
            selectedAction: this.state.actions[i],
            currentIndex: i,
            [modalName]: !this.state[modalName]
        });
    } */

    toggle = (modalName, i) => () => {
        const currentModal = !this.state.modalSwitch[modalName];
        console.log('currentModal: ', currentModal);
        this.setState({
            selectedAction: this.state.actions[i],
            currentIndex: i,
            //!this.state.modalSwitch[modalName]
        });
        this.setState(prevState => ({ modalSwitch: { ...prevState.modalSwitch, [modalName]: currentModal } }))
    }

    onClose = (e, modalName) => {
        const currentModal = !this.state.modalSwitch[modalName];
        //this.setState({
        //nintexActionModal: false
        //})
        this.setState(prevState => ({ modalSwitch: { ...prevState.modalSwitch, [modalName]: currentModal } }))
    }

    handleActionUpdate(action, i, type) {
        const modalName = action.name === "Call Nintex Workflow" ? "nintexActionModal" : "nintexActionModal";
        console.log('index: ', i, ', modalName: ', modalName, ', Updated action: ', action);
        //replace item i in actions with action here..delete if no action presented
        const { actions } = this.state;
        type === 'update' ? actions.splice(i, 1, action) : actions.splice(i, 1);
        this.setState({ actions: actions }, () => { this.props.actionsUpdated(actions, type) })
    }

    render() {
        const { pageLayoutFormSchema, actions, selectedAction, currentIndex, startWorkflow, collectionOperation, callNintexWorkflow, callWebService, sendEmail, sendSMS, getSharepointList, setFormComponent, queryJson, sqlQuery, toast } = this.state
        const placeholders = [this.renderNode("Start"), this.actionConnector(0, "grey-text")]
        const onClickVariables = this.props.onClickVariables;

        console.log("Actions length-->", actions ? actions.length : 0)
        const maxActions = actions ? actions.length : 0;

        var variables = actions.filter((e, i) => (i < currentIndex && (e.type == "Sharepoint" || e.type == "queryJson" || e.type == "collection_operation")));

        for (let i = 0; i < maxActions; i++) {
            placeholders.push(this.renderPlaceholder(i, actions[i] ? actions[i] : null), i < maxActions ? this.actionConnector(i + 1, i + 1 < maxActions ? "" : "grey-text") : null)
        }

        placeholders.push(this.renderNode("End"))

        if (this.props.extvariables) {
            this.props.extvariables.map(x => {
                variables.push({
                    connId: x.connId,
                    tenant: x.tenant,
                    variableType: x.type,
                    name: x.var,
                    variable: x.var,
                    type: 'variable'
                })
            })
        }

        return (
            <Container>
                <DndProvider backend={Backend}>
                    <Row around>
                        <Col md='5' style={{ 'padding': '0px' }}>
                            <Card style={{ width: "100%", marginTop: "1rem" }}>
                                <CardHeader color="grey lighten-1">Actions Control Panel</CardHeader>
                                <CardBody>
                                    <div style={{ overflow: 'hidden', clear: 'both' }}>
                                        {startWorkflow && <div><ActionCard cardName='Start Workflow' icon='play-circle' holderIndex={-1} /><br /></div>}
                                        {callNintexWorkflow && <div><ActionCard cardName='Call Nintex Workflow' icon='sitemap' holderIndex={-1} /><br /></div>}
                                        {collectionOperation && <div><ActionCard cardName='Collection Operation' icon='database' holderIndex={-1} /><br /></div>}
                                        {callWebService && <div><ActionCard cardName='Call Web Service' icon='retweet' holderIndex={-1} /><br /></div>}
                                        {sendEmail && <div><ActionCard cardName='Send Email' icon='envelope' holderIndex={-1} /><br /></div>}
                                        {sendSMS && <div><ActionCard cardName='Send SMS' icon='at' holderIndex={-1} /><br /></div>}
                                        {getSharepointList && <div><ActionCard cardName='Get Sharepoint List' icon='at' holderIndex={-1} /><br /></div>}
                                        {setFormComponent && <div><ActionCard cardName='Set Form Component' icon='check-square' holderIndex={-1} /><br /></div>}
                                        {queryJson && <div><ActionCard cardName='Query Json' icon='code' holderIndex={-1} /><br /></div>}
                                        {sqlQuery && <div><ActionCard cardName='SQL Query' icon='database' holderIndex={-1} /><br /></div>}
                                        {toast && <div><ActionCard cardName='Toast' icon='comment' holderIndex={-1} /><br /></div>}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md='7'>
                            <Card style={{ width: "100%", marginTop: "1rem" }}>
                                <CardBody>
                                    <CardText>Action(s) to be executed when a document being {this.state.eventID === 0 ? " added" : " modified"}.
                                        Drag and drop available action from the Action Control Panel to add action, or click
                                        on any action below to edit.
                                    </CardText>
                                    <div
                                        style={{
                                            maxHeight: '100vh',
                                            padding: '10px',
                                            margin: '0 auto',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {placeholders}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </DndProvider>

                {this.state.modalSwitch['Start Workflow'] &&
                    <StartWorkflowModal
                        action={selectedAction}
                        show={this.state.modalSwitch['Start Workflow']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Call Nintex Workflow'] &&
                    <CallNintexActionModal
                        action={selectedAction}
                        show={this.state.modalSwitch['Call Nintex Workflow']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Call Web Service'] &&
                    <CallWebServiceModal
                        AppId={this.props.AppId}
                        action={selectedAction}
                        show={this.state.modalSwitch['Call Web Service']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Collection Operation'] &&
                    <CollectionOperationModal
                        variablesLists={variables}
                        AppId={this.props.AppId}
                        action={selectedAction}
                        show={this.state.modalSwitch['Collection Operation']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />

                }

                {this.state.modalSwitch['Send Email'] &&
                    <SendEmailModal
                        action={selectedAction}
                        show={this.state.modalSwitch['Send Email']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />

                }

                {this.state.modalSwitch['Send SMS'] &&
                    <SendSMSModal
                        action={selectedAction}
                        show={this.state.modalSwitch['Send SMS']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Get Sharepoint List'] &&
                    <GetSharepointListModal
                        action={selectedAction}
                        show={this.state.modalSwitch['Get Sharepoint List']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Set Form Component'] &&
                    <SetFormComponentModal
                        onClickVariables={onClickVariables}
                        pageLayoutFormSchema={pageLayoutFormSchema}
                        action={selectedAction}
                        variablesLists={variables}
                        show={this.state.modalSwitch['Set Form Component']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Query Json'] &&
                    <QueryJsonModal
                        onClickVariables={onClickVariables}
                        action={selectedAction}
                        variablesLists={variables}
                        show={this.state.modalSwitch['Query Json']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['SQL Query'] &&
                    <SqlQueryModal
                        action={selectedAction}
                        show={this.state.modalSwitch['SQL Query']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }

                {this.state.modalSwitch['Toast'] &&
                    <ToastModal
                        action={selectedAction}
                        show={this.state.modalSwitch['Toast']}
                        toggle={this.toggle}
                        handleActionUpdate={this.handleActionUpdate}
                        onClose={this.onClose}
                        i={currentIndex} />
                }
            </Container>

        )
    }

}

export default ActionCanvas