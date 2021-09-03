import React, { Component, Fragment } from 'react';
import { Row, Col, Container, Button, FormGroup, Label } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import OtpInput from 'react-otp-input';
import queryString from 'query-string';
import { connect } from 'react-redux';
import * as ACT from '../../../../actions';
import auth from "../../../../actions/auth";
import { Toast } from '../../../../utils/helperFunctions';
import axios from '../../../../utils/axiosService';

class AccessOtpForm extends Component {
    constructor(props) {
        super()
        this.state = {
            res_code: "",
            otpcontact: "",
            isDisabled: true,
            otp: "",
            numInputs: 6,
            separator: '',
            hasErrored: false,
            isInputNum: false,
        }
    }

    componentWillMount() {

    }

    publicVerifyCode = () => {
        try {
            const { location } = this.props;
            //const { id } = queryString.parse(location.search);
            const id = this.props.user.ShareForm.formId;
            const sharing = this.props.user.ShareForm.sharing;
            var data = { to: this.state.otpcontact }
            axios.apis('POST', `/api/sendOTP?id=${id}&sharing=${sharing}`, data, auth.headers)
                .then(response => {
                    if (response.status_code == 200) {
                        this.setState({ res_code: response.message, isDisabled: false, });
                        Toast('We have sent code in your email or mobile.', 'success');
                    } else {
                        Toast('Your Email or Mobile is not Register, Please try again latter. ', 'error');
                    }
                }).catch(error => console.error(error))
        } catch (err) {
            Toast('Something went wrong, Please try again latter. ', 'error');
        }

    }

    publicHandleOtpChange = otp => {
        //console.log(otp);
        if (otp.length == 6) {
            if (this.state.res_code == otp) {
                const payload = this.props.user.ShareForm;
                payload["verifyOtp"] = true;
                this.props.SetShareForm(payload);
                this.props.history.push(`/public/form?id=${payload.formId}&sharing=${payload.sharing}`)
            } else {
                Toast('OTP incorrect.', 'error');
                this.setState({ otp: "" });
            }
        } else {
            this.setState({ otp });
        }
    };

    publicHandleSubmit = e => {
        e.preventDefault();
    };


    publicValidate = () => {
        var value = this.state.otpcontact
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        var phoneNum = /^\+[1-9]\d{1,14}$/;
        var isEmail = filter.test(value), isPhone = phoneNum.test(value);
        let isValid = (isEmail || isPhone) ? false : true;
        return isValid;
    }


    render() {
        const { otpcontact, isDisabled, otp, numInputs, hasErrored, isInputNum, separator } = this.state;
        return (
            <Fragment>
                <Row>
                    <Col md='10' className='mx-auto float-none z-depth-1 p-5'>
                        <div className="App">
                            <div className="card p-5">
                                <form onSubmit={this.publicHandleSubmit}>
                                    <div className="margin-top--small">
                                        <FormGroup controlId="otpcontact">
                                            <Label>{<FormattedMessage id="public.otpContact" />}</Label>
                                            <input
                                                id="otpcontact"
                                                type="text"
                                                className="form-control"
                                                placeholder="Email or Mobile"
                                                value={otpcontact}
                                                maxLength="256"
                                                required
                                                onChange={e => this.setState({ otpcontact: e.target.value })}
                                            />
                                        </FormGroup>

                                        <Button
                                            onClick={this.publicVerifyCode}
                                            className="btn margin-top--large"
                                            disabled={this.publicValidate()}>
                                            {isDisabled ? "Get OTP" : "Resend OTP"}
                                        </Button>
                                    </div>

                                    <br />


                                    <h2 className="text-center">Enter verification code</h2>
                                    <div className="margin-top-small tel-code">
                                        <OtpInput
                                            inputStyle={{
                                                width: '3rem',
                                                height: '3rem',
                                                margin: '0 .2rem',
                                                fontSize: '2rem',
                                                borderRadius: 4,
                                                border: '1px solid rgba(0,0,0,0.3)',
                                            }}
                                            value={otp}
                                            numInputs={numInputs}
                                            isDisabled={isDisabled}
                                            hasErrored={hasErrored}
                                            errorStyle="error"
                                            onChange={this.publicHandleOtpChange}
                                            separator={<span>{separator}</span>}
                                            isInputNum={isInputNum}
                                            shouldAutoFocus
                                        />
                                        <br />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Fragment>
        )
    }
}


const mapStateToProps = ({ user, form }) => ({
    user
})

const mapDispatchToProps = (dispatch) => ({
    SetShareForm: (formId) => dispatch(ACT.SetShareForm(formId)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AccessOtpForm)