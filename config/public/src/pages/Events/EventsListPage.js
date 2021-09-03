import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axiosService from '../../utils/axiosService';
import { Link } from 'react-router-dom';
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row,
    NavLink,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Input,
    Table,
    Label,
} from 'reactstrap';
import API from '../../config';
import { GetAppName } from '../../utils/helperFunctions';
import moment from 'moment';
import constants from '../../config'

const apiUrl = API.API_URL;

class EventsListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            event_type: '',
            connectionId: '',
            connections: [],
            events: [],
            subscription_type: 'Google Drive',
            createModal: false,
            subscriptionId: "",
            title: "",
            content: "",
            rootFolderId : undefined,
            rootFolders : [],
            alternateLink : undefined
        };
		this.createSubscription = this.createSubscription.bind(this);
        this.onSubscTypeChange = this.onSubscTypeChange.bind(this);
        this.onConnectionIdChange = this.onConnectionIdChange.bind(this);
        this.onRootFolderChange = this.onRootFolderChange.bind(this);
        this.getConnectionList = this.getConnectionList.bind(this);
        this.getConnectionRootFolderList = this.getConnectionRootFolderList.bind(this);
		this.onSubscTypeChange = this.onSubscTypeChange.bind(this);
		this.toggle = this.toggle.bind(this);
    }

    onSubscTypeChange(e) {
        this.getConnectionList(e.target.value);
        this.setState({subscription_type: e.target.value});
    }

	onConnectionIdChange(e) {
		this.getConnectionRootFolderList(e.target.value);
		this.setState({connectionId : e.target.value});
    }
    
    onRootFolderChange(e) {
        console.log(this.state.rootFolders, this.state.rootFolders[e.target.selectedIndex].alternateLink );
        this.setState({ rootFolderId: e.target.value, alternateLink: this.state.rootFolders[e.target.selectedIndex].alternateLink });
    }
    	
	getConnectionList(type) {
        axiosService.apis('POST', '/api/getConnectionsList?type=' + type)
        .then(response => {
        let connections = response;
        this.setState({ connections });
        if (connections.length) {
            this.setState({ connectionId: connections[0]._id });
            this.getConnectionRootFolderList(connections[0]._id);
        }
        }).catch(error => {
        console.log(error)
        });
    }
    
	getConnectionRootFolderList(connectionId) {
        
        axiosService.apis("GET", `/api/connections/getRootFolders/${connectionId}`)
        .then(response => {
            let rootFolders = response;
            this.setState({ rootFolders, rootFolderId: rootFolders[0].id });
        }).catch(error => console.error(error))
	}
	
    createSubscription(e) {
        e.preventDefault();
        let that = this;
        let target = e.target;
        console.log(target);
        let postData = {
            title: target.title.value,
            description: target.content.value,
            connectionId: target.connectionId.value,
            rootFolderId: target.rootFolderId.value
        };
        console.log(postData)
        axiosService.apis("POST", '/api/createChannel', postData)
            .then(function(response) {
                let data = {
                    eventId: 'new',
                    title: target.title.value,
                    description: target.content.value,
                    connectionId: target.connectionId.value,
                    rootFolderId: target.rootFolderId.value,
                    alternateLink: that.state.alternateLink,
                    channel: response,
                    //createdBy: this.props.user.User_data._id
                }
                console.log("response:", response);
                axiosService.apis("POST", '/api/event', data)
                    .then(function(response) {
                        that.setState({'createModal': false});
                        that.getEventsList();
                    })
                    .catch(function(error) {
                        that.setState({'createModal': false});
                        console.log(error)
                    })
            })
            .catch(function(error) {
                console.log(error)
            });
    };

    getEventsList() {
        const { app_id, User_data } = this.props.user;
        var reqData = { userId: User_data._id, appId: app_id };
        fetch(apiUrl + '/events', reqData)
            .then(res => res.json())
            .then(json => {
                let events = json;
                this.setState({ events });
                //this.googleSDK();
            });
    }

    componentDidMount() {
        this.getEventsList();
    }
    
    toggle = modelName => () => {
        this.setState({
            [modelName]: !this.state[modelName]
        });
    };

    render() {
        const { connectionId, rootFolderId, events, createModal, subscriptionId, connections, rootFolders } = this.state;
        const { User_data, app_id } = this.props.user
        if (!User_data && typeof app_id == "undefined") return false;
        var rootPath = GetAppName(this.props.user);
        return (
            <Fragment>
                <Container className='mt-3'>
                    <Row className='py-3'>
                        <Col md='12'>
                            <Button className="float-right" size="sm" rounded onClick={this.toggle('createModal')}>
                                    New Subscription
                            </Button>
                            <Card className="w-100">
                                <CardBody>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Title</th>
                                                <th>Decription</th>
                                                <th>Type</th>
                                                <th>Resource URI</th>
                                                <th>Watch</th>
                                                <th>Status</th>
                                                <th>Created At</th>
                                                <th>Expiration</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events && events.map((item, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.title}</td>
                                                    <td>{item.description}</td>
                                                    <td></td>
                                                    <td style={{maxWidth: "350px", wordBreak: "break-all"}}>{item.alternateLink}</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td style={{whiteSpace: "nowrap"}}>{moment(item.updatedAt).format("YYYY-MM-DD h:mm:ss A")}</td>
                                                    <td></td>
                                                    <td><Link to={rootPath + "/eventsubscription/"+item._id}>
                                                        <Button size="sm" rounded>
                                                            Open
                                                        </Button></Link>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Modal isOpen={createModal} toggle={this.toggle('createModal')}>
                        <ModalHeader
                            className='text-center'
                            titleClass='w-100 font-weight-bold'
                            toggle={this.toggle('createModal')}
                        >
                            New Subscription
                        </ModalHeader>
                        <ModalBody>
                            <form className='mx-3 grey-text' onSubmit={this.createSubscription}>
						        <div className="md-form form-group">
                                    <input name="subscriptionId" type="hidden" value={subscriptionId} />
                                    <select name="type" className="-select md-form" onChange={this.onSubscTypeChange}>
                                        <option value={constants.TYPE_GDRIVE}>Google Drive</option>
                                        <option value={constants.TYPE_ONEDRIVE}>Sharepoint Online</option>
                                    </select>
						        </div>
                                { connections.length ?
                                    <div className="md-form form-group">
                                        <br/>
                                        <label htmlFor='connectionId' className='grey-text'>
                                        Select Connection
                                        </label>
                                        <select name="connectionId" id="connectionId"  className="form-control" value={connectionId} onChange={this.onConnectionIdChange}>
                                            {  connections.map((item, index) =>
                                                <option value={item._id} key={index}>{item.title}</option>
                                            )}
                                        </select>
                                    </div> : <input name="connectionId" type="hidden" value="" />
                                }   
                                { rootFolders.length ?
                                    <div className="md-form form-group">
                                        <br/>
                                        <label htmlFor='rootFolderId' className='grey-text'>
                                        Select Root Folder
                                        </label>
                                        <select name="rootFolderId" id="rootFolderId" className="form-control" value={rootFolderId} onChange={this.onRootFolderChange}>
                                            {  rootFolders.map((item, index) =>
                                                <option value={item.id} key={index}>{item.title}</option>
                                            )}
                                        </select>
                                    </div> : <input name="rootFolderId" type="hidden" value="" />
                                }   
                                { rootFolderId &&
                                    <div className="md-form form-group">
                                        <br/>
                                        <label htmlFor='eventType' className='grey-text'>
                                            Event Type
                                        </label>
                                        <select name="eventType" id="eventType" className="form-control">
                                                <option>Event type...</option>
                                                <option value='newfile'>New file added</option>
                                                <option value='modifiedfile'>File changed</option>
                                        </select>
                                    </div>
                                }                 
                                <br/>
                                <Label>Title</Label>
                                <Input
                                    name='title'
                                    icon='user'
                                    group
                                    type='text'
                                    validate
                                    error='wrong'
                                    success='right'
                                />
                                <Label>Description</Label>
                                <Input
                                    name='content'
                                   
                                    icon='envelope'
                                    group
                                    type="text"
                                    validate
                                    error='wrong'
                                    success='right'
                                />
                                <Button className='justify-content-center ,mt-1' type="submit">
                                    Submit
                                </Button>
                            </form>
                        </ModalBody>
                    </Modal>

                </Container>
            </Fragment>
            
        );
    }
}

const mapStateToProps = ({ user }) => ({
    user
})

export default connect(mapStateToProps, null)(EventsListPage)
