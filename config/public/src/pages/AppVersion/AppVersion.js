import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    Button,
    ModalFooter,
    Modal,
    ModalBody,
    ModalHeader,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown
} from 'reactstrap';
import { FormattedMessage } from 'react-intl';

import { getPublishApps, installPublishApp, loadApps } from "../../actions/users";
import { Toast, GetTenantName } from '../../utils/helperFunctions';

import ModalConfirmation from '../../components/ModalConfirmation';
import CustomToggle from '../../components/CustomToggle';
import InstallPage from './Component/InstallPage/installPage';
import API from '../../config';
import '../AppsSetting/AppSetting.css';


class AppVersion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedId: "",
            isIcon: false,
            isAppNameOk: false,
            IsModalConfirmation: false,
            selected_id: "",
            openInstallPage: false,
            appLists: [],
            hostname: GetTenantName().replace("-dev")
        }
    };

    componentDidMount = async () => {
        this.onload();
    }

    onHandelAction = async (type, item) => {
        const { User_data } = this.props.user;
        const userId = User_data._id;
        const appLists = await this.props.installPublishApp({ appId: item._id, type });
        Toast(appLists.message);
        this.onload();
        await this.props.loadApps({ _id: userId, hostname: User_data.company.hostname });

    }

    onload = async () => {
        const { User_data } = this.props.user;
        const userId = User_data._id;
        const appLists = await this.props.getPublishApps({ _id: userId, is_publish: true });
        this.setState({ appLists: appLists.data })
    }


    //Close Instance Page
    onCloseInstallPage = () => {
        this.setState({ openInstallPage: false, selectedRow: {}, });
    }

    render() {
        const that = this;
        const { appLists, openInstallPage, hostname } = this.state;

        return (
            <Fragment>

                <div className="panel app-setting">
                    <div className="panel-heading d-flex justify-content-between collection-header">
                        <div className="float-left">
                            <h4><FormattedMessage id="appversion.application_version" /></h4>
                        </div>
                        <div className='float-right'>
                            <button type='button' className='btn waves-effect mt-2 mr-2 btn btn-secondary' onClick={(() => window.open(API.STUDIO_URL.replace("<<tenant>>", hostname)))}>Studio</button>
                            <button type='button' className='btn waves-effect mt-2 btn btn-secondary' onClick={this.onload}>Refresh</button>
                        </div>
                    </div>
                    <div className="panel-body bg-white">
                        <div className="table-view" style={{ "border": "1px solid #dee2e6" }}>

                            <div className="table-responsive">
                                <table className="table" id="table1" >
                                    <thead className="custome-table-thead">
                                        <tr>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.app_logo" /></b></th>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.app_name" /></b></th>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.app_type" /></b></th>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.installed" /></b></th>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.installed_version" /></b></th>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.current_version" /></b></th>
                                            <th className="custome-table-th"><b><FormattedMessage id="appversion.action" /></b></th>
                                        </tr>
                                    </thead>
                                    {(appLists && appLists.length != 0) ?
                                        <tbody className="custome-table-tbody">
                                            {appLists.map((item, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td className="auto custome-table-td-v2"><i className="material-icons" style={{ fontSize: "25px", verticalAlign: "middle" }} >{item.icon}</i></td>
                                                        <td className="auto custome-table-td-v2">{item.name}</td>
                                                        <td className="auto custome-table-td-v2">{item.application_type == 2 ? 'Standalone App' : 'Portal App'}</td>
                                                        <td className="auto custome-table-td-v2">{item.is_installed ? 'Installed' : '-'}</td>
                                                        <td className="auto custome-table-td-v2">{item.installed_version}</td>
                                                        <td className="auto custome-table-td-v2">{item.current_versions}</td>
                                                        <td className="auto custome-table-td-v2">
                                                            <UncontrolledDropdown className={` ${item.is_installed ? 'is-app-version-toggle' : 'is-system-toggle'} CustomToggle`} setActiveFromChild>
                                                                <DropdownToggle tag={CustomToggle} />
                                                                <DropdownMenu size="sm" title="" right>
                                                                    {!item.is_installed && <DropdownItem className="d-flex" onClick={() => this.onHandelAction(1, item)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Install">file_download</i>Install</span></DropdownItem>}
                                                                    {(item.is_installed && (item.installed_version != item.current_versions)) && <DropdownItem className="d-flex" onClick={() => this.onHandelAction(2, item)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="update">update</i>Update</span></DropdownItem>}
                                                                    {item.is_installed && <DropdownItem className="d-flex" onClick={() => this.onHandelAction(3, item)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Uninstall">&#xE872;</i>Uninstall</span></DropdownItem>}
                                                                    {(item.is_installed && item.application_type == 2) && <DropdownItem className="d-flex" onClick={() => window.open(item.default_path)}><span className="d-flex"><i className="pointer text-primary material-icons" data-toggle="tooltip" title="Open">visibility</i>Open</span></DropdownItem>}
                                                                </DropdownMenu>
                                                            </UncontrolledDropdown>

                                                        </td>
                                                    </tr>
                                                )
                                            })
                                            }
                                        </tbody>
                                        :
                                        <tbody className="custome-table-tbody">
                                            <tr>
                                                <td colspan="7" className="text-center"><p>No any published application.</p></td>
                                            </tr>
                                        </tbody>
                                    }
                                </table>
                            </div>
                        </div>
                    </div>
                </div>


                {openInstallPage && <Modal isOpen={openInstallPage} toggle={this.onCloseInstallPage} size="xl" centered>
                    <ModalHeader toggle={this.onCloseInstallPage}>
                        <th className="custome-table-th"><h4><FormattedMessage id="appversion.app_information" /></h4></th>
                    </ModalHeader>
                    <ModalBody>
                        <InstallPage data={this.state.selectedRow} logs={this.state.logs} />
                    </ModalBody>
                </Modal>}
            </Fragment >
        )
    }
}

const mapStateToProps = ({ user }) => ({
    user
})

const mapDispatchToProps = (dispatch) => ({
    getPublishApps: (data) => dispatch(getPublishApps(data)),
    installPublishApp: (data) => dispatch(installPublishApp(data)),
    loadApps: (data) => dispatch(loadApps(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppVersion)
