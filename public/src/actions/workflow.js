import { config } from '../utils/workflow.config';
import axios from '../utils/axiosService';

export const SAVE_FLOWCHART = 'SAVE_FLOWCHART';
export const LOAD_FLOWCHART = 'LOAD_FLOWCHART';

export const CALL_A_WEBSERVICE_START = 'CALL_A_WEBSERVICE_START';
export const CALL_A_WEBSERVICE_SUCCESS = 'CALL_A_WEBSERVICE_SUCCESS';
export const CALL_A_WEBSERVICE_FAIL = 'CALL_A_WEBSERVICE_FAIL';

export function saveFlowchart (data) {
    return (dispatch, getState) => {
        let myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        return fetch(config.SAVE_FLOWCHART_API, {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(data),
            // mode: 'no-cors'
        })
        .then(response => {
            return response.json();
        })
        .then(json => {
            console.log(json)
        })
        .catch(err => {
            console.log(err)
        })
    }    
}

export function loadFileFromServer (filename) {
    return (dispatch, getState) => {

        return fetch(`${config.LOAD_FLOWCHART_API}/${filename}`, {
            method: 'GET'
        })
        .catch(err => {
            console.log(err)
        })
        .then(response =>{
            if(response){
                response.json()
            }
            
        })
        .then(json => {
            dispatch({
                type: LOAD_FLOWCHART,
                payload: json
            })
        })
    }
}

export function callAWebService (path, method, header, body) {
    return (dispatch, getState) => {
        dispatch({ type: CALL_A_WEBSERVICE_START });
        let myHeaders = new Headers();
        if (header && typeof header === 'object') {
            Object.keys(header).forEach(key => myHeaders.append(key, header[key]));
        }
        return fetch(path, {
            method: method,
            headers: myHeaders,
            body: body,
        })
        // .then(response => response.json())
        .then(response => {
            response.json()
            .then(json => {
                dispatch({
                    type: CALL_A_WEBSERVICE_SUCCESS,
                    payload: {
                        responseCode: response.status,
                        responseHeader: Object.assign({}, response.headers.values()),
                        responseContent: json
                    }
                })
            })

        })
        .catch(err => {
          dispatch({ type: CALL_A_WEBSERVICE_FAIL, payload: err });
        })
    }
}

export const saveWorkflow = (payload) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/saveWorkflow", payload);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const StartWorkflow = (id) => async dispatch => {
    try {
        const res = await axios.apis("POST", "/api/StartWorkflow?id="+id, {});
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetWorkflow = (payload) => async dispatch => {
    try {
        var urlRequest =  payload ? "/api/GetWorkflow?id="+payload : "/api/GetWorkflow"
        const res = await axios.apis("GET", urlRequest);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetInstances = (id) => async dispatch => {
    try {
        const res = await axios.apis("GET", "/api/GetInstances?id="+id);
        console.log(res)
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const GetInstanceLogs = (id) => async dispatch => {
    try {
        const res = await axios.apis("GET", "/api/GetInstanceLogs?id="+id);
        console.log(res.response)
        return res.response;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}

export const DeleteWorkflow = (id) => async dispatch => {
    try {
        const res = await axios.apis("DELETE", "/api/DeleteWorkflow?id="+id);
        return res;
    } catch (err) {
        return { status: false, message: "Something is worng." }
    }
}