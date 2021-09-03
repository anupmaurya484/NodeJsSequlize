import React from "react";
import { Route, Switch, IndexRedirect, BrowserRouter as Router, } from "react-router-dom";
import { connect } from 'react-redux';
import { GetAppName, GetTenantName, AppDeveloperMode } from '../../utils/helperFunctions';


// import Landing from '../LandingPage'
import User from '../../pages/Admin/Users/User';
import Settings from '../../pages/Admin/Settings';
// import SidenavSetup from '../../pages/Sidenav/SidenavSetup';
import ProfilePage from '../../pages/ProfilePage';
import TenantsList from '../../pages/Tenants/TenantLists';
import AppVersion from '../../pages/AppVersion/AppVersion';


// Authentication related pages
import LoginPage from "../../pages/LoginPage";
import SignupPage from '../../pages/SignupPage';
import ChangePasswordPage from '../../pages/ChangePasswordPage';
import HomePage from "../../pages/HomePage";
import UploadForm from '../../pages/UploadForm';
import AppSetting from '../../pages/AppsSetting/AppSetting';
import ApplicationError from '../../pages/ApplicationError';
import PageNotFound from '../../pages/PageNotFound'
import Logout from '../../pages/Logout';

import PageLists from "../../pages/PageLayout/PageLists";
import CreatePage from '../../pages/PageLayout/CreatePage';
import ViewPage from '../../pages/PageLayout/ViewPage';
import TermsService from '../../pages/termsService'

//Collections Pages
import CollectionList from "../../pages/Collections/CollectionList";
import CollectionForm from "../../pages/Collections/CollectionForm";
import CollectionViewList from '../../pages/Collections/CollectionViewList';

//Calendar Page
import CalendarLists from '../../pages/Calendar/CalendarLists';
import AddCalendar from '../../pages/Calendar/AddCalendar';
import CalendarView from '../../pages/Calendar/CalendarView';

// Connection Page
import ConnectionListPage from '../../pages/Connection/ConnectionListPage';
import ContainerListPage from '../../pages/Connection/ContainerListPage';
import FileManagerFsPage from '../../pages/Connection/FileManagerFsPage';
import AddContainerPage from '../../pages/Connection/AddContainerPage';
import ConnectionSetupPage from '../../pages/Connection/ConnectionSetup'
import AuthPage from '../../pages/Connection/AuthPage';

//Workflows Page
import Workflow from '../../pages/Workflow';
import InstancePage from '../../pages/Workflow/component/InstancePage';
import TaskViewPage from '../../pages/WorkflowTask';
import WorkflowTaskQuickApproval from '../../pages/WorkflowTask/WorkflowTaskQuickApproval';

//Events Pages
import EventsListPage from '../../pages/Events/EventsListPage';
import SubscriptionPage from '../../pages/Events/SubscriptionPage';

//Schedules Pages
import ScheduleListPage from '../../pages/Schedule/ScheduleListPage';
import ScheduleFormPage from '../../pages/Schedule/ScheduleFormPage';

//SharedForms
import SharedformsList from '../../pages/Sharedforms';
import Sharedforms from '../../pages/Sharedforms/Sharedforms';

import ExternalCollectionPage from '../../pages/Collections/ExternalCollectionPage';
import InternalInputCollectionForm from '../../pages/Collections/InternalInputCollectionForm';
import ShareInputCollectionForm from '../../pages/Collections/ShareInputCollectionForm';
import AccessOtpForm from '../../pages/Collections/ShareInputCollectionForm/AccessOtpForm';
import PathSetting from "../../pages/PathSetting"
import Credit from '../../pages/Credit';

// Admin pages
import ApplicationConfig from '../../pages/Admin/ApplicationConfig';


