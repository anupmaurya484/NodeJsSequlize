import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Form } from 'react-formio';
import {
    EdgeHeader,
    TabContent,
    TabPane,
    Col,
    Row,
    CardBody,
    Card,
    CardHeader,
    CardTitle,
    CardText,
    Container,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import classnames from 'classnames';
import queryString from 'query-string';
import docimg from '../../assets/images/notes.jpg';
import calendar from '../../assets/images/schedule.jpg';
import flowchart from '../../assets/images/workflow.jpg';
import webpage from '../../assets/images/typing.jpg';
import folder from '../../assets/images/folder.jpg';
import schedule from '../../assets/images/calendar.jpg'

import axios from '../../utils/axiosService';
import { Toast, GetAppName, AppDesign } from '../../utils/helperFunctions';
import 'react-alice-carousel/lib/alice-carousel.css';
import { ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CollectionCarousel from "./components/CollectionCarousel";
import FolderCarousel from "./components/FolderCarousel";
import CalendarCarousel from "./components/CalendarCarousel";
import Me from './components/Me';
import MyTasks from '../../components/MyTasks';
import Contacts from '../../components/Contacts';
import { FormattedMessage } from 'react-intl';
import ViewPage from '../PageLayout/ViewPage'
import './HomePage.css';

class HomePage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: [
                { name: 'Collections', quantity: 0, document: 0 },
                { name: 'Folders', quantity: 0, document: 0 },
                { name: 'Calendars', quantity: 0, document: 0 },
                { name: 'Workflows', quantity: 0, document: 0 },
                { name: 'Schedules', quantity: 0, document: 0 },
                { name: 'Pages', quantity: 0, document: 0 },
            ],
            activeTab: 'collections',
            custome_home_page: null,
            pageLayoutId: null,
            is_load: true
        }
    }

    componentDidMount = () => {
        const queryStringData = queryString.parse(location.search);
        if ((queryStringData["page-layout-id"])) {
            this.setState({ custome_home_page: true, pageLayoutId: queryStringData["page-layout-id"], is_load: false });
        } else {
            this.setState({ is_load: false });
            this.getStatistic();
        }
    }

    getStatistic = async () => {
        const { app_id, User_data } = this.props.user
        try {

            //http://localhost:3003/design/Hoststart

            if (!AppDesign()) {
                //Get Default Page
                const response_app = await axios.apis('GET', '/api/GetDefaultUrl?app_id=' + app_id)
                if (response_app.status) {
                    if (response_app.app_data && response_app.app_data.is_url_page && response_app.app_data.default_path != "") {
                        window.location.href = response_app.app_data.default_path;
                    }
                }
            }
            
            this.setState({ is_load: false });

            //Get Usage State
            const response = await axios.apis('GET', '/api/GetUsageStats');
            if (response.status) {
                this.setState({ data: response.data });
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    scrollToTop = () => window.scrollTo(0, 0);

    //custom Home
    CustomHomeComponent = () => (
        // <div className='p-1 bg-white' style={{ "margin": "-12px" }}>
            <ViewPage formId={this.state.pageLayoutId} />
        // </div>
    )

    render() {
        const { data, custome_home_page, is_load, activeTab } = this.state;

        if (is_load) {
            return false;
        }

        return (
            < Fragment >

                {/* //Load custom Home page from page layout  */}
                {custome_home_page && this.CustomHomeComponent()}

                {/* //Default Home page  */}
                {!custome_home_page &&
                    < Fragment >
                        <Container className='mt-3 mb-5' style={{ maxWidth: '1440px' }}>
                            <Row>
                                <Col md='9' className='mt-0'>
                                    <Card className='mb-4'>
                                        <CardHeader className='text-center pt-3'>
                                            <h2 className='h2-responsive mb-3'>
                                                <strong className='font-weight-bold'>
                                                    <FormattedMessage id="homepage.glozic_application_dashboard" />
                                                </strong>
                                            </h2>
                                            <p><FormattedMessage id="homepage.statistics_and_quick_access" /></p>
                                        </CardHeader>
                                        <CardBody>
                                            <div style={{ width: '100%', height: 200 }}>
                                                {data && <ResponsiveContainer>
                                                    <ComposedChart
                                                        width={500}
                                                        height={300}
                                                        data={data}
                                                        margin={{
                                                            top: 20, right: 20, bottom: 20, left: 20,
                                                        }}
                                                    >
                                                        <CartesianGrid stroke="#f5f5f5" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Area type="monotone" dataKey="document" fill="#8884d8" stroke="#8884d8" />
                                                        <Bar dataKey="quantity" barSize={60} fill="#413ea0" />
                                                        {false && <Line type="monotone" dataKey="activity" stroke="#ff7300" />}
                                                    </ComposedChart>
                                                </ResponsiveContainer>}
                                            </div>
                                            <hr />
                                            <div className="App">
                                                <Nav tabs fill id="uncontrolled-tab-example">
                                                    <NavItem>
                                                        <NavLink
                                                            className={classnames({ active: activeTab === 'collections' })}
                                                            onClick={() => this.setState({ activeTab: 'collections' })}>
                                                            <FormattedMessage id="homepage.collections" />
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem>
                                                        <NavLink className={classnames({ active: activeTab === 'folders' })}
                                                            onClick={() => this.setState({ activeTab: 'folders' })}>
                                                            <FormattedMessage id="homepage.folders" />
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem>
                                                        <NavLink className={classnames({ active: activeTab === 'calendars' })}
                                                            onClick={() => this.setState({ activeTab: 'calendars' })}>
                                                            <FormattedMessage id="homepage.calendars" />
                                                        </NavLink>
                                                    </NavItem>
                                                </Nav>
                                                <br />
                                                {(activeTab === 'collections') &&
                                                    <CollectionCarousel />
                                                }
                                                {(activeTab === 'folders') &&
                                                    <FolderCarousel />
                                                }
                                                {(activeTab === 'calendars') &&
                                                    <CalendarCarousel />
                                                }
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card>
                                        <CardBody>
                                            <Row>
                                                <Col md='12' className='mt-4'>
                                                    <Row id='categories'>
                                                        <Col md='4'>
                                                            <div type='fadeInLeft'>
                                                                <Card className='my-3 grey lighten-4'>
                                                                    <img className='img-fluid' src={docimg} />
                                                                    <CardBody className='text-center'>
                                                                        <CardTitle>
                                                                            <i className='pink-text pr-2 fa fa-css3' />
                                                                            <strong><FormattedMessage id="homepage.collection" /></strong>
                                                                        </CardTitle>
                                                                        <CardText>
                                                                            <FormattedMessage id="homepage.collections_of_documents" />
                                                                        </CardText>
                                                                        <NavLink
                                                                            tag='button'
                                                                            className='btn btn-outline--color btn-sm btn-rounded d-inline'
                                                                            onClick={() => { this.scrollToTop(), this.props.history.push(`${GetAppName(this.props.user)}/collection-list`) }} >
                                                                            <FormattedMessage id="homepage.more" />
                                                                        </NavLink>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        </Col>
                                                        <Col md='4'>
                                                            <div type='fadeInDown'>
                                                                <Card className='my-3 grey lighten-4'>
                                                                    <img

                                                                        className='img-fluid'
                                                                        src={folder}
                                                                    />
                                                                    <CardBody className='text-center'>
                                                                        <CardTitle>
                                                                            <i className='blue-text pr-2 fa fa-cubes' />
                                                                            <strong><FormattedMessage id="homepage.file_folders" /></strong>
                                                                        </CardTitle>
                                                                        <CardText>
                                                                            <FormattedMessage id="homepage.file_folders_are_containers" />
                                                                        </CardText>
                                                                        <NavLink
                                                                            tag='button'
                                                                            className='btn btn-outline--color btn-sm btn-rounded d-inline'
                                                                            onClick={() => { this.scrollToTop(), this.props.history.push(`${GetAppName(this.props.user)}/containers`) }}>
                                                                            <FormattedMessage id="homepage.more" />
                                                                        </NavLink>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        </Col>
                                                        <Col md='4'>
                                                            <div type='fadeInRight'>
                                                                <Card className='my-3 grey lighten-4'>
                                                                    <img

                                                                        className='img-fluid'
                                                                        src={calendar}
                                                                    />
                                                                    <CardBody className='text-center'>
                                                                        <CardTitle>
                                                                            <i className='green-text pr-2 fa fa-code' />
                                                                            <strong><FormattedMessage id="homepage.calendar" /></strong>
                                                                        </CardTitle>
                                                                        <CardText>
                                                                            <FormattedMessage id="homepage.built_in_calendars" />

                                                                        </CardText>

                                                                        <NavLink
                                                                            tag='button'
                                                                            className='btn btn-outline--color btn-sm btn-rounded d-inline'
                                                                            onClick={() => { this.scrollToTop(), this.props.history.push(`${GetAppName(this.props.user)}/calendar-list`) }}>
                                                                            <FormattedMessage id="homepage.more" />
                                                                        </NavLink>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    <Row id='categories'>
                                                        <Col md='4'>
                                                            <div type='fadeInLeft'>
                                                                <Card className='my-3 grey lighten-4'>
                                                                    <img className='img-fluid' src={flowchart} />
                                                                    <CardBody className='text-center'>
                                                                        <CardTitle>
                                                                            <i className='pink-text pr-2 fa fa-bars' />
                                                                            <strong><FormattedMessage id="homepage.workflows" /></strong>
                                                                        </CardTitle>
                                                                        <CardText>
                                                                            <FormattedMessage id="homepage.drag_and_drop" />
                                                                        </CardText>

                                                                        <NavLink
                                                                            tag='button'
                                                                            className='btn btn-outline--color btn-sm btn-rounded d-inline'
                                                                            onClick={() => { this.scrollToTop(), this.props.history.push(`${GetAppName(this.props.user)}/workflow`) }}>
                                                                            <FormattedMessage id="homepage.more" />
                                                                        </NavLink>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        </Col>
                                                        <Col md='4'>
                                                            <div type='fadeInUp'>
                                                                <Card className='my-3 grey lighten-4'>
                                                                    <img

                                                                        className='img-fluid'
                                                                        src={schedule}
                                                                    />
                                                                    <CardBody className='text-center'>
                                                                        <CardTitle>
                                                                            <i className='blue-text pr-2 fa fa-arrows-alt'
                                                                            />
                                                                            <strong><FormattedMessage id="homepage.scheduals" /></strong>
                                                                        </CardTitle>
                                                                        <CardText>
                                                                            <FormattedMessage id="homepage.creating_schedules" />

                                                                        </CardText>

                                                                        <NavLink
                                                                            tag='button'
                                                                            className='btn btn-outline--color btn-sm btn-rounded d-inline'
                                                                            onClick={() => { this.scrollToTop(), this.props.history.push(`${GetAppName(this.props.user)}/schedules`) }}>
                                                                            <FormattedMessage id="homepage.more" />
                                                                        </NavLink>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        </Col>
                                                        <Col md='4'>
                                                            <div type='fadeInRight'>
                                                                <Card className='my-3 grey lighten-4'>
                                                                    <img

                                                                        className='img-fluid'
                                                                        src={webpage}
                                                                    />
                                                                    <CardBody className='text-center'>
                                                                        <CardTitle>
                                                                            <i className='green-text pr-2 fa fa-table' />
                                                                            <strong><FormattedMessage id="homepage.pages" /></strong>
                                                                        </CardTitle>
                                                                        <CardText>
                                                                            <FormattedMessage id="homepage.custom_pages_for_content" />
                                                                        </CardText>
                                                                        <NavLink
                                                                            tag='button'
                                                                            className='btn btn-outline--color btn-sm btn-rounded d-inline'
                                                                            onClick={() => { this.scrollToTop(), this.props.history.push(`${GetAppName(this.props.user)}/page-list`) }}>
                                                                            <FormattedMessage id="homepage.more" />
                                                                        </NavLink>
                                                                    </CardBody>
                                                                </Card>
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col md='3' className='mt-0'>
                                    <Card className='mb-4'>
                                        <CardBody>
                                            <Me />
                                        </CardBody>
                                    </Card>
                                    <Card className='mb-4'>
                                        <CardHeader className='text-center py-3'>
                                            <strong className='font-weight-bold'>
                                                <FormattedMessage id="homepage.my_tasks" />
                                            </strong>
                                        </CardHeader>
                                        <CardBody>
                                            <MyTasks view='list' />
                                        </CardBody>
                                    </Card>
                                    <Card className='mb-4'>
                                        <CardHeader className='text-center py-3'>
                                            <strong className='font-weight-bold'>
                                                <FormattedMessage id="homepage.contacts" />
                                            </strong>
                                        </CardHeader>
                                        <CardBody>
                                            <Contacts view='list' />
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </Fragment >
                }
            </Fragment>
        )


    }
}

//Get Props
const mapStateToProps = ({ user }) => ({
    user,
});

export default connect(mapStateToProps, null)(HomePage);