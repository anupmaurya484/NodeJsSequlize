import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as admin from '../../../actions/admin';
import { SetUserData } from '../../../actions/users';
import { Toast, GetDataBase, AppDeveloperMode, getQueryString} from '../../../utils/helperFunctions';
import { encode } from '../../../utils/crypto'
import API from '../../../config';
import * as ACT from '../../../actions';

//Import Tabs 
import CompanyProfile from './Tabs/CompanyProfile';
import DatabaseSetup from './Tabs/DatabaseSetup';
import EmailSetup from './Tabs/EmailSetup';
import ProfileAccess from './Tabs/ProfileAccess';
import { Row, Col, Card, Form, Modal, Button, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, CardTitle, CardHeader, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledCollapse, Collapse } from 'reactstrap';
import './Settings.css';

class Settings extends Component {

	constructor() {
		super()
		this.state = {
			is_edit_user: false,
			userdata: null,
			isEditPassword: false,
			secutiry_password: false,
			active_tab: 1,
			is_edit_info: false,
			company_id: null,
			is_change_password: false,
			change_password: { old_password: '', new_password: '' },
			company_info: {
				company_name: "",
				address: "",
				city: "",
				state: "",
				country: "",
				zip_code: ""
			},
			smtp_config: {
				smtp_server: "",
				smtp_port: null,
				user: "",
				pass: "",
				smtp_fromMail: "",
			},
			database_config: {
				database_url: '',
				database_name: '',
				user: '',
				password: '',
				//Dev
				dev_database_url: '',
				dev_database_name: '',
				dev_user: '',
				dev_password: ''
			},
			authentication_profile_type: "1",
			saml_auth: {
				idp_type: "",
				entry_point: "",
				is_setuped: false,
				key: ""
			},
		}
	}

	componentDidMount() {
		var { User_data } = this.props.user

		//Get Outh 
		if (getQueryString() && getQueryString()["saml-email"]) {
			localStorage.setItem("=SEZYZYZ", getQueryString()["saml-email"])
			window.close();
		}

		this.props.GetAdminConfig({ user_id: User_data._id }).then(data => {
			try {
				let company_info = {
					company_name: data.company_name || '',
					address: data.address || '',
					city: data.city || '',
					state: data.state || '',
					country: data.country || '',
					zip_code: data.zip_code || ''
				}

				const { configuration, user } = data;
				let smtp_config = {
					smtp_server: configuration.smtp_config.smtp_server || '',
					smtp_port: configuration.smtp_config.smtp_port || null,
					smtp_fromMail: configuration.smtp_config.smtp_fromMail || '',
					user: configuration.smtp_config.smtp_auth.user || '',
					pass: configuration.smtp_config.smtp_auth.pass || '',
				};

				let personal_info = {
					firstname: user.firstname || "",
					lastname: user.lastname || "",
					address: user.address || "",
					email: user.email || "",
					gender: user.gender || "",
					phone: user.phone || "",
					mobile: user.mobile || "",
					profile_logo: user.profile_logo ? API.API_URL + '/download?filename=' + user.profile_logo : ''
				}

				let database_url = AppDeveloperMode() ? (configuration.dev_database_url ? configuration.dev_database_url : "") : (configuration.database_url ? configuration.database_url : "")
				let database_config = {
					database_url: database_url,
					database_authentication: false,
					user: configuration.database_url ? this.databaseconfig(database_url).user : "",
					password: configuration.database_url ? this.databaseconfig(database_url).password : "",

					//Dve Database
					dev_database_url: configuration.dev_database_url,
					dev_database_authentication: false,
					dev_user: configuration.dev_database_url ? this.databaseconfig(configuration.dev_database_url).user : "",
					dev_password: configuration.dev_database_url ? this.databaseconfig(configuration.dev_database_url).password : "",
				}

				const company_logo = data.company_logo;
				const company_id = data._id;
				data.configuration.secutiry_password = data.configuration.secutiry_password ? data.configuration.secutiry_password : false
				this.setState({
					company_id,
					company_logo,
					company_info,
					smtp_config,
					personal_info,
					database_config,
					authentication_profile_type: data.configuration.authentication_profile_type || 1,
					saml_auth: data.configuration.saml_auth || this.state.saml_auth,
					secutiry_password: data.configuration.secutiry_password
				});
			} catch (err) {
				console.log(err.message);
			}

		})

	}

	componentWillReceiveProps(props) {
		const { adminConfig, User_data } = props
		if (adminConfig) {
			this.setState({ adminConfig: adminConfig })
		}
	}


	databaseconfig(url) {
		var user = url.split("@")[0].split("//")[1].split(":")[0]
		var password = url.split("@")[0].split("//")[1].split(":")[1]
		var url_db = url.replace(user, '<user>');
		url_db = url_db.replace(password, '<password>');
		return {
			database_url: url_db,
			user: user,
			password: password
		}
	}



