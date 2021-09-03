import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux'
import { DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, Row, Col, } from 'reactstrap';
import TaskView from '../../components/MyTasks';
import NintexTaskView from './components/NintexTaskView';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import './WorkflowTaskViewPage.css';

class WorkflowTaskViewPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      view: "Glozic"
    }
  }

  render() {
    const { view } = this.state;

    return (
      <Fragment>
        <Breadcrumbs title="External Content" breadcrumbItem="Dashboard" />
        <div className="panel">
          <div className="panel-heading">
            <div className='panel-title'>
              <h3>Tasks</h3>
            </div>
            <div className="panel-action" style={{ display: 'flex', justifyContent: 'flex-end', alignContent: 'center', alignItems: 'baseline' }}>
              <UncontrolledDropdown className="CustomToggle"  setActiveFromChild>
                <DropdownToggle id="dropdown-basic" className="btn-sm">
                  {view}
                </DropdownToggle>

                <DropdownMenu>
                  <DropdownItem onClick={(e) => { this.setState({ view: 'Glozic' }) }}>Glozic</DropdownItem>
                  <DropdownItem onClick={(e) => { this.setState({ view: 'Nintex' }) }}>Nintex</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>
          <div className="panel-block bg-white">
            {view == "Glozic" &&
              <TaskView view='table' />
            }
            {view == "Nintex" &&
              <NintexTaskView />
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

const mapDispatchToProps = () => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowTaskViewPage)
