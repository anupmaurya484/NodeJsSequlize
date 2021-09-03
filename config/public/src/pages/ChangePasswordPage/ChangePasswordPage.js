import React, { Component } from 'react';
import './ChangePasswordPage.css';
import { changepassword } from "../../actions/users";
import { connect } from "react-redux";
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { Toast } from "../../utils/helperFunctions";
import { GetPasswordConfig } from "../../actions/users";


const strength_level = {
    "1": 'Strong',
    '2': 'Medium',
    '3': 'Low'
}

const strength_level_color = {
    "1": 'bg-danger',
    '2': 'bg-success',
    '3': 'bg-warning'
}


class ChangePasswordPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user_id: "", password: "", cpassword: "",
            secutiry_password: null,
            strength_progress: 0,
            is_retry_attempts: false,
            is_alphanumeric_charaters: false,
            is_mixed_upper_lower: false,
            is_one_number: false,
            is_special_characters: false,
            is_minimum_password: false
        };
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        let { password, user_id, cpassword } = this.state;
        if (password != cpassword) {
            Toast("Confirm password does't match", "error")
        } else if (!password || !user_id) {
            Toast("Some thing is worng, Please try agian leter.", "error");
        } else {
            var data = { password: password, user_id: user_id }
            this.props.changepassword(data).then(res => {
                if (res.status == true) {
                    Toast("your password has been updated successfull.", "error");
                    this.props.history.push("/login");
                } else {
                    Toast({ html: res.message })
                }
            });
        }

    }


    onChangePassword = (e) => {
        const target = e.target;
        const secutiry_password = this.state.secutiry_password;
        var total_active_security = 0;
        var total_done_security = 0;
        var is_alphanumeric_charaters = false;
        var is_mixed_upper_lower = false;
        var is_one_number = false;
        var is_special_characters = false;
        var is_minimum_password = false;

        if (target instanceof HTMLInputElement) {
            const name = target.name;
            const string = target.value;


            if(secutiry_password){
                var is_security = ['is_alphanumeric_charaters', 'is_mixed_upper_lower', 'is_one_number', 'is_special_characters', 'is_minimum_password']
                is_security.forEach(e => total_active_security += secutiry_password[e] == true ? 1 : 0)
                is_security.forEach(e => {
                    if (secutiry_password[e] == true && e == 'is_alphanumeric_charaters') {
                        var isvaildLen = secutiry_password.password_criteria.alphanumeric_charaters;
                        var stripped = string.replace(/[^A-Za-z]/g, '');
                        if (stripped.length >= isvaildLen) {
                            total_done_security++;
                            is_alphanumeric_charaters = true;
                        } else {
                            total_done_security = is_alphanumeric_charaters == true ? total_done_security-- : total_done_security;
                            is_alphanumeric_charaters = false;
                        }
                    }
    
                    if (secutiry_password[e] == true && e == 'is_mixed_upper_lower') {
                        var strippedUpper = string.replace(/[^A-Z]/g, '');
                        var strippedLower = string.replace(/[^a-z]/g, '');
                        if (strippedUpper.length >= 1 && strippedLower.length >= 1) {
                            total_done_security++;
                            is_mixed_upper_lower = true;
                        } else {
                            total_done_security = is_mixed_upper_lower == true ? total_done_security-- : total_done_security;
                            is_mixed_upper_lower = false;
                        }
                    }
    
                    if (secutiry_password[e] == true && e == 'is_one_number') {
                        var stripped = string.replace(/[^0-9]/g, '');
                        if (stripped.length >= 1) {
                            total_done_security++;
                            is_one_number = true;
                        } else {
                            total_done_security = is_one_number == true ? total_done_security-- : total_done_security;
                            is_one_number = false;
                        }
                    }
    
                    if (secutiry_password[e] == true && e == 'is_special_characters') {
                        var isvaildLen = secutiry_password.password_criteria.special_characters;
                        var stripped = string.replace(/\s|[A-Za-z0-9_]/g, '');
                        if (stripped.length >= isvaildLen) {
                            total_done_security++;
                            is_special_characters = true;
                        } else {
                            total_done_security = is_special_characters == true ? total_done_security-- : total_done_security;
                            is_special_characters = false;
                        }
                    }
                    if (secutiry_password[e] == true && e == 'is_minimum_password') {
                        var isvaildLen = secutiry_password.password_criteria.minimum_password;
                        if (string.length >= isvaildLen) {
                            total_done_security++;
                            is_minimum_password = true;
                        } else {
                            total_done_security = is_minimum_password == true ? total_done_security-- : total_done_security;
                            is_minimum_password = false;
                        }
                    }
                })
            }
           


            this.setState({
                password : string,
                isCall: false,
                strength_progress: total_active_security == 0 ? 100 : (total_done_security / total_active_security) * 100,
                is_alphanumeric_charaters: is_alphanumeric_charaters,
                is_mixed_upper_lower: is_mixed_upper_lower,
                is_one_number: is_one_number,
                is_special_characters: is_special_characters,
                is_minimum_password: is_minimum_password,
            });
        }
    }


    componentWillMount() {
        this.setState({ user_id: this.props.match.params._id })
        this.props.GetPasswordConfig().then(res => {
            console.log(res);
            this.setState({ secutiry_password: res.data });
        }).catch(err => {
            console.log(err);
        })
    }

    render() {
        let { cpassword, password, 
            secutiry_password,
            strength_progress,
            is_retry_attempts,
            is_alphanumeric_charaters,
            is_mixed_upper_lower,
            is_one_number,
            is_special_characters,
            is_minimum_password } = this.state;
        let { User_data, loginError } = this.props;

        const isLoginButtonDisabled = !cpassword || !password || !(strength_progress == 100);
        
        const passwordPolicy = (secutiry_password && (secutiry_password.is_alphanumeric_charaters 
                               || secutiry_password.is_minimum_password 
                               || secutiry_password.is_mixed_upper_lower 
                               || secutiry_password.is_one_number 
                               || secutiry_password.is_special_characters))

        if (this.state.isCall && !User_data) {
            Toast({ html: loginError })
        }
        
        return (
            // change password start
            <Container>
                <Row className='justify-content-center'>
                    <Col md="6">
                        <Card className='mt-5'>
                            <CardBody>
                                <form onSubmit={this.onSubmit}>
                                    <p className="h4 text-center py-4">Change Password</p>
                                    <label htmlFor="lblPassword">
                                        Password</label>
                                    <input
                                        type="password"
                                        id="lblPassword"
                                        className="form-control"
                                        value={password}
                                        maxLength="256"
                                        onChange={this.onChangePassword}
                                    />
                                    <br />
                                    <label htmlFor="lblConfirmPassword">
                                        Confirm Password
                                        </label>
                                    <input
                                        type="password"
                                        id="lblConfirmPassword"
                                        className="form-control"
                                        value={cpassword}
                                        maxLength="256"
                                        onChange={e => this.setState({ cpassword: e.target.value, isCall: false })}
                                    />

                                {(passwordPolicy && secutiry_password) &&
                                        <div>
                                            <div style={{ "marginTop": "30px" }}>
                                                <h6> Your password must have </h6>
                                                {secutiry_password.is_alphanumeric_charaters &&
                                                    <div className="custom-control custom-checkbox">
                                                        <input checked={is_alphanumeric_charaters} type="checkbox" className="custom-control-input" id="defaultChecked1" disabled="disabled" />
                                                        <label style={{ "color": "#4ec47e" }} className="custom-control-label w-100" for="defaultChecked2">
                                                            At least {secutiry_password.password_criteria.alphanumeric_charaters} Alphanumeric charaters(a..z,A..Z)
                                                        </label>
                                                    </div>
                                                }

                                                {secutiry_password.is_mixed_upper_lower &&
                                                    <div className="custom-control custom-checkbox">
                                                        <input checked={is_mixed_upper_lower} type="checkbox" className="custom-control-input" id="defaultChecked1" disabled="disabled" />
                                                        <label style={{ "color": "#4ec47e" }} className="custom-control-label w-100" for="defaultChecked2">
                                                            Mixed of uppercase and lowercase
                                                        </label>
                                                    </div>
                                                }

                                                {secutiry_password.is_one_number &&
                                                    <div className="custom-control custom-checkbox">
                                                        <input checked={is_one_number} type="checkbox" className="custom-control-input" id="defaultChecked1" disabled="disabled" />
                                                        <label style={{ "color": "#4ec47e" }} className="custom-control-label w-100" for="defaultChecked2">
                                                            At least 1 number (0,9)
                                                        </label>
                                                    </div>
                                                }

                                                {secutiry_password.is_special_characters &&
                                                    <div className="custom-control custom-checkbox">
                                                        <input checked={is_special_characters} type="checkbox" className="custom-control-input" id="defaultChecked1" disabled="disabled" />
                                                        <label style={{ "color": "#4ec47e" }} className="custom-control-label w-100" for="defaultChecked2">
                                                            {"At least " + secutiry_password.password_criteria.special_characters + " Special characters(~!@#$%^&*()[]{}<>?+_)"}
                                                        </label>
                                                    </div>
                                                }

                                                {secutiry_password.is_minimum_password &&
                                                    <div className="custom-control custom-checkbox">
                                                        <input checked={is_minimum_password} type="checkbox" className="custom-control-input" id="defaultChecked1" disabled="disabled" />
                                                        <label style={{ "color": "#4ec47e" }} className="custom-control-label w-100" for="defaultChecked2">
                                                            At least {secutiry_password.password_criteria.minimum_password} minimum password length
                                                        </label>
                                                    </div>
                                                }

                                            </div>

                                            <h6 style={{ "marginTop": "30px" }}>Strength :  {strength_level[secutiry_password.strength_level]}</h6>
                                            <div className="progress" style={{ "width": "40%" }} > <div style={{ "width": strength_progress + "%" }} className={"progress-bar "+strength_level_color[secutiry_password.strength_level]} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                                        </div>
                                    }

                                    <div className="text-center py-4 mt-3">
                                        <Button type="submit" disabled={isLoginButtonDisabled} className='w-100 m-0 p-2'>
                                            Submit</Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
            // change password end
        );
    }
}



const mapDispatchToProps = (dispatch) => {
    return {
        GetPasswordConfig: () => dispatch(GetPasswordConfig()),
        changepassword: (data) => dispatch(changepassword(data)),
    };
}

export default connect(null, mapDispatchToProps)(ChangePasswordPage);
