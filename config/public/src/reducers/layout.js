// @flow
import * as TYPES from '../actions/types';

const INIT_STATE = {
	showLeftSidebar: false,
	isTopNav: true,
	isSideNav: true,
};

const Layout = (state = INIT_STATE, action) => {
	switch (action.type) {
		case TYPES.SHOW_LEFT_SIDEBAR:
			return {
				...state,
				showLeftSidebar: action.payload
			};
		case TYPES.SHOW_TOP_NAV:
			return {
				...state,
				isTopNav: action.isTopNav
			};
		case TYPES.SHOW_SIDE_NAV:
			return {
				...state,
				isSideNav: action.isSideNav
			};
		default:
			return state;
	}
};

export default Layout;
