import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { CreateSidenavConfig } from '../../actions/users';
import SidenavDesigner from './SidenavDesigner';
import * as helper from '../../utils/helperFunctions';
import * as ACT from '../../actions';
import './SidenavSetup.css';

class SidenavSetup extends Component {
	constructor(props) {
		super(props)

		this.state = {
			current_step: 1,
			appName: props.appName,
			JSONconfig: '',
			defaultConfig: {},
			config: {},
			isVisible: false,
			isSubmitEnable: false
		}

		this.textJSONconfig = React.createRef()
	}

	toggleHidden() {
		this.setState({ isVisible: !this.state.isVisible })
	}

	changeCurrentView = id => {
		if (this.state.current_step != id)
			this.setState({ current_step: id })
	}

	handleSaveApplyDesignConfig = (data) => {
		console.log(data);
		var { JSONconfig, config } = this.state;
		config.groupLinks = data;
		JSONconfig = helper.stringifyPrettyJSON(config.groupLinks);
		console.log(JSONconfig);
		this.setState({ config: config, JSONconfig: JSONconfig, isSubmitEnable: true });
	}

	render() {
		const { JSONconfig, config, current_step, isSubmitEnable } = this.state
		let groupLinks = config ? config.groupLinks : []

		return (
			<Fragment>
				<div className='panel sidenav-setup'>
					<div className='panel-heading collection-header'>
						<div className='link-block'>
							<span className={current_step == 1 ? 'active-span' : ''} onClick={() => this.changeCurrentView(1)}>Sidenav designer</span>
							<span className={current_step == 2 ? 'active-span' : ''} onClick={() => this.changeCurrentView(2)}>Sidenav config</span>
						</div>
						{current_step == 2 &&
							<div style={{ "right": "25px", "position": "absolute" }}>
								<button className="btn btn-primary btn-sm mr-2" onClick={this.handleDefaultConfig}>Close</button>
								<button disabled={!isSubmitEnable} className='btn btn-primary btn-sm' onClick={this.handleSaveApplyConfig}>Save</button>
							</div>
						}
						{current_step == 1 &&
							<div style={{ "right": "25px", "position": "absolute" }}>
								<button className="btn btn-primary btn-sm mr-2" onClick={this.handleDefaultConfig}>Close</button>
								<button disabled={!isSubmitEnable} className='btn btn-primary btn-sm' onClick={this.handleSaveApplyConfig}>Save</button>
							</div>
						}

					</div>
					<div className='panel-block bg-white p-3'>
						{current_step == 2 &&
							<Row id="sidenav-config">
								<Col md="3">
									<ul id="sidenav-preview" className='pl-0'>
										{
											groupLinks &&
											groupLinks.map((groupLink, index) => (
												<div key={index}>
													{
														groupLink.header.length > 0 &&
														<li><span className="subheader">{groupLink.header}</span></li>
													}
													{
														groupLink.links.map((item, i) => (
															<div key={i} >
																<div>
																	<li>
																		{
																			item.isExternal ?
																				<a href={item.route} className='text-overflow'>
																					<i className="material-icons">{item.icon}</i>
																					{item.text}
																				</a>
																				: <Link to={item.route} className='text-overflow'>
																					<i className="material-icons">{item.icon}</i>
																					{item.text}
																				</Link>
																		}
																	</li>
																</div>
																{
																	item.sublink &&
																	item.sublink.length > 0 &&
																	item.sublink.map((subitem, idx) => (
																		<li key={idx} className={`sublink ${this.state.isVisible ? 'show' : 'hide'}`} >
																			{
																				subitem.isExternal ?
																					<a href={subitem.route}>
																						<i className="material-icons">{subitem.icon}</i>
																						{subitem.text}
																					</a>
																					: <Link to={subitem.route}>
																						<i className="material-icons">{subitem.icon}</i>
																						{subitem.text}
																					</Link>
																			}
																		</li>
																	))
																}
															</div>
														))
													}
													{
														groupLink.dividerBottom &&
														<li><div className="divider"></div></li>
													}
												</div>
											))
										}
									</ul>
								</Col>
								<Col md='9'>
									<Col md='12' className="input-field">
										<span className="left"><strong>Sidenav JSON config</strong></span>
										<textarea
											id="textarea-sidenav-json-config"
											value={JSONconfig}
											onChange={this.handleChangeJSONconfig}
											ref={this.textJSONconfig}
											onKeyDown={event => helper.handleTabPressedOnJSONTextarea(event, this.textJSONconfig.current)} />
									</Col>
								</Col>
							</Row>
						}
						{current_step == 1 &&
							<SidenavDesigner handleSaveApplyDesignConfig={(e) => this.handleSaveApplyDesignConfig(e)} location={this.props.location} groupLinks={groupLinks} />
						}
					</div>
				</div>
			</Fragment>

		)
	}

	componentWillMount() {
		const { loadSidenavConfig, appconfig, user } = this.props

		console.log("SideNavigation componet => ");
		console.log(this.props);

		const { appName } = this.state
		if (appconfig) {
			loadSidenavConfig(appconfig.selectedId);
		} else {
			loadSidenavConfig(user.app_id);
		}
	}

	componentDidUpdate(prevProps) {
		const { appName, sidenavConfig, loadSidenavConfig, appconfig } = this.props
		if (sidenavConfig !== prevProps.sidenavConfig) {
			const JSONconfig = helper.stringifyPrettyJSON(sidenavConfig.groupLinks)
			this.setState({
				config: sidenavConfig,
				defaultConfig: sidenavConfig,
				JSONconfig: JSONconfig
			})
		}
	}

	handleChangeJSONconfig = (event) => {
		this.setState({ JSONconfig: event.target.value, isSubmitEnable: true })
	}

	handleDefaultConfig = () => {
		if (this.props.appconfig) {
			this.props.closeModel()
		} else {
			this.props.history.goBack();
		}
	}

	handlePreviewConfig = () => {
		const newConfig = this.updateConfig()
		this.setState({ config: newConfig })
	}

	updateConfig = () => {
		const { JSONconfig, config, defaultConfig } = this.state
		let newConfig = defaultConfig
		try {
			newConfig = { ...config, groupLinks: JSON.parse(JSONconfig) }
		} catch (err) {
			alert('JSON config is not valid\nError : ' + err)
		}
		return newConfig
	}

	handleSaveApplyConfig = async (JSONconfig) => {
		const config = this.updateConfig()
		const { saveSidenavConfig, setSidenavFromConfig, CreateSidenavConfig } = this.props;
		const { User_data } = this.props.user;
		const userId = User_data._id;
		const newDate = new Date().toISOString();

		this.handlePreviewConfig();
		var payload = {
			app_id: config.app_id,
			groupLinks: config.groupLinks,
			modifiedBy: userId,
			modifiedTime: newDate,
			_id: config._id
		}
		const resdata = await CreateSidenavConfig(payload);
		helper.Toast("Menu update successfully.");
		this.setState({ isSubmitEnable: false })
		setSidenavFromConfig([], config.groupLinks)
	}
}

const mapStateToProps = (state) => {
	return {
		sidenavConfig: state.user.sidenavConfig,
		appName: state.user.appName,
		user: state.user
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		saveSidenavConfig: (config) => dispatch(ACT.saveSidenavConfig(config)),
		CreateSidenavConfig: (config) => dispatch(CreateSidenavConfig(config)),
		loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName)),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SidenavSetup)
