//Import Packages
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button, Container, NavLink, NavItem, Nav, TabContent, TabPane, Modal, ModalBody, ModalHeader } from 'reactstrap';
import queryString from 'query-string';
import classnames from "classnames";
import { Formik, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';

//Function 
import { GetAppName, Toast } from '../../../utils/helperFunctions';
import { actionCreateCalendarForm, actionGetCalendarForm } from '../../../actions/calendar';

//Import Components 
import CalendarEventDesignForm from './CalendarComponents/CalendarEventDesignForm';
import CalendarViewConfig from './CalendarComponents/CalendarViewConfig';
import CalendarSettingFrom from './CalendarComponents/CalendarSettingFrom';
import CalendarActions from './CalendarComponents/CalendarActions';
import CalendarPreview from './CalendarComponents/CalendarPreview';

//import CalendarEventDesignFormSchema from '../../../assets/json/event_form_design.json'
import CalendarEventDesignFormSchema from '../../../assets/json/calendarDefaultEventForm.json';
import '../index.css';
import SimpleBar from 'simplebar-react';

const validationSchema = Yup.object().shape({
    calendarName: Yup.string().required("calendar Name is a required field."),
    calendarDescription: Yup.string().required("calendar Description is a required field.")
});

const initState = {
    calendarName: '',
    calendarDescription: '',
    eventsOverlaps: false
}

//Define Class
class AddCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_step: 1,
            form_setting_step: 0,
            isSetting: false,
            eventformschema: CalendarEventDesignFormSchema,
            eventsConfig: undefined,
            setting_data: {
                calendarName: "",
                calendarDescription: "",
                calenderCatergory: "",
                eventsOverlaps: false,
            },
            viewConfig: {
                is_yearly: true,
                is_monthly: true,
                is_weekly: true,
                is_daily: true
            },
            setAddCalendarModal: false
        }
    }

    changeCurrentView(current_step) {
        this.setState({ current_step: current_step })
    }

    UNSAFE_componentWillMount = async () => {
        const { id: formId } = queryString.parse(this.props.location.search);
        if (formId != 'new') {
            this.loadFormData(formId)
        } else {
            this.setState({ setAddCalendarModal: true });
        }
    }

    loadFormData = async (formId) => {
        const resData = await this.props.actionGetCalendarForm(formId)
        if (resData.status) {
            const setting_data = {
                calendarName: resData.data.calendarName,
                calendarDescription: resData.data.calendarDescription,
                calenderCatergory: resData.data.calenderCatergory,
                eventsOverlaps: resData.data.eventsOverlaps,
            }
            this.setState({
                setting_data: setting_data,
                eventformschema: JSON.parse(resData.data.eventformschema),
                viewConfig: resData.data.viewConfig,
                eventsConfig: resData.data.eventsConfig,
            });

        } else {
            Toast(data.message, 'error');
        }
    }

    handleCreateUpdateCollection = async () => {
        const { id: formId } = queryString.parse(this.props.location.search);
        let payload = {
            _id: formId,
            appId: this.props.user.app_id,
            eventformschema: JSON.stringify(this.state.eventformschema),
            calendarName: this.state.setting_data.calendarName,
            calendarDescription: this.state.setting_data.calendarDescription,
            eventsOverlaps: this.state.setting_data.eventsOverlaps,
            viewConfig: this.state.viewConfig,
            eventsConfig: this.state.eventsConfig
        }
        console.log(payload);
        const resData = await this.props.actionCreateCalendarForm(payload);
        Toast(resData.message, resData.status ? 'success' : 'error')
    }

    SaveEventActions = (eventCfg) => {
        let { eventsConfig } = this.state;
        eventsConfig = eventCfg;
        this.setState({ eventsConfig });
    }


    render() {
        const { form_setting_step, isSetting, current_step, setting_data, eventformschema, viewConfig, eventsConfig, setAddCalendarModal, eventsOverlaps } = this.state;
        const { user } = this.props;
        const id = "new"
        return (
            <Fragment>
                <div tabs className="topnav nav-tabs nav-justified collection-form" style={{ "marginTop": "-29px" }}>
                    <div className="container-fluid d-flex">
                        {/* <label title="User Permission" onClick={() => this.setState({ isSetting: true })} className='mt-2 mr-5' style={{ fontSize: "18px" }}><i className="fa fa-cog" aria-hidden="true"></i></label> */}
                        <div className='navTop-button' style={{ paddingTop: "9px" }}>
                            <Button className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary ${classnames({ active: isSetting })}`} onClick={() => this.setState({ isSetting: !isSetting })}>
                                <i className="fa fa-cog fa-black stroke-transparent" aria-hidden="true"></i></Button>
                        </div>
                        <Nav className="" style={{ width: "23%" }}>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: current_step == 1 })}
                                    onClick={() => { this.changeCurrentView(1) }}>
                                    <span className="d-none d-sm-block"><FormattedMessage id="collection.form_designer" /></span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: current_step == 2 })}
                                    onClick={() => this.changeCurrentView(2)}>
                                    <span className="d-none d-sm-block"><FormattedMessage id="collection.view_config" /></span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: current_step == 3 })}
                                    onClick={() => this.changeCurrentView(3)}>
                                    <span className="d-none d-sm-block"><FormattedMessage id="collection.event_config" /></span>
                                </NavLink>
                            </NavItem>
                        </Nav>

                        {current_step == 1 &&
                            <div className="form_designer-tabls float-left ml-3" style={{ paddingTop: "9px" }}>
                                <Button title="Preview" onClick={() => this.setState({ form_setting_step: 1 })} className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary ${form_setting_step === 1 ? "active" : ""}`}><span className="material-icons stroke-transparent" style={{ "marginLeft": "-6px", "marginTop": "-2px" }}>pageview</span></Button>
                            </div>
                        }

                        <div className="d-flex justify-content-end" style={{ "right": "25px", "position": "absolute", paddingTop: "2px" }}>
                            <div className="p-2">
                                <Link to={"/design" + GetAppName(this.props.user) + "/calendar-list"}>
                                    <button className='btn btn-primary btn-sm'>Exit</button>
                                </Link>
                            </div>
                            <div className="p-2">
                                <button className='btn btn-primary btn-sm' onClick={() => this.handleCreateUpdateCollection()}>{id == "new" ? 'Save' : 'Update'}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <TabContent activeTab={current_step}>
                    <br /><br />
                    {current_step == 1 &&
                        <TabPane tabId={1}>
                            <CalendarEventDesignForm
                                eventformschema={eventformschema}
                                onChangeEventDesignForm={(data) => this.setState({ eventformschema: data })} />

                        </TabPane>
                    }
                    {current_step == 2 &&
                        <TabPane tabId={2}>
                            <CalendarViewConfig
                                viewConfig={viewConfig}
                                onChangeViewConfig={(data) => this.setState({ viewConfig: data })} />
                        </TabPane>
                    }

                    {current_step == 3 &&
                        <TabPane tabId={3}>
                            <CalendarActions
                                user={user}
                                eventsConfig={eventsConfig}
                                submission={setting_data}
                                SaveEventActions={(e, i) => this.SaveEventActions(e, i)}
                            />
                        </TabPane>
                    }

                </TabContent>

                {/* //Setting Tabs  */}
                {isSetting &&
                    <>
                        <div className="side-menu left-bar collection-setting" >
                            <SimpleBar style={{ height: "900px", 'maxWidth': '100%', 'overflow-x': 'hidden', 'overflow-y': 'hidden' }}>
                                <div data-simplebar className="h-100">
                                    <div className="mb-3 d-flex justify-content-between">
                                        <label title="Collection Setting" className='mt-2 mr-5' style={{ fontSize: "18px" }}>Page Setting</label>
                                        <i onClick={() => this.setState({ isSetting: false })} className="fa fa-times" aria-hidden="true"></i>
                                    </div>
                                    <CalendarSettingFrom
                                        settingData={setting_data}
                                        onChangeSettingForm={(data) => this.setState({ setting_data: data })} />

                                </div>
                            </SimpleBar>
                        </div>
                        <div className="rightbar-overlay" onClick={() => this.setState({ isSetting: false })}></div>
                    </>
                }

                {/* Collection Preview */}
                {(form_setting_step == 1) &&
                    <CalendarPreview
                        previewSchema={eventformschema}
                        previewModal={true}
                        toggle={() => this.setState({ form_setting_step: 0 })} />
                }

                <Modal className='modal-md' isOpen={setAddCalendarModal}>
                    <ModalHeader toggle={() => window.location.href = "/design" + GetAppName(this.props.user) + "/calendar-list"}>
                        Page Setting
                    </ModalHeader>
                    <ModalBody>
                        <Formik
                            initialValues={initState}
                            validationSchema={validationSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={(values) => {
                                const data = {
                                    calendarName: values.calendarName,
                                    calendarDescription: values.calendarDescription,
                                    eventsOverlaps: values.eventsOverlaps
                                }
                                console.log(data);
                                this.setState({ setting_data: { ...setting_data, ...data }, setAddCalendarModal: false });
                            }}>
                            {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                                <Form>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="form-group" style={{ paddingLeft: '2px' }}>
                                                <label className='font-weight-bold'>Calendar Name<span className='required-star'>*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="calendarName"
                                                    name="calendarName"
                                                    rows="4"
                                                    value={values.calendarName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage className="validation-error" name='calendarName' component='div' />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-group" style={{ paddingLeft: '2px' }}>
                                                <label className='font-weight-bold' >Calendar Description<span className='required-star'>*</span></label>
                                                <textarea
                                                    style={{ width: '100%' }}
                                                    className="form-control"
                                                    id="calendarDescription"
                                                    name="calendarDescription"
                                                    type="text"
                                                    maxLength="256"
                                                    value={values.calendarDescription}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                ></textarea>
                                                <ErrorMessage className="validation-error" name='calendarDescription' component='div' />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <label className='font-weight-bold'>Allowed events overlaps</label>
                                            <input
                                                type="switch"
                                                type="radio"
                                                className="ml-1"
                                                id="eventsOverlaps"
                                                name="eventsOverlaps"
                                                label=""
                                                checked={values.eventsOverlaps}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                        <div className='col-lg-12 mt-3'>
                                            <Link to={"/design" + GetAppName(this.props.user) + "/calendar-list"}>
                                                <Button className='btn btn-secondary float-left'>cancel</Button>
                                            </Link>
                                            <Button type='submit' className='btn btn-secondary float-right'>submit</Button>
                                        </div>
                                    </div>
                                </Form>
                            )}

                        </Formik>
                    </ModalBody>
                </Modal>
            </Fragment>

        )
    }
}

//Get Props
const mapStateToProps = ({ user }) => ({
    user
});

//Dispatch Functiond
const mapDispatchToProps = (dispatch) => ({
    actionCreateCalendarForm: (data) => dispatch(actionCreateCalendarForm(data)),
    actionGetCalendarForm: (id) => dispatch(actionGetCalendarForm(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddCalendar)