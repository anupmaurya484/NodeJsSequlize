import { combineReducers } from 'redux';
import userReducer from './userReducer';
import formReducer from './formReducer';
import Layout from './layout';
import workflowSetting from './workflowSetting';
import workflow from './workflow';
import webService from './webService';
import calendarReducer from './calendarReducer';


const reducers = combineReducers({
  user: userReducer,
  form: formReducer,
  Layout: Layout,
  workflowSetting: workflowSetting,
  workflow: workflow,
  webService: webService,
  calendar: calendarReducer
});

export default reducers;