import axios from '../utils/axiosService';
import * as TYPES from './types';
import auth from "./auth";
import { encode } from '../utils/crypto'

const setLoginError = (loginError) => {
    return {
        type: TYPES.SET_LOGIN_ERROR,
        loginError
    }
}

export const SetUserData = (User_data) => {
    return {
        type: TYPES.SET_LOGIN_SUCCESS,
        User_data
    };
}

export const SetLogoutSuccess = (LogoutSuccess) => {
    return {
        type: TYPES.LOGOUT_SUCCESS,
        LogoutSuccess
    };
}
export const TenantConnectionSuccess = (TenantConnection) => {
    return {
        type: TYPES.TENANT_CONNECTION_SUCCESS,
        TenantConnection
    };
}

const SetUserApps = (UserApps) => {
    return {
        type: TYPES.SET_USER_APPS,
        UserApps
    };
}

const SetApplicationError = (boolean) => {
    return {
        type: TYPES.SET_APPLICATION_ERROR,
        applicationError: boolean
    };
}

const loginStates = (res) => async dispatch => {
    const { data, status_code } = res;
    if (status_code == 200) {
        localStorage.access_token = encode(data.access_token);
        localStorage.refresh_token = encode(data.refresh_token);
        localStorage.user = encode(JSON.stringify(data.user));
        auth.setAuthToken(data.access_token);
        axios.setAuthToken(data.access_token);
        var user = data.user
        dispatch(loadApps({ _id: data.user._id }));
        dispatch({ type: TYPES.SET_LOGIN_SUCCESS, User_data: user });
    }
}


export const login = (payload) => async dispatch => {
    try {
        const res = await axios.apis('POST', "/api/login", payload);
        const { message, status_code, data } = res;
        if (status_code === 200) {
            if (data.user.level == "6" && data.user.isView == "login") {
                window.location.href = data.user.domain + "/login?email=" + data.user.email;
            } else {
                dispatch(loginStates(res));
            }
        } else {
            dispatch(setLoginError(message));
        }
        return res;
    } catch (err) {
        console.log(err);
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const getUserInfo = () => async dispatch => {
	try {
		const res = await axios.apis("GET", "/api/getUserInfo");
        localStorage.user = encode(JSON.stringify(res.data))
        dispatch({ type: TYPES.SET_LOGIN_SUCCESS, User_data: res.data });
	} catch (err) {
		return { status: false, message: "Something is worng." }
	}
}

export const loginwithGoogle = (id) => async dispatch => {
    const res = await axios.apis("POST", '/api/googleLogin', { id: id });
    dispatch(loginStates(res));
    return res;
};

export const loginwithSaml = (payload) => async dispatch => {
    const res = await axios.apis("POST", '/api/samlLogin', payload);
    dispatch(loginStates(res));
    return res;
};

export const loginwithMicrosoft = (code) => async dispatch => {
    const res = await axios.apis("POST", '/api/microsoftLogin', code);
    dispatch(loginStates(res));
    return res;
};

export const signup = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/signup", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetPasswordConfig = () => async dispatch => {
    try {
        const res = await axios.apis("GET", "/api/GetPasswordConfig");
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const verifyemails = (verifycode) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/tokenVerify", { token: verifycode });
        console.log(res);
        return res;
    } catch (err) {
        console.log(err);
        return { status: false, message: "Something is worng." }
    }
}

export const doforget = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/forgetpassword", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const changepassword = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/changepassword", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const updateProfile = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/updateProfile", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}
export const updateProfileDespatch = (User_data) => async dispatch => {
    try {
        dispatch({ type: TYPES.SET_LOGIN_SUCCESS, User_data: User_data });
        return true;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const loadApps = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", '/api/appLists/', payload)
        dispatch(SetUserApps(res.apps));
        if (!res.apps) {
            dispatch(SetApplicationError(true));
        }
        return res
    } catch (err) {
        return { res: 201, status: false, message: "Something is worng." }
    }
}

export const getPublishApps = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", '/api/installAppLists', payload)
        return res
    } catch (err) {
        return { res: 201, status: false, message: "Something is worng." }
    }
}

export const installPublishApp = (payload) => async dispatch => {
    try {
        const res = await axios.apis("GET", '/api/installApp/' + payload.appId + "/" + payload.type)
        return res
    } catch (err) {
        return { res: 201, status: false, message: "Something is worng." }
    }
}

export const publishAppService = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", '/api/publish-app', payload)
        return res
    } catch (err) {
        return { res: 201, status: false, message: "Something is worng." }
    }
}

export const CreateUpdateAppList = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/create-app", payload);
        return res;
    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

export const CreateSidenavConfig = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/CreateUpdateSidenavConfig", payload);
        return res;
    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

export const DeleteApplists = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/DeleteApps", payload);
        return res;
    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

export const logout = (payload) => async dispatch => {
    try {
        await axios.apis("POST", "/api/logout", payload);
        localStorage.clear();
        auth.resetAuthToken();
        axios.resetAuthToken();
        dispatch(SetLogoutSuccess(false));
        window.location.href = "/logout";
    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}


