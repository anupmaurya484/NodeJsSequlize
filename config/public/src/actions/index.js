import axios from '../utils/axiosService'
import * as TYPES from './types';
import auth from "./auth";
import sysSidenavs from '../assets/json/sysSidenavs.json';

export const fetchUser = () => async dispatch => {
	const res = await axios.apis("GET", '/api/current_user');
	dispatch({ type: TYPES.FETCH_USER, payload: { ...res, isLoggedIn: res.googleId != null } });
};

export const setLogoutSuccess = (LogoutSuccess) => {
	return {
		type: TYPES.LOGOUT_SUCCESS,
		LogoutSuccess
	};
}

export const setLanagugae = (languageType) => {
	return { type: TYPES.SET_LANGUAGE, languageType }
}

export const SetShareForm = (formId) => {
	const ShareForm = formId
	return { type: TYPES.SET_ShareForm, ShareForm }
}

export const RemoveShareForm = () => {
	const ShareForm = false
	return { type: TYPES.SET_ShareForm, ShareForm }
}

export const SetLeftSidebarAction = (isopen) => ({
	type: TYPES.SHOW_LEFT_SIDEBAR,
	payload: isopen
});

export const setTopNavAction = (isopen) => ({
	type: TYPES.SHOW_TOP_NAV,
	isTopNav: isopen
});

export const setSideNavAction = (isopen) => ({
	type: TYPES.SHOW_SIDE_NAV,
	isSideNav: isopen
});

export const setExternalAccessProfile = (externalAccessProfile) => ({
	type: TYPES.SET_EXTERNAL_ACCESS_PROFILE,
	externalAccessProfile: externalAccessProfile
})


export const handleToken = token => async dispatch => {
	const res = await axios.apis("POST", '/api/stripe', token);
	if (res) {
		localStorage.user = JSON.stringify(res.data);
		dispatch({ type: TYPES.SET_LOGIN_SUCCESS, User_data: res });
	}
};

export const submitTask = (values, history) => async dispatch => {
	const res = await axios.apis("POST", '/api/tasks', values);

	history.push('/tasks');
	dispatch({ type: TYPES.FETCH_USER, payload: res });
};

export const setCollectionNavItem = () => {
	return (dispatch) => {
		axios.apis("GET", '/sidenav-links').then(res => {
			const collectionNavItem = {
				header: 'Collections',
				dividerBottom: true,
				links: res.data
			}
			dispatch({ type: TYPES.SET_COLLECTION_NAV_ITEM, collectionNavItem })
		}).catch(e => console.error(e))
	}
}

export const setDefaultNavItem = () => {
	return (dispatch) => {
		const defaultNavItem = {
			header: 'Setup',
			links: [
				{
					name: 'collection-list',
					route: '/collection-list',
					icon: 'apps',
					text: 'Collections',
				},
				{
					name: 'sidenav-setup',
					route: '/sidenav-setup',
					icon: 'settings',
					text: 'Sidenav',
				},
			],
			dividerBottom: false,
		}

		dispatch({ type: TYPES.SET_DEFAULT_NAV_ITEM, defaultNavItem })
	}
}

export const loadCollectionNavItemLinks = () => {
	return (dispatch) => {
		axios.apis("GET", '/api/sidenav-links').then(res => {
			dispatch({ type: TYPES.LOAD_COLLECTION_NAV_ITEM_LINKS, payload: res.data })
		}).catch(e => console.error(e))
	}
}

export const setSidenavAdmin = () => {
	return (dispatch) => {
		const defaultNavItem = {
			header: 'Admin',
			links: [
				{
					name: 'user',
					route: '/user',
					icon: 'account_circle',
					text: 'User management',
				},
				{
					name: 'settings',
					route: '/settings',
					icon: 'settings',
					text: 'Settings',
				},
			],
			dividerBottom: false,
		}
		dispatch({ type: TYPES.SET_ADMIN_SIDENAV_LINKS, defaultNavItem })
	}
}

export const setSidenavFromConfig = (collections, sidenavGroupLinks) => {
	return (dispatch) => {
		let collectionNavItem;

		if (collections.length > 0) {
			collectionNavItem = {
				header: 'Collections',
				dividerBottom: true,
				links: [...collections]
			}
		}

		dispatch({ type: TYPES.SET_COLLECTION_NAV_ITEM, collectionNavItem })
		dispatch({ type: TYPES.SET_SIDENAV_GROUP_LINKS, sidenavGroupLinks })
		dispatch({ type: TYPES.SET_DEFAULT_NAV_ITEM, defaultNavItem: undefined })

	}
}

export const setSidenavGroupLinks = (sidenavGroupLinks) => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_SIDENAV_GROUP_LINKS, sidenavGroupLinks })
	}
}

// save sidenav config in DB
export const saveSidenavConfig = (config) => {
	return (dispatch) => {
		axios.apis("POST", "/api/sidenav-config", config).then(res => { console.log() })
			.catch(e => console.error(e))
	}
}

export const unsetSidenavFromConfig = () => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_SIDENAV_FROM_CONFIG, sidenav: undefined })
	}
}

export const loadSidenavConfig = (app_id) => {
	return (dispatch) => {
		axios.apis("GET", `/api/sidenav-config?app_id=${app_id}`, auth.headers)
			.then(res => {
				dispatch({ type: TYPES.SET_APP, app_id: app_id });
				if (res.status_code == 200) {
					dispatch({ type: TYPES.LOAD_SIDENAV_CONFIG, sidenavConfig: res.data });
				}
				else if (app_id === "5f190371db85375976b48101" || app_id === "5f190371db85375976b48102") {
					dispatch({ type: TYPES.LOAD_SIDENAV_CONFIG, sidenavConfig: sysSidenavs.find(x => x.app_id == app_id) });
				} else {
					dispatch({ type: TYPES.LOAD_SIDENAV_CONFIG, sidenavConfig: sysSidenavs.find(x => x.app_id == 0) });
				}
			}).catch(e => console.error(e))
	}
}

export const setApp = (appName) => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_APP, appName })
	}
}

export const setCollectionList = (collectionList) => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_COLLECTION_LIST, collectionList })
	}
}

export const setDummyManagerAndDepartment = () => {
	return (dispatch) => {
		const payload = {
			department: 'IT (dummy department)',
			manager: 'John The Dummy Manager'
		}
		dispatch({ type: TYPES.SET_DUMMY_MANAGER_AND_DEPARTMENT, payload })
	}
}

export const setcurrentPage = (current_page) => {
	return {
		type: TYPES.SET_CURRENT_PAGE,
		current_page
	};
}

export const Initial = () => async dispatch => {
	try {
		const res = await axios.apis("GET", "/api/initial");
		return res;
	} catch (err) {
		return { status: false, message: "Something is worng." }
	}
}

export const showTopNavAction = (isopen) => dispatch => {
	dispatch(setTopNavAction(isopen));
}

export const showSideNavAction = (isopen) => dispatch => {
	dispatch(setSideNavAction(isopen));
}

export const showLeftSidebarAction = (isopen) => dispatch => {
	dispatch(SetLeftSidebarAction(isopen));
}



