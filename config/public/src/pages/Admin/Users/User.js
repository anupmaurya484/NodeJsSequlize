import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl';
import { Input, Row, Col, Card, CardHeader, Collapse, Modal, ModalBody, ModalHeader, Button, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, CardBody } from "reactstrap";
import constant from '../../../utils/constant';
import { Toast } from '../../../utils/helperFunctions';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DataTable from '../../../components/DataTable';
import ModalConfirmation from '../../../components/ModalConfirmation';
import CustomToggle from '../../../components/CustomToggle';
import UserForm from './UserForm/UserForm';

// import './User.css'

//Action 
import * as admin from '../../../actions/admin';

class UserPage extends Component {
  constructor() {
    super()
    this.state = {
      userLists: [],
      is_open_adduser: false,
      userdata: "",
      search: "",
      IsModalConfirmation: false,
      DropdownToggle: false,
      selected_id: 0,
      PageNo: 1,
      PageRecord: 10,
      DataCount: 0,
      totalCount: 0,
      selected_id: 0,
      ismodalopen: false,
      col1: false,
      col2: false
    }
  }

  componentDidMount() {
    const { PageRecord } = this.state;
    this.onEventPage({ "PageNo": 1, "search": '' })
  }

  addUser = (e) => {
    if (e) {
      e["company_id"] = this.props.user.User_data.company._id;
      e["company_name"] = this.props.user.User_data.company.company_name;
      var checkEmailDomain = e.email.split("@")[1];
      if (checkEmailDomain != this.props.user.User_data.company.emailDomain && this.props.user.User_data.level != 8) {
        Toast("This email domain is not valid, it should be companied email domain valid.", "error");
      } else {
        const { PageRecord } = this.state;
        this.props.AddNewUser(e).then(data => {
          if (data.status) {
            console.log(data.message)
            this.onEventPage({ "PageNo": 1, "search": '' })
            this.setState({ is_open_adduser: false, PageNo: 1, search: '' });
            Toast(data.message, "success");
          } else {
            Toast(data.message, "error");
          }
        }).catch(err => {
          console.log("Add failed...")
          this.onEventPage({ "PageNo": 1, "search": '' })
          this.setState({ is_open_adduser: false, PageNo: 1, search: '' })
        })
      }
    }
  }

  callFunction = (r, callType) => {
    if (callType) {
      this.props.SendWelcomeMail({ email: r.email, firstname: r.firstname }).then(data => {
        Toast(data.message, "success");
      });
    } else {
      this.setState({ is_open_adduser: true, userdata: r })
    }

  }
  callDelete = (r) => {
    this.setState({ selected_id: r._id, IsModalConfirmation: true })

  }

  handelConfirm(response) {
    const that = this;
    const { selected_id } = this.state;
    if (response) {
      const { PageRecord } = this.state;
      this.props.DeleteUser(selected_id).then(data => {
        if (data.status) {
          this.onEventPage({ "PageNo": 1, "search": '' })
          that.setState({ is_open_adduser: false, IsModalConfirmation: false });
          Toast(data.message, "success");
        } else {
          Toast(data.message, "error");
        }
      }).catch(err => {
        Toast(err.message, "error");
        this.onEventPage({ "PageNo": 1, "search": '' })
        that.setState({ is_open_adduser: false, IsModalConfirmation: false })
      })
    }
    else {
      this.setState({ IsModalConfirmation: false })
    }
  }