class Routes extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoadPage: false,
    }
  }

  componentWillMount() {
    const that = this;
    setTimeout(()=> that.setState({ isLoadPage: true }),2500)
    
  }

  componentDidUpdate() {
    window.onpopstate = e => {
      var rootPath = GetAppName(this.props.user);
      const pathname = "/" + this.props.location.pathname.split("/")[1]
      if (rootPath && pathname && pathname != rootPath) {
        window.location.reload();
      }
    }
  }

  render() {
    var rootPath = GetAppName(this.props.user);

    var IsSuperAdmin = 0, IsTenant = 0;
    if (this.props.user.isLoggedIn) {
      IsSuperAdmin = (this.props.user.User_data.level == 8 || this.props.user.User_data.level == 6) ? 1 : 0;
      IsTenant = (this.props.user.User_data.level != 6) ? 1 : 0
    }


    return (
      <Switch>
        {/* public path*/}
        {/* <Route exact path="/public/survey" component={surveyForm} /> */}
        <Route exact path="/public/form" component={ShareInputCollectionForm} />
        <Route exact path="/public/access-otp-form" component={AccessOtpForm} />
        <Route exact path="/public/page/:pageId" component={ViewPage} />  {/*change page path*/}
        <Route exact path="/public/auth" component={AuthPage} />
        <Route exact path="/public/terms-of-service" component={TermsService} />
        <Route exact path="/public/quickapproval/:id/:outcome?" component={WorkflowTaskQuickApproval} />

        {/* Login and Sign  path*/}
        <Route exact path="/login/:google_id" component={LoginPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/registration" component={SignupPage} />
        <Route exact path="/changepassword/:_id" component={ChangePasswordPage} />
        <Route exact path="/design/app-setting" component={AppSetting} />

        {/* Home Path  */}
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/home/tenantrequest" component={TenantsList} />
        <Route exact path="/home/Profile" component={ProfilePage} />
        <Route exact path="/home/user" component={User} />
        <Route exact path="/home/credit" component={Credit} />
        <Route exact path="/application-error" component={ApplicationError} />
        <Route exact path="/logout" component={Logout} />

        <Route exact path="/page/:path_name/:page_name" component={ViewPage} />
        <Route exact path="/external/login" component={LoginPage} />

        {/* Dashboard Path  */}
        {(rootPath != "/Survey" && rootPath != "" && rootPath != "/shared-forms-list") && < Route exact path={rootPath} component={HomePage} />}
        {(rootPath != "/Survey" && rootPath != "" && rootPath != "/shared-forms-list") && <Route exact path={"/design" + rootPath} component={HomePage} />}



        <Route exact path={rootPath + "/workflow"} component={Workflow} />
        <Route exact path={rootPath + "/tasks"} component={TaskViewPage} />
        <Route exact path={rootPath + "/workflow/InstancePage"} component={InstancePage} />
        <Route exact path={rootPath + "/file-explorer/:containerId"} component={FileManagerFsPage} />
        <Route exact path={rootPath + "/containers"} component={ContainerListPage} />
        {/* <Route exact path={rootPath + "/add-container"} component={AddContainerPage} /> */}
        <Route exact path={rootPath + "/connections"} component={ConnectionListPage} />
        {/* <Route exact path={rootPath + "/connection-setup"} component={ConnectionSetupPage} /> */}
        <Route exact path={rootPath + "/calendar-list"} component={CalendarLists} />
        {/* <Route exact path={rootPath + "/create-calendar"} component={AddCalendar} /> */}
        <Route exact path={rootPath + "/calendar-view"} component={CalendarView} />
        <Route exact path={rootPath + "/events"} component={EventsListPage} />
        <Route exact path={rootPath + "/eventsubscription/:id?"} component={SubscriptionPage} />
        <Route exact path={rootPath + "/schedules"} component={ScheduleListPage} />
        <Route exact path={rootPath + "/schedule/:id?"} component={ScheduleFormPage} />
        <Route exact path={rootPath + "/page/:pageId"} component={ViewPage} />  {/*change page path*/}
        <Route exact path={rootPath + "/data-input"} component={InternalInputCollectionForm} />
        <Route exact path={rootPath + "/collection/:id"} component={CollectionViewList} />
        <Route exact path={rootPath + "/collection-list"} component={CollectionList} />
        <Route exact path={rootPath + "/page-list"} component={PageLists} />
        <Route exact path={rootPath + "/external-collection"} component={ExternalCollectionPage} />
        <Route exact path={rootPath + "/upload-form"} component={UploadForm} />
        {/* <Route exact path={rootPath + "/create-page"} component={CreatePage} /> */}

        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/workflow"} component={Workflow} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/tasks"} component={TaskViewPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/workflow/InstancePage"} component={InstancePage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/file-explorer/:containerId"} component={FileManagerFsPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/containers"} component={ContainerListPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/add-container"} component={AddContainerPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/connections"} component={ConnectionListPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/connection-setup"} component={ConnectionSetupPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/calendar-list"} component={CalendarLists} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/create-calendar"} component={AddCalendar} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/calendar-view"} component={CalendarView} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/events"} component={EventsListPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/eventsubscription/:id?"} component={SubscriptionPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/schedules"} component={ScheduleListPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/schedule/:id?"} component={ScheduleFormPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/page/:pageId"} component={ViewPage} />} {/*change page path*/}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/data-input"} component={InternalInputCollectionForm} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/collection/:id"} component={CollectionViewList} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/collection-list"} component={CollectionList} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/page-list"} component={PageLists} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/external-collection"} component={ExternalCollectionPage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/create-page"} component={CreatePage} />}
        {AppDeveloperMode() && <Route exact path={"/design" + rootPath + "/create-form"} component={CollectionForm} />}
        {AppDeveloperMode() && <Route exact path={"/design/page-group"} component={PathSetting} />}

        {/* Survey path*/}
        {/* <Route exact path="/survey" component={SurveyList} />
        <Route exact path="/survey/Survey-form" component={surveyForm} />
        <Route exact path="/survey/survey-response" component={SurveyResponse} />
        <Route exact path="/survey/survey-analysis" component={surveynalysis} />
        <Route exact path="/survey/survey-analysis/:surveynalysis" component={SurveyAnalysisDetails} /> */}


        {GetTenantName() == 'portal' && <Route exact path={"/shared-forms-list"} component={SharedformsList} />}
        {GetTenantName() == 'portal' && <Route exact path={rootPath + "/shared-forms-list"} component={SharedformsList} />}
        {GetTenantName() == 'portal' && <Route exact path={rootPath + "/sharedforms"} component={Sharedforms} />}
        {GetTenantName() == 'portal' && <Route exact path={"/shared-forms-list/shardformrecords"} component={Sharedforms} />}

        {/* Admin path*/}
        {(IsSuperAdmin == 1 && AppDeveloperMode()) && <Route exact path="/admin/user" component={User} />}
        {(IsSuperAdmin == 1 && AppDeveloperMode()) && <Route exact path="/admin/settings" component={Settings} />}
        {(IsSuperAdmin == 1 && AppDeveloperMode() && IsTenant) && <Route exact path="/admin/tenant" component={TenantsList} />}
        {(IsSuperAdmin == 1 && !AppDeveloperMode()) && <Route exact path="/admin/appversion" component={AppVersion} />}

        {this.state.isLoadPage && <Route render={function () { return <PageNotFound />; }} />}

      </Switch >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}


export default connect(mapStateToProps, null)(Routes);