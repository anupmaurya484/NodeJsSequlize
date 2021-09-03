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

import {
	CreateUpdateAppList,
	loadApps,
	publishAppService,
	CreateSidenavConfig,
	DeleteApplists
} from "../../actions/users";

import axiosService from '../../utils/axiosService';
import SidenavSetup from '../Sidenav/SidenavSetup';
import { Toast } from '../../utils/helperFunctions';

import AppUserPermission from './AppUserPermission';
import ModalConfirmation from '../../components/ModalConfirmation';
import CustomToggle from '../../components/CustomToggle';
import UploadImage from '../../components/UploadImage';
import CreateApp from './CreateApp';
import auth from "../../actions/auth";
import API from '../../config';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import './AppSetting.css';

const apiUrl = API.API_URL;


class AppSetting extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedUsers: [],
			groupLink_date: null,
			selectedId: "",
			create_update_model: false,
			isIcon: false,
			IsUserList: false,
			IsSideMenu: false,
			isAppNameOk: false,
			IsModalConfirmation: false,
			selected_id: "",
			publish_app: false
		}
	};

	componentDidMount = async () => {

	}

	handelConfirm = async (response) => {
		const that = this;
		const { selected_id } = this.state;
		if (response) {
			const { User_data } = this.props.user
			const userId = User_data._id
			const result = await this.props.DeleteApplists({ _id: selected_id });
			const result2 = result.res == 200 ? await this.props.loadApps({ _id: userId }) : result.res;
			this.setState({ IsModalConfirmation: false })
		} else {
			this.setState({ IsModalConfirmation: false })
		}
	}

	handleClickCreateApp = async (data) => {
		return new Promise(async (resolve, reject) => {
			try {
				console.log(data);
				const { User_data, UserApps } = this.props.user;
				let { groupLink_date } = this.state;
				const userId = User_data._id;
				const newDate = new Date().toISOString();
				const defaultData = { _id: "", appName: "", appLogo: "" };
				if (data._id == "") {
					const body = {
						name: data.appName,
						description: data.description,
						application_type: data.application_type,
						isSideNav: data.isSideNav,
						isTopNav: data.isTopNav,
						icon: data.appLogo,
						createdTime: newDate,
						createdBy: userId,
						modifiedTime: newDate,
						modifiedBy: userId,
						is_deleted: 0,
						userList: [],
						default_path: data.default_path === 'custom_url' ? data.default_path_url : data.default_path,
						is_url_page: data.default_path === 'custom_url' ? true : false
					}
					var isUnique = UserApps.some(x => x.name == data.appName);
					if (isUnique) {
						Toast("Name is already used, please change", 'error');
						resolve(false)
					} else {
						const result = await this.props.CreateUpdateAppList(body);
						if (result.res == 200) {
							const sidenav = {
								app_id: result.result,
								createdTime: newDate,
								createdBy: userId,
								modifiedTime: newDate,
								modifiedBy: userId,
								is_deleted: 0,
								groupLinks: {
									"header": "Content",
									"dividerBottom": true,
									"links": data.sidenav_config
								},
								default_path: data.default_path
							}
							await this.props.CreateSidenavConfig(sidenav);
							await this.props.loadApps({ _id: userId });
							this.setState({ data: defaultData });
							Toast(result.message);
							resolve(true)
						} else {
							resolve(false)
							Toast(result2.message);
						}
					}

				} else {
					var isUnique = UserApps.some(x => (x.name == data.appName && x._id != data._id));
					if (isUnique) {
						Toast("Name is already used, please change", 'error');
						resolve(false)
					} else {
						const body = {
							_id: data._id,
							name: data.appName,
							description: data.description,
							application_type: data.application_type,
							isSideNav: data.isSideNav,
							isTopNav: data.isTopNav,
							icon: data.appLogo,
							modifiedTime: newDate,
							modifiedBy: userId,
							default_path: data.default_path === 'custom_url' ? data.default_path_url : data.default_path,
							is_url_page: data.default_path === 'custom_url' ? true : false
						}
						const result = await this.props.CreateUpdateAppList(body);
						if (groupLink_date.groupLinks) {
							groupLink_date.groupLinks[0]["links"] = data.sidenav_config;
							const sidenav = {
								_id: groupLink_date._id,
								app_id: groupLink_date.app_id,
								groupLinks: groupLink_date.groupLinks
							}

							console.log(sidenav);
							await this.props.CreateSidenavConfig(sidenav);
						}
						const result2 = result.res == 200 ? await this.props.loadApps({ _id: userId }) : result.res;
						this.setState({ data: defaultData });
						Toast(result.message);
						resolve(true);
					}
				}
			} catch (err) {
				console.log(err);
				resolve(false);
			}
		});
	}

	handleEditApp = async (data) => {
		const response = await axiosService.apis('GET', `/api/sidenav-config?app_id=${data._id}`)
		var data = {
			_id: data._id,
			appName: data.name,
			description: data.description,
			application_type: data.application_type,
			appLogo: data.icon,
			default_path: data.is_url_page ? 'custom_url' : data.default_path,
			sidenav_config: response.data ? response.data.groupLinks : [],
			isSideNav: data.isSideNav,
			isTopNav: data.isTopNav,
			is_url_page: data.is_url_page || false,
			default_path_url: data.is_url_page ? data.default_path : ""
		}
		this.setState({ groupLink_date: response.data, data: data, create_update_model: true })
	}

	SidenavModel = () => {
		const { data, selectedId } = this.state;
		var appconfig = { selectedId: selectedId }
		return (
			<Modal className="sidenav-page-model w-50" isOpen={true} toggle={() => this.setState({ IsSideMenu: false })} size="sm">
				<ModalBody>
					<SidenavSetup
						appconfig={appconfig}
						closeModel={(e) => this.setState({ IsSideMenu: false })} />
				</ModalBody>
			</Modal>
		)
	}

	handlePublishiApp = async (item_app, isPublish) => {
		if (item_app) {
			this.setState({ publishApp: item_app })
		} else if (isPublish) {
			this.setState({ publishApp: false });
			const { User_data, UserApps } = this.props.user;
			const userId = User_data._id;

			const current_versions = this.state.publishApp.current_versions;
			const payload = {
				"appId": this.state.publishApp._id,
				"versionId": current_versions ? current_versions.replace(current_versions, "v" + (Number(current_versions.split(".")[0].split("v")[1]) + 1) + ".0.0") : "v1.0.0",
				"createdTime": new Date().toISOString()
			}
			const result = await this.props.publishAppService(payload);
			const result2 = result.status ? await this.props.loadApps({ _id: userId }) : result.res;
			Toast(result.message);
		} else {
			this.setState({ publishApp: false });
		}

	}

	openPage = (item, apps, externalPath) => {
		const default_path = item.default_path;
		const link = item.link;
		const that = this;
		debugger
		if (item.application_type == 2 && externalPath != "") {
			window.location.href = "/design/" + item.name;
		} else if (default_path && default_path != "") {
			const app_info = apps.find(x => x._id === item._id);
			if (item.is_url_page === true) {
				if (externalPath != "") {
					window.location.href = "/design/" + item.name;
				} else {
					if (default_path.split(link).length >= 2) {
						window.open(default_path, '_blank');
					} else {
						window.open(default_path);
					}
				}
			} else if (app_info) {
				const links = [].concat.apply([], app_info.sidenav.groupLinks[0].map(x => x.links))
				const find_index = links.findIndex(x => x.route == default_path)
				if (find_index === -1 || ["/dashboard", "dashboard"].includes(default_path)) {
					window.location.href = externalPath + link;
					//window.open(externalPath + link)
				} else {
					window.location.href = externalPath + link + default_path
					//window.open(externalPath + link + default_path);
				}
			} else {
				window.open(link);
			}
		} else {
			window.open(link);
		}
	}

	UserList = () => (
		<AppUserPermission
			selectedId={this.state.selectedId}
			selectedUsers={this.state.selectedUsers}
			user={this.props.user}
			toggle={() => this.setState({ IsUserList: false })}
			CreateUpdateAppList={this.props.CreateUpdateAppList}
			loadApps={this.props.loadApps} />)

	render() {
		const { create_update_model, IsUserList, IsSideMenu, IsModalConfirmation, data, publishApp } = this.state;
		console.log(this.props.user);
		const { UserApps, User_data, isLoggedIn } = this.props.user;
		const that = this;

		var adminApp = [{ name: "Admin", icon: "accessibility", link: "/user", is_system: 1, _id: "5f190371db85375976b48102" }];
		var dashboardApp = [{ name: "Dashboard", icon: "dashboard", link: "/apps/dashboard", is_system: 1, _id: "5f190371db85375976b48101" }];
		const apps2 = (UserApps && UserApps.length != 0) ? dashboardApp.concat(UserApps) : dashboardApp;
		const apps = (isLoggedIn && (User_data.level == 8 || User_data.level == 6)) ? adminApp.concat(apps2) : apps2;

		const steps = [
			{ name: 'App Settings', component: <div></div> },
			{ name: 'Assign app icon', component: <div></div> },
			{ name: 'Enable content types', component: <div></div> },
		];

		return (
			<Fragment>
				<Breadcrumbs title="AppSetting" breadcrumbItem="Dashboard" />
				{(apps && apps.length) && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}
				{(publishApp) && <ModalConfirmation IsModalConfirmation={true} showOkButton={true} showCancelButton={true} title="Publish App confirmation" text="Are you sure you want to publish this app?" onClick={(response) => this.handlePublishiApp(null, response)} />}


				{ create_update_model &&
					<CreateApp
						data={data}
						handleClickCreateUpdateApp={this.handleClickCreateApp}
						onClose={() => this.setState({ create_update_model: false, data: null })} />
				}

				{ IsUserList == true && this.UserList()}
				{ IsSideMenu == true && this.SidenavModel()}


				<div className="panel app-setting">
					<div className="panel-heading collection-header">
						<div className="panel-action">
							<Button size="sm" className='m-auto btn' onClick={(e) => this.setState({ create_update_model: true })}>New</Button>
						</div>
					</div>
					<div className="panel-body bg-white">
						<div className="table-view" style={{ "border": "1px solid #dee2e6" }}>

							<div className="table-responsive">
								<table className="table" id="table1" >
									<thead className="custome-table-thead">
										<tr>
											<th className="custome-table-th"><b>App logo</b></th>
											<th className="custome-table-th"><b>App Name</b></th>
											<th className="custome-table-th"><b>App Version</b></th>
											<th className="custome-table-th"><b>Application Type</b></th>
											<th className="custome-table-th"><b>Side Navigation</b></th>
											<th className="custome-table-th"><b>Action</b></th>
										</tr>
									</thead>
									{(apps && apps.length) &&
										<tbody className="custome-table-tbody">
											{apps.map((item, i) => {
												return (
													<tr key={i}>
														<td className="auto custome-table-td-v2"><i className="material-icons" style={{ fontSize: "25px", verticalAlign: "middle" }} >{item.icon}</i></td>
														<td className="auto custome-table-td-v2">{item.name}</td>
														<td className="auto custome-table-td-v2">{item.current_versions}</td>
														<td className="auto custome-table-td-v2">{item.application_type == 2 ? 'Standalone App' : 'Portal App'}</td>
														<td className="auto custome-table-td-v2"><Button onClick={(e) => that.setState({ IsSideMenu: true, selectedId: item._id })} size="sm" className='m-auto'>View</Button></td>
														<td className="auto custome-table-td-v2">
															{item.is_system != 1 &&
																<UncontrolledDropdown className="is-app-toggle CustomToggle" setActiveFromChild>
																	<DropdownToggle tag={CustomToggle} />
																	<DropdownMenu size="sm" title="" right>
																		<DropdownItem className="d-flex" onClick={() => that.handleEditApp(item)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>App Setup</span></DropdownItem>
																		<DropdownItem className="d-flex" onClick={() => this.setState({ selected_id: item._id, IsModalConfirmation: true })}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>
																		<DropdownItem className="d-flex" onClick={() => this.openPage(item, apps, "")}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="View">call_missed_outgoing</i>Open</span></DropdownItem>
																		<DropdownItem className="d-flex" onClick={() => this.openPage(item, apps, "/design")}><span className="d-flex"><i className="pointer text-primary material-icons" data-toggle="tooltip" title="View">camera_front</i>Design</span></DropdownItem>
																		<DropdownItem className="d-flex" onClick={() => this.handlePublishiApp(item)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="View">outbound</i>{'Publish'}</span></DropdownItem>
																	</DropdownMenu>
																</UncontrolledDropdown>
															}
															{item._id == "5f190371db85375976b48101" &&
																<UncontrolledDropdown className="is-system-toggle CustomToggle" setActiveFromChild>
																	<DropdownToggle tag={CustomToggle} />
																	<DropdownMenu size="sm" title="" right>
																		<DropdownItem className="d-flex" onClick={() => this.openPage(item, apps, "")}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="View">call_missed_outgoing</i>Open</span></DropdownItem>
																		<DropdownItem className="d-flex" onClick={() => window.location.href = "/design/dashboard"}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="View">camera_front</i>Design</span></DropdownItem>
																	</DropdownMenu>
																</UncontrolledDropdown>
															}
														</td>

													</tr>
												)
											})
											}
										</tbody>
									}
								</table>
							</div>
						</div>
					</div>
				</div>
			</Fragment >
		)
	}
}

const mapStateToProps = ({ user }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({
	CreateUpdateAppList: (data) => dispatch(CreateUpdateAppList(data)),
	CreateSidenavConfig: (data) => dispatch(CreateSidenavConfig(data)),
	DeleteApplists: (data) => dispatch(DeleteApplists(data)),
	loadApps: (data) => dispatch(loadApps(data)),
	publishAppService: (data) => dispatch(publishAppService(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppSetting)
