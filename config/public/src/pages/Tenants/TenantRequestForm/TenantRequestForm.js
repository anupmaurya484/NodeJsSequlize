import React, { Component, Fragment } from 'react';
import { Card, CardBody, Modal, ModalBody, ModalHeader } from 'reactstrap';
import StepWizard from 'react-step-wizard';
import FirstStep from './Components/FirstStep';
import SecondStep from './Components/SecondStep';
import ThirdStep from './Components/ThirdStep';
import FourStep from './Components/FourStep';
import LastStep from './Components/LastStep';
import NavStep from './Components/NavStep';
import { TenantRequest, AddCompany } from '../../../actions/admin';
import './TenantRequest.css';


class TenantRequestForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showConnectSuccess: false,
            is_complete: true,
            data: props.data ? props.data : {
                hostname: "",
                email: "",
                address: "",
                mobile_number: "",
                company_name: "",
                country: "",
                db_user: "",
                database_url: "",
                db_password: "",
                emailDomain: "",
            }
        }
    }

    onSubmitNextForm = async (submit_data, steps, _childProps) => {
        console.log({
            ...this.state.data,
            ...submit_data
        });
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                ...submit_data
            }
        });
        if (steps != 3) {
            _childProps.nextStep();
        } else {
            this.onFinalSubmitForm({
                ...this.state.data,
                ...submit_data
            }, _childProps);
        }

    }


    onFinalSubmitForm = async (data, _childProps) => {
        const payload = {
            firstname: data.firstname,
            lastname: data.lastname,
            full_name: this.props.user.firstname + " " + this.props.user.lastname,
            hostname: data.hostname,
            email_address: data.email,
            emailDomain: data.emailDomain,
            address: data.address,
            mobile: data.mobile_number,
            company_name: data.company_name,
            user: this.props.user._id,
            country_code: data.country,
            database_url: data.is_system ? false : data.database_url,
            dev_database_url: data.is_system ? false : data.dev_database_url
        }
        const Request = this.props.user.level == "8" ? AddCompany : TenantRequest;
        Request(payload).then(response => {
            if (response.status) {
                this.setState({ is_complete: true });
                _childProps.nextStep();
            } else {
                this.setState({ is_complete: false });
                _childProps.nextStep();
                Toast(response.message, 'error')
            }
        });
    }

    onClose = (code) => {
        console.log("code: ", code)
        console.log("closed!");
    }

    render() {

        const { data, showConnectSuccess, is_complete } = this.state
        const props = this.props;
        return (
            <Card style={{ "backgroundColor": "#f9f9f9" }}>
                <CardBody>
                    <div className={`col-12`}>
                        <StepWizard initialStep={1} nav={<NavStep />}>
                              <FirstStep
                                user={props.user}
                                CheckTenantValidForm={props.CheckTenantValidForm}
                                getUrl={props.getUrl}
                                data={data}
                                history={props.history}
                                onClose={this.props.onClose}
                                handleNext={this.onSubmitNextForm}
                                showConnectSuccess={showConnectSuccess} /> 
                            <SecondStep
                                data={data}
                                history={props.history}
                                handleNext={this.onSubmitNextForm}
                                onClose={this.props.onClose} />

                            <ThirdStep
                                data={data}
                                onClose={this.props.onClose}
                                handleNext={this.onSubmitNextForm}
                                history={this.props.history}
                            /> 

                            <LastStep
                                gotoWorkflowSetup={() => console.log()}
                                onClose={this.props.onClose}
                                history={this.props.history}
                                is_complete={is_complete} />
                        </StepWizard>
                    </div>

                    {showConnectSuccess == 2 &&
                        <div className={`col-12 mt-1 text-center`}>
                            <div className="alert alert-danger">
                                <strong>Error!</strong> Connection Failed, Please try again!.
					</div>
                        </div>
                    }
                </CardBody>
            </Card>
        )
    }
}

export default TenantRequestForm