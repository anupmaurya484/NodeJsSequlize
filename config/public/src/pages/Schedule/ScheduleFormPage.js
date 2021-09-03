import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {
  TabContent,
  TabPane,
  NavLink,
  NavItem,
  Nav
} from 'reactstrap';
import classnames from "classnames";

import { Form } from 'react-formio';
import moment from 'moment';
import parser from 'cron-parser';

import ScheduleActions from './ScheduleActions';
import API from '../../config';
import auth from "../../actions/auth";
import { Toast, isEmptyString, GetTenantName, GetAppName } from '../../utils/helperFunctions';
import axios from '../../utils/axiosService';
import { cronGenerator } from '../../utils/helperFunctions';
import 'brace/mode/json';

const apiUrl = API.API_URL;

class ScheduleFormPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formShouldRefresh: false,
      formSchema: require('./ScheduleFormSchema.json'),
      scheduleId: this.props.match.params.id,
      current_step: 1,
      eventsConfig: undefined,
      title: '',
      description: '',
      jobId: undefined,
      jobKey: undefined,
      tabSelected: 1,
      schedule: {
        title: '',
        description: '',
        startDate: moment(),
        startTime: moment().hours() + ':' + moment().minutes(),
        endDate: moment(),
        endTime: moment().hours() + ':' + moment().minutes(),
        isRepeating: false,
        repeatsInterval: '',
        weekdays: {},
        days: {},
        cronExp: '* * * * *'
      },
      logs: [],
      status: 'Planned',
      submission: { data: this.schedule, isNew: true }
    }
  }

  componentDidMount = async () => {
    const { scheduleId, schedule } = this.state;
    if (scheduleId) {
      await this.loadInputData(scheduleId);
    };
    await this.updateFormSchema();
    this.setState({ formShouldRefresh: true })
  }

  async updateFormSchema() {
    var { formSchema, status } = this.state;
    try {
      const varComp = {
        "type": "var",
        "hidden": true,
        "key": "custom",
        "persistent": false,
        "tableView": false,
        "input": true,
        "label": "",
        "protected": false,
        "id": "ef2yqwq",
        "isNew": this.state.submission.isNew || status == "Planned",
        "customDefaultValue": "submission.isNew = component.isNew;"
      }

      formSchema.components.push(varComp);
      await this.setState({ formSchema });
    } catch (err) {
      console.error(err)
    }
  }

  async loadInputData(scheduleId) {
    try {
      const res = await axios.apis('GET', `/api/schedules/schedule/${scheduleId}`, auth.headers);
      this.setState({
        title: res.title,
        description: res.description,
        schedule: res.schedule,
        eventsConfig: res.eventsConfig,
        jobId: res.jobId,
        jobKey: res.jobKey,
        submission: { data: res.schedule, isNew: false },
        status: res.status,
        logs: res.logs,
        formShouldRefresh: true
      });
    } catch (err) {
      console.error(err)
    }
  }

  changeCurrentView = id => {
    if (this.state.current_step != id)
      this.setState({
        current_step: id
      })
  }

  handleAddEditSchedule = async () => {
    const { location, user } = this.props;
    const { app_id } = this.props.user
    const { schedule, scheduleId, title, description, logs, status, jobId, jobKey, eventsConfig } = this.state;
    const scheduleData = {
      appId: app_id,
      title: title,
      description: description,
      schedule: schedule,
      scheduleId: scheduleId,
      eventsConfig: eventsConfig,
      createdBy: user.User_data._id,
      modifiedBy: user.User_data._id,
      jobId: jobId,
      jobKey: jobKey,
      logs: logs,
      status: status
    }

    const jobDef = {
      data: {
        "title": title,
        "description": description,
        "scheduleId": scheduleId,
        "hostname": GetTenantName(),
        "schedule": schedule,
        "eventsConfig": eventsConfig,
        "tz": moment.tz.guess(true)
      },
      cronExp: this.state.schedule.cronExp
    }

    const postSchedule = (scheduleId, scheduleData) => {
      return new Promise((resolve, reject) => {
        try {
          const scheduleRec = axios.apis('POST', `/api/schedules/schedule` + (scheduleId ? `/${scheduleId}` : ""), scheduleData, auth.headers);
          resolve(scheduleRec)
        } catch (error) {
          reject("error", error);
        }
      })
    }

    const postScheduleJob = (jobDef) => {
      return new Promise((resolve, reject) => {
        try {
          const job = axios.apis('POST', '/api/schedules/job', jobDef, auth.headers);
          resolve(job)
        } catch (error) {
          reject("error", error);
        }
      })
    }

    if (!scheduleId) {
      console.log("save schdule, create job and update schedule..")
      try {
        const scheduleRec = await postSchedule(scheduleId, scheduleData);
        await this.loadInputData(scheduleRec._id);
        jobDef.data.scheduleId = scheduleRec._id;
        const job = await postScheduleJob(jobDef);
        scheduleData.jobId = job.id;
        scheduleData.jobKey = job.id.match(/\:(.*?)\:/)[1];
        scheduleData.status = "Scheduled";
        console.log(job)
        await postSchedule(scheduleRec._id, scheduleData);
      } catch (error) {
        console.log("error", error);
        return;
      }
      this.props.history.push(GetAppName(this.props.user) + '/schedules')
    } else if (status === "Planned") {
      console.log("create job and update schedule...")
      try {
        jobDef.data.scheduleId = scheduleId;
        const job = await postScheduleJob(jobDef);
        scheduleData.jobId = job.id;
        scheduleData.jobKey = job.id.match(/\:(.*?)\:/)[1];
        scheduleData.status = "Scheduled";
        await postSchedule(scheduleId, scheduleData);
      } catch (error) {
        console.log("error", error);
        return;
      }
      this.props.history.push(GetAppName(this.props.user) + '/schedules')
    } else {
      console.log("update schedule...")
      try {
        await postSchedule(scheduleId, scheduleData);
      } catch (error) {
        console.log("error", error);
        return;
      }
      Toast("Schedule updated..");
    }

  }

  onChange = (e) => {
    var { schedule, title, description, submission } = this.state;
    console.log(e)
    if (e.changed) {
      console.log("field:", e.changed.component.key)
      switch (e.changed.component.key) {
        case "title":
          title = e.changed.value;
          schedule[e.changed.component.key] = e.changed.value;
          break
        case "description":
          description = e.changed.value;
          schedule[e.changed.component.key] = e.changed.value;
          break
        case "startTime":
          schedule["startDate"] = moment(moment(e.data.startDate).format('YYYY-MM-DD') + " " + e.data.startTime);
          schedule["startTime"] = e.data.startTime;
          break
        case "endTime":
          schedule["endDate"] = moment(moment(e.data.endDate).format('YYYY-MM-DD') + " " + e.data.endTime);
          schedule["endTime"] = e.data.endTime;
          break
        case "startDate":
          schedule["startDate"] = moment(moment(e.data.startDate).format('YYYY-MM-DD') + " " + e.data.startTime);
          //schedule["startTime"] = e.data.startTime;
          break
        case "endDate":
          schedule["endDate"] = moment(moment(e.data.endDate).format('YYYY-MM-DD') + " " + e.data.endTime);
          //schedule["endTime"] = e.data.endTime;
          break
        case "isRepeating":
          schedule["isRepeating"] = e.data.isRepeating;
          schedule["repeatsInterval"] = e.data.repeatsInterval === "" ? "hourly" : e.data.repeatsInterval;
          break
        default:
          schedule[e.changed.component.key] = e.changed.value;
          //schedule["startDate"] = e.data.startDate;
          //schedule["endDate"] = e.data.endDate;
          //schedule["startTime"] = e.data.startTime;
          //schedule["endTime"] = e.data.endTime;
          break
      }
      schedule.cronExp = cronGenerator(schedule.repeatsInterval, schedule.startTime, schedule.days, undefined, schedule.weekdays);
      submission.data = schedule;
      this.setState({ schedule, title, description, cronExp: schedule.cronExp, submission });
    }
  }

  onCustomEvent = (cusEvent) => {
    var { schedule } = this.state;
    if (cusEvent.type === "clickClear") {
      this.setState({ formShouldRefresh: false })
      console.log(cusEvent.type);
      schedule.endDate = ""
      schedule.endTime = ""
      this.setState({ schedule, formShouldRefresh: true })
    }
  }

  printSchedules = () => {
    const { schedule, logs } = this.state;
    const scheduleArray = [];
    //const scheduleStart = moment(moment(schedule.startDate).format('YYYY-MM-DD')+" "+schedule.startTime);
    //const scheduleEnd = moment(moment(schedule.endtDate).format('YYYY-MM-DD')+" "+schedule.endTime);
    const scheduleStart = schedule.startDate;
    const scheduleEnd = schedule.endDate;
    const start = logs.length > 0 ? logs[logs.length - 1].started : undefined;
    var options = {
      currentDate: start ? start : moment(scheduleStart).subtract(1, 'seconds'),
      endDate: schedule.isRepeating ? scheduleEnd : scheduleStart,
      iterator: true
    };
    //try {
    var interval = parser.parseExpression(schedule.cronExp, options);
    var count = 0;

    while (true && count <= 25) {
      try {
        count++
        var obj = interval.next();
        console.log("obj:", obj, obj.done)
        scheduleArray.push(obj.value.toString());
      } catch (e) {
        console.log("e:", e)
        break;
      }
    }

    return (scheduleArray)
    //} catch (err) {
    //    console.log('Error1: ' + err.message);
    //    return (undefined)
    // }
  }

  SaveEventActions = (eventCfg) => {
    let { eventsConfig } = this.state;
    eventsConfig = eventCfg;
    this.setState({ eventsConfig });
  }

  render() {
    const { current_step, schedule, eventsConfig, scheduleId, submission, jobKey, logs, formShouldRefresh, formSchema } = this.state;
    const { location, user } = this.props;
    console.log(submission)

    return (
      <Fragment>
        <div tabs className='topnav nav-tabs nav-justified' style={{ "marginTop": "-29px" }} >
          <div className='container-fluid d-flex'>
            <Nav className="">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 1 })}
                  onClick={() => { this.changeCurrentView(1) }}
                >
                  <span>Settings</span>
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 2 })}
                  onClick={() => { this.changeCurrentView(2) }}>
                  <span>Actions</span>
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 3 })}
                  onClick={() => { this.changeCurrentView(3) }}>
                  <span>Logs</span>
                </NavLink>
              </NavItem>
            </Nav>


            <div className="d-flex justify-content-end" style={{ "right": "25px", "position": "absolute", paddingTop: "2px" }}>
              <div className="p-2">
                <Link to={"/design" + GetAppName(this.props.user) + "/schedules"}>
                  <button className="btn btn-sm btn-primary">Exit</button>
                </Link>
              </div>
              <div className="p-2">
                <button className="btn btn-sm btn-primary" onClick={this.handleAddEditSchedule}>{scheduleId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>

        <TabContent activeTab={current_step}>
          <br /><br />
          {current_step == 1 && formShouldRefresh &&
            <TabPane tabId={1}>
              <Form
                form={formSchema}
                submission={submission}
                onChange={(e) => { submission.isNew ? this.onChange(e) : {} }}
              />
            </TabPane>
          }

          {current_step == 2 &&
            <TabPane tabId={2}>
              <ScheduleActions
                user={user}
                submission={submission}
                eventsConfig={eventsConfig}
                SaveEventActions={(e, i) => this.SaveEventActions(e, i)}
              />
            </TabPane>
          }

          {current_step == 3 &&
            <TabPane tabId={3}>
              <Fragment>
                <Row>
                  <Col md="6">
                    <h2>Logs and projection </h2>
                    <p>Actual triggers and up coming schedules</p>
                  </Col>
                  <Col md="6">
                    ({jobKey})
                  </Col>
                </Row>
                <table className="table table-dark table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Schedules</th>
                      <th>Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) =>
                      <tr id={idx}>
                        <td>
                          {(idx + 1)}
                        </td>
                        <td>
                          {log.started ? moment(log.started).format("MMM Do YYYY, h:mm a") : ""}
                        </td>
                        <td>{log.detail}</td>
                        <td>Triggered</td>
                      </tr>
                    )}
                    {this.printSchedules().map((log, i) =>
                      <tr id={logs.length + i}>
                        <td>
                          {(logs.length + i + 1)}
                        </td>
                        <td>{log}</td>
                        <td>
                          pending activities
                        </td>
                        <td>Scheduled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Fragment>
            </TabPane>
          }
        </TabContent>
        {/* <div className='panel'>
          <div className='panel-heading collection-header'>
            <div className='link-block'>
              <span className={current_step == 1 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(1)}>Settings</span>
              <span className={current_step == 2 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(2)}>Actions</span>
              <span className={current_step == 3 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(3)}>Logs</span>
            </div>
            <div className="d-flex justify-content-end" style={{ "right": "25px", "position": "absolute", paddingTop: "2px"  }}>
              <div className="p-2">
                <Link to={GetAppName(this.props.user) + "/schedules"}>
                  <button className="btn btn-sm btn-primary">Exit</button>
                </Link>
              </div>
              <div className="p-2">
                <button className="btn btn-sm btn-primary" onClick={this.handleAddEditSchedule}>{scheduleId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
          <div className='panel-block bg-white p-3'>
            {current_step == 1 && formShouldRefresh &&
              <Fragment>
                <Form
                  form={formSchema}
                  submission={submission}
                  onChange={(e) => { submission.isNew ? this.onChange(e) : {} }}
                />
              </Fragment>
            }
            {current_step == 2 &&
              <ScheduleActions
                user={user}
                submission={submission}
                eventsConfig={eventsConfig}
                SaveEventActions={(e, i) => this.SaveEventActions(e, i)}
              />
            }
            {current_step == 3 &&
              <Fragment>
                <Row>
                  <Col md="6">
                    <h2>Logs and projection </h2>
                    <p>Actual triggers and up coming schedules</p>
                  </Col>
                  <Col md="6">
                    ({jobKey})
                  </Col>
                </Row>
                <table className="table table-dark table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Schedules</th>
                      <th>Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) =>
                      <tr id={idx}>
                        <td>
                          {(idx + 1)}
                        </td>
                        <td>
                          {log.started ? moment(log.started).format("MMM Do YYYY, h:mm a") : ""}
                        </td>
                        <td>{log.detail}</td>
                        <td>Triggered</td>
                      </tr>
                    )}
                    {this.printSchedules().map((log, i) =>
                      <tr id={logs.length + i}>
                        <td>
                          {(logs.length + i + 1)}
                        </td>
                        <td>{log}</td>
                        <td>
                          pending activities
                        </td>
                        <td>Scheduled</td>
                      </tr>
                    )}
                  </tbody>
                </table>


              </Fragment>
            }
          </div>
        </div> */}
      </Fragment>
    )
  }

}

const mapStateToProps = ({ user }) => ({
  user
})

const mapDispatchToProps = (dispatch) => ({
  //
})

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleFormPage)