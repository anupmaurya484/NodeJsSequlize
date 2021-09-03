import React, { Component, Fragment } from 'react';
import { Container, Row, Col } from 'reactstrap';
import axios from 'axios';
import auth from '../../actions/auth';
import TaskForm from '../../components/MyTasks/TaskForm';
import API from '../../config';
import queryString from 'query-string';
import './WorkflowTaskQuickApproval.css'

const apiUrl = API.API_URL;

class WorkflowTaskQuickApproval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            task : undefined,
            status : undefined,
        };
        this.id = this.props.match.params.id;
        this.outcome = this.props.match.params.outcome;
        this.test = queryString.parse(this.props.location.search, {parseBooleans: true}).test
    }

    componentDidMount() {
        axios.get(`${apiUrl}/GetTask/${this.id}`)
            .then(res => {
                console.log(res)
                if (res.data.data.response == "") { 
                    res.data.data.response =  this.outcome;
                    this.setState({ status: "New"})
                } else {
                    this.setState({ status: this.test? "New" : "Completed"});
                    if (this.test) {
                        res.data.data.status = "New";
                        res.data.data.response = this.outcome
                    }
                };
                this.setState({task: res})
            }).catch(e => {
                console.log(e);
            })
        console.log(this.test, typeof this.test)
    }

    
    handleFormSubmit = async (formData) => {
        console.log(this.test, formData)
        if (this.test) {
            this.setState({ status: "Confirmed"})
            return
        }
        axios.get(`${apiUrl}/ExternalUpdateTask/${this.id}/${formData.response}`, auth.headers)
            .then(res => {
                console.log(auth.headers, res)
                this.setState({ status: "Confirmed"})
            })
            .catch(e => {
                console.log(e, auth.headers);
            })
      }

    render() {
        this.state.task && console.log(this.state.status, this.state.task.data)
        
        return (
            <Container>
                { this.state.task && this.state.status == "New" && 
                <div className="panel box-shadow-none" >
                <div className="panel-block">
                    <div className="text-center">
                        <h2>Workflow Task</h2>
                    </div>
                    <div style={{paddingTop : "30px"}} className="panel-body" >
                        <Row className="justify-content-lg-center">
                            <Col>
                                <TaskForm
                                title=""
                                onSubmit={e => this.handleFormSubmit(e)}
                                data={this.state.task.data} />
                            </Col>
                        </Row>
                    </div>
                </div>
                </div>
                }
                { this.state.status == "Confirmed" &&
                <div className="jumbotron text-center container-fluid p-5">
                    <h1 className="display-3">Thank You!</h1>
                    <p className="lead">Your reply was <strong>processed successfully</strong>.</p>
                    <hr />
                    <p>
                        Having trouble? <a href="https://www.glozic.com">Contact us</a>
                    </p>
                    <p className="lead">
                    <a className="btn btn-primary btn-sm" href="https://portal.glozic.com/" role="button">Continue to Glozic Portal</a>
                    </p>
                </div>
                }
                { this.state.status == "Completed" &&
                <div className="jumbotron text-center container-fluid p-5">
                    <h1 className="display-3">Ops!</h1>
                    <p className="lead">The task was either <strong>closed or completed</strong>, no further action is required.</p>
                    <hr />
                    <p>
                        Having trouble? <a href="https://www.glozic.com">Contact us</a>
                    </p>
                    <p className="lead">
                    <a className="btn btn-primary btn-sm" href="https://portal.glozic.com/" role="button">Continue to Glozic Portal</a>
                    </p>
                </div>
                }
            </Container>
        )
    }

}

export default WorkflowTaskQuickApproval