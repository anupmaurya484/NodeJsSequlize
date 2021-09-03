import React, { Component, Fragment } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import StepWizard from 'react-step-wizard';
import FirstStep from './Components/FirstStep';
import SecondStep from './Components/SecondStep';
// import ThirdStep from './Components/ThirdStep';
import FourStep from './Components/FourStep';
import LastStep from './Components/LastStep';
import NavStep from './Components/NavStep';
import '../AppSetting.css';
// import Progress from './components/Progress';

const SIDENAV = [{
    "name": "Dashboard",
    "route": "/",
    "icon": "dashboard",
    "text": "Dashboard",
    "checked": true
},
{
    "name": "Collections",
    "route": "/collection-list",
    "icon": "view_module",
    "text": "Collections",
    "checked": true
},
{
    "name": "Page Layouts",
    "route": "/page-list",
    "icon": "settings",
    "text": "Page Layout",
    "checked": true
}, {
    "name": "Connection",
    "route": "/connections",
    "icon": "settings_input_component",
    "text": "Connections",
    "checked": true
}, {
    "name": "File Folders",
    "route": "/containers",
    "icon": "folder",
    "text": "File Folders",
    "checked": true
}, {
    "name": "Schedules",
    "route": "/schedules",
    "icon": "today",
    "text": "Schedules",
    "checked": true
}, {
    "name": "Calendar",
    "route": "/calendar-list",
    "icon": "today",
    "text": "Calendar",
    "checked": true
}, {
    "name": "workflow",
    "route": "/workflow",
    "icon": "play_arrow",
    "text": "workflow",
    "checked": true
}]

class CreateApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showConnectSuccess: false,
            is_complete: true,
            data: props.data ? props.data : {
                _id: "",
                appName: "",
                description: "",
                appLogo: "",
                default_path: "/",
                application_type: "1",
                default_path_url: "",
                is_url_page: false,
                sidenav_config: SIDENAV,
                isSideNav: true,
                isTopNav: true
            }
        }
    }

    onSubmitNextForm = async (submit_data, key, _childProps) => {
        console.log(key);
        let { data } = this.state;
        if (key == 'default_home_page') {
            data['default_path'] = submit_data.default_path;
            data['default_path_url'] = submit_data.default_path_url;
            this.setState({
                ...this.state,
                data: {
                    ...this.state.data,
                    ...submit_data
                }
            })
        } else if (key == 'SidenavConfig') {
            let sidenav_config = submit_data.SidenavConfig.filter(x => x.checked)
            this.setState({
                ...this.state,
                data: {
                    ...this.state.data,
                    sidenav_config: sidenav_config,
                    isSideNav: submit_data.isSideNav,
                    isTopNav: submit_data.isTopNav
                }
            })
        } else if (key == 'selected_icon') {
            this.setState({
                ...this.state,
                data: {
                    ...this.state.data,
                    appLogo: submit_data
                }
            })
        } else if(key == 'initial-setup') {
            this.setState({
                ...this.state,
                data: {
                    ...this.state.data,
                    appName: submit_data.appName,
                    description: submit_data.description,
                    application_type: submit_data.application_type,
                    isSideNav: submit_data.isSideNav,
                    sidenav_config: SIDENAV,
                    isSideNav: true,
                    isTopNav: true
                }
            });
        }


        if (_childProps) {
            const res = await this.props.handleClickCreateUpdateApp(data);
            if (res) {
                _childProps.nextStep();
                this.setState({ is_complete: true });
            } else {
                _childProps.nextStep();
                this.setState({ is_complete: false });
            }
        }

    }

    onClose = (code) => {
        console.log("code: ", code)
        console.log("closed!");
    }

    onFinished = () => {
        this.setState({
            showConnectSuccess: false,
            is_complete: true,
            data: {
                _id: "",
                appName: "",
                description: "",
                appLogo: "",
                default_path: "/",
                application_type: "1",
                default_path_url: "",
                is_url_page: false,
                sidenav_config: SIDENAV,
                isSideNav: true,
                isTopNav: true
            }
        });
        console.log("this.props.onClose");
        this.props.onClose();
    }

    render() {

        const { data, showConnectSuccess, is_complete } = this.state
        const props = this.props;
        console.log(data);

        return (
            <div>
                <div className={`col-12`}>
                    <Modal className="create-app-page-model" centered isOpen={true} toggle={this.props.onClose} size="lg">
                        <ModalHeader toggle={this.props.onClose}> {(data._id == "" ? "Create" : "Update") + " App Space"}</ModalHeader>
                        <ModalBody>
                            <StepWizard initialStep={1} nav={<NavStep />}>
                                <FirstStep
                                    data={data}
                                    history={props.history}
                                    onClose={this.props.onClose}
                                    handleNext={this.onSubmitNextForm}
                                    showConnectSuccess={showConnectSuccess} />
                                <SecondStep
                                    data={data}
                                    history={props.history}
                                    handleNext={this.onSubmitNextForm}
                                    onClose={this.props.onClose} />

                                {/* <ThirdStep
                                    data={data}
                                    onClose={this.props.onClose}
                                    handleNext={this.onSubmitNextForm}
                                    history={this.props.history}
                                /> */}
                                <FourStep
                                    data={data}
                                    onClose={this.props.onClose}
                                    options_value={data.sidenav_config}
                                    appName={data.appName}
                                    handleNext={this.onSubmitNextForm}
                                    history={this.props.history}
                                />
                                <LastStep
                                    gotoWorkflowSetup={() => console.log()}
                                    onClose={this.onFinished}
                                    history={this.props.history}
                                    is_complete={is_complete} />
                            </StepWizard>
                        </ModalBody>
                    </Modal>
                </div>

                {showConnectSuccess == 2 &&
                    <div className={`col-12 mt-1 text-center`}>
                        <div className="alert alert-danger">
                            <strong>Error!</strong> Connection Failed, Please try again!.
					</div>
                    </div>
                }
            </div>
        )
    }
}

export default CreateApp