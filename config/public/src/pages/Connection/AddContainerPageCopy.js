import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import Select from 'react-select';
import axios from 'axios';

import axiosService from '../../utils/axiosService';
import API from '../../config';
import constants from '../../config';
import { Toast, GetAppName, GetTenantName } from '../../utils/helperFunctions';

import ModalConfirmation from '../../components/ModalConfirmation';
import Breadcrumbs from '../../components/Common/Breadcrumb';
const apiUrl = API.API_URL;


// Initialize dropdown options for the Select component, individual users' opionts from team members
// tenant users' options from the tenant users
var options = [];

class AddContainerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      containers: [],
      container: null,
      ConnectionsListLoading: true,
      connections: [],
      container_type: constants.TYPE_GRIDFS,
      title: "",
      content: "",
      connectionId: "",
      containerId: undefined,
      rootFolderId: "",
      rootFolders: [],
      current_step: 1,
      temPermission: {},
      showConnectSuccess: false,
      auth_code: null,
      auth_token: {},
      IsModalConfirmation: false,
    };

    this.createContainer = this.createContainer.bind(this);
    this.updateContainer = this.updateContainer.bind(this);
    this.onConnectionTypeChange = this.onConnectionTypeChange.bind(this);
    this.onConnectionIdChange = this.onConnectionIdChange.bind(this);
    this.onRootFolderChange = this.onRootFolderChange.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadContainer = this.loadContainer.bind(this);
  }

  componentDidMount() {
    const { id } = queryString.parse(location.search);
    if (["new", ""].indexOf(id) < 0) this.loadContainer(id);
    options = this.props.user.User_data.team ? this.props.user.User_data.team.members.map((member) => ({ value: member.id, label: member.email })) : [];
  }

  loadContainer(id) {
    var { temPermission } = this.state;
    axiosService.apis("GET", "/api/containers/" + id)
      .then(response => {
        console.log(response)
        if (response.permission) {
          temPermission.read = response.permission.read ? (response.permission.read.map((m) => ({ value: m.id, label: m.email }))) : [];
          temPermission.write = response.permission.write ? (response.permission.write.map((m) => ({ value: m.id, label: m.email }))) : [];
          temPermission.design = response.permission.design ? (response.permission.design.map((m) => ({ value: m.id, label: m.email }))) : [];
        }
        this.setState({
          container: response,
          containerId: response._id,
          container_type: response.type,
          connectionId: response.connectionId,
          rootFolderId: response.rootFolderId,
          title: response.title,
          content: response.content,
          temPermission: temPermission,
        })
        if (response.type)
          this.getConnectionList(response.type);
      }).catch(error => {
        console.log(error);
      });
  }

  onConnectionTypeChange(e) {
    this.getConnectionList(e.target.value);
    this.setState({ container_type: e.target.value })
  }

  onConnectionIdChange(e) {
    this.getConnectionRootFolderList(e.target.value);
    this.setState({ connectionId: e.target.value });
  }

  onRootFolderChange(e) {
    console.log(e.target.value)
    this.setState({ rootFolderId: e.target.value });
  }

  inputChangeHandler = event => {
    let value = event.target.value;
    let name = event.target.name;
    let changeSet = {}
    changeSet[name] = value;
    this.setState(changeSet)
  };

  handleInputChange = (inputType, e) => {
    var { title, content, temPermission } = this.state;
    if (inputType === "title") {
      title = e.target.value;
      this.setState({ title: title })
    } else if (inputType === "content") {
      content = e.target.value;
      this.setState({ content: content })
    } else if (inputType === "permissionRead") {
      temPermission.read = e //.map(({value}) => value)
      console.log("permissionRead: ", temPermission.read)
      this.setState({ temPermission: temPermission })
    } else if (inputType === "permissionWrite") {
      temPermission.write = e //.map(({value}) => value)
      console.log("permissionWrite: ", temPermission.write)
      this.setState({ temPermission: temPermission })
    } else if (inputType === "permissionDesign") {
      temPermission.design = e //.map(({value}) => value)
      console.log("permissionDesign: ", temPermission.design)
      this.setState({ temPermission: temPermission })
    }
  }

  changeCurrentView = id => {
    if (this.state.current_step != id)
      this.setState({ current_step: id });
  }

  handleCreateUpdateContainer = () => {
    const that = this;
    const { app_id } = this.props.user
    const { title, content, container_type, connectionId, rootFolderId, temPermission, containerId } = this.state;
    temPermission.read = temPermission.read ? (temPermission.read.map((member) => ({ id: member.value, email: member.label }))) : [];
    temPermission.write = temPermission.write ? (temPermission.write.map((member) => ({ id: member.value, email: member.label }))) : [];
    temPermission.design = temPermission.design ? (temPermission.design.map((member) => ({ id: member.value, email: member.label }))) : [];


    let postData = {
      containerId: containerId,
      title: title,
      content: content,
      type: container_type,
      connectionId: connectionId,
      rootFolderId: rootFolderId,
      permission: temPermission,
      app_id
    };

    axiosService.apis("POST", "/api/containers", postData)
      .then(response => {
        Toast(response.message ? response.message : 'Container has been updated.')
        const rootPath = GetAppName(this.props.user);
        that.props.history.push("/design" + rootPath + '/containers')
      }).catch(error => {
        console.log(error);
      });
  }

  createContainer(e) {
    e.preventDefault();
    let target = e.target;
    const that = this;

    let postData = {
      title: target.title.value,
      content: target.content.value,
      type: target.type.value,
      connectionId: target.connectionId ? target.connectionId.value : "",
      rootFolderId: target.rootFolderId ? target.rootFolderId.value : "",
    };

    axiosService.apis("POST", "/api/containers", postData)
      .then(response => {
        Toast(response.message)
        const rootPath = GetAppName(this.props.user);
        that.props.history.push("/design" + rootPath + '/containers')
      }).catch(error => {
        console.log(error);
      });

  };

  updateContainer(e) {
    e.preventDefault();
    let target = e.target;
    let self = this;
    let containerId = target.containerId.value;
    let postData = {
      title: target.title.value,
      content: target.content.value,
      type: target.type.value,
      connectionId: target.connectionId ? target.connectionId.value : "",
      rootFolderId: target.rootFolderId ? target.rootFolderId.value : "",
    };

    axios.put(apiUrl + `/containers/${containerId}`, postData)
      .then(function (response) {
        Toast(response.message)
        self.getContainerList();
        const rootPath = GetAppName(self.props.user);
        self.props.history.push("/design" + rootPath + '/containers')
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  getType = type => {
    if (type)
      return constants.storageTypes[type];
    else
      return constants.storageTypes;
  }

  getConnectionList(type) {
    console.log(type)

    axiosService.apis('POST', '/api/getConnectionsList?type=' + type)
      .then(response => {
        let connections = response;
        if (connections.length != 0) {
          this.setState({ connectionId: connections[0]._id, connections: connections, ConnectionsListLoading: false });
          this.getConnectionRootFolderList(connections[0]._id);
        } else {
          this.setState({ ConnectionsListLoading: false });
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

  handelConfirm(response) {
    const that = this;
    const { containerId } = this.state;
    if (response) {
      axiosService.apis("DELETE", `/api/containers/${containerId}`)
        .then(response => {
          Toast(response.message)
          const rootPath = GetAppName(that.props.user);
          that.props.history.push("/design" + rootPath + '/containers')
        }).catch(error => console.error(error))
    }
    else {
      this.setState({ IsModalConfirmation: false })
    }
  }

  render() {
    const { ConnectionsListLoading, IsModalConfirmation, container_type, connections, rootFolders, current_step, temPermission, title, content, connectionId, rootFolderId } = this.state;
    const { id } = queryString.parse(location.search);
    return (
      <Fragment>

        {connections && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}

        <div className='panel'>
          <div className='panel-heading collection-header'>
            <div className='link-block'>
              <span className={current_step == 1 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(1)}><FormattedMessage id="container.settings" /></span>
              <span className={current_step == 2 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(2)}>permission</span>
            </div>


            <div className="d-flex justify-content-end" style={{ "right": "25px", "position": "absolute" }}>
              <div className="p-2">
                <Link to={"/design" + GetAppName(this.props.user) + "/containers"}>
                  <button className="btn btn-primary btn-sm">Exit</button>
                </Link>
              </div>
              {id !== "new" && <div className="p-2">
                <button className="btn btn-primary btn-sm" onClick={() => this.setState({ IsModalConfirmation: true })}>Delete</button>
              </div>
              }
              <div className="p-2">
                <button className="btn btn-primary btn-sm" onClick={this.handleCreateUpdateContainer}>{id == "new" ? 'Create' : 'Update'}</button>
              </div>
            </div>
          </div>

          {current_step == 1 &&
            <div className='panel-body bg-white p-3'>
              <form className='mx-3 grey-text'>
                <div className="form-group">
                  <label htmlFor='type' className='grey-text'>
                    Connection Type
                  </label>
                  <select name="type" id="type" className="form-control form-select-modified" value={container_type} onChange={this.onConnectionTypeChange}>
                    <option value={constants.TYPE_GRIDFS}>GridFS</option>
                    <option value={constants.TYPE_GDRIVE}>Google Drive</option>
                    <option value={constants.TYPE_ONEDRIVE}>One Drive</option>
                  </select>
                </div>

                {container_type !== constants.TYPE_GRIDFS && connections.length ?
                  <div className="form-group">
                    <label htmlFor='connectionId' className='grey-text'>
                      Select Connection
                    </label>
                    <div className="d-flex justify-content-between">
                      <select name="connectionId" id="connectionId" className="form-control col-lg-10 form-select-modified" value={connectionId} onChange={this.onConnectionIdChange}>
                        {connections.map((item, index) =>
                          <option value={item._id} key={index}>{item.title}</option>
                        )}
                      </select>
                      <Link to={"/design" + GetAppName(this.props.user) + "/connection-setup?connection_type=" + container_type}>
                        <Button className="btn Ripple-parent btn-sm btn-primary"> Add New</Button>
                      </Link>
                    </div>
                  </div> : <input name="connectionId" type="hidden" value="" />
                }

                {(container_type !== constants.TYPE_GRIDFS && connections.length == 0 && ConnectionsListLoading == false) &&
                  <Link to={"/design" + GetAppName(this.props.user) + "/connection-setup?connection_type=" + container_type}>
                    <Button className="btn Ripple-parent btn-sm btn-primary"> Add New</Button>
                  </Link>
                }

                {container_type !== constants.TYPE_GRIDFS && rootFolders.length ?
                  <div className="form-group">
                    <label htmlFor='rootFolderId' className='grey-text'>
                      Select Root Folder
                    </label>
                    <select name="rootFolderId" id="rootFolderId" className="form-control form-select-modified" value={rootFolderId} onChange={this.onRootFolderChange}>
                      {rootFolders.map((item, index) =>
                        <option value={item.id} key={index}>{item.title}</option>
                      )}
                    </select>
                  </div> : <input name="rootFolderId" type="hidden" value="" />
                }

                <div className="form-group">
                  <label htmlFor='title' className='grey-text'>
                    Title
                  </label>
                  <input
                    type='text'
                    id='title'
                    name='title'
                    className='form-control'
                    value={title}
                    onChange={event => this.handleInputChange('title', event)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor='content' className='grey-text'>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    rows="4"
                    value={content}
                    onChange={event => this.handleInputChange('content', event)}
                  />
                </div>

              </form>
            </div>
          }

          {current_step == 2 &&
            <div className='panel-body bg-white p-3'>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "20%" }}>Access</th>
                    <th scope="col" style={{ width: "80%" }}>Users</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Read</td>
                    <td><Select
                      value={temPermission.read}
                      isMulti
                      name="permissionRead"
                      options={options}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={(e) => this.handleInputChange('permissionRead', e)}
                    />
                    </td>
                  </tr>
                  <tr>
                    <td>Write</td>
                    <td><Select
                      value={temPermission.write}
                      isMulti
                      name="permissionWrite"
                      options={options}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={(e) => this.handleInputChange('permissionWrite', e)}
                    />
                    </td>
                  </tr>
                  <tr>
                    <td>Design</td>
                    <td><Select
                      value={temPermission.design}
                      isMulti
                      name="permissionDesign"
                      options={options}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={(e) => this.handleInputChange('permissionDesign', e)}
                    />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          }

        </div>


      </Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps, null)(AddContainerPage)