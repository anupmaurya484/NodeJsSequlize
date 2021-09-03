import axios from '../utils/axiosService'
import * as TYPES from './types';
import auth from "./auth";
import { Toast } from '../utils/helperFunctions';


export const SetCalendarViewLists = (CalendarViewLists) => {
    return {
        type: TYPES.SET_CALENDAR_LISTS,
        CalendarViewLists
    };
}

export const SetCalendarEventDesign = (CalendarEventDesign) => {
    return {
        type: TYPES.Calendar_Event_Design,
        CalendarEventDesign
    };
}

export const actionGetCalendarViewLists = (payload) => async dispatch => {
    try {
        const resData = await axios.apis("POST", "/api/calendar-lists", payload);
        if (resData.status == true)
            dispatch(SetCalendarViewLists(resData.data));
        else
            Toast(data.message, 'error');

    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

export const actionGetCalendarForm = (id) => async dispatch => {
    try {
        const resData = await axios.apis("GET", "/api/calendar-lists/" + id);
        return resData;
    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

export const actionCreateCalendarForm = (payload) => async dispatch => {
    try {

        const resData = await axios.apis("PUT", "/api/create-calendar-forms", payload);
        return resData;

    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}


// export const ActionCalendarEventDesign = (payload) => async dispatch => {
//     try {

//         const resData = await axios.apis("GET", "/api/get-calendar-event-design", payload);
//         if (resData.status == true)
//             dispatch(SetCalendarEventDesign(resData.data));
//         else
//             Toast(data.message, 'error');

//     } catch (err) {
//         return { res: 200, status: false, message: "Some thing wrong, Please try again." };
//     }
// }

export const actionCreateCalendarEvent = (payload) => async dispatch => {
    try {
        const resData = await axios.apis("PUT", "/api/createupdate-calendar-event", payload);
        return resData;

    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

export const actionGetCalendarEvent = (id) => async dispatch => {
    try {
        const resData = await axios.apis("GET", "/api/get-calendar-events/" + id);
        return resData;

    } catch (err) {
        return { res: 200, status: false, message: "Some thing wrong, Please try again." };
    }
}

