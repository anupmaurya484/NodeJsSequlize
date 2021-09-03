import React, { Component, Fragment } from 'react';
import { Container, Modal, ModalBody, ModalHeader, Button } from "reactstrap";
import Form from '@rjsf/core';
import axios from 'axios';
import auth from "../../../actions/auth";
import DataTable from '../../../components/DataTable'
import API from '../../../config';
import { Toast } from "../../../utils/helperFunctions";
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import './ExternalCollectionPage.css';

const apiUrl = API.API_URL;

class ExternalCollectionPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dataMessage: 'Loading...',
      modalStatus: false,
      collectionName: 'Nintex Tasks',
      column: ['name', 'subject', 'description', 'created', 'status', 'workflow'],
      record: null,
      formSchema: { title: '', type: "object", properties: {} },
      uiSchema: {},
      actionMessage: '',
      accessToken: '',
      selectedTask: ''
    }
  }

  toggle = () => {
    this.setState({
      modalStatus: !this.state.modalStatus
    });
  }

  getTableRows() {
    let rows = this.state.record && this.state.record.map((r, i) => ({
      name: r.name,
      subject: r.subject,
      description: r.description,
      created: r.created,
      status: r.status,
      workflow: r.workflow,
      action: <a onClick={e => this.handleEditRecord(i)}>
        <i className="fa fa-edit" />
      </a>
    }));
    return rows
  }

  render() {
    const {
      dataMessage,
      collectionName,
      column,
      record,
      formSchema,
      actionMessage
    } = this.state
    const data = {
      columns: [
        {
          label: 'Name',
          field: 'name',
        },
        {
          label: 'Subject',
          field: 'subject',
        },
        {
          label: 'Description',
          field: 'description',
        }, {
          label: 'Created',
          field: 'created',
        }, {
          label: 'Status',
          field: 'status',
        }, {
          label: 'Workflow',
          field: 'workflow',
        }, {
          label: '',
          field: 'action',
          sort: 'disabled'
        }
      ],
      rows: this.getTableRows(),
    }

    const uiSchema1 = {
      "id": { "ui:readonly": true, "ui:widget": "hidden" },
      "name": { "ui:readonly": true },
      "description": { "ui:readonly": true },
      "modified": { "ui:readonly": true, "ui:widget": "hidden" },
      "created": { "ui:readonly": true },
      "initiator": { "ui:readonly": true },
      "workflow": { "ui:readonly": true, "ui:widget": "hidden" },
      "workflowId": { "ui:readonly": true, "ui:widget": "hidden" },
      "status": { "ui:readonly": true, "ui:widget": "hidden" },
      "subject": { "ui:readonly": true, "ui:widget": "hidden" },
      "defaultOutcome": { "ui:readonly": true, "ui:widget": "hidden" },
      "outcome": { "ui:readonly": true, "ui:widget": "hidden" },
      "completedBy": { "ui:readonly": true, "ui:widget": "hidden" },
      "completedDate": { "ui:readonly": true, "ui:widget": "hidden" },
      "outcomes": { "ui:readonly": true, "ui:widget": "hidden" },
      "isAuthenticated": { "ui:readonly": true, "ui:widget": "hidden" },
      "assignTo": { "ui:readonly": true, "ui:widget": "hidden" },
      "assignees": { "ui:readonly": true },
      "message": { "ui:readonly": true },
      "actionInstanceId": { "ui:readonly": true, "ui:widget": "hidden" }
    }

    return (
      <Fragment>
        <Breadcrumbs title="External Content" breadcrumbItem="Dashboard" />
         <div className="panel">
            <div className="panel-heading">
              <div className='panel-title'>
                <h3>{collectionName ? collectionName : 'Collection'}</h3>
              </div>
            </div>
            <div className="panel-block bg-white">
              <div className='w-full overflow-auto'>
                {!record &&
                  <div className='no-data-label'>
                    {
                      dataMessage === 'Loading...' ? <div>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                     Loading... </div> : dataMessage
                    }
                  </div>
                }
                {record && !record.length &&
                  <div className='no-data-label'>No Data Available</div>
                }

                {record && record.length &&
                  <DataTable
                    data={data}
                  />
                }

              </div>
            </div>
          </div>
        <Modal isOpen={this.state.modalStatus} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Task - {this.state.selectedTask.subject ? this.state.selectedTask.subject : ""}</ModalHeader>
          <ModalBody>
            <Form
              uiSchema={uiSchema1}
              schema={formSchema}
            >
              <div className="btn-action-container">
                <Button color="secondary" size="sm" onClick={this.onApprove}>Approve</Button>
                <Button color="primary" size="sm" onClick={this.onReject}>Reject</Button>
              </div>
            </Form>
          </ModalBody>
        </Modal>
      </Fragment>
    )
  }

  componentWillMount() {
    this.loadExternalRecords()
  }

  componentDidMount() {
    // materialize css initialization
    //  M.AutoInit()
  }

  loadExternalRecords() {
    axios.get(`${apiUrl}/external-content`, auth.headers)
      .then(res => {
        const record = res.data.data.tasks
        this.setState({ accessToken: res.data.accessToken ? res.data.accessToken : '' })
        // map keys in returned data to form schema properties
        let properties = Object.keys(record[0]).reduce((obj, key) => {
          return { ...obj, [key]: { type: 'string', title: key, default: '' } }
        }, {})
        // add comment field in the form schema
        properties.comment = { type: 'string', title: 'comment' }

        const schema = { ...this.state.formSchema, properties }

        this.setState({
          record,
          formSchema: schema,
          collectionName: `Nintex Tasks (${record[0].assignTo})`,
        })
      })
      .catch(e => {
        this.setState({ dataMessage: "Error fetching tasks, please verify if user token is valid" }) //"No connection found for user, please create a connection to retrieve tasks.."})
      })
  }

  handleEditRecord = (index) => {
    const { formSchema, record } = this.state
    const selectedRecord = record[index]
    const properties = formSchema.properties

    delete properties['dueDate']
    console.log(properties)

    // add default value to show fields value in the form based on selected record
    const newProperties = Object.keys(properties).reduce((obj, key) => {
      if (key !== 'comment') {
        return { ...obj, [key]: { ...properties[key], default: selectedRecord[key] } }
      } else {
        return { ...obj, [key]: { ...properties[key] } }
      }
    }, {})

    // set UI schema for those fields to read-only
    /**/
    const uiSchema = Object.keys(properties).reduce((obj, key) => {
      if (key !== 'comment') {
        // eslint-disable-next-line 
        return { ...obj, [key]: { ["ui:readonly"]: true } }
      } else {
        return obj
      }
    }, {})
    /**/

    console.log(newProperties, uiSchema)

    this.setState({
      selectedTask: selectedRecord,
      formSchema: { ...formSchema, properties: newProperties },
      uiSchema,
      modalStatus: true //open modal
    })
  }

  onApprove = () => {
    const { formSchema } = this.state
    const id = formSchema.properties.id.default

    axios.patch(`${apiUrl}/external-content?task_id=${id}`, { outcome: { outcome: 'Approve' }, 'accessToken': this.state.accessToken }, auth.headers)
      .then(res => {
        console.log(res)
        const { result } = res.data
        let actionMessage

        this.openModalPostActionMessage()

        if (result.error) {
          actionMessage = `Fail to approve task\n${result.error}`
        } else {
          actionMessage = 'The task has been approved'
        }
        Toast(actionMessage);
        this.loadExternalRecords();
        this.setState({ actionMessage: actionMessage, modalStatus: false });
      })
      .catch(err => { console.log(err.message) })
  }

  onReject = () => {
    const { formSchema } = this.state
    const id = formSchema.properties.id.default

    axios.patch(`${apiUrl}/external-content?task_id=${id}`, { outcome: { outcome: 'Reject' }, accessToken: this.state.accessToken }, auth.headers)
      .then(res => {
        const { result } = res.data
        let actionMessage

        this.openModalPostActionMessage()

        if (result.error) {
          actionMessage = `Fail to reject task\n${result.error}`
        } else {
          actionMessage = 'The task has been rejected'
        }
        Toast(actionMessage);
        this.loadExternalRecords();
        this.setState({ actionMessage: actionMessage, modalStatus: false })
      })
      .catch(e => console.error(e))
  }

  openModalPostActionMessage = (message) => {
    const elem = document.getElementById('modal-post-action-message')
    // const modal = M.Modal.getInstance(elem)
    //  modal.open()
  }

  handleClickClose = () => {
    const elem1 = document.getElementById('modal-post-action-message')
    const elem2 = document.getElementById('modal-edit-record')
    //M.Modal.getInstance(elem1).close()
    // M.Modal.getInstance(elem2).close()

    this.loadExternalRecords()
  }
}

export default ExternalCollectionPage
