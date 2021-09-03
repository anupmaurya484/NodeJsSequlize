import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link,Redirect  } from 'react-router-dom'
import { isEmpty } from 'lodash'

import initialSidenavConfig from './initialSidenavConfig'
import './Sidenav.css'
import * as ACT from '../../actions'

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
			isVisible: false,
			groupLinks: []
		}
	}

	componentDidMount() {
		let { groupLinks } = this.props;
		if (!groupLinks || isEmpty(groupLinks) || groupLinks.length==0 ) {
			groupLinks = initialSidenavConfig.groupLinks;
		}
		this.setState({ groupLinks: groupLinks })
	}

	componentWillReceiveProps(props) {
		var groupLinks = [];
		if ((!props.groupLinks || isEmpty(props.groupLinks) || props.groupLinks.length==0 ) || !props ) {
			groupLinks = initialSidenavConfig.groupLinks;
		}else{
			groupLinks = props.groupLinks
		}
		this.setState({ groupLinks: groupLinks });
	}


	onLoadDefaultPage(menus){
		this.setState({groupLinks : menus});
	}

	toggleHidden() {
		this.setState({
			isVisible: !this.state.isVisible
		})
	}

	render() {
		const { selectedNavItem } = this.state
		const { user } = this.props
		const { User_data } = this.props.user
		var { groupLinks } = this.state

		// hide sidenav setup section for user with role_id < 3
		if (User_data.level < 3) {
			const setupGroupLinkIdx = groupLinks.findIndex(groupLink => groupLink.header === 'setup')
			groupLinks.splice(setupGroupLinkIdx, 1)
		}

		return (
			<Fragment>
			
			</Fragment>
		);
	}

	componentWillMount() {
		
	}

	componentDidUpdate(prevProps) {
		const {
			appName,
			sidenavConfig,
			setSidenavFromConfig,
		} = this.props

		if (appName !== prevProps.appName || sidenavConfig !== prevProps.sidenavConfig) {
			if (sidenavConfig !== prevProps.sidenavConfig && sidenavConfig) {
				setSidenavFromConfig([], sidenavConfig.groupLinks)
			}
		}
	}

	// componentDidMount() {
	// 	// materialize css initialization
	// 	this.initMaterialize()
	// }

	// initMaterialize() {
	// 	let sidenav = document.querySelectorAll('.sidenav');
	// 	M.Sidenav.init(sidenav);

	// 	let modal = document.querySelectorAll('.modal');
	// 	M.Modal.init(modal);
	// }

	handleClickNavItem(index, i, idx) {
		const elems = document.querySelectorAll('.sidenav');
	//	const sidenavInstance //= //M.Sidenav.getInstance(elems[0])
	//	sidenavInstance.close()
		this.state.groupLinks.forEach(ele => {
			ele.links.forEach(eles => {
				if (eles.sublink) {
					eles.sublink.map(eles2 => {
						eles2.is_selected = 0;
					});
				}
				eles.is_selected = 0;
			});
		});
		if (idx >= 0) {
			this.state.groupLinks[index].links[i].sublink[idx].is_selected = 1;
		} else {
			this.state.groupLinks[index].links[i].is_selected = 1;
		}

		this.setState(this.state)
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.user,
		appName: state.user.appName,
		groupLinks: state.user.sidenavGroupLinks ? state.user.sidenavGroupLinks : [],
		sidenavConfig: state.user.sidenavConfig,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		setApp: (appName) => dispatch(ACT.setApp(appName)),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);