import {
    CALL_A_WEBSERVICE_START,
    CALL_A_WEBSERVICE_SUCCESS,
    CALL_A_WEBSERVICE_FAIL
} from '../actions/workflow';

const initial = {
    error: null,
    loading: false,
    data: null
}

const webService = (state = initial, action) => {

  switch (action.type) {
      case CALL_A_WEBSERVICE_START: return Object.assign({}, state, { error: null, loading: true });
      case CALL_A_WEBSERVICE_SUCCESS: return Object.assign({}, state, { error: null, loading: false, data: action.payload });
      case CALL_A_WEBSERVICE_FAIL: return Object.assign({}, state, { error: action.payload, loading: false });
      default: return state;
  }
}

export default webService;
