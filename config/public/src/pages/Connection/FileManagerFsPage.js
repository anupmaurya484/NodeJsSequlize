import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FileManager, FileNavigator } from '@opuscapita/react-filemanager';
import connectorNodeV1 from '@opuscapita/react-filemanager-connector-node-v1';
import constants from '../../config';

import API from '../../config';
import axiosService from '../../utils/axiosService';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { GetTenantName } from '../../utils/helperFunctions';

const apiUrl = API.API_URL;

class FileManagerFsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      containerId: this.props.match.params.containerId,
      containerDetail: {
        title: "",
        type: "",
        connectionStatus: constants.connection_status_not_connected
      }
    };
  }

  disconnectGDrive() {
    this.updateConnection(constants.connection_status_not_connected, {}, {});
  }

  getContainerDetails() {
    axiosService.apis('GET', '/api/containers/' + this.state.containerId)
      .then(response => {
        this.setState({
          containerDetail: response
        });
      }).catch(error => {
        console.log(error)
      })
  }

  updateConnection(connectionStatus, authData, userData) {
    let self = this;
    let postData = {
      connectionStatus: connectionStatus,
      auth_data: authData,
      auth_user_data: userData
    };

    axiosService.apis('POST', `/containers/${this.state.containerId}/connection`, postData)
      .then(response => {
        self.setState({
          containerDetail: response
        });
      }).catch(error => {
        console.log(error)
      })
  };

  componentDidMount() {
    this.getContainerDetails();
  }

  render() {
    const { containerId, containerDetail } = this.state;
    const gridfsApiOptions = {
      ...connectorNodeV1.apiOptions,
      apiRoot: apiUrl + '/' + containerId + "/" + GetTenantName()
    }

    return (
      <Fragment>
        <Breadcrumbs title="File-explore" breadcrumbItem="File-explore" />
        <div className='row'>
          {
            containerDetail && containerDetail.type ?
              <div className="col-lg-12" style={{ height: '480px' }}>
                <FileManager>
                  <FileNavigator
                    id="filemanager-gfs"
                    api={connectorNodeV1.api}
                    apiOptions={gridfsApiOptions}
                    capabilities={connectorNodeV1.capabilities}
                    listViewLayout={connectorNodeV1.listViewLayout}
                    viewLayoutOptions={connectorNodeV1.viewLayoutOptions}
                  />
                </FileManager>
              </div> : ""
          }
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps, null)(FileManagerFsPage);
