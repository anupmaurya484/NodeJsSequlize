import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';

import axiosService from '../../utils/axiosService';
import API from '../../config';
import constants from '../../config';
import folderImage from '../../assets/images/Folder_girl.svg';
import { GetAppName, Toast, GetTenantName, AppDesign } from '../../utils/helperFunctions';

import { Input, Label, Container, Table, Row, Col, Card, Modal, ModalBody, ModalHeader, Button, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, CardBody } from "reactstrap";
import { FormattedMessage } from 'react-intl';
import ModalConfirmation from '../../components/ModalConfirmation';
import CustomToggle from '../../components/CustomToggle';
import DataTable from "../../components/DataTable"
import Breadcrumbs from '../../components/Common/Breadcrumb';
// import CloudDropdown from '../Connection/CloudDropdown';


class ConnectionListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userLevel: this.props.user.User_data.level,
            connections: [],
            connection_type: null,
            auth_code: null,
            auth_token: {},
            createModal: false,
            connectionId: "",
            title: "",
            content: "",
            userId: this.props.user.User_data._id,
            accessToken: "",
            updateModal: false,
            showConnectSuccess: false,
            IsModalConfirmation: false,
            selected_id: null,
            activeTab: 1,
            clientId: '',
            login: '',
            filterType: '',

        };
        this.updateConnection = this.updateConnection.bind(this);
        this.inputChangeHandler = this.inputChangeHandler.bind(this);
    }

    inputChangeHandler = event => {
        let value = event.target.value;
        let name = event.target.name;
        let changeSet = {}
        changeSet[name] = value;
        let auth_token = this.state.auth_token;
        name.match(/^(userId|accessToken)$/) ? auth_token[name] = value : null;
        this.setState(name.match(/^(userId|accessToken)$/) ? auth_token : changeSet)
    };

    openUpdateModal = (connection) => {
        this.setState({
            updateModal: true,
            connectionId: connection._id,
            auth_code: null,
            connection_type: connection.type,
            title: connection.title,
            content: connection.content,
            userId: connection.userId || "",
            accessToken: connection.auth_token.access_token || "",
            auth_token: connection.auth_token || null,
            showConnectSuccess: false
        });
    };

    updateConnection(e) {
        e.preventDefault();
        let target = e.target;
        let self = this;
        const { auth_code, auth_token } = this.state;
        let connectionId = target.connectionId.value;
        let postData = {
            title: target.title.value,
            content: target.content.value,
            auth_token: (target.type.value !== constants.TYPE_NINTEX) ? auth_token : {
                userId: target.userId.value,
                accessToken: target.accessToken.value,
            },
            type: target.type.value,
            code: auth_code,
            updatedBy: this.props.user.User_data.id
        };

        axiosService.apis("PUT", `/api/connections/${connectionId}`, postData)
            .then(response => {
                self.getConnectionList();
            }).catch(error => {
                console.log(error);
            });

        self.setState({
            'updateModal': false
        })

    };

    googleSDK() {
        window['googleSDKLoaded'] = () => {
            window['gapi'].load('auth2', () => {
                this.auth2 = window['gapi'].auth2.init({
                    apiKey: constants.googleApiKey,
                    discoveryDocs: constants.googleDiscoveryOptions,
                    client_id: constants.googleClientId,
                    scope: constants.googleScopes,
                });
            });
        }

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://apis.google.com/js/api.js?onload=googleSDKLoaded";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'google-jssdk'));
    }

    getConnectionList(option) {
        const { app_id, User_data } = this.props.user;
        const option_payload = option ? option : { search: "" };
        var reqData = { userId: User_data._id, appId: app_id, userLevel: User_data.level, ...option_payload }

        axiosService.apis("POST", `/api/getConnectionsList`, reqData)
            .then(response => {
                let connections = response;
                this.setState({ connections });
                //this.googleSDK();
            }).catch(error => console.error(error))

    }

    componentDidMount() {
        this.getConnectionList();
    }

    callDelete = (id) => {
        this.setState({ selected_id: id, IsModalConfirmation: true })
    }


    handelConfirm = async (response) => {
        const that = this;
        const { selected_id } = this.state;
        if (response) {
            axiosService.apis("DELETE", `/api/connections/` + selected_id)
                .then(response => {
                    that.getConnectionList();
                    that.setState({ IsModalConfirmation: false })
                }).catch(error => console.error(error))

        } else {
            this.setState({ IsModalConfirmation: false })
        }
    }

    getType = type => {
        if (type)
            return constants.storageTypes[type];
        else
            return constants.storageTypes;
    }

    async handleInputChange(e) {
        const { name, value } = e.target;
        await this.setState({ [name]: value });
        this.getConnectionList()
    }

    getTableRows = () => {
        const that = this;
        const { connections } = this.state;
        var rootPath = GetAppName(this.props.user);
        let rows = connections && connections.map((connection, i) => ({
            title: connection.title,
            type: connection.type,
            usedcount: connection.containers.length,
            updatedAt: moment(connection.updatedAt).format("YYYY-MM-DD h:mm:ss A"),
            action: <div style={{ "width": "70px", "display": "flex" }}>
                <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
                    <DropdownToggle tag={CustomToggle} />
                    <DropdownMenu size="sm" title="" right flip>
                        {AppDesign() && <DropdownItem className="d-flex" onClick={() => this.openUpdateModal(connection)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>}
                        {AppDesign() && <DropdownItem className="d-flex" onClick={() => this.callDelete(connection._id)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>}
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        }));
        return rows
    }

    doSearch(evt) {
        const that = this;
        var searchText = evt.target.value; // this is the search text
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            that.getConnectionList({ currentPage: 1, search: searchText, formType: this.state.formType })
        }, 300);
    }

    render() {
        const { title, content, userId, accessToken, connection_type, connections, connectionId, userLevel, IsModalConfirmation, filterType } = this.state;
        const { updateModal } = this.state;

        const data = {
            columns: [
                {
                    label: 'Title',
                    field: 'title',
                },
                {
                    label: 'Type',
                    field: 'type',
                },
                {
                    label: 'Used Count',
                    field: 'usedcount',
                },
                {
                    label: 'Updated At',
                    field: 'updatedAt',
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'disabled'
                }
            ],
            rows: this.getTableRows(),
        }

        return (
            <Fragment>

                {(connections && connections.length >= 0) &&
                    <ModalConfirmation
                        IsModalConfirmation={IsModalConfirmation}
                        showOkButton={true}
                        showCancelButton={true}
                        title="Delete"
                        text="Are you sure you want to delete?"
                        onClick={(response) => this.handelConfirm(response)} />}


                <Breadcrumbs title="Connections Lists" breadcrumbItem={"Dashboard"} />
                <Row className="page-header">
                    <Col col='6'>
                        <div className='page-heading-title'>
                            <h3><b>Connections List</b></h3>
                        </div>
                    </Col>
                    <Col col="6">
                        <div className="d-flex align-items-center justify-content-end">
                            <div className="search-box mr-2">
                                <div className="position-relative">
                                    <input onChange={(e) => this.doSearch(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                </div>
                            </div>
                            {/* <CloudDropdown handleTypeChange={this.handleTypeChange} filterType={filterType} /> */}
                            <div className="page-title-right d-flex ">
                                {AppDesign() &&
                                    <Link to={"/design" + GetAppName(this.props.user) + "/connection-setup"}>
                                        <Button size="sm"> Add New Connection </Button>
                                    </Link>
                                }
                            </div>
                        </div>
                    </Col>
                </Row>
                {(connections && connections.length != 0) &&
                    <div style={{ marginBottom: '20px' }}>
                        <Row className='py-3'>
                            <Col md='12'>
                                <Card>
                                    <DataTable
                                        isPagination={false}
                                        isSearch={false}
                                        totalPage={25}
                                        correntPage={1}
                                        data={data}
                                        onClicks={(e) => console.log(e)} />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                }

                {(connections && connections.length == 0) &&
                    <div className='h-100 container-fluid'>
                        <div className='row h-100 justify-content-center full-height'>
                            <div className='col-12 h-100 align-self-center text-center'>
                                <img src={folderImage} className="figure-img img-fluid" style={{ height: "200px" }} />
                                <p>List of Connection</p>
                            </div>
                        </div>
                    </div>
                }

                <Modal isOpen={updateModal} toggle={() => this.setState({ updateModal: false })}>
                    <ModalHeader closeButton className='text-center w-100 font-weight-bold' toggle={() => this.setState({ updateModal: false })}>
                        Update {connection_type} Connection
                    </ModalHeader>
                    <ModalBody>
                        <form className='mx-3 grey-text' onSubmit={this.updateConnection}>
                            <input name="connectionId" type="hidden" value={connectionId} />
                            <input name="type" type="hidden" value={connection_type} />
                            <Label>Title<span className='required-star'>*</span></Label>
                            <Input
                                name='title'
                                label='Title'
                                value={title}
                                icon='user'
                                group
                                type='text'
                                validate
                                error='wrong'
                                success='right'
                                onChange={this.inputChangeHandler}
                            />
                            <Label>Description<span className='required-star'>*</span></Label>
                            <Input
                                name='content'
                                value={content}
                                label='Description'
                                icon='envelope'
                                group
                                type="text"
                                validate
                                error='wrong'
                                success='right'
                                onChange={this.inputChangeHandler}
                            />
                            {
                                (connection_type === constants.TYPE_NINTEX) &&
                                <div>
                                    {(userLevel < 7) &&
                                        <Input name='userId' label="User ID" icon='id-badge' type='text' value={userId} disabled onChange={this.inputChangeHandler} />}
                                    {(userLevel >= 7) &&
                                        <Input name='userId' label="User ID" icon='id-badge' type='text' value={userId} onChange={this.inputChangeHandler} />}
                                    <Input name='accessToken' label="Access Token" icon='key' type='text' value={accessToken} />
                                </div>
                            }
                            <Button className='justify-content-center mt-2' type="submit"> Submit</Button>
                        </form>
                    </ModalBody>
                </Modal>
            </Fragment >

        );
    }
}

const mapStateToProps = ({ user }) => ({
    user
})

export default connect(mapStateToProps, null)(ConnectionListPage)
