import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import OauthPopup from 'react-oauth-popup';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import Cookies from 'universal-cookie';
import app_loader from '../../assets/images/app_loader.svg';
import { fetchUser, loadSidenavConfig } from '../../actions';
import { checkTenatLogin, getQueryString, Toast, GetTenantName } from "../../utils/helperFunctions";
import { verifyemails, doforget, login, loginwithMicrosoft, loginwithGoogle, loginwithSaml, GetPasswordConfig } from "../../actions/users";
import API from "../../config";

import constants from '../../config';
import './loginPage.css';

let authStateParam = btoa(JSON.stringify({ origin: window.location.origin }));
let microsoftUrls = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${constants.microsoftClientId}&scope=${encodeURIComponent(constants.microsoftLoginScopes)}&response_type=code&redirect_uri=${encodeURIComponent(constants.microsoftRedirectUri)}&state=${authStateParam}`
const cookie = new Cookies();

class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            isCall: false,
            isforget: false,
            isTenantLogin: false,
            secutiry_password: null,
            authentication_profile_type: 0,
            saml_type: 0,
            isError: false,
            password_attempted: cookie.get('PWA') || 0
        };
        this.onSubmit = this.onSubmit.bind(this);
    }



    componentWillMount = async () => {

        try {
            var QueryStringName = ""
            var QueryStringValue = ""
            const isExternalLogin = this.props.location.pathname == "/external/login" ? true : false;

            //Get Email and Verify code query string
            if (this.props.location.search) {
                var QueryStringName = this.props.location.search.split("?")[1].split("=")[0];
                var QueryStringValue = this.props.location.search.split("?")[1].split("=")[1];
                if (QueryStringName == "email") {
                    this.setState({ email: getQueryString().email });
                } else if (QueryStringName != "saml") {
                    this.verifyemail(QueryStringName, QueryStringValue);
                }
            }

            if (isExternalLogin && QueryStringName == "") {
                this.setState({ isError: true });
            } else if (!isExternalLogin && QueryStringName == "") {
                const resData = await this.props.GetPasswordConfig();
                if (resData.authentication_profile_type == 2) {
                    window.location.href = API.BASE_API_URL + "/auth/saml/login"
                } else {
                    this.setState({ authentication_profile_type: 1 });
                }
            }

            //If Open Tenant Login
            if (checkTenatLogin()) {
                this.setState({ isTenantLogin: true });
            }

            //If User Login with Social Account
            if (this.props.match.params.google_id && this.props.match.params.google_id != 0) {
                this.props.loginwithGoogle(this.props.match.params.google_id).then(response => {
                    if (response.status === false) {
                        Toast(response.message);
                        throw "error";
                    } else {
                        if (this.props.ShareForm) {
                            this.props.history.push(`/public/form?id=${this.props.ShareForm.formId}&sharing=${this.props.ShareForm.sharing}`)
                        }
                    }
                }).catch(err => {
                    throw "error";
                })
            }

            //If User access Saml 
            if (QueryStringName == "saml") {
                const requestParmas = isExternalLogin ? { samlKey: QueryStringValue, isExternalLogin: true } : { samlKey: QueryStringValue };
                const samlResponse = await this.props.loginwithSaml(requestParmas);
                if (samlResponse.status === false) {
                    Toast(samlResponse.message);
                    throw samlResponse;
                }
            }

        } catch (err) {
            this.setState({ isError: true });
        }
    }

    handleOauthResponse = (code) => {
        console.log("code handleOauthResponse: ", code)
        try {
            if (code) {
                let postData = { code };
                this.props.loginwithMicrosoft(postData).then(response => {
                    if (response.status === false) {
                        Toast(response.message);
                        throw "error";
                    } else {
                        if (this.props.ShareForm) {
                            this.props.history.push(`/public/form?id=${this.props.ShareForm.formId}&sharing=${this.props.ShareForm.sharing}`)
                        }
                    }
                });
            }
        } catch (err) {
            this.setState({ isError: true });
        }

    }

    onSubmit(e) {
        e.preventDefault();
        this.state.isCall = true;
        const password_attempted = Number(this.state.password_attempted) + 1;
        var payload = {
            email: this.state.email,
            password: this.state.password,
            isLogin: this.state.isTenantLogin ? 2 : 1,
            connection: this.props.connection,
            password_attempted: password_attempted
        }
        this.props.login(payload).then(response => {
            if (response.status === false) {
                if (response.message == "Please enter a valid password.") {
                    cookie.set('PWA', password_attempted, { path: '/login', maxAge: 3000 });
                    this.setState({ password_attempted });
                }
                Toast(response.message);
            } else {
                cookie.remove('PWA');
                if (this.props.ShareForm) {
                    this.props.history.push(`/public/form?id=${this.props.ShareForm.formId}&sharing=${this.props.ShareForm.sharing}`)
                }
                this.props.loadSidenavConfig('5f190371db85375976b48101');
            }
        });

    }

    verifyemail = async (name, value) => {
        try {
            var response = await this.props.verifyemails(value);
            if (name === "token") {
                if (response.status === true) {
                    this.props.history.push("/changepassword/" + response.user_id);
                } else {
                    Toast(response.message, 'error2');
                    throw true
                }
            } else {
                Toast(response.message, 'info');
                throw true
            }
        } catch (err) {
            this.setState({ isError: true });
        }

    }

    forgetPassword = () => {
        this.setState({ isforget: true })
    }

    isLogin = () => {
        this.setState({ isforget: false })
    }

    onSubmitforget = (e) => {
        e.preventDefault();
        let { email } = this.state;
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!filter.test(email)) {
            Toast("Please enter valid email address.", 'error');
        } else {
            this.props.doforget({ email: email }).then(res => {
                Toast(res.message, 'info');
                if (res.status == true) {
                    this.setState({ isforget: false, email: "", password: "" })
                }
            });
        }
    }

    render() {

        let { email, password, isforget, isTenantLogin, authentication_profile_type, isError } = this.state;
        const isLoginButtonDisabled = !email || !password;
        return (
            <div className='login'>
                {authentication_profile_type == 1 &&
                    <div>
                        {!isforget ?
                            // main login start
                            <Container>
                                <Row className='h-100 justify-content-center'>
                                    <Col xs="10" sm="6" md="8" lg="5" className="my-auto">
                                        <Card className="mt-2">
                                            <CardBody>
                                                <form onSubmit={this.onSubmit} style={{ "textAlign": "left" }}>
                                                    <p className="h4 text-center py-4 brand-font-color">LOG IN</p>
                                                    <label htmlFor="lblEmail">
                                                        Email</label>
                                                    <input
                                                        type="text"
                                                        id="lblEmail"
                                                        className="form-control"
                                                        value={email}
                                                        maxLength="256"
                                                        onChange={e => this.setState({ email: e.target.value.toLowerCase(), isCall: false })}
                                                    />
                                                    <br />
                                                    <label htmlFor="lblPassword">
                                                        Password
                                                    </label>
                                                    <input
                                                        id="lblPassword"
                                                        type="password"
                                                        className="form-control"
                                                        value={password}
                                                        maxLength="256"
                                                        onChange={e => this.setState({ password: e.target.value, isCall: false })}
                                                    />
                                                    <div className="form-check form-check-inline">
                                                        <input className="form-check-input" type="checkbox" name="is_notify_email" />
                                                        <label className="form-check-label" htmlFor="inlineRadio1">Stay signed in?</label>
                                                    </div>
                                                    <div className="text-center mt-3">
                                                        <Button type="submit" variant="flat" disabled={isLoginButtonDisabled} className='w-100 m-0 p-2 brand-background-color'>Sign In</Button>
                                                        <div className="justify-content-between mt-2 d-flex small small-link">
                                                            {/* for tenant login we are not showing registration link */}
                                                            {!isTenantLogin && <Link to="/registration" onClick={this.handleClickDashboard}>Register a new account</Link>}
                                                            <a href="#" onClick={this.forgetPassword}>Reset Password</a>
                                                        </div>
                                                    </div>
                                                </form>

                                                {(!isTenantLogin) && <div>
                                                    <div className="or-seperator"><i>or</i></div>
                                                    <a href={API.BASE_API_URL + "/auth/google"}>
                                                        <button type="button" className="google-button">
                                                            <span className="google-button__icon">
                                                                <svg viewBox="0 0 366 372" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M125.9 10.2c40.2-13.9 85.3-13.6 125.3 1.1 22.2 8.2 42.5 21 59.9 37.1-5.8 6.3-12.1 12.2-18.1 18.3l-34.2 34.2c-11.3-10.8-25.1-19-40.1-23.6-17.6-5.3-36.6-6.1-54.6-2.2-21 4.5-40.5 15.5-55.6 30.9-12.2 12.3-21.4 27.5-27 43.9-20.3-15.8-40.6-31.5-61-47.3 21.5-43 60.1-76.9 105.4-92.4z" id="Shape" fill="#EA4335" />
                                                                    <path d="M20.6 102.4c20.3 15.8 40.6 31.5 61 47.3-8 23.3-8 49.2 0 72.4-20.3 15.8-40.6 31.6-60.9 47.3C1.9 232.7-3.8 189.6 4.4 149.2c3.3-16.2 8.7-32 16.2-46.8z" id="Shape" fill="#FBBC05" />
                                                                    <path d="M361.7 151.1c5.8 32.7 4.5 66.8-4.7 98.8-8.5 29.3-24.6 56.5-47.1 77.2l-59.1-45.9c19.5-13.1 33.3-34.3 37.2-57.5H186.6c.1-24.2.1-48.4.1-72.6h175z" id="Shape" fill="#4285F4" /><path d="M81.4 222.2c7.8 22.9 22.8 43.2 42.6 57.1 12.4 8.7 26.6 14.9 41.4 17.9 14.6 3 29.7 2.6 44.4.1 14.6-2.6 28.7-7.9 41-16.2l59.1 45.9c-21.3 19.7-48 33.1-76.2 39.6-31.2 7.1-64.2 7.3-95.2-1-24.6-6.5-47.7-18.2-67.6-34.1-20.9-16.6-38.3-38-50.4-62 20.3-15.7 40.6-31.5 60.9-47.3z" fill="#34A853" />
                                                                </svg>
                                                            </span>
                                                            <span className="google-button__text">Sign in with Google</span>
                                                        </button>
                                                    </a>

                                                    {/* Microsoft Login Button */}
                                                    <OauthPopup url={microsoftUrls} onClose={this.onClose} onCode={this.handleOauthResponse}>
                                                        <button type="button" className="google-button mt-1">
                                                            <span className="google-button__icon">
                                                                <svg id="svg" viewBox="0 0 366 372" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                                    <g id="svgg">
                                                                        <path id="path0" d="M62.399 206.405 C 62.398 206.622,62.397 236.275,62.396 272.300 L 62.395 337.800 127.873 337.901 C 179.992 337.982,193.416 337.900,193.670 337.501 C 194.074 336.864,194.096 335.893,193.700 336.138 C 193.535 336.240,193.490 307.316,193.600 271.862 C 193.733 229.118,193.665 207.301,193.400 207.106 C 193.156 206.927,193.204 206.810,193.524 206.806 C 193.812 206.803,193.935 206.619,193.799 206.398 C 193.458 205.846,62.400 205.853,62.399 206.405 " stroke="none" fill="#04acec" fillRule="evenodd"></path>
                                                                        <path id="path1" d="M206.268 62.265 C 206.121 62.413,206.000 92.113,206.000 128.267 L 206.000 194.000 272.001 194.000 L 338.002 194.000 337.901 128.100 L 337.800 62.200 272.168 62.099 C 236.070 62.043,206.415 62.118,206.268 62.265 " stroke="none" fill="#84cc2c" fillRule="evenodd"></path>
                                                                        <path id="path2" d="M62.185 62.500 C 62.080 62.775,62.041 92.430,62.097 128.400 L 62.200 193.800 128.100 193.901 L 194.000 194.002 194.000 128.001 L 194.000 62.000 128.187 62.000 C 75.905 62.000,62.336 62.103,62.185 62.500 " stroke="none" fill="#f4541c" fillRule="evenodd"></path>
                                                                        <path id="path3" d="M206.185 206.499 C 206.080 206.774,206.041 236.430,206.097 272.400 L 206.200 337.800 272.000 337.800 L 337.800 337.800 337.800 272.000 L 337.800 206.200 272.088 206.099 C 219.729 206.018,206.337 206.099,206.185 206.499 " stroke="none" fill="#fcbc0c" fillRule="evenodd"></path>
                                                                        <path id="path4" d="M62.195 272.200 C 62.195 308.060,62.242 322.671,62.300 304.668 C 62.358 286.666,62.358 257.326,62.300 239.468 C 62.242 221.611,62.195 236.340,62.195 272.200 M193.600 272.280 C 193.490 307.524,193.536 336.224,193.701 336.059 C 193.867 335.893,193.957 307.057,193.901 271.979 L 193.800 208.200 193.600 272.280 " stroke="none" fill="#04acf4" fillRule="evenodd"></path>
                                                                    </g>
                                                                </svg>
                                                            </span>
                                                            <span className="google-button__text">Sign in with Microsoft</span>
                                                        </button>
                                                    </OauthPopup>

                                                    {(this.props.ShareForm) &&
                                                        <div>
                                                            <div className="or-seperator mt-2"><i>or</i></div>
                                                            <Link to="/public/access-otp-form"><Button type="button" variant="flat" className='w-100 m-0 p-2 brand-background-color'>OTP</Button></Link>
                                                        </div>
                                                    }
                                                </div>
                                                }

                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>
                            :
                            // Forgot Password start
                            <Container>
                                <Row className='justify-content-center'>
                                    <Col xs="6" sm="6" md="6" lg="6" >
                                        <Card className='m-5'>
                                            <CardBody>
                                                <form onSubmit={this.onSubmitforget}>
                                                    <p className="h4 text-center py-4 brand-font-color">GLOZIC</p>
                                                    <label htmlFor="lblEmail">
                                                        Your Registered Email</label>
                                                    <input
                                                        type="text"
                                                        id="lblEmail"
                                                        className="form-control"
                                                        value={email}
                                                        maxLength="256"
                                                        onChange={e => this.setState({ email: e.target.value.toLowerCase(), isCall: false })}
                                                    />
                                                    <div className="text-center py-4 mt-3">
                                                        <Button type="submit" variant="flat" disabled={!email} className='w-100 m-0 p-2'> Submit</Button>
                                                        <div className="mt-2 small">
                                                            <a href="#" onClick={this.isLogin}>Back to Login</a>
                                                        </div>
                                                    </div>
                                                </form>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>
                        }
                    </div>

                }
                {authentication_profile_type == 0 &&
                    <Container>
                        <Row className='h-100 justify-content-center'>
                            <Col xs="10" sm="6" md="8" lg="5" className="my-auto">
                                <Card className="mt-2">
                                    <CardBody>
                                        {!isError && <h1 className="text-white">Please wait <img width="20%" src={app_loader} /></h1>}
                                        {isError && <h1 className="text-white">Connectin failed, Please try again.</h1>}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                }

            </div>
        );

    }
}

const mapStateToProps = (state) => {
    return {
        User_data: state.user.User_data,
        connection: state.user.TenantConnection,
        loginError: state.user.loginError,
        ShareForm: state.user.ShareForm
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        GetPasswordConfig: () => dispatch(GetPasswordConfig()),
        login: (payload) => dispatch(login(payload)),
        verifyemails: (code) => dispatch(verifyemails(code)),
        doforget: (email) => dispatch(doforget(email)),
        loadSidenavConfig: (appName) => dispatch(loadSidenavConfig(appName)),
        loginwithGoogle: (data) => dispatch(loginwithGoogle(data)),
        loginwithSaml: (data) => dispatch(loginwithSaml(data)),
        loginwithMicrosoft: (data) => dispatch(loginwithMicrosoft(data)),
        fetchUser: () => dispatch(fetchUser())

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
