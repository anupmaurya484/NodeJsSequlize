import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import Select from 'react-select';
import axios from 'axios';
import classnames from "classnames";
import {
  TabContent,
  TabPane,
  NavLink,
  NavItem,
  Nav
} from 'reactstrap';
import axiosService from '../../utils/axiosService';
import API from '../../config';
import constants from '../../config';
import { Toast, GetAppName, GetTenantName } from '../../utils/helperFunctions';

import ModalConfirmation from '../../components/ModalConfirmation';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Formik, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';
const apiUrl = API.API_URL;

const validationSchema = Yup.object().shape({
  container_type: Yup.string().required("connection type is a required field."),
  // connectionId: Yup.string().required("select connection is a required field."),
  // rootFolderId: Yup.string().required("select root folder is a required field."),
  title: Yup.string().required("title is a required field."),
  content: Yup.string().required("Description is a required field.")
});

// Initialize dropdown options for the Select component, individual users' opionts from team members
// tenant users' options from the tenant users
var options = [];

class AddContainerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      containerId: undefined,
      containers: [],
      container: null,
      ConnectionsListLoading: true,
      connections: [],
      rootFolders: [],
      current_step: 1,
      temPermission: {},
      showConnectSuccess: false,
      auth_code: null,
      auth_token: {},
      IsModalConfirmation: false,
      initState: {
        container_type: constants.TYPE_GRIDFS,
        connectionId: '',
        rootFolderId: '',
        title: '',
        content: '',
      }
    };

    this.createContainer = this.createContainer.bind(this);
    this.updateContainer = this.updateContainer.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loadContainer = this.loadContainer.bind(this);
  }

  componentDidMount() {
    const { id } = queryString.parse(location.search);
    if (["new", ""].indexOf(id) < 0) {
      this.loadContainer(id);
    } else {
      this.setState({ isLoading: false, })
    }
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
          isLoading: false,
          container: response,
          containerId: response._id,
          // container_type: response.type,
          // connectionId: response.connectionId,
          // rootFolderId: response.rootFolderId,
          // title: response.title,
          // content: response.content,
          temPermission: temPermission,
          initState: {
            container_type: response.type,
            connectionId: response.connectionId,
            rootFolderId: response.rootFolderId,
            title: response.title,
            content: response.content,
          }
        });
        if (response.type)
          this.getConnectionList(response.type);
      }).catch(error => {
        console.log(error);
      });
  }

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

  handleCreateUpdateContainer = (data) => {
    const that = this;
    const { app_id } = this.props.user
    const { temPermission, containerId } = this.state;
    temPermission.read = temPermission.read ? (temPermission.read.map((member) => ({ id: member.value, email: member.label }))) : [];
    temPermission.write = temPermission.write ? (temPermission.write.map((member) => ({ id: member.value, email: member.label }))) : [];
    temPermission.design = temPermission.design ? (temPermission.design.map((member) => ({ id: member.value, email: member.label }))) : [];


    let postData = {
      containerId: containerId,
      title: data.title,
      content: data.content,
      type: data.container_type,
      connectionId: data.connectionId,
      rootFolderId: data.rootFolderId,
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

  getConnectionList(type, setFieldValue) {

    axiosService.apis('POST', '/api/getConnectionsList?type=' + type)
      .then(response => {
        let connections = response;
        if (connections.length != 0) {
          if (setFieldValue) {
            setFieldValue('connectionId', connections[0]._id)
          }
          this.setState({ connections: connections, ConnectionsListLoading: false });
          this.getConnectionRootFolderList(connections[0]._id, setFieldValue);
        } else {
          this.setState({ ConnectionsListLoading: false });
        }
      }).catch(error => {
        console.log(error)
      });
  }

  getConnectionRootFolderList(connectionId, setFieldValue) {
    axiosService.apis("GET", `/api/connections/getRootFolders/${connectionId}`)
      .then(response => {
        let rootFolders = response;
        if (setFieldValue) {
          setFieldValue('rootFolderId', rootFolders[0].id)
        }
        this.setState({ rootFolders });
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
    const { initState, isLoading, ConnectionsListLoading, IsModalConfirmation, container_type, connections, rootFolders, current_step, temPermission, title, content, connectionId, rootFolderId } = this.state;
    const { id } = queryString.parse(location.search);

    return (
      <Fragment>
        <div tabs className='topnav nav-tabs nav-justified' style={{ "marginTop": "-29px" }} >
          <div className='container-fluid d-flex'>
            <Nav className="">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 1 })}
                  onClick={() => { this.changeCurrentView(1) }}
                >
                  <span>Settings</span>
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 2 })}
                  onClick={() => { this.changeCurrentView(2) }}>
                  <span>Permission</span>
                </NavLink>
              </NavItem>
            </Nav>

            <div className="d-flex justify-content-end" style={{ "right": "25px", "position": "absolute", paddingTop: "2px" }}>
              <div className="p-2">
                <Link to={"/design" + GetAppName(this.props.user) + "/containers"}>
                  <button className="btn btn-primary btn-sm">Exit</button>
                </Link>
              </div>
              {/* {id !== "new" && <div className="p-2">
                <button className="btn btn-primary btn-sm" onClick={() => this.setState({ IsModalConfirmation: true })}>Delete</button>
              </div>
              } */}
              <div className="p-2">
                <label type='button' for='button2' className="btn btn-primary btn-sm" >{id == "new" ? 'Create' : 'Update'}</label>
              </div>
            </div>
          </div>
        </div>

        {connections && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}
        <TabContent activeTab={current_step}>
          <br /><br />
          {!isLoading && current_step == 1 &&
            <Formik
              initialValues={initState}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={(values) => {
                const data = {
                  container_type: values.container_type,
                  connectionId: values.connectionId,
                  rootFolderId: values.rootFolderId,
                  title: values.title,
                  content: values.content,
                }
                this.handleCreateUpdateContainer(data)
              }}>
              {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                <Form id='my-form'>
                  <TabPane tabId={1}>
                    <div className='panel-body bg-white p-3'>
                      {/* <form className='mx-3 grey-text'> */}
                      <div className="form-group">
                        <label htmlFor='type' className='grey-text'>
                          Connection Type <span className='required-star'>*</span>
                        </label>
                        <select name="type" id="type" className="form-control form-select-modified" name='container_type' id='container_type' value={values.container_type} onChange={(e) => { setFieldValue('container_type', e.target.value), this.getConnectionList(e.target.value, setFieldValue) }} onBlur={handleBlur}>
                          <option value={constants.TYPE_GRIDFS}>GridFS</option>
                          <option value={constants.TYPE_GDRIVE}>Google Drive</option>
                          <option value={constants.TYPE_ONEDRIVE}>One Drive</option>
                        </select>
                        <ErrorMessage className="validation-error" name='container_type' component='div' />
                      </div>

                      {(values.container_type != constants.TYPE_GRIDFS) ?
                        <div className="form-group">
                          <label htmlFor='connectionId' className='grey-text'>
                            Select Connection<span className='required-star'>*</span>
                          </label>
                          <div className="d-flex justify-content-between">
                            <select required name="connectionId" id="connectionId" className="form-control col-lg-10 form-select-modified" value={values.connectionId} onChange={(e) => { setFieldValue('connectionId', e.target.value), this.getConnectionRootFolderList(e.target.value, setFieldValue) }} onBlur={handleBlur}>
                              {connections.map((item, index) =>
                                <option value={item._id} key={index}>{item.title}</option>
                              )}
                            </select>
                            <ErrorMessage className="validation-error" name='selectconnection' component='div' />
                            <Link to={"/design" + GetAppName(this.props.user) + "/connection-setup?connection_type=" + values.container_type}>
                              <Button className="btn Ripple-parent btn-sm btn-primary"> Add New</Button>
                            </Link>
                          </div>
                        </div> : <input name="connectionId" type="hidden" value="" />
                      }

                      {/* {(values.container_type !== constants.TYPE_GRIDFS && connections.length == 0 && ConnectionsListLoading == false) &&
                        <Link to={"/design" + GetAppName(this.props.user) + "/connection-setup?connection_type=" + values.container_type}>
                          <Button className="btn Ripple-parent btn-sm btn-primary"> Add New</Button>
                        </Link>
                      } */}

                      {values.container_type !== constants.TYPE_GRIDFS && rootFolders.length ?
                        <div className="form-group">
                          <label htmlFor='rootFolderId' className='grey-text'>
                            Select Root Folder<span className='required-star'>*</span>
                          </label>
                          <select name="rootFolderId" id="rootFolderId" className="form-control form-select-modified" value={values.rootFolderId} onChange={handleChange} onBlur={handleBlur}>
                            {rootFolders.map((item, index) =>
                              <option value={item.id} key={index}>{item.title}</option>
                            )}
                          </select>
                          <ErrorMessage className="validation-error" name='rootFolderId' component='div' />
                        </div> : <input name="rootFolderId" type="hidden" value="" />
                      }

                      <div className="form-group">
                        <label htmlFor='title' className='grey-text'>
                          Title<span className='required-star'>*</span>
                        </label>
                        <input
                          type='text'
                          id='title'
                          name='title'
                          className='form-control'
                          value={values.title}
                          onChange={handleChange} onBlur={handleBlur}
                        />
                        <ErrorMessage className="validation-error" name='title' component='div' />
                      </div>

                      <div className="form-group">
                        <label htmlFor='content' className='grey-text'>
                          Description<span className='required-star'>*</span>
                        </label>
                        <textarea
                          className="form-control"
                          id="content"
                          name='content'
                          rows="4"
                          value={values.content}
                          onChange={handleChange} onBlur={handleBlur}
                        />
                        <ErrorMessage className="validation-error" name='content' component='div' />
                      </div>

                      {/* </form> */}
                      {id !== "new" && <div className="">
                        <button className="btn btn-danger btn-md" onClick={() => this.setState({ IsModalConfirmation: true })}>Delete</button>
                      </div>
                      }
                      <input type="submit" style={{ "display": "none" }} name="button2" id="button2" value="Submit" />

                    </div>
                  </TabPane>
                </Form>
              )}

            </Formik>
          }

          {current_step == 2 &&
            <TabPane tabId={2}>
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
            </TabPane>
          }
        </TabContent>
        {/* </div> */}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps, null)(AddContainerPage)