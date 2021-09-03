//Import Packages
import React, { Component, Fragment } from 'react';
import ReactDOM from "react-dom";
import { Row, Col, Button, Container, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { connect } from 'react-redux';
import { Form } from 'react-formio';
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import queryString from 'query-string';
import moment from 'moment';
import axios from '../../../utils/axiosService';
import Breadcrumbs from '../../../components/Common/Breadcrumb';

//Function 
import { GetAppName, Toast, printSchedules, cronGenerator } from '../../../utils/helperFunctions';
import { actionGetCalendarForm, actionCreateCalendarEvent, actionGetCalendarEvent } from '../../../actions/calendar';

//Define Class
class CalendarView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventForm: {},
            eventsConfig: undefined,
            eventFormData: {
                "startTime": new Date(),
                "endTime": new Date()
            },
            eventformId: "",
            is_open_eventform: false,
            view: 'dayGridMonth',
            headerToolbarRight: "",
            events: [],
            tz: moment.tz.guess(true)
        }
    }

    UNSAFE_componentWillMount = async () => {
        const { id: formId } = queryString.parse(this.props.location.search);
        const resData = await this.props.actionGetCalendarForm(formId)
        const resData2 = await this.props.actionGetCalendarEvent(formId)
        if (resData.status) {
            let headerToolbarRight = [];
            if (resData.data.viewConfig) {
                if (resData.data.viewConfig.is_daily)
                    headerToolbarRight.push('timeGridDay');
                if (resData.data.viewConfig.is_monthly)
                    headerToolbarRight.push('dayGridMonth')
                if (resData.data.viewConfig.is_weekly)
                    headerToolbarRight.push('timeGridWeek')
                if (resData.data.viewConfig.is_yearly)
                    headerToolbarRight.push('listWeek')
            }
            this.setState({
                eventForm: JSON.parse(resData.data.eventformschema),
                eventsConfig: resData.data.eventsConfig,
                events: resData2.data,
                headerToolbarRight: headerToolbarRight.toString()
            });
        }
    }

    //Open New Event Form 
    onHandleSelectDate = (info) => {
        console.log(info.startStr, info.endStr, info)

        console.log(new Date(info.startStr));
        console.log(new Date(info.endStr));

        this.setState({
            is_open_eventform: true,
            eventFormData: {
                "startTime": new Date(info.startStr),
                "endTime": new Date(info.endStr)
            }
        })
    };

    /*  Calendar Events  */
    onHandleSelectEventForm = (calEvent, jsEvent, view) => {
        const { events } = this.state;
        const event = events.find(x => x._id == calEvent.event._def.publicId)
        const eventFormData = event.eventFormData
        //console.log(eventFormData);;
        this.setState({
            is_open_eventform: true,
            eventformId: event._id,
            eventFormData: eventFormData
        });
    };

    //Close Event Form
    onCloseEventForm = () => {
        this.setState({
            is_open_eventform: false,
            eventformId: "",
            eventFormData: {
                "startTime": new Date(),
                "endTime": new Date()
            }
        });
    }

    /*  Calendar Events  */
    handleDrop = (eventObj, date) => {
        console.group('onDrop');
        console.log('date');
        console.dir(date);
        console.groupEnd();
    };

    /*  Calendar Events  */
    handleChangeView = view => e => {
        e.preventDefault();
        this.setState({ view: view.name });
    };

    /*  Calendar Events  */
    EventDetail = ({ eventObj, el }) => {
        console.log(el);
        $el.popover({
            title: eventObj.title,
            content: eventObj.description,
            trigger: 'hover',
            placement: 'top',
            container: 'body'
        });
        return el
    };

    eventSubmit = async (e) => {
        console.log(e)
        const { id: formId } = queryString.parse(this.props.location.search);
        const { eventformId, eventsConfig } = this.state;
        e.data.startTime = moment(moment(e.data.startTime).format('YYYY-MM-DD') + (e.data.fromTime ? (" " + e.data.fromTime) : ""));
        e.data.endTime = moment(moment(e.data.endTime).format('YYYY-MM-DD') + (e.data.toTime ? (" " + e.data.toTime) : ""));
        
        var startTimeStr = moment(e.data.startTime).hours() + ':' + moment(e.data.startTime).minutes();
        var reqData = {
            _id: eventformId == "" ? 'new' : eventformId,
            title: e.data.title,
            description: e.data.description,
            color: e.data.color ? e.data.color : '#4285f4',
            startDateTime: new Date(e.data.startTime).toISOString(),
            endDateTime: new Date(e.data.endTime).toISOString(),
            cronExp: e.data.isRepeating ? cronGenerator(e.data.repeatsInterval, startTimeStr, e.data.days, undefined, e.data.weekdays) : "",
            calendarformId: formId,
            eventFormData: e.data,
            eventsConfig: eventsConfig
        }

        const resData = await this.props.actionCreateCalendarEvent(reqData)
        Toast(resData.message, resData.status ? 'success' : 'error');
        this.setState({
            eventformId: "",
            eventFormData: "",
            is_open_eventform: false,
            events: resData.result
        });
    }

    onChange = (e) => {
        var { eventFormData } = this.state;
        if (e.changed) {
            if (!(e.changed.component.inputType == "textarea" || e.changed.component.inputType == "text")) {
                switch (e.changed.component.key) {
                    case "fromTime":
                        eventFormData["startTime"] = moment(moment(e.data.startTime).format('YYYY-MM-DD') + " " + e.data.fromTime);
                        eventFormData["fromTime"] = e.data.fromTime
                        break
                    case "toTime":
                        eventFormData["endTime"] = moment(moment(e.data.endTime).format('YYYY-MM-DD') + " " + e.data.toTime);
                        eventFormData["toTime"] = e.data.toTime
                        break
                    case "startTime": //start time
                        eventFormData["startTime"] = moment(moment(e.data.startTime).format('YYYY-MM-DD') + " " + e.data.fromTime);
                        break
                    case "endTime": //end time
                        eventFormData["endTime"] = moment(moment(e.data.endTime).format('YYYY-MM-DD') + " " + e.data.toTime);
                        break
                    default:
                        eventFormData[e.changed.component.key] = e.changed.value;
                        break
                }
                this.setState({ eventFormData })
            }

        }
    }

    mappingEventData = (data) => {
        // data is the event list from db, we want to manipulate the list for rendering on calendar
        var eventList = [];
        eventList = data.map(e => {
            if (e.eventFormData.isRepeating) {
                var diff = moment.utc(moment(new Date(e.endDateTime), "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(e.startDateTime), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                var until = e.eventFormData.repeatEnd === "until" ? e.eventFormData.untilDate : new Date();
                var limit = e.eventFormData.repeatEnd === "for" ? e.eventFormData.limit : false;

                return printSchedules(e.cronExp, new Date(e.startDateTime), until, limit, true)
                    .map(repeatingEventStart => {
                        return {
                            title: e.title,
                            description: e.description,
                            start: moment(repeatingEventStart).format("YYYY-MM-DDTHH:mm:ss"),
                            end: moment(repeatingEventStart)
                                .add(diff.split(':')[0], 'hours')
                                .add(diff.split(':')[1], 'minutes')
                                .add(diff.split(':')[2], 'seconds').format("YYYY-MM-DDTHH:mm:ss"),
                            overlap: false,
                            rendering: 'background',
                            color: e.color,
                            id: e._id
                        }
                    })
            } else {
                return {
                    title: e.title,
                    description: e.description,
                    start: moment(new Date(e.startDateTime)).format("YYYY-MM-DDTHH:mm:ss"),
                    end: moment(new Date(e.endDateTime)).format("YYYY-MM-DDTHH:mm:ss"),
                    overlap: false,
                    rendering: 'background',
                    color: e.color,
                    id: e._id
                }
            }
        }
        );
        return eventList.flat();
    }

    onEventDrop = async (eventBj) => {
        //console.log("eventDrop:", eventBj)
        const { id: formId } = queryString.parse(this.props.location.search);
        const { events, eventsConfig } = this.state;
        const event = events.find(x => x._id == eventBj.event._def.publicId);
        let eventFormData = event.eventFormData;
        const startTime = new Date(eventBj.event.start).toISOString();
        const endTime = new Date(eventBj.event.end ? eventBj.event.end : eventBj.event.start).toISOString();
        eventFormData['startTime'] = startTime
        eventFormData['fromTime'] = moment(startTime).format('hh:mm')
        eventFormData['endTime'] = endTime
        eventFormData['toTime'] = moment(endTime).format('hh:mm')

        const reqData = {
            IsUpdateTime: true,
            _id: eventBj.event._def.publicId,
            startDateTime: startTime,
            endDateTime: endTime,
            calendarformId: formId,
            eventFormData: eventFormData,
            eventsConfig: eventsConfig

        }
        const resData = await this.props.actionCreateCalendarEvent(reqData);
        this.setState({ events: resData.result });
    }


    render() {
        const { events, eventForm, selectDate, headerToolbarRight, eventFormData } = this.state;
        try {
            return (
                <Fragment>
                    <Breadcrumbs title="Calendar view" breadcrumbItem="Calendar view" />
                    <Modal isOpen={this.state.is_open_eventform} toggle={this.onCloseEventForm} size="lg" centered>
                        <Fragment>
                            <ModalHeader toggle={this.onCloseEventForm} >
                                Calendar Event
                            </ModalHeader>
                            <ModalBody>
                                <Form
                                    form={eventForm}
                                    submission={{ data: eventFormData }}
                                    //onChange={(e) => this.onChange(e)}
                                    onSubmit={(e) => this.eventSubmit(e)}
                                />
                            </ModalBody>
                        </Fragment>
                    </Modal>

                    <div style={{ padding: "30px", backgroundColor: "#fff" }}>
                        <FullCalendar
                            plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            displayEventTime={true}
                            height="80vh"
                            headerToolbar={{
                                left: "today prev,next",
                                center: "title",
                                right: headerToolbarRight
                            }}
                            navLinks={true}
                            nowIndicator={true}
                            selectable={true}
                            editable={true}
                            droppable={true}
                            events={this.mappingEventData(events)}
                            eventDrop={this.onEventDrop}
                            // eventContent={renderEventContent}
                            drop={(date, jsEvent, ui, resourceId) => { console.log('drop function'); }}
                            eventChange={this.onEventDrop}
                            select={this.onHandleSelectDate}
                            eventClick={this.onHandleSelectEventForm}>
                        </FullCalendar>
                    </div>

                </Fragment >
            )
        } catch (err) {
            return (
                <div style={{ padding: "30px", backgroundColor: "#fff" }}>
                    <div className="alert alert-danger" role="alert">
                        {err.message}
                    </div>
                    <FullCalendar
                        plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                        initialView="dayGridMonth"
                        displayEventTime={true}
                        height="80vh"
                        headerToolbar={{
                            left: "today prev,next",
                            center: "title",
                            right: headerToolbarRight
                        }}
                        navLinks={true}
                        nowIndicator={true}
                        selectable={true}
                        editable={true}
                        droppable={true}
                        eventDrop={this.onEventDrop}
                        // eventContent={renderEventContent}
                        drop={(date, jsEvent, ui, resourceId) => { console.log('drop function'); }}
                        eventChange={this.onEventDrop}
                        select={this.onHandleSelectDate}
                        eventClick={this.onHandleSelectEventForm}>
                    </FullCalendar>
                </div>
            )
        }

    }
}

function renderEventContent(eventInfo) {
    return (
        <div>
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </div>
    )
}

//Get Props
const mapStateToProps = ({ user }) => ({
    user
});

//Dispatch Functiond
const mapDispatchToProps = (dispatch) => ({
    actionGetCalendarForm: (id) => dispatch(actionGetCalendarForm(id)),
    actionCreateCalendarEvent: (data) => dispatch(actionCreateCalendarEvent(data)),
    actionGetCalendarEvent: (id) => dispatch(actionGetCalendarEvent(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarView)