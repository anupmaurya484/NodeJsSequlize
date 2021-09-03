import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunk from 'redux-thunk';
import {decode} from './crypto'

import auth from '../actions/auth';
import { SetUserData } from '../actions/users';

import reducers from '../reducers';
import axios from './axiosService';


export const configureStore = () => {

  const middlewares = [thunk.withExtraArgument(auth)];

  if (process.env.NODE_ENV !== "production") {
    middlewares.push(
      createLogger({
        colors: {
          title: () => "inherit",
          prevState: () => "red",
          action: () => "#03A9F4",
          nextState: () => "#4CAF50",
          error: () => "#F20404"
        }
      })
    );
  }

  const store = createStore(reducers,applyMiddleware(...middlewares));
  
  const access_token = localStorage.access_token
  if (access_token) {
    try{
      const jwt = decode(access_token);
      const user = JSON.parse(decode(localStorage.user));
      auth.setAuthToken(jwt);
      axios.setAuthToken(jwt);
      store.dispatch(SetUserData(user));
    }catch(err){
      console.log(err.message);
    }
  }
  return store;
};


