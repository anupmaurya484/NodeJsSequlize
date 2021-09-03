import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axios from '../../utils/axiosService';
import { Link } from 'react-router-dom'
import {
  Button, Breadcrumb, BreadcrumbItem, Input, Col, Row,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'react';
import queryString from 'query-string';
import API from '../../config';
import auth from "../../actions/auth";
import { Toast, isEmptyString, getHostInfo, GetAppName } from '../../utils/helperFunctions';
import { FormattedMessage } from 'react-intl';

const apiUrl = API.API_URL;

class SubscriptionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        subscriptionId : this.props.match.params.subscriptionId,
        current_step: 1,
        tabSelected: 1,
        eventsConfig: undefined,
        event: {
          _id: '',
          eventName:'',
          eventDesc:''
        }
      }
  }

  componentWillMount() {
    const { id: eventId } = queryString.parse(this.props.location.search);
    if (eventId != 'new') {
      
    }
  }

  handleInputChange = (inputType, { target }) => {
    const { event } = this.state
    if (inputType == 'eventName') {
      event.eventName = target.value
      this.setState({ hasEventFieldsChanged: true, event: event })
    } else if (inputType == "eventDesc") {
      event.eventDesc = target.value
      this.setState({ event: event })
    }
  }

  changeCurrentView = id => {
    if (this.state.current_step != id)
      this.setState({
        current_step: id
      })
  }

  handleEditSubscription = () => {
    const { location, user } = this.props;
    const { app_id, User_data } = this.props.user
    const { id } = queryString.parse(location.search);
    const { event } = this.state;
    var data = {
      appId: app_id,
      eventName: event.eventName,
      eventDesc: event.eventDesc,
      createdTime: null,
      createdBy: user.User_data._id,
      modifiedTime: null,
      modifiedBy: user.User_data._id
    }

    axios.apis('POST', `/api/event?id=${id}`, data, auth.headers)
      .then(response => {
        Toast(response.message)
        if (id === 'new') this.props.history.push(GetAppName(this.props.user) + '/events')
        else this.reloadData()
      }).catch(error => console.error(error))
  }

  render() {
    const { tabSelected, current_step, event } = this.state;
    const { location, user } = this.props;
    const { id } = queryString.parse(location.search);

    return (
      <Fragment >
        <Breadcrumb>
          <BreadcrumbItem ><Link to={GetAppName(this.props.user)}>Dashboard</Link></BreadcrumbItem>
          <BreadcrumbItem ><Link to={GetAppName(this.props.user) + "/events"}>Events</Link></BreadcrumbItem>
          <BreadcrumbItem active>Edit Subscription</BreadcrumbItem>
        </Breadcrumb>
        <div className='panel'>
          <div className='panel-heading collection-header'>
            <div className='link-block'>
              <span className={current_step == 1 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(1)}><FormattedMessage id="events.settings" /></span>
              <span className={current_step == 2 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(2)}><FormattedMessage id="events.actions" /></span>
              <span className={current_step == 3 ? 'active-span' : ''}
                onClick={() => this.changeCurrentView(3)}><FormattedMessage id="events.logs" /></span>
            </div>
            <div className="d-flex justify-content-end" style={{ "right": "25px", "position": "absolute" }}>
              <div className="p-2">
                <Link to={GetAppName(this.props.user) + "/events"}>
                  <Button size="sm" color='white' className='custom-btn'>Exit</Button>
                </Link>
              </div>
              <div className="p-2">
                <Button size="sm" color='white' className='custom-btn' onClick={this.handleEditSubscription}>
                  {id == "new" ? 'Create' : 'Update'}
                </Button>
              </div>
            </div>
          </div>
          <div className='panel-block bg-white p-3'>
            {current_step == 1 &&
              <Fragment>
                <Row>
                  <Col md="12" className='custom-input-margin' >
                    <Input
                      label={<FormattedMessage id="event.name" />}
                      id="eventName"
                      type="text"
                      value={event.eventName}
                      maxLength="256"
                      onChange={e => this.handleInputChange('eventName', e)} />
                  </Col>
                </Row>
                <Row>
                  <Col md="12" className='custom-input-margin'>
                    <div className="form-group">
                      <label htmlFor="eventDesc">
                        <FormattedMessage id="event.description" />
                      </label>
                      <textarea
                        className="form-control"
                        id="eventDesc"
                        value={event.eventDesc}
                        rows="2"
                        onChange={e => this.handleInputChange('eventDesc', e)}
                      />
                    </div>
                  </Col>
                </Row>
                
              </Fragment>
            }
            {current_step == 2 &&
              <div/>
            }
            {current_step == 3 &&
              <div/>
            }
          </div>
        </div>
      </Fragment>
    )
  }
}


const mapStateToProps = ({ user }) => ({
  user
})

const mapDispatchToProps = (dispatch) => ({
  //setCollectionList: (collections) => dispatch(ACT.setCollectionList(collections))
})

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionForm)
