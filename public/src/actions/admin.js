import axios from '../utils/axiosService'
import * as TYPES from './types';

export const GetAdminConfigResponse = (adminConfig) => {
    return {
        type: TYPES.ADMIN_CONFIG_RESPONSE_SUCCESS,
        adminConfig
    };
}

export const GetUserListResponse = (userLists) => {
    return {
        type: TYPES.USER_LISTS_RESPONSE_SUCCESS,
        userLists
    };
}

export const GetTenantResponse = (tenantLists) => {
    return {
        type: TYPES.TENANT_REQUEST_RESPONSE_SUCCESS,
        tenantLists
    };
}


export const GetAdminConfig = (payload) => async dispatch => {

    try {
        const res = await axios.apis("POST", "/api/GetCompanySetting", payload);
        const { status_code, data } = res;
        if (status_code == 200) {
            dispatch(GetAdminConfigResponse(data));
            return data
        } else {
            dispatch(GetAdminConfigResponse(null));
            return null
        }
    } catch (err) {
        console.log(err);
        return null
    }
}

export const EditSetting = (payload) => async dispatch => {

    try {
        const res = await axios.apis("POST", "/api/EditSetting", payload);
        const { status_code } = res;
        if (status_code === 200) {
            GetAdminConfig();
        }
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const EditProfile = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/UpdateProfile", payload);
        const { status_code } = res;
        if (status_code === 200) {
            GetAdminConfig();
        }
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const UploadPhoto = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/upload", payload);
        const { status_code } = res;
        if (status_code === 200) {
            GetAdminConfig();
        }
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const EditProfilePhoto = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/UpdateLogo", payload);
        const { status_code } = res;
        if (status_code === 200) {
            GetAdminConfig();
        }
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}
export const ChangePassword = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/updateNewpassword ", payload);
        const { status_code } = res;
        if (status_code === 200) {
            GetAdminConfig();
        }
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const EditUser = async (payload) => {

    try {
        const res = await axios.apis("POST", "/api/EditCompanyAdminUser", payload);
        const { status_code } = res;
        if (status_code === 200) GetAdminConfig();
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const GetUserList = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/GetUserList", payload);
        const { status_code, data } = res;
        if (status_code == 200) {
            dispatch(GetUserListResponse(data));
        } else {
            dispatch(GetUserListResponse([]));
        }
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const AddNewUser = (payload) => async dispatch => {

    try {
        const res = await axios.apis("POST", "/api/AddUser", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const SendWelcomeMail = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/SendWelcomeMail", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const DeleteUser = (payload) => async dispatch => {
    try {
        const res = await axios.apis("DELETE", "/api/DeleteUser/" + payload, payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const TenantRequest = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/TenantRequest", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const GetTenantRequest = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/GetTenantRequest", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}
export const VerifyConnectionSetup = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/VerifyConnectionSetup", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const AddCompany = async (payload) => {

    try {
        const res = await axios.apis("POST", "/api/AddCompany", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const DeletedCompany = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/DeletedCompany", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}


export const ActiveDeactiveTenantCompany = async (payload) => {
    try {
        const res = await axios.apis("GET", "/api/ActiveDeactiveTenantCompany/" + payload.is_flag + "/" + payload.id);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const CheckTenantValidForm = async (payload) => {
    try {
        payload["IsNotLoader"] = true
        const res = await axios.apis("POST", "/api/CheckTenantValidForm/", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const GetPassword = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/GetPassword", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}


export const Appslist = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/appslist", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const MergeApssData = async (payload) => {
    try {
        const res = await axios.apis("POST", "/api/mergeapp", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

export const AutocompleteData = (apiName) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/" + apiName);
        return res;
    } catch (err) {
        return { status: false, message: "Some thing wrong, Please try again." };
    }
}

