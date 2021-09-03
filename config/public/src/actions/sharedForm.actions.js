import axios from '../utils/axiosService'

export const GetSharedforms = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/sharedforms", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetSharedformTableView = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/sharedformTableView", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetSharedformRecords = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/sharedformSubmissions", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const DeleteSharedformRecords = (payload) => async dispatch => {
    try {
        console.log(payload);
        const res = await axios.apis("DELETE", `/api/deleteShareformSubmission?form_id=${payload.formId}&record_id=${payload.recordId}`);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

