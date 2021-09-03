import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardBody, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Button, Container, UncontrolledDropdown } from 'reactstrap';

import { GetPages, DeletePage } from "../../actions/collection";
import { Toast, GetAppName, AppDesign } from '../../utils/helperFunctions';
import API from '../../config';
import CardLists from '../../components/CardLists';
import { FormattedMessage } from 'react-intl';
import DataTable from "../../components/DataTable"
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ModalConfirmation from '../../components/ModalConfirmation';
import CustomToggle from '../../components/CustomToggle';
import folderGirl from '../../assets/images/Folder_girl.svg';
// import CloudDropdown from '../../pages/Connection/CloudDropdown';
// import styles from './CollectionList.css'

class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PageList: [],
      search: '',
      selected_id: '',
      IsModalConfirmation: false,
      display_layout: 1,
      setNewPageModal: false,
      filterType: '',

    }
  }
  async handleInputChange(e) {
    const { name, value } = e.target;
    await this.setState({ [name]: value });
    this.loadPageList()
  }

  callFunction = (r, callType) => {
    const rootpath = GetAppName(this.props.user);
    if (callType == 1) {
      window.open(`${AppDesign('path') + rootpath + "/page/" + r._id}`, '_blank')
    } else {
      this.props.history.push("/design" + rootpath + "/create-page?id=" + r._id)
    }
  }

  callDelete = (r) => {
    this.setState({ selected_id: r._id, IsModalConfirmation: true })

  }
  handelConfirm(response) {
    const that = this;
    const { selected_id } = this.state;
    if (response) {
      this.props.DeletePage(selected_id).then(data => {
        if (data.status) {
          that.loadPageList();
          that.setState({ IsModalConfirmation: false });
          Toast(data.message, "success");
        } else {
          Toast(data.message, "error");
        }
      }).catch(err => {
        Toast(err.message, "error");
        that.loadPageList();
        that.setState({ IsModalConfirmation: false })
      })
    }
    else {
      this.setState({ IsModalConfirmation: false })
    }
  }
  getTableRows = () => {
    const that = this;
    const { PageList } = this.state;
    let rows = PageList && PageList.map((r, i) => ({
      name: r.pageName,
      description: r.pageDescription,
      date: r.createdTime,
      action: <div style={{ "width": "70px", "display": "flex" }}>
        <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
          <DropdownToggle tag={CustomToggle} />
          <DropdownMenu size="sm" title="" right flip>
            <DropdownItem className="d-flex" onClick={() => that.callFunction(r, 1)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Open">visibility</i>open</span></DropdownItem>
            {AppDesign() && <DropdownItem className="d-flex" onClick={() => that.callFunction(r, 2)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>}
            {AppDesign() && <DropdownItem className="d-flex" onClick={() => that.callDelete(r)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    }));
    return rows
  }

  setLayout(e) {
    this.setState({ ...this.state, display_layout: e.target.value })
  }


  handleTypeChange = async (value) => {
    await this.setState({ filterType: value });
    this.loadPageList()
  }

  render() {
    const that = this;
    const { PageList, IsModalConfirmation, display_layout, filterType } = this.state;
    const { User_data, app_id } = this.props.user
    if (!PageList && !User_data && !app_id) return false;
    var rootPath = GetAppName(this.props.user);

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
      <Fragment>
        {/* <Breadcrumbs title="Page Lists" breadcrumbItem="Page Lists" /> */}
        <Row className='page-header'>
          <Col col='6'>
            <div className='page-heading-title'>
              <h3><b>Page-List</b></h3>
            </div>
          </Col>
          <Col col="6">
            <div className="d-flex align-items-center justify-content-end">
              <div className="search-box">
                <div className="position-relative">
                  <input onChange={(e) => this.handleInputChange(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
                  <i className="fa fa-search" aria-hidden="true"></i>
                </div>
              </div>
              {/* <CloudDropdown handleTypeChange={this.handleTypeChange} filterType={filterType} /> */}
              <div className="page-title-right d-flex ">

                <div className="pt-1">
                  <i onClick={() => this.setState({ display_layout: 1 })} className="fa fa-align-justify table-type pointer" aria-hidden="true" style={{ "margin": "0px 10px 0px 10px" }}></i>
                  <i onClick={() => this.setState({ display_layout: 2 })} className="fa fa-th-large table-type pointer" aria-hidden="true"></i>
                </div>

                {AppDesign() && <Link to={"/design" + rootPath + "/create-page?id=new"}> <Button className="btn-default mr-1" onClick={() => that.setState({ setNewPageModal: !setNewPageModal })} size="sm">ADD Page</Button></Link>}
                {AppDesign() && <Link to={"/design/page-group"}>  <Button className="btn-default mr-1" size="sm">Cretae Path</Button></Link>}
                
              </div>
            </div>
          </Col>
        </Row>

        <Row>

          {data && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}

          {(display_layout == 1 && (PageList && PageList.length != 0)) &&
            <Col className="mt-3">
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
          }

          {(display_layout == 2 && PageList && PageList.length != 0) && PageList && PageList.map((collection, i) => (
            <Col style={{ marginTop: '10px' }} md='2' key={i}>
              <CardLists
                key={i}
                title={collection.pageName}
                description={collection.pageDescription}
                button1Text='Open'
                button1Url={rootPath + "/page/" + collection._id}
                button2Text='Edit'
                button2Url={rootPath + '/create-page?id=' + collection._id} />
            </Col>
          ))
          }
        </Row>
        {PageList && !PageList.length &&
          <div className='h-100 container-fluid'>
            <div className='row h-100 justify-content-center full-height'>
              <div className='col-12 h-100 align-self-center text-center'>
                <img src={folderGirl} className="figure-img img-fluid" style={{ height: "200px" }} />
                <p>List of Calendars for events tracking</p>
              </div>
            </div>
          </div>
        }
      </Fragment>
    )
  }

  componentWillMount() {
    this.loadPageList()
  }

  loadPageList = async () => {
    try {
      const { app_id, User_data } = this.props.user
      const { search } = this.state;
      const reqData = { userId: User_data._id, appId: app_id, search }
      //debugger;
      var res = await this.props.GetPages(reqData);
      this.setState({ PageList: res.data });
    } catch (err) {
      console.log(err.message);
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

const mapDispatchToProps = (dispatch) => ({
  GetPages: (data) => dispatch(GetPages(data)),
  DeletePage: (data) => dispatch(DeletePage(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(Page)