	saveData(data, objectKey) {
		let payload = {};
		console.log();
		const { company_id, active_tab } = this.state;
		switch (active_tab) {
			case 1:
				payload = data
				payload.update_type = "company";
				payload.company_logo = data.company_logo;
				let User_data = this.props.user.User_data
				User_data.company["company_name"] = data.company_name;
				User_data.company["company_logo"] = data.company_logo;
				localStorage.user = encode(JSON.stringify(User_data));
				this.props.SetUserData(User_data);
				break;
			case 2:
				payload = {
					smtp_config: {
						"smtp_server": data.smtp_server,
						"smtp_port": Number(data.smtp_port),
						"smtp_auth": { "user": data.user, "pass": data.pass },
						"smtp_fromMail": data.smtp_fromMail,
					}
				}
				payload.update_type = "email"
				break;
			case 3:
				payload = data.database_config
				payload.update_type = "database"
				break;
			default:
				break;
		}

		payload["company_id"] = company_id;

		//Call Save API 
		this.props.EditSetting(payload).then(resData => {
			if (resData.status) {
				this.setState({ [objectKey]: data })
				Toast(resData.message, "success");
			} else {
				Toast(resData.message, "error")
			}
		});
	}

	EditProfilePhoto = async (data) => {
		let User_data = this.props.user.User_data
		User_data.company["company_logo"] = data.logo_url;
		localStorage.user = encode(JSON.stringify(User_data));
		this.props.SetUserData(User_data);
		this.setState({ company_logo: data.logo_url });
		const result = await this.props.EditProfilePhoto(data);
		return result;
	}

	RemoveProfilePhoto = async () => {
		let User_data = this.props.user.User_data
		User_data.company["company_logo"] = "";
		localStorage.user = encode(JSON.stringify(User_data));
		this.props.SetUserData(User_data);
		this.setState({ company_logo: "" });
	}

	render() {

		let { company_id, active_tab, company_info, company_logo, smtp_config, database_config, secutiry_password, saml_auth, authentication_profile_type } = this.state;
		const { adminConfig } = this.props.user
		if (adminConfig === {} || !adminConfig) return false;
		const baseapiurl = API.BASE_API_URL;

		return (
			<Fragment>
				<div className="settings-page">
					<Row>
						<Col xs={12} md={2} className="pl-0">
							<div className="flex-column nav">
								<span onClick={() => this.setState({ active_tab: 1 })} className={"d-flex nav-link" + (active_tab === 1 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">account_circle</span><FormattedMessage id="setting.company_details" /></span>
								<span onClick={() => this.setState({ active_tab: 2 })} className={"d-flex nav-link" + (active_tab === 2 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">toggle_on</span><FormattedMessage id="setting.smtp_config" /></span>
								<span onClick={() => this.setState({ active_tab: 3 })} className={"d-flex nav-link" + (active_tab === 3 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">lock</span><FormattedMessage id="setting.tenant_database" /></span>
								<span onClick={() => this.setState({ active_tab: 4 })} className={"d-flex nav-link" + (active_tab === 4 ? " active" : "")}><span className="material-icons mr-1 brand-font-color">vpn_key</span><FormattedMessage id="setting.authentication_profiles" /></span>
							</div>
						</Col>
						<Col xs={12} md={10} className="details">
							{/* Company details*/}
							{active_tab === 1 &&
								<CompanyProfile
									company_id={company_id}
									company_info={company_info}
									company_logo={company_logo}
									UploadPhoto={this.props.UploadPhoto}
									EditProfilePhoto={this.EditProfilePhoto}
									RemoveProfilePhoto={this.RemoveProfilePhoto}
									saveData={(e) => this.saveData(e, 'company_info')} />
							}

							{/* Email configuration */}
							{active_tab === 2 &&
								<EmailSetup
									smtp_config={smtp_config}
									saveData={(e) => this.saveData(e, 'smtp_config')}
								/>
							}

							{/* Security database Start */}
							{active_tab === 3 &&
								<DatabaseSetup
									database_config={database_config}
									saveData={(e) => this.saveData(e, 'database_config')} />
							}

							{/* Security password Start */}

							{active_tab === 4 &&
								<ProfileAccess
									user={this.props.user}
									baseapiurl={baseapiurl}
									secutiry_password={secutiry_password}
									saml_auth={saml_auth}
									adminConfig={adminConfig}
									authentication_profile_type={authentication_profile_type}
									EditSetting={this.props.EditSetting}
								/>
							}
						</Col>
					</Row>
				</div>
			</Fragment >

		);
	}
};

const mapStateToProps = ({ user }) => {
	return { user }
}

const mapDispatchToProps = (dispatch) => {
	return {
		GetAdminConfig: (data) => dispatch(admin.GetAdminConfig(data)),
		EditSetting: (data) => dispatch(admin.EditSetting(data)),
		EditUser: (data) => dispatch(admin.EditUser(data)),
		EditProfile: (data) => dispatch(admin.EditProfile(data)),
		UploadPhoto: (data) => dispatch(admin.UploadPhoto(data)),
		EditProfilePhoto: (data) => dispatch(admin.EditProfilePhoto(data)),
		ChangePassword: (data) => dispatch(admin.ChangePassword(data)),
		SetUserData: (data) => dispatch(SetUserData(data))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);