import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, ModalHeader, DropdownToggle, CardBody, DropdownMenu, DropdownItem, Dropdown, UncontrolledCollapse, Card, Row, Col, CardHeader } from 'reactstrap';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import CustomToggle from '../../components/CustomToggle';
import ModalConfirmation from '../../components/ModalConfirmation';
import Paginato from '../Pagination/Pagination';
import API from '../../config';
import auth from '../../actions/auth';
import TaskForm from './TaskForm';

import todoImage from '../../assets/images/Todo_girl.svg';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './MyTasks.css';


const apiUrl = API.API_URL;

function dateFormatter(cell, row) {
  return (
    <span>
      { moment(cell).format("MMM Do YYYY, h:mm a")}
    </span>
  );
};
let size = 10; // Pagination's page size

class MyTasks extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tasks: undefined,
      activePage: 1,
      activeKey: null,
      dataMessage: 'Loading...',
      columns: [
        {
          dataField: 'id', text: 'Task ID',
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: "15%", textAlign: 'left' };
          }
        },
        {
          dataField: 'data.instanceId', text: 'Workflow ID',
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: "18%", textAlign: 'left' };
          }
        },
        { dataField: 'timestamp', text: 'Created', formatter: dateFormatter, sort: true },
        { dataField: 'data.owner', text: 'Assignee' },
        { dataField: 'data.status', text: 'Status' },
        {
          dataField: 'data.taskName', text: 'Task Name',
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: "20%", textAlign: 'left' };
          }
        },
        {
          dataField: "",
          text: "Actions",
          formatter: this.renderButtons,
          formatExtraData: this,
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: "15%", textAlign: 'center' };
          },
          sort: false
        }
      ],
      approveConfirmation: false,
      rejectConfirmation: false,
      currentRow: undefined,
      openTaskModal: false
    }
  }

  renderButtons(cell, row, rowIndex, formatExtraData) {
    var that = formatExtraData;
    return (
      <span className="more_options">
        <Dropdown className="CustomToggle">
          <DropdownToggle tag={CustomToggle} />
          <DropdownMenu size="sm" title="">
            <DropdownItem className="d-flex" onClick={() => that.setState({ currentRow: row, openTaskModal: true })}>
              <span className="d-flex">
                <i className="pointer md-blue material-icons" data-toggle="tooltip" title="edit">edit</i>
                  View
               </span>
            </DropdownItem>
            {row.data.status == "New" &&
              <DropdownItem className="d-flex" onClick={() => that.setState({ currentRow: row, approveConfirmation: true })}>
                <span className="d-flex">
                  <i className="pointer md-green material-icons" data-toggle="tooltip" title="edit">check</i>
                  Approve
               </span>
              </DropdownItem>
            }
            {row.data.status == "New" &&
              <DropdownItem className="d-flex" onClick={() => that.setState({ currentRow: row, rejectConfirmation: true })}>
                <span className="d-flex">
                  <i className="pointer md-red material-icons" data-toggle="tooltip" title="Start" style={{ width: '20px' }}>close</i>
								Reject
							</span>
              </DropdownItem>
            }
          </DropdownMenu>
        </Dropdown>
      </span>
    );
  }

  componentDidMount() {
    this.loadTasks()
  }

  loadTasks() {
    axios.get(`${apiUrl}/GetTasks`, auth.headers)
      .then(res => {
        this.setState({ tasks: (res.data.data ? res.data.data : []) })
      })
      .catch(e => {
        this.setState({ tasks: [] })
        console.log("GetTasks returned error:", e);
      })
  }

  handleApproveConfirm = async (ans) => {
    console.log(ans, this.state.currentRow)
    //this.state.currentRow.data.status = "Completed";
    //this.state.currentRow.data.response = "approved";
    //this.state.currentRow.data.updated = Date.now();
    //await this.state.currentRow.update(this.state.currentRow.data);
    axios.get(`${apiUrl}/UpdateTask/${this.state.currentRow.id}/approve`, auth.headers)
      .then(res => {
        console.log(auth.headers, res);
        this.loadTasks();
      })
      .catch(e => {
        console.log(e, auth.headers);
      })
    this.setState({ approveConfirmation: false })
  }

  handleRejectConfirm = async (ans) => {
    console.log(ans, this.state.currentRow)
    axios.get(`${apiUrl}/UpdateTask/${this.state.currentRow.id}/reject`, auth.headers)
      .then(res => {
        console.log(auth.headers, res);
        this.loadTasks();
      })
      .catch(e => {
        console.log(e, auth.headers);
      })
    this.setState({ rejectConfirmation: false })
  }

  handleFormSubmit = async (formData) => {
    console.log(this.state.currentRow)
    console.log(formData.response, formData)
    axios.get(`${apiUrl}/UpdateTask/${this.state.currentRow.id}/${formData.response}`, auth.headers)
      .then(res => {
        console.log(auth.headers, res);
        this.loadTasks();
      })
      .catch(e => {
        console.log(e, auth.headers);
      })
    this.setState({ openTaskModal: false })
  }

  //Close Task Modal Page
  onCloseTaskModal = () => {
    this.setState({
      openTaskModal: false,
      currentRow: undefined
    });
  }


  render() {
    //const tasks = this.props.data ? this.props.data : []
    const { columns, approveConfirmation, rejectConfirmation, tasks, dataMessage, activePage } = this.state;

    return (
      <Fragment>
        {!tasks &&
          <div className='no-data-label'>
            {
              dataMessage === 'Loading...' ? <div>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Loading... </div> : dataMessage
            }
          </div>
        }
        {(tasks && !tasks.length) &&
          <div className='row h-100 justify-content-center'>
            <div className='col-12 h-100 align-self-center text-center'>
              <img src={todoImage} className="figure-img img-fluid" style={{ height: "100px" }} />
              <p>There were no tasks assigned to you.</p>
            </div>
          </div>
        }
        {(tasks && tasks.length!=0 && this.props.view && this.props.view == 'table') &&
          <BootstrapTable keyField='id' data={tasks} columns={columns} striped hover />
        }
        { (tasks && tasks.length!=0 && this.props.view && this.props.view == 'list') &&
          <div>
            {tasks.length > size &&
              <Row>
                <Col>
                  {<Paginato pageSize={size} length={tasks.length} active={activePage ? activePage : 1} onClick={e => this.setState({ activePage: e.target.text })} />}
                </Col>
              </Row>
            }
           
          </div>
        }

        <ModalConfirmation IsModalConfirmation={approveConfirmation} showOkButton={true} showCancelButton={true} title="Approve" text="You are approving the task" onClick={(response) => this.handleApproveConfirm(response)} />
        <ModalConfirmation IsModalConfirmation={rejectConfirmation} showOkButton={true} showCancelButton={true} title="Reject" text="You are rejecting the task" onClick={(response) => this.handleRejectConfirm(response)} />
        {this.state.openTaskModal &&
          <Modal isOpen={this.state.openTaskModal} toggle={this.onCloseTaskModal} size="lg" centered>
            <ModalHeader toggle={this.onCloseTaskModal} >
              <h1>Wrokflow task</h1>
            </ModalHeader>
            <ModalBody>
              <TaskForm
                title=""
                onCloseTaskModal={this.onCloseTaskModal}
                onSubmit={e => this.handleFormSubmit(e)}
                data={this.state.currentRow} />
            </ModalBody>
          </Modal>}
      </Fragment>
    )

  }
}


const mapStateToProps = ({ user }) => ({
  user
})

const mapDispatchToProps = () => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(MyTasks)