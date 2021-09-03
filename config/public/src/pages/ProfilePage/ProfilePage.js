import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux'
import * as user from '../../actions/users';
import * as admin from '../../actions/admin';
// import //MuiPhoneNumber from "material-ui-phone-number";
import {
  Container, Row, Col, Input, Button, BreadcrumbItem, Breadcrumb, Card, CardBody,
  Modal, ModalBody, ModalFooter, ModalHeader, Table, TableHead, TableBody,
  DropdownItem, UncontrolledDropdown, DropdownMenu, DropdownToggle
} from 'reactstrap';
import { Toast, isValidProfileURL } from '../../utils/helperFunctions';
import { encode } from '../../utils/crypto';
import { FormattedMessage } from 'react-intl';
import CustomToggle from '../../components/CustomToggle';
import './ProfilePage.css';
import Form from '@rjsf/core';
import axiosService from '../../utils/axiosService';
import API from '../../config';

const schema = {
  "type": "object",
  "required": ["email"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    }
  }
}


class ProfilePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      memberModal: false,
      User_data: this.props.user.User_data,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      address: "",
      mobile: "",
      gender: "",
      profile_img: "",
      id: "",
      is_notify_email: 0,
      is_notify_mobile: 0,
      is_notify_whatsapp: 0,
      team: { allowedMembers: 10, members: [] },
      formData: null,
      userNotFound: null,
      is_edit_info: false,
      is_change_password: false,
      change_password: { old_password: '', new_password: '' },
    }
  }

  componentDidMount() {
    if (this.props.user.User_data) {
      const { firstname, lastname, email, phone, gender, address, mobile, profile_img, _id, team, is_notify_email, is_notify_mobile, is_notify_whatsapp, } = this.props.user.User_data
      console.log("component did mount ");
      console.log(this.props.user.User_data);
      this.setState({
        firstname: firstname || "",
        lastname: lastname || "",
        address: address || "",
        email: email || "",
        gender: gender || "",
        phone: phone || "",
        is_notify_email: is_notify_email || 0,
        is_notify_mobile: is_notify_mobile || 0,
        is_notify_whatsapp: is_notify_whatsapp || 0,
        mobile: (/\+/.test(mobile) ? mobile : "+1") || "",
        profile_img: profile_img,
        id: _id,
        team: team ? team : { allowedMembers: 10, members: [] }
      })
    }
  }

  onChange = (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const name = target.name;
      const value = target.value;
      this.setState({
        ...this.state,
        [name]: value
      });
    }
  }

  onSubmit = async (e) => {
    try {
      e.preventDefault();
      const { firstname, lastname, phone, address, gender, is_notify_email, is_notify_mobile, is_notify_whatsapp, profile_img } = this.state;
      let mobile = "+" + this.state.mobile.replace(/[^\w\s]/gi, '').replace(/ /g, '')
      var reqData = { firstname, lastname, phone, address, mobile, gender, is_notify_email, is_notify_mobile, is_notify_whatsapp, profile_img }
      const res = await this.props.updateProfile(reqData);
      Toast(res.message)
      this.setState({ is_edit_info: false })
      this.props.user.User_data.firstname = firstname;
      this.props.user.User_data.lastname = lastname;
      this.props.user.User_data.phone = phone;
      this.props.user.User_data.mobile = mobile;
      this.props.user.User_data.address = address;
      this.props.user.User_data.gender = gender;
      this.props.user.User_data.is_notify_email = is_notify_email;
      this.props.user.User_data.is_notify_mobile = is_notify_mobile;
      this.props.user.User_data.is_notify_whatsapp = is_notify_whatsapp;
      this.props.user.User_data.profile_img = profile_img;
      await this.props.updateProfileDespatch(this.props.user.User_data)
      localStorage.user = encode(JSON.stringify(this.props.user.User_data));

    } catch (err) {
      console.log(err.message);
    }
  }

  onSubmitMember = (e) => {
    var { memberModal, team, firstname, lastname, email, id } = this.state;
    console.log("email ", e.formData.email)
    if (team.members.some(v => v.email === e.formData.email)) {
      Toast("User already in your team..");
      return
    }

    axiosService.apis("GET", `/api/userprofiles/${e.formData.email}`)
      .then(response => {
        let user = response.user;
        if (user) {
          console.log('user: ', user)
          if (!user.team) {
            user.team = { allowedMembers: 10, members: [] }
          }
          if (user.team.members.length < 10) {
            user.team.members.push({ "id": id, "email": email, "name": firstname + " " + lastname, "status": "Pending approval" });
            axiosService.apis("POST", "/api/updateProfile", { id: user._id, team: user.team })
              .then(result1 => {
                console.log('result1: ', result1);
                //Request sent"
                team.members.push({ "id": user._id, "email": e.formData.email, "name": user.fullname || user.firstname + " " + user.lastname, "status": "Active" })
                this.setState({ team, memberModal: false });
                console.log(e.formData, team);
                axiosService.apis("POST", "/api/updateProfile", { id: id, team: team })
                  .then(result2 => {
                    console.log('result2: ', result2);
                  })
              })
          }
        } else {
          this.setState({ userNotFound: "User not found.." });
          Toast(this.state.userNotFound);
          console.log('User not exists')
        }
      }).catch(error => console.error(error))

  }

  updateMember = (item, i) => (event) => {
    var { team, email, id } = this.state;
    const action = event.target.name;
    console.log("Event Name for item..: ", action, item, i);
    var urRecInMyTeam = { ...item };
    console.log("urRecInMyTeam.email: ", urRecInMyTeam.email);

    axiosService.apis("GET", `/api/userProfiles/${urRecInMyTeam.email}`)
      .then(response => {
        let you = response.user;
        if (you) {
          let urMembers = [...you.team.members];
          console.log("urMembers: ", urMembers);
          let pos = urMembers.findIndex(v => v.email === email);
          let myRecInUrTeam = urMembers[pos];
          console.log("pos & ele: ", pos, myRecInUrTeam);

          switch (action) {
            case "Accept":
              myRecInUrTeam.status = "Active"; //Set my record in your team to active/accepted
              urRecInMyTeam.status = "Active"; //Set ur record in my team to active
              urMembers.splice(pos, 1, myRecInUrTeam);
              team.members.splice(i, 1, urRecInMyTeam)
              //axiosService.apis("POST", "/api/updateProfile", {id: mem.id})
              break;
            case "Reject":
              myRecInUrTeam.status = "Inactive"; //Set my record in your team to active/accepted
              urRecInMyTeam.status = "Inactive"; //Set ur record in my team to active
              urMembers.splice(pos, 1, myRecInUrTeam);
              team.members.splice(i, 1, urRecInMyTeam);
              break;
            case "Cancel":
              urMembers.splice(pos, 1);
              team.members.splice(i, 1);
              break;
            case "Remove":
              urMembers.splice(pos, 1);
              team.members.splice(i, 1);
              break;
            case "Disconnect":
              myRecInUrTeam.status = "Inactive"; //Set my record in your team to active/accepted
              urRecInMyTeam.status = "Inactive"; //Set ur record in my team to active
              urMembers.splice(pos, 1, myRecInUrTeam);
              team.members.splice(i, 1, urRecInMyTeam);
              break;
            default:
            // code block
          }
          you.team.members = urMembers;
          this.setState({ team: team });
          console.log("urMembers: ", urMembers);
          console.log("myMembers: ", team.members);

          //Updating contact's team
          axiosService.apis("POST", "/api/updateProfile", { id: you._id, team: you.team })
            .then(res => {
              console.log("Updated contact's team.");
            }).catch(error => console.error(error));

          //Updating own team
          axiosService.apis("POST", "/api/updateProfile", { id: id, team: team })
            .then(res => {
              console.log("Updated own team.");
            }).catch(error => console.error(error))

        } else {

        }
      }).catch(error => console.error(error))

  }

  setEditMode(is_edit_info) {
    const { temp_state } = this.state;
    if (is_edit_info)
      this.setState({ is_edit_info: is_edit_info, temp_state: this.state })
    else
      this.setState({ ...temp_state, is_edit_info: false, temp_state: undefined })
  }

  async handleFileInput(e, is_from) {
    e.preventDefault()
    // is_from 1 for company 2 user  
    if (e.target.files[0]) {
      const data = new FormData()
      data.append('file', e.target.files[0]);
      const response = await this.props.UploadPhoto(data);
      if (response) {
        const id = (is_from == 1) ? this.state.company_id : this.props.user.User_data._id;
        const payload = { id, logo_url: response.filename, update_type: is_from };
        const response1 = await this.props.EditProfilePhoto(payload)
        if (response1) {
          const logo = API.API_URL + '/download?filename=' + response.filename;
          if (is_from == 1)
            this.setState({ logo })
          else
            this.setState({ ...this.state, profile_img: response.filename });
        }
      }
    }

  }

  // change input value
  handleInputChange(type, e) {
    if (type == "change_password") {
      let change_password = this.state.change_password;
      change_password[e.target.name] = e.target.value
      this.setState({ change_password: change_password });
    } else if (type == "mobile") {
      this.setState({ ["mobile"]: e });
    } else {
      const { name, value, type: inputType, checked } = e.target
      const final_value = (inputType === "checkbox") ? checked : value
      this.setState({ [name]: final_value })
    }

  }

  submitChangePassword(e) {
    const { old_password, new_password } = this.state.change_password
    if (old_password && new_password) {
      const payload = { user_id: this.props.user.User_data._id, old_password, new_password }
      this.props.ChangePassword(payload).then(resData => {
        if (resData.status) {
          Toast(resData.message, "success")
          this.setState({ is_change_password: false, change_password: { old_password: '', new_password: '' } })
        } else {
          Toast(resData.message, "error")
        }
      });
    } else {
      Toast("Input Field is required", "error")
    }
  }

  log = (type) => console.log.bind(console, type);
  render() {
    const {
      id,
      firstname,
      lastname,
      email,
      phone,
      address,
      mobile,
      gender,
      team,
      formData,
      memberModal,
      is_notify_email,
      is_notify_mobile,
      is_notify_whatsapp,
      is_edit_info
    } = this.state;
    const isTenantUser = this.state.User_data.isTenantUser;
    let levels = [], level = 0;
    let profile_img = isValidProfileURL(API.API_URL, this.state.profile_img);
    
    return (
      <Fragment>
        <Modal isOpen={memberModal} toggle={() => this.setState({ memberModal: false })} centered>
          <ModalHeader toggle={() => this.setState({ memberModal: false })}>Add/Edit Member</ModalHeader>
          <ModalBody>
            <Form schema={schema}
              formData={formData}
              onChange={(e) => console.log(e.formData)}
              onSubmit={(e) => this.onSubmitMember(e)}>
              <Button color="secondary" onClick={() => this.setState({ memberModal: false })}>Close</Button>
              <Button color="primary ml-2" type="submit">Apply</Button>
            </Form>
          </ModalBody>
        </Modal>

        {this.state.is_change_password &&
          <Modal isOpen={this.state.is_change_password} toggle={() => this.setState({ is_change_password: false, change_password: { old_password: '', new_password: '' } })} size="md">
            <ModalHeader toggle={() => this.setState({ is_change_password: false, change_password: { old_password: '', new_password: '' } })}>Change Password</ModalHeader>
            <ModalBody>
              <Input label="Old Password"
                id="edit_old_password"
                type="password"
                name="old_password"
                placeholder="Old password"
                maxLength="256"
                onChange={event => this.handleInputChange('change_password', event)}
              />
              <Input label="New Password"
                id="edit_new_password"
                type="password"
                name="new_password"
                placeholder="New password"
                maxLength="256"
                onChange={event => this.handleInputChange('change_password', event)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" className='Button-md' onClick={() => this.setState({ is_change_password: false, change_password: { old_password: '', new_password: '' } })}>Close</Button>
              <Button color="primary" className='Button-md' onClick={(e) => this.submitChangePassword(e)}>Submit</Button>
            </ModalFooter>
          </Modal>
        }
        <Row className="settings-page">
          <div className="panel box-shadow-none">
            <div className="panel-block">
              <div className="text-center">
                <h2><FormattedMessage id="profile.page.personal_info" /></h2>
              </div>
              <Card>
                <div className="d-flex justify-content-end">
                  {!is_edit_info && <span className="material-icons cursor-pointer" onClick={() => this.setEditMode(true)}>
                    create
											</span>}
                  {is_edit_info &&
                    <Fragment>
                      {/* <span className="material-icons cursor-pointer" onClick={(e) => this.saveData(e)}> */}
                      <span className="material-icons cursor-pointer" onClick={this.onSubmit}>
                        save
													</span>
                      <span className="material-icons cursor-pointer" onClick={() => this.setEditMode(false)}>
                        close
													</span>
                    </Fragment>
                  }
                </div>
                <Row>
                  <Col xs={12} md={4} className="align-self-center"><FormattedMessage id="profile.page.photo" /></Col>
                  <Col xs={12} md={8}>
                    <div className="photo">
                      <img height="75" width="75" src={profile_img} onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn1.iconfinder.com/data/icons/avatar-3/512/Manager-512.png' }} alt="img" className="rounded-circle" />
                      {is_edit_info &&
                        <div className="file-upload photo-upload">
                          <div></div>
                          <input type="file" accept="image/*" onChange={(e) => this.handleFileInput(e, 2)} />
                        </div>
                      }
                    </div>
                    {/* <img height="50" width="50" src={logo} onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn1.iconfinder.com/data/icons/avatar-3/512/Manager-512.png' }} alt="img" className="rounded-circle" /> */}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={4}><FormattedMessage id="profile.page.userId" /></Col>
                  <Col xs={12} md={8}>
                    {!is_edit_info ?
                      id
                      :
                      <input className="form-control" name="id" readOnly value={id} type="text" />
                    }
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={4}><FormattedMessage id="profile.page.name" /></Col>
                  <Col xs={12} md={8}>
                    {!is_edit_info ?
                      firstname + " " + lastname :
                      <Fragment>
                        <Row style={{ padding: '0px' }}>
                          <Col className="pl-0">
                            <input className="form-control" name="firstname" onChange={event => this.handleInputChange('personal_info', event)} value={firstname} type="text" />
                          </Col>
                          <Col className="pr-0">
                            <input className="form-control" name="lastname" onChange={event => this.handleInputChange('personal_info', event)} value={lastname} type="text" />
                          </Col>
                        </Row>
                      </Fragment>
                    }
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={4}><FormattedMessage id="profile.page.address" /></Col>
                  <Col xs={12} md={8}>
                    {!is_edit_info ?
                      address :
                      <input className="form-control" name="address" onChange={event => this.handleInputChange('personal_info', event)} value={address} type="text" />
                    }
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={4}><FormattedMessage id="profile.page.email" /></Col>
                  <Col xs={12} md={8}>
                    {!is_edit_info ?
                      email :
                      <input className="form-control" name="email" onChange={event => this.handleInputChange('personal_info', event)} value={email} type="email" />
                    }
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={4}><FormattedMessage id="profile.page.mobile" /></Col>
                  <Col xs={12} md={8}>
                    {/* {!is_edit_info ?
                        mobile :
                        <MuiPhoneNumber
                          name="mobile"
                          autoFormat="true"
                          value={mobile}
                          onChange={event => this.handleInputChange('mobile', event)} />
                      } */}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={4}><FormattedMessage id="profile.page.gender" /></Col>
                  <Col xs={12} md={8}>
                    {!is_edit_info ?
                      gender :
                      <Fragment>
                        <div className="form-check form-check-inline">
                          <input className="form-check-input" type="radio" name="gender" checked={['male', 'Male'].includes(gender)} onChange={event => this.handleInputChange('personal_info', event)} id="inlineRadio1" value="Male" />
                          <label className="form-check-label" htmlFor="inlineRadio1">Male</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input className="form-check-input" type="radio" name="gender" checked={['female', 'Female'].includes(gender)} onChange={event => this.handleInputChange('personal_info', event)} id="inlineRadio2" value="Female" />
                          <label className="form-check-label" htmlFor="inlineRadio2">Female</label>
                        </div>
                      </Fragment>
                    }</Col>
                </Row>
                <Row>

                  <Col xs={12} md={4}>Enable Notifications</Col>
                  <Col xs={12} md={8}>

                    <Fragment>
                      <div className="form-check form-check-inline">
                        <input disabled={!is_edit_info} className="form-check-input" type="checkbox" name="is_notify_email" checked={is_notify_email} onChange={event => this.handleInputChange('personal_info', event)} id="checkbook1" value="email" />
                        <label className="form-check-label" htmlFor="inlineRadio1">Email</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input disabled={!is_edit_info} className="form-check-input" type="checkbox" name="is_notify_mobile" checked={is_notify_mobile} onChange={event => this.handleInputChange('personal_info', event)} id="checkbook2" value="mobile" />
                        <label className="form-check-label" htmlFor="inlineRadio2">Mobile</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input disabled={!is_edit_info} className="form-check-input" type="checkbox" name="is_notify_whatsapp" checked={is_notify_whatsapp} onChange={event => this.handleInputChange('personal_info', event)} id="checkboo3" value="WhatsApp" />
                        <label className="form-check-label" htmlFor="inlineRadio2">WhatsApp</label>
                      </div>
                    </Fragment>

                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={12}>
                    <button className="btn waves-effect mt-2 btn btn-secondary" type="button" onClick={() => this.setState({ is_change_password: true, change_password: { old_password: '', new_password: '' } })}><FormattedMessage id="profile.page.change_password" /></button>
                  </Col>
                </Row>
              </Card>
            </div>
          </div>
        </Row>



        {!isTenantUser &&
          <Row>

            <div className="panel box-shadow-none">
              <div className="panel-block">
                <div className="text-center"><h3>My Team</h3></div>
                <Card className="card-body w-100 table-responsive">
                  <div className="d-flex justify-content-end">
                    {/* <span className="material-icons cursor-pointer" onClick={() => this.setEditMode(true)}>create</span> */}
                    {(team.members.length < team.allowedMembers) ?
                      <Button type="submit" className='custom-Button' onClick={() => this.setState({ memberModal: true })}>
                        Add member</Button> :
                      <Button type="submit" className='custom-Button' disabled onClick={() => this.setState({ memberModal: true })}>
                        Add member</Button>
                    }
                  </div>
                  <Row className='justify-content-left'>
                    Your content can only be shared to accepted team member(s) listed below:
                      <Table className="table-sm table-hover">
                      <thead color="cyan lighten-5">
                        <tr>
                          <th>#</th>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.members && team.members.map((item, index) =>
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.id}</td>
                            <td>{item.email}</td>
                            <td>{item.name}</td>
                            <td>{item.status}</td>
                            <td>
                              <UncontrolledDropdown size="sm" setActiveFromChild>
                                <DropdownToggle color="primary" tag={CustomToggle} />
                                <DropdownMenu size="sm" title="" right>
                                  {item.status === "Request sent" && <DropdownItem name="Cancel" onClick={this.updateMember(item, index)}>Cancel</DropdownItem>}
                                  {item.status === "Active" && <DropdownItem name="Disconnect" onClick={this.updateMember(item, index)}>Disconnect</DropdownItem>}
                                  {item.status === "Inactive" && <DropdownItem name="Remove" onClick={this.updateMember(item, index)}>Remove</DropdownItem>}
                                  {item.status === "Pending approval" && <DropdownItem name="Accept" onClick={this.updateMember(item, index)}>Accept</DropdownItem>}
                                  {item.status === "Pending approval" && <DropdownItem name="Reject" onClick={this.updateMember(item, index)}>Reject</DropdownItem>}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Row>
                </Card>
              </div>
            </div>
          </Row>
        }

      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return { user: state.user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateProfile: (data) => dispatch(user.updateProfile(data)),
    updateProfileDespatch: (data) => dispatch(user.updateProfileDespatch(data)),
    UploadPhoto: (data) => dispatch(admin.UploadPhoto(data)),
    EditProfilePhoto: (data) => dispatch(admin.EditProfilePhoto(data)),
    ChangePassword: (data) => dispatch(admin.ChangePassword(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);