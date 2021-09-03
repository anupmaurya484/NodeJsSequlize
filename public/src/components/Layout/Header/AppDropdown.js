import React, { useState, useEffect } from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, NavLink, Button } from "reactstrap";
import { connect } from 'react-redux';
import { Link, withRouter } from "react-router-dom";
import * as ACT from '../../../actions';
import { loadApps } from '../../../actions/users';
import { GetTenantName, getRandomColor, AppDesign, accessLevel, AppDeveloperMode } from "../../../utils/helperFunctions";


var adminApp = [{ name: "Admin", icon: "accessibility", link: "/admin/user", _id: "5f190371db85375976b48102" }];
var dashboardApp = [{ name: "Dashboard", icon: "dashboard", link: "/dashboard", _id: "5f190371db85375976b48101" }];
var TenantForm = { name: "Forms", icon: "note", link: "/shared-forms-list", _id: "5f190371db85375976b48103" };

const AppDropdown = (props) => {

  // Declare a new state variable, which we'll call "menu"
  const [isDropdown, setAppDropdown] = useState(false);
  const { isLoggedIn, User_data, UserApps, app_id, applicationError } = props.user;

  useEffect(async () => {
    const resData = await props.loadApps({ _id: User_data._id });
    if (!resData.apps) {
      props.history.push("/application-error")
    }
  }, [])


  //For Tenant for access Portal side 
  if (GetTenantName() == "portal") {
    dashboardApp.push(TenantForm);
  }


  const handleChangeAppHome = (id, data, item, isApplication) => {
    handleChangeApp(id, data.link, data.default_path, item, data.is_url_page, isApplication)
  }

  const handleChangeApp = (id, link, default_path, item, is_url_page, isApplication) => {
    if (!isApplication) {
      props.loadSidenavConfig(id);
    }

    setAppDropdown(false)
    let redirectPath = ""
    if (default_path && default_path != "") {
      const app_info = item.find(x => x._id === id);
      if (is_url_page === true) {
        if (default_path.split(link).length >= 2) {
          redirectPath = (link + default_path.split(link)[1])
        } else {
          if (AppDesign()) {
            redirectPath = default_path;
          } else {
            window.location.replace(default_path);
          }
        }
      } else if (app_info) {
        const links = [].concat.apply([], app_info.sidenav.groupLinks[0].map(x => x.links))
        const find_index = links.findIndex(x => x.route == default_path)
        if (find_index === -1 || ["/dashboard", "dashboard"].includes(default_path)) {
          redirectPath = link
        } else {
          redirectPath = (link + default_path)
        }
      } else {
        redirectPath = link
      }
    } else {
      redirectPath = link
    }

    if (redirectPath == "/admin/user") {
      props.history.push(redirectPath)
    } else if (isApplication) {
      window.open(redirectPath);
    } else {
      if (AppDesign() || (window.location.pathname.search("/admin") >= 0 && window.location.pathname!="/admin/appversion")) {
        props.history.push("/design" + redirectPath)
      } else if (redirectPath != "") {
        props.history.push(redirectPath)
      }
    }

  }


  const apps2 = (UserApps && UserApps.length != 0) ? dashboardApp.concat(UserApps) : dashboardApp;
  const apps = (isLoggedIn && (User_data.level == 8 || User_data.level == 6) && AppDeveloperMode()) ? adminApp.concat(apps2) : apps2;
  let ids = apps.map(o => o.name)
  let filtered = apps.filter(({ name, application_type }, index) => (!ids.includes(name, index + 1) && application_type != 2))
  const rows = new Array(Math.round(filtered.length / 3)).fill(0);

  return (
    <React.Fragment>

      {(app_id != "" && app_id && apps && apps.length != 0 && apps.find(x => x._id == app_id)) &&
        <div className="d-inline-block dropdown">
          {AppDesign() ?
            <Button onClick={() => { props.showLeftSidebarAction(false), handleChangeAppHome(app_id, apps.find(x => x._id == app_id), apps, true) }} className="btn waves-effect mt-2">{apps.find(x => x._id == app_id).name}
              <i className="fa fa-play ml-2" aria-hidden="true"></i>
            </Button>
            :
            <div className="d-inline-block dropdown">
              <Button onClick={() => { props.showLeftSidebarAction(false), handleChangeAppHome(app_id, apps.find(x => x._id == app_id), apps) }} className="btn waves-effect mt-2">{apps.find(x => x._id == app_id).name}</Button>
            </div>
          }
        </div>
      }

      {((AppDesign() && !props.HeaderSetting.is_portalApp) || props.HeaderSetting.is_portalApp) &&
        <Dropdown className="ml-1" isOpen={isDropdown} toggle={() => { setAppDropdown(!isDropdown), props.showLeftSidebarAction(false) }}>
          <DropdownToggle className="btn header-item noti-icon waves-effect" caret tag="button">
            <i className="fa fa-th ml-1"></i>
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-md apps-dropdown-menu" right>
            <div className="px-lg-2">
              {filtered.map((item, i) => (
                <DropdownItem key={i} className="dropdown-icon-item d-flex w-100 " style={{ padding: "0px" }}>
                  <span className="w-100 app-p-20" onClick={e => handleChangeApp(item._id, item.link, item.default_path, apps, item.is_url_page)}>
                    <i className="material-icons" style={{ fontSize: "25px", color: getRandomColor(), verticalAlign: "middle" }} >{item.icon}</i>
                    <label style={{ marginLeft: "10px" }}>{item.name}</label>
                  </span>
                  {AppDesign() && <i onClick={e => handleChangeApp(item._id, item.link, item.default_path, apps, item.is_url_page, true)} className="fa fa-cog app-icon-config" aria-hidden="true"></i>}
                </DropdownItem>
              ))}

              {accessLevel(['superadmin', 'portaladmin', 'tenantadmin', 'programmer', 'designer'], User_data.level) &&
                <Link to={AppDeveloperMode() ? "/design/app-setting" : "/admin/appversion"} className="header-profile">
                  <DropdownItem tag="button" className="bg-white">
                    <span id="btn-create-new-app " className="custom-btn header-admin-btn btn btn-primary btn-sm">{AppDeveloperMode() ? 'App Design' : 'App Setup'}</span>
                  </DropdownItem>
                </Link>
              }
            </div>
          </DropdownMenu >
        </Dropdown >
      }
    </React.Fragment >

  );
}

const mapStateToProps = (state) => {
  return { user: state.user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadApps: (data) => dispatch(loadApps(data)),
    setApp: (appName) => dispatch(ACT.setApp(appName)),
    loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName)),
    setcurrentPage: (appName) => dispatch(ACT.setcurrentPage(appName)),
    showLeftSidebarAction: (flag) => dispatch(ACT.showLeftSidebarAction(flag)),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppDropdown))
