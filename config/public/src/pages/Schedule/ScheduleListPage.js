import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axiosService from '../../utils/axiosService';
import { Link } from 'react-router-dom';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
    UncontrolledDropdown,
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Modal,
    ModalBody,
    ModalHeader
} from 'reactstrap';
import API from '../../config';
import CustomToggle from '../../components/CustomToggle';
import { GetAppName, AppDesign } from '../../utils/helperFunctions';
import ScheduleFormModal from './ScheduleFormModal';
import DataTable from "../../components/DataTable";
// import CloudDropdown from '../../pages/Connection/CloudDropdown';
import docImage from '../../assets/images/Documents_illustrator.svg';
import moment from 'moment';

const apiUrl = API.API_URL;

class ScheduleListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scheduleId: '',
            schedules: [],
            createModal: false,
            title: ""
        };
        this.createSchedule = this.createSchedule.bind(this);
        this.getScheduleList = this.getScheduleList.bind(this);
        this.toggle = this.toggle.bind(this);
    }


    getScheduleList(option) {
        const option_payload = option ? option : { search: "" };
        axiosService.apis('POST', '/api/schedules', option_payload)
            .then(response => {
                let schedules = response;
                this.setState({ schedules });
            }).catch(error => {
                console.log(error)
            });
    }

    createSchedule(e) {
        console.log(e)
        let that = this;
        let target = e.target;
        let postData = {
            title: target.title.value,
            description: target.content.value,
            scheduleId: target.connectionId.value
        };

        axiosService.apis("POST", '/api/schedule', postData)
            .then(function (response) {
                let data = {

                    //createdBy: this.props.user.User_data._id
                }
                console.log("response:", response);
            })
            .catch(function (error) {
                console.log(error)
            });
    };

    componentDidMount() {
        this.getScheduleList();
    }

    toggle = modelName => () => {
        this.setState({
            [modelName]: !this.state[modelName]
        });
    };

    getTableRows = () => {
        const that = this;
        const { schedules } = this.state;
        var rootPath = GetAppName(this.props.user);

        let rows = schedules && schedules.map((schedule, i) => ({
            title: schedule.title,
            description: schedule.description,
            type: schedule.schedule.repeatsInterval === "" ? "once" : schedule.schedule.repeatsInterval,
            created: moment(schedule.created).format("MMM Do YYYY, h:mm a"),
            starts: moment(schedule.schedule.startDate).format("MMM Do YYYY, h:mm a"),
            ends: moment(schedule.schedule.startDate).format("MMM Do YYYY, h:mm a"),
            status: schedule.status,
            action: <div style={{ "width": "70px", "display": "flex" }}>
                <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
                    <DropdownToggle tag={CustomToggle} />
                    <DropdownMenu size="sm" title="" right flip>
                        <DropdownItem className="d-flex" onClick={() => that.props.history.push(AppDesign('path') + rootPath + "/schedule/" + schedule._id)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Open">visibility</i>open</span></DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        }));

        return rows
    }

    handleTypeChange = async (value) => {
        await this.setState({ filterType: value });
        this.getScheduleList()
    }

    doSearch(evt) {
        const that = this;
        var searchText = evt.target.value; // this is the search text
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            that.getScheduleList({ search: searchText })
        }, 300);
    }

    render() {
        const { createModal, schedules, filterType } = this.state;
        const { User_data, app_id } = this.props.user
        var rootPath = GetAppName(this.props.user);

        const data = {
            columns: [
                {
                    label: 'Title',
                    field: 'title',
                },
                {
                    label: 'Decription',
                    field: 'decription',
                },
                {
                    label: 'Type',
                    field: 'type',
                },
                {
                    label: 'Created',
                    field: 'created',
                },
                {
                    label: 'Starts',
                    field: 'starts',
                },
                {
                    label: 'Ends',
                    field: 'ends',
                },
                {
                    label: 'Status',
                    field: 'status',
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
            <Fragment>
                {/* <Breadcrumbs title="Schedule" breadcrumbItem="Dashboard" /> */}

                <Row className="page-header">
                    <Col col='6'>
                        <div className='page-heading-title'>
                            <h3><b>Schedule List</b></h3>
                        </div>
                    </Col>
                    <Col col='6'>
                        <div className="d-flex align-items-center justify-content-end">
                            <div className="search-box mr-2">
                                <div className="position-relative">
                                    <input onChange={(e) => this.doSearch(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                </div>
                            </div>
                            {/* <CloudDropdown handleTypeChange={this.handleTypeChange} filterType={filterType} /> */}
                            <div className="page-title-right d-flex ">
                                <div className="pt-1">
                                    {/* <i onClick={() => this.setState({ display_layout: 2 })} className="fa fa-align-justify table-type pointer" aria-hidden="true" style={{ "margin": "0px 10px 0px 10px" }}></i>
                                    <i onClick={() => this.setState({ display_layout: 1 })} className="fa fa-th-large table-type pointer" aria-hidden="true"></i> */}
                                </div>
                                {AppDesign() &&
                                    <Link to={"/design" + rootPath + "/schedule"}>
                                        <Button className="btn-default mr-1" size="sm">Add Schedule</Button>
                                    </Link>
                                }
                            </div>
                        </div>
                    </Col>
                </Row>


                {(schedules && schedules.length != 0) &&
                    <div style={{ marginBottom: '20px' }}>
                        <Row>
                            <Col className="mt-3">
                                <Card>
                                    <DataTable
                                        isPagination={false}
                                        isSearch={false}
                                        totalPage={25}
                                        correntPage={1}
                                        data={data} />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                }

                {(schedules && schedules.length == 0) &&
                    <div className='h-100 container-fluid'>
                        <div className='row h-100 justify-content-center full-height'>
                            <div className='col-12 h-100 align-self-center text-center'>
                                <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
                                <p>List of Schedule to store documents</p>
                            </div>
                        </div>
                    </div>
                }

                <Modal isOpen={createModal} toggle={this.toggle('createModal')} size="lg" centered>
                    <ModalHeader
                        toggle={this.toggle('createModal')}
                    >
                        New Schedule
                        </ModalHeader>
                    <ModalBody>
                        <ScheduleFormModal
                            scheduleSubmit={(e) => this.createSchedule(e)} />
                    </ModalBody>
                </Modal>
            </Fragment>

        );
    }
}

const mapStateToProps = ({ user }) => ({
    user
})

export default connect(mapStateToProps, null)(ScheduleListPage)
