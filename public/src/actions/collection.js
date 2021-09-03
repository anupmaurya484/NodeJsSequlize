import axios from '../utils/axiosService'
import * as TYPES from './types';
import auth from "./auth";

export const Getrecords = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/Getrecords", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetCollections = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/collections-list", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetTableView = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/getTableView", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const Deleterecorde = (payload) => async dispatch => {
    try {
        const res = await axios.apis("DELETE", `/api/record?form_id=${payload.formId}&record_id=${payload.recordId}`);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetPages = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/page-layout-list", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const DeletePage = (payload) => async dispatch => {
    try {
        const res = await axios.apis("DELETE", "/api/delete-page/" + payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetPathLists = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/get-path-lists", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const DeletePath = (id) => async dispatch => {
    try {
        const res = await axios.apis("DELETE", "/api/delete-path/" + id);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const onAddPath = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/create-path/", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}


