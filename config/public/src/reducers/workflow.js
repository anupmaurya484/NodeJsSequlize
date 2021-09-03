import {
    LOAD_FLOWCHART
} from '../actions/workflow';

const initial = {
}

const workflow = (state = initial, action) => {

  switch (action.type) {
      case LOAD_FLOWCHART: return Object.assign({}, state, action.payload);
      default: return state;
  }
}

export default workflow;
