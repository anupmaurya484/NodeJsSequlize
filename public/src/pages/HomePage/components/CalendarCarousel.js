import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import CardLists from '../../../components/CardLists';
import { GetAppName } from '../../../utils/helperFunctions';
import AliceCarousel from 'react-alice-carousel';
import { actionGetCalendarViewLists } from '../../../actions/calendar';
import 'react-alice-carousel/lib/alice-carousel.css';
import '../HomePage.css';
import calendarImage from '../../../assets/images/Schedule_girl.svg';

const handleDragStart = (e) => e.preventDefault();

const responsive = {
    0: { items: 1 },
    568: { items: 2 },
    1024: { items: 3 },
}

class CalendarCarousel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        this.props.actionGetCalendarViewLists({ "appId": this.props.user.app_id })
    }

    render() {
        const calendarLists = this.props.calendar ? this.props.calendar.CalendarViewLists : []
        var rootPath = GetAppName(this.props.user);

        return (
            <Fragment>
                { calendarLists && !calendarLists.length &&
                <div className='row justify-content-center'>
                    <div className='col-4 align-self-center text-right'>
                    <img src={calendarImage} className="figure-img img-fluid" style={{ height: "100px" }}/>
                    </div>
                    <div className='col-4 align-self-end text-left'>
                    <p>List of Calendars for events tracking</p>
                    </div>
                </div>
                }
                <AliceCarousel
                    autoPlay
                    autoPlayStrategy="none"
                    autoPlayInterval={1000}
                    mouseTracking
                    items={calendarLists.map((item, i) => (
                            <CardLists
                                key={i}
                                style={{"width" : "280px" }}
                                title={item.calendarName}
                                description={item.calendarDescription}
                                button1Text='Open'
                                button1Url={rootPath + '/calendar-view?id=' + item._id}
                                button2Text='Edit'
                                button2Url={rootPath + "/create-calendar?id=" + item._id} />
                    ))}
                    disableDotsControls={false}
                    disableButtonsControls={true}
                    responsive={responsive} />
            </Fragment>
        )
    }
}

const mapStateToProps = ({ user, calendar }) => {
    return { user, calendar }
}

const mapDispatchToProps = (dispatch) => ({
    actionGetCalendarViewLists: (data) => dispatch(actionGetCalendarViewLists(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(CalendarCarousel);