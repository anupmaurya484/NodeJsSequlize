import React, { Component, Fragment } from 'react'
import './UserForm.css';
import { Container, Row, Col, Form, FormGroup, Button, Label } from "reactstrap";
import { FormattedMessage } from 'react-intl';

class User extends Component {

    constructor() {
        super()
        this.state = {
            data: { email: "", firstname: "", lastname: "", level: 0, credits: 0, password: '', mobile: '' },
            loading: false,
            errors: "",
            informUser: false,
            is_verification: false,
            is_autopass: false,
        }
    }

    onChange = (e) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
            const name = target.name;
            const value = target.value;
            this.setState({
                ...this.state,
                data: { ...this.state.data, [name]: value }
            });
        } else {
            this.setState({
                ...this.state,
                data: { ...this.state.data, [e.target.name]: e.target.value }
            });
        }
    };

    componentDidMount() {
        document.addEventListener('DOMContentLoaded', function () {
            var elems = document.querySelectorAll('select');
        });

        if (this.props.userdata) {
            this.setState({ data: this.props.userdata });
        }
    }

    handleSubmit = async (values) => {
        try {
            const response = await axios.put('change-password', values);
            if (response.status) {
                setTimeout(() => SetSuccess(false), 3000);
                SetSuccess("Your password is updated successfully");
                SetError(false);
                SetInitForm({
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                })

            } else {
                setTimeout(() => SetError(false), 3000);
                SetError(response.message);
                SetInitForm({
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                })
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        var { email } = this.state.data
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!filter.test(email)) {

        } else {
            if (this.state.data.level == 0) {

            } else {
                this.state.data["informUser"] = this.state.informUser;
                this.props.addUser({ ...this.state.data, is_verify: this.state.is_verification })
            }
        }
    }


    render() {
        const { data: { email, firstname, lastname, is_verify, credits, password, mobile }, informUser, is_verification, is_autopass } = this.state;
        const isLoginButtonDisabled = !email || !firstname || !lastname;
        const { levels } = this.props
        const level = this.props.userdata ? this.props.userdata.level : 0;
        return (
            <Container>
                {/* <p className="h4 text-center py-2">{email ? "View User details" : "Add New User"}</p> */}
                <Form onSubmit={this.onSubmit}>
                    <Row className='justify-content-center'>
                        <Col md="6">
                            <FormGroup controlid="firstname">
                                <Label>{<FormattedMessage id="userlists.firstname" />}</Label>
                                <input className="form-control" type="text" value={firstname} name="firstname" maxLength="256" placeholder="Enter First Name" onChange={this.onChange} />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup controlid="lastname">
                                <Label>{<FormattedMessage id="userlists.lastname" />}</Label>
                                <input className="form-control" type="text" value={lastname} name="lastname" maxLength="256" placeholder="Enter Last Name" onChange={this.onChange} />
                            </FormGroup>
                        </Col>

                        <Col md="6">
                            <FormGroup controlid="email">
                                <Label>{<FormattedMessage id="userlists.email" />}</Label>
                                <input className="form-control" type="email" value={email} name="email" maxLength="256" placeholder="Enter Email" onChange={this.onChange} />
                            </FormGroup>
                        </Col>

                        <Col md="6" className='m-auto'>
                            <FormGroup controlid="level">
                                <Label>  <FormattedMessage id="userlists.level" /></Label>
                                <select className="form-control form-select-modified" as="select" name="level" defaultValue={level} onChange={this.onChange} >
                                    {(level == 0) &&
                                        <option value="0" disabled>Choose your option</option>
                                    }
                                    {
                                        levels.map(function (item, i) {
                                            return (
                                                <option key={i} value={item.id}>{item.name}</option>
                                            )
                                        })
                                    }
                                </select>
                            </FormGroup>
                        </Col>

                        <Col md="12">
                            <FormGroup controlid="mobile">
                                <Label>Mobile Number</Label>
                                <input className="form-control" type="text" value={mobile} name="mobile" maxLength="256" placeholder="Enter Mobile" onChange={this.onChange} />
                            </FormGroup>
                        </Col>
                        <Col md={!is_autopass ? '12' : '6' }>
                            <div className="custom-control custom-switch">
                                <input type="checkbox" className="custom-control-input" id="customSwitch" checked={is_autopass}
                                    onChange={(e) => this.setState({ is_autopass: !is_autopass })} />
                                <label className="custom-control-label" htmlFor="customSwitch"> Auto Generated Password?</label>
                            </div>
                        </Col>
                        {is_autopass &&
                        <Col md="6">
                            <FormGroup controlid="password">
                                <Label>{<FormattedMessage id="userlists.passowrd" />}</Label>
                                <input className="form-control" type="text" readOnly={password} value={password} name="password" maxLength="256" placeholder="Enter Password" onChange={this.onChange} />
                            </FormGroup>
                        </Col>
                        }
                        {!this.props.userdata &&
                            <Fragment>
                                <Col md="12">
                                    <div className="custom-control custom-switch">
                                        <input type="checkbox" className="custom-control-input" id="customSwitch2" checked={is_verification}
                                            onChange={(e) => this.setState({ is_verification: !is_verification })} />
                                        <label className="custom-control-label" htmlFor="customSwitch2">Required verification account ?</label>
                                    </div>
                                </Col>
                                <Col md="12">
                                    <div className="custom-control custom-switch">
                                        <input type="checkbox" className="custom-control-input" id="customSwitch1" checked={informUser}
                                            onChange={(e) => this.setState({ informUser: !informUser })} />
                                        <label className="custom-control-label" htmlFor="customSwitch1"><FormattedMessage id="userlists.informUser" /> {informUser}</label>
                                    </div>
                                </Col>
                            </Fragment>
                        }
                        <div className="text-center py-2">
                            <Button type="submit" className='w-100 m-0 p-2' disabled={isLoginButtonDisabled}><FormattedMessage id="userlists.submit" /></Button>
                        </div>
                    </Row>
                </Form>
            </Container >
        )
    }
};

export default User