  getTableRows = () => {
    let { userLists } = this.state
    const levels = constant.levels;
    const that = this;
    let rows = userLists && userLists.map((r, i) => ({
      full_name: r.firstname + " " + r.lastname,
      email: r.email,
      phone: r.phone ? r.phone : "-----",
      level: levels[r.level - 1].name,
      credits: r.credits,
      status: <input type="checkbox" className="filled-in" onChange={(e) => console.log(e)} checked={r.is_verify ? "checked" : ""} />,
      action: <div style={{ "width": "70px", "display": "flex" }}>
        <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
          <DropdownToggle tag={CustomToggle} />
          <DropdownMenu size="sm" title="" right>
            <DropdownItem className="d-flex" onClick={() => that.callFunction(r, 2)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Send Welcome email">send</i>Send</span></DropdownItem>
            <DropdownItem className="d-flex" onClick={() => that.callFunction(r)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>
            <DropdownItem className="d-flex" onClick={() => that.callDelete(r)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown >
      </div>
    }));
    return rows
  }

  onEventPage = async (data) => {
    console.log(data);
    const { PageRecord } = this.state;
    const response = await this.props.GetUserList({ "PageNo": data.PageNo, "search": data.search, "PageRecord": PageRecord });
    if (response.status) {
      this.setState({
        userLists: response.data,
        is_open_adduser: false,
        PageNo: data.PageNo,
        search: data.search,
        DataCount: response.data_count,
        totalCount: response.total_records
      });
    }

  }

  render() {
    const that = this;
    const { IsModalConfirmation, PageNo, totalCount, PageRecord, DataCount, search } = this.state;
    const levels = constant.levels.filter(x => ![6, 7, 8].includes(x.id));
    const data = {
      columns: [
        {
          label: <FormattedMessage id="userlists.fullname" />,
          field: 'full_name',
        },
        {
          label: <FormattedMessage id="userlists.email" />,
          field: 'email',
        },
        {
          label: <FormattedMessage id="userlists.phone" />,
          field: 'phone',
        }, {
          label: <FormattedMessage id="userlists.level" />,
          field: 'level',
        }, {
          label: <FormattedMessage id="userlists.credits" />,
          field: 'credits',
        }, {
          label: <FormattedMessage id="userlists.active" />,
          field: 'status',
        }, {
          label: 'Action',
          field: 'action',
          sort: 'disabled'
        }
      ],
      rows: this.getTableRows(),
    }

    return (
      <Fragment>
        <Modal isOpen={this.state.is_open_adduser} toggle={() => this.setState({ is_open_adduser: false, userdata: null })} size="md" centered>
          {this.state.is_open_adduser &&
            <Fragment>
              <ModalHeader toggle={() => this.setState({ is_open_adduser: false, userdata: null })}>
                <FormattedMessage id={!this.state.userdata ? "userlists.add_new_user" : "userlists.view_user_details"} />
              </ModalHeader>
              <ModalBody>
                <UserForm
                  userdata={this.state.userdata}
                  levels={levels}
                  addUser={(e) => this.addUser(e)}>
                </UserForm>
              </ModalBody>
            </Fragment>
          }
        </Modal>
        <Modal isOpen={this.state.ismodalopen} toggle={() => this.setState({ ismodalopen: false })} size="md" centered>
          <ModalHeader toggle={() => this.setState({ ismodalopen: false })}>
            <span>Process Contacts</span>
            {/* <Button >CLOSE</Button> */}
          </ModalHeader>
          <ModalBody>
            <div id="accordion">
              <Card className="mb-2">
                <CardHeader className="p-3" id="headingOne">
                  <h6 className="m-0 font-14">
                    <span onClick={() => { this.setState({ col1: !this.state.col1, col2: false }) }}
                      style={{ cursor: "pointer" }} className="text-dark">
                      <h3> <i className="fa fa-download mr-2" aria-hidden="true"></i>Import Contacts</h3>
                    </span>
                  </h6>
                </CardHeader>
                <Collapse isOpen={this.state.col1} className="p-2" >
                  <p>We support importing CSV file from Outlook, Outlook Express, Yahoo! mail,Hotmail and some other apps.</p>
                  <p>Please Select CSV or XLS/XLS file to Upload:</p>
                  <h4>General File Format</h4>
                  <h4 className='mt-3 text-primary'>(Download Sample)</h4>
                  <Button className='mt-3 upload-button'>UPLOAD</Button>
                </Collapse>
              </Card>
              <Card className="mb-1">
                <CardHeader className="p-3" id="headingTwo">
                  <h6 className="m-0 font-14">
                    <span onClick={() => { this.setState({ col2: !this.state.col2, col1: false }) }}
                      style={{ cursor: "pointer" }} className="text-dark">
                      {" "}<h3> <i className="fa fa-upload mr-2" aria-hidden="true"></i>Export Contacts</h3>{" "}
                    </span>
                  </h6>
                </CardHeader>
                <Collapse isOpen={this.state.col2} className="p-2" >
                  <p>Which export Format?</p>
                  <div className='inline-block'>
                    <Button className='mr-2'>DOWNLOAD CSV</Button>
                    <Button>DOWNLOAD EXCEL</Button>
                  </div>
                </Collapse>
              </Card>
            </div>
          </ModalBody>
        </Modal>

        <Breadcrumbs title="Users Lists" breadcrumbItem={"Users Lists"} />
        {data && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}

        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <Row className="mb-2">
                  <Col sm="4">
                    <div className="search-box mr-2 mb-2 d-inline-block">
                      <div className="position-relative search-right">
                        <i className="cursor-pointer fa fa-search search-icon" onClick={() => this.onEventPage({ "PageNo": 1, "search": search })}></i>
                        <Input value={search} onChange={(e) => this.setState({ search: e.target.value })} type="text" className="form-control" placeholder="Search..." />
                      </div>
                    </div>
                  </Col>
                  <Col sm="8">
                    <div className="text-sm-right">
                      <Button onClick={() => this.setState({ is_open_adduser: true })} className='m-1 p-2 float-right'><span>{<FormattedMessage id="userlists.add_new_user" />}</span></Button>
                      <Button className="Import-export-buttton mt-1 mr-2 float-right" onClick={() => this.setState({ ismodalopen: true })}>IMPORT/EXPORT</Button>
                    </div>
                  </Col>
                </Row>
                <DataTable
                  data={data}
                  onClicks={(e) => console.log(e)}
                  addOnClieck={(e) => this.setState({ is_open_adduser: true })}
                  pagination={{
                    onEventPage: this.onEventPage,
                    PageNo: PageNo,
                    totalCount: totalCount,
                    PageRecord: PageRecord,
                    DataCount: DataCount
                  }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

      </Fragment>
    )
  };
}

const mapStateToProps = ({ user }) => {
  return { user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    GetUserList: (data) => dispatch(admin.GetUserList(data)),
    AddNewUser: (data) => dispatch(admin.AddNewUser(data)),
    SendWelcomeMail: (data) => dispatch(admin.SendWelcomeMail(data)),
    DeleteUser: (data) => dispatch(admin.DeleteUser(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);