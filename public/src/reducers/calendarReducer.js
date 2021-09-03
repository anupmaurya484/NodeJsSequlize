import * as TYPES from '../actions/types';

const initialState = {
	CalendarViewLists: [],
}

export default function (state = initialState, action) {
  switch (action.type) {
    case TYPES.SET_CALENDAR_LISTS:
      return { ...state, CalendarViewLists: action.CalendarViewLists }

    default:
      return state;
  }
}
