//Import Packages
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Card, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledDropdown } from "reactstrap";
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

//Import Components
import CardLists from '../../../components/CardLists';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DataTable from "../../../components/DataTable";
import CustomToggle from '../../../components/CustomToggle';
// import CloudDropdown from '../../Connection/CloudDropdown';


//Function 
import { GetAppName, AppDesign } from '../../../utils/helperFunctions';
import { actionGetCalendarViewLists } from '../../../actions/calendar';
import calendarImage from '../../../assets/images/Schedule_girl.svg';


import './CalendarLists.css';


//Define Class
class CalendarLists extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calendarLists: [],
            display_layout: 1
        }
    }

    componentDidMount() {
        this.loadCalendarList();
    }

    loadCalendarList = async (option) => {
        try {
            const { app_id, User_data } = this.props.user;
            const option_payload = option ? option : { search: "" }
            await this.props.actionGetCalendarViewLists({ "appId": this.props.user.app_id, ...option_payload });
            const calendarLists = this.props.calendar ? this.props.calendar.CalendarViewLists : [];
            this.setState({ calendarLists: calendarLists });
        } catch (err) {
            console.log(err.message);
        }
    }

    getTableRows = () => {
        const that = this;
        const { calendarLists } = this.state;
        var rootPath = GetAppName(this.props.user);
        let rows = calendarLists && calendarLists.map((calendar, i) => ({
            name: calendar.calendarName,
            description: calendar.calendarDescription,
            date: calendar.createdTime,
            action: <div style={{ "width": "70px", "display": "flex" }}>
                <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
                    <DropdownToggle tag={CustomToggle} />
                    <DropdownMenu size="sm" title="" right flip>
                        <DropdownItem className="d-flex" onClick={() => that.props.history.push(rootPath + calendar.urlCollection + `&name=${calendar.name}`)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Open">visibility</i>open</span></DropdownItem>
                        {AppDesign() && <DropdownItem className="d-flex" onClick={() => that.props.history.push((calendar.urlDesigner) ? rootPath + calendar.urlDesigner : null)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>}
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        }));
        return rows
    }

    doSearch(evt) {
        const that = this;
        var searchText = evt.target.value; // this is the search text
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            that.loadCalendarList({ search: searchText })
        }, 300);
    }
    render() {

        const { calendarLists, display_layout, filterType } = this.state;
        const { User_data, app_id } = this.props.user
        if (!calendarLists && !User_data && !app_id) return false;
        var rootPath = GetAppName(this.props.user);
        //const calendarLists = this.props.calendar ? this.props.calendar.CalendarViewLists : []

        const data = {
            columns: [
                {
                    label: <FormattedMessage id="page.names" />,
                    field: 'name',
                },
                {
                    label: <FormattedMessage id="page.description" />,
                    field: 'description',
                },
                {
                    label: <FormattedMessage id="page.created_date_time" />,
                    field: 'date',
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'disabled'
                }
            ],
            rows: this.getTableRows(),
        }


        return (
            <Fragment className="Calendar-container">

                <Breadcrumbs title="Calendar" breadcrumbItem="Dashboard" />
                <Row className="page-header">
                    <Col col="6">
                        <div className='page-heading-title'>
                            <h3><b>Calendar List</b></h3>
                        </div>
                    </Col>
                    <Col col="6">
                        <div className="d-flex align-items-center justify-content-end">
                            <div className="search-box">
                                <div className="position-relative">
                                    <input onChange={(e) => this.doSearch(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="page-title-right d-flex ">

                                <div className="pt-1">
                                    <i onClick={() => this.setState({ display_layout: 2 })} className="fa fa-align-justify table-type pointer" aria-hidden="true" style={{ "margin": "0px 10px 0px 10px" }}></i>
                                    <i onClick={() => this.setState({ display_layout: 1 })} className="fa fa-th-large table-type pointer" aria-hidden="true"></i>
                                </div>

                                {AppDesign() &&
                                    <Link to={"/design" + rootPath + "/create-calendar?id=new"}>
                                        <Button className="btn-default mr-1" size="sm">ADD Calendar</Button>
                                    </Link>
                                }

                            </div>
                        </div>
                    </Col>
                </Row>


                {(display_layout == 1 && calendarLists.length != 0) &&
                    <div style={{ marginBottom: '20px' }}>
                        <Row>
                            {
                                calendarLists.map((item, i) => (
                                    <Col style={{ marginTop: '10px' }} md='2' key={i}>
                                        <CardLists
                                            key={i}
                                            title={item.calendarName}
                                            description={item.calendarDescription}
                                            button1Text='Open'
                                            button1Url={rootPath + '/calendar-view?id=' + item._id}
                                            button2Text='Edit'
                                            button2Url={rootPath + "/create-calendar?id=" + item._id} />
                                    </Col>
                                ))
                            }
                        </Row>
                    </div>
                }

                {(display_layout == 2 && calendarLists.length != 0) &&
                    <div style={{ marginBottom: '20px' }}>
                        <Row>
                            <Col className="mt-1">
                                <Card>
                                    <DataTable
                                        isPagination={false}
                                        isSearch={false}
                                        totalPage={25}
                                        correntPage={1}
                                        data={data}
                                        onClicks={(e) => console.log(e)} />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                }

                {calendarLists && !calendarLists.length &&
                    <div className='h-100 container-fluid'>
                        <div className='row h-100 justify-content-center full-height'>
                            <div className='col-12 h-100 align-self-center text-center'>
                                <img src={calendarImage} className="figure-img img-fluid" style={{ height: "200px" }} />
                                <p>List of Calendars for events tracking</p>
                            </div>
                        </div>
                    </div>
                }
            </Fragment>
        )
    }
}

//Get Props
const mapStateToProps = ({ user, calendar }) => ({
    user,
    calendar
});

//Dispatch Functiond
const mapDispatchToProps = (dispatch) => ({
    actionGetCalendarViewLists: (data) => dispatch(actionGetCalendarViewLists(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarLists)