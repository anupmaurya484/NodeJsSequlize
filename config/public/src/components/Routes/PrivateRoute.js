import React from 'react'
import { Route, Redirect } from 'react-router-dom';
import { AppDeveloperMode } from '../../utils/helperFunctions';
import { connect } from 'react-redux';

//Access Path 
var pulbicRouter = ['login', 'registration', 'changepassword', 'auth', 'logout', 'external'];
var accessRouter = ['Survey-form', 'public', 'page'];


const PrivateRoute = ({ user, isAuthenticated, applicationError, level, component: Component, ...rest }) => {

  var obj = { ...rest }, routes, router = obj.location.pathname.split('/')[1];

  const login_redirect_path = localStorage["_LOGINAFTERDFALTPATH"];

  const defaultPath = login_redirect_path ? login_redirect_path : (AppDeveloperMode() ? '/design/dashboard' : '/dashboard')
  
  if (isAuthenticated) {
    localStorage.removeItem("_LOGINAFTERDFALTPATH");
  }

  if (accessRouter.indexOf(router) >= 0) {
    routes = <Route {...rest} render={props => <Component {...props} />} />
  } else if (pulbicRouter.indexOf(router) < 0) {  //-1 is true
    routes = <Route {...rest} render={props => isAuthenticated ? (router === "") ? <Redirect to={defaultPath} /> : <Component {...props} /> : <Redirect to="/login" />} />
  } else {
    if (applicationError && isAuthenticated) {
      routes = <Route {...rest} render={props => <Redirect to={'/application-error'} />} />
    } else {
      routes = <Route {...rest} render={props => isAuthenticated ? <Redirect to={defaultPath} /> : <Component {...props} />} />
    }
  }
  return routes
}

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.isLoggedIn,
    user: state.user.User_data,
    applicationError: state.user.applicationError,
    level: state.user.isLoggedIn ? state.user.User_data.level : null
  }
}


export default connect(mapStateToProps)(PrivateRoute);


