import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import BootstrapTable from 'react-bootstrap-table-next';
import { CSVExport, Search } from 'react-bootstrap-table2-toolkit';
import { Card, Row, Col, Pagination, CardBody, CardHeader, UncontrolledCollapse } from 'reactstrap';
import moment from 'moment';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './Contacts.css';
import API from '../../config';
import Paginato from '../Pagination/Pagination';
import constant from '../../utils/constant';
import * as admin from '../../actions/admin';
const apiUrl = API.API_URL;
const { SearchBar } = Search;
const { ExportCSVButton } = CSVExport;
function dateFormatter(cell, row) {
  return (
    <span>
      { moment(cell).format("MMM Do YYYY, h:mm a")}
    </span>
  );
}
let size = 10;

class Contacts extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activePage: 1,
      activeKey: null,
      dataMessage: 'Loading...',
      columns: [
        {
          dataField: 'full_name', text: <FormattedMessage id="userlists.fullname" />,
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: "15%", textAlign: 'left' };
          }
        },
        {
          dataField: 'email', text: <FormattedMessage id="userlists.email" />,
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: "18%", textAlign: 'left' };
          }
        },
        { dataField: 'phone', text: <FormattedMessage id="userlists.phone" />, sort: true }
      ],
      contacts: null
    }
  }

  componentDidMount = async () => {
    if (this.props.user.User_data.isTenantUser || this.props.user.User_data.level > 7) {
      await this.props.GetUserList();
      let { userLists } = this.props.user
      const levels = constant.levels;
      let rows = userLists && userLists.map((r, i) => ({
        full_name: r.firstname + " " + r.lastname,
        email: r.email,
        phone: r.phone ? r.phone : "",
        level: levels[r.level - 1].name,
        credits: r.credits,
      }));
      this.setState({ contacts: rows })
    } else {
      let data = await this.getTableRows()
      console.log(data)
      this.setState({ contacts: data })
    }
  }

  getTableRows = () => {
    return new Promise((resolve, reject) => {
      try {
        let rows = this.props.user.User_data.team.members.map((r, i) => ({
          full_name: r.name,
          email: r.email,
          phone: "",
          level: "",
          credits: ""
        }));
        resolve(rows)
      } catch (error) {
        reject("error", error)
      }
    })
  }

  render() {
    const { columns, dataMessage, activePage, contacts, activeKey } = this.state;

    return (
      <Fragment>
        {!contacts &&
          <div className='no-data-label'>
            {
              dataMessage === 'Loading...' ? <div>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Loading... </div> : dataMessage
            }
          </div>
        }
        { contacts && !contacts.length &&
          <div className='no-data-label'>You do not have any contacts yet.</div>
        }
        { (contacts && contacts.length && this.props.view && this.props.view == 'table') > 0 &&
          (<BootstrapTable keyField='id' data={data.rows} columns={columns} striped hover />)
        }
        { (contacts && contacts.length && this.props.view && this.props.view == 'list') > 0 &&
          (<div>
            {contacts.length > size &&
              <Row>
                <Col>
                  {<Paginato pageSize={size} length={contacts.length} active={activePage ? activePage : 1} onClick={text => this.setState({ activePage: text })} />}
                  {false && <Pagination size='sm' tag='button'>{items}</Pagination>}
                </Col>
              </Row>
            }
            <Row>
              <Col>
                <div id="accordion">
                  {contacts.slice((activePage - 1) * size, (activePage - 1) * size + size).map((contacts, i) => {
                    var key = "#target" + i
                    return (
                      <Card className="card mb-1" key={i}>
                        <CardHeader className='card-header px-3 py-1 d-flex align-items-center justify-content-between btn collapsed'
                          id={"target" + i} onClick={e => this.setState({ activeKey: ((activeKey == i.toString()) ? -1 : i.toString()) })}>
                          {contacts.full_name}
                          <span className="fa-stack fa-sm">
                            {(i.toString() == this.state.activeKey) ?
                              <i className="fa fa-chevron-down"></i> :
                              <i className="fa fa-minus"></i>}
                          </span>
                        </CardHeader>
                        <UncontrolledCollapse toggler={key}>
                          <CardBody className='px-3 py-2'>
                            {contacts.email + ", " + contacts.phone}
                          </CardBody>
                        </UncontrolledCollapse>
                      </Card>
                    )
                  })}
                </div>
              </Col>
            </Row>
          </div>)
        }
      </Fragment>
    )

  }
}


const mapStateToProps = ({ user }) => ({
  user
})

const mapDispatchToProps = (dispatch) => {
  return {
    GetUserList: () => dispatch(admin.GetUserList())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Contacts)