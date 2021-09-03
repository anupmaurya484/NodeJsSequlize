import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Button, FormGroup, Label, Input } from 'reactstrap';
import { Toast, hiddenDatabasePassword } from '../../../../src/utils/helperFunctions';
import { FormattedMessage } from 'react-intl';
import config from '../../../config'
class TenantApprovedForms extends Component {

  constructor(props) {
    super(props);
    this.state = {
      _id: "",
      user_id: "",
      company_name: "",
      company_email: "",
      address: "",
      country: "",
      hostname: "",
      emailDomain: "",
      db_url: "",
      dev_db_url: "",
      firstname: "",
      lastname: "",
      mobile: "",
      user_info: "",
      is_active: "",
      request_status: 0,
      updated_request_status: 0,
      selected: [],
      options: [],
      apps_details: "",
      isEmailUnique: null,
      isTenantUnique: null,
      isEmailDomain: null,
      inValidTenant: null,
      is_custom_url: false
    }
  }

  onChange = (selected) => {
    this.setState({ selected });
  };

  componentDidMount() {
    const { userdata, Allapps } = this.props;
    var options = [], selected = [];

    if (Allapps) {
      var apps_details = Allapps
      apps_details.apps.forEach(ele => {
        options.push({ value: ele.name, label: ele.name })
      });

      apps_details.tananta.apps.forEach(ele => (!selected.includes(ele.name)) ? selected.push(ele.name) : '')
    }

    this.setState({
      _id: userdata._id || "",
      user_id: userdata.createdBy,
      company_name: userdata.company_name,
      company_email: userdata.email,
      address: userdata.address,
      country: userdata.country_code,
      hostname: userdata.hostname,
      emailDomain: userdata.emailDomain,
      db_url: userdata.configuration ? (userdata.configuration.database_url ? userdata.configuration.database_url : "") : "",
      dev_db_url: userdata.configuration ? (userdata.configuration.dev_database_url ? userdata.configuration.dev_database_url : "") : "",
      firstname: userdata.full_name.split(" ")[0],
      lastname: userdata.full_name.split(" ")[1],
      mobile: userdata.mobile_number,
      is_active: userdata.is_active,
      request_status: userdata.request_status,
      domain: userdata.domain,
      apps_details: apps_details,
      options: options,
      selected: selected,
      apps_details: "",
      IsAddTenant: userdata.IsAddTenant
    });
  }

  onSubmit = (e) => {
    e.preventDefault()
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(this.state.company_email)) {
      Toast("Please enter valid email address.")
    } else {
      this.props.addCompany(this.state)
    }
  }

  ActiveDeactiveTenantCompany = (id, is_flag) => {
    this.setState({ is_active: is_flag })
    // this.props.ActiveDeactiveTenantCompany({ id: id, is_flag: is_flag });
  }

  mergeTenant = (e) => {
    e.preventDefault()
    console.log(this.state.selected);
    const { userdata, Allapps } = this.props;
    var apps_details = Allapps;
    console.log(apps_details);

    var data = [];
    this.state.selected.forEach(ele => {
      if (!(apps_details.tananta.apps.some(x => x.name == ele))) {
        apps_details.apps.forEach(eleapps => {
          if (ele == eleapps.name) {
            data.push({
              name: eleapps.name,
              icon: eleapps.icon,
              link: eleapps.link,
              sidenav: eleapps.sidenav,
              is_system: eleapps.is_system,
            });
          }
        });
      }

    });

    var payload = {
      db_connection: (userdata.db_connection == "") ? (userdata.company ? userdata.company.database_url : "") : userdata.db_connection,
      emailDomain: userdata.emailDomain,
      tanant_id: Allapps.tananta.tanant_id,
      firstname: Allapps.tananta.firstname,
      lastname: Allapps.tananta.lastname,
      level: Allapps.tananta.level,
      apps: data,
      sidenavs: Allapps.tananta.sidenavs
    }

    if (data.length != 0) {
      this.props.MergeApss(payload);
    } else {
      Toast("Please add apps in tanant user.")
    }
  }

  handleCheckUpdatedStatus = ({ target }, status) => {

    if (target.checked == true) {
      this.setState({ updated_request_status: status })
    } else {
      this.setState({ updated_request_status: 0 })
    }
  }

  _handleKeyDown = async ({ target }) => {
    if (target.value != "") {
      var payload = { name: target.name, value: target.value };
      payload.name = (target.name == "company_email") ? "email" : target.name;
      const result = await this.props.CheckTenantValidForm(payload);
      console.log(result);
      const status = result.data;
      if (target.name == "company_email") {
        const emailDomain = status == false ? (target.value.split("@").length == 2 ? target.value.split("@")[1] : "") : ""
        this.setState({ isEmailUnique: status, emailDomain: emailDomain });
      }
      if (target.name == "hostname") {
        this.setState({ isTenantUnique: status });
      }
      if (target.name == "emailDomain") {
        this.setState({ isEmailDomain: status });
      }
    }
  }

  OnchnageTenantInputForm = ({ target }) => {
    var inValidTenantName = ["intranet", "internet", "home", "www", "dashboard", "api", "history", "reports", "workflow", "public"];
    const name = target.value.replace(" ", "")
    this.setState({ hostname: name, inValidTenant: inValidTenantName.includes(name) })
  }

  onChangeCustomUrl = (type) => {
    if (type == 1) {
      const db_url = config.systemMongoURI.replace("<<TenantDomain>>", this.state.hostname);
      const dev_db_url = config.systemMongoURI.replace("<<TenantDomain>>", this.state.hostname + '-dev');
      this.setState({ db_url: db_url, dev_db_url: dev_db_url, is_custom_url: 1 });
    } else {
      this.setState({ db_url: "", is_custom_url: 2 });
    }
  }



  render() {
    const {
      _id,
      company_name,
      company_email,
      emailDomain,
      hostname,
      country,
      firstname,
      lastname,
      mobile,
      address,
      db_url,
      dev_db_url,
      is_active,
      request_status,
      updated_request_status,
      selected,
      options,
      IsAddTenant,
      isEmailUnique,
      isTenantUnique,
      isEmailDomain,
      inValidTenant,
      is_custom_url
    } = this.state;
    const isLoginButtonDisabled = !firstname || !lastname || !company_email || !company_name || !emailDomain || !db_url || !mobile || (IsAddTenant ? (isEmailUnique || isTenantUnique || isEmailDomain || inValidTenant) : false);
    const { userdata } = this.props;

    return (
      <Fragment>
        <Form onSubmit={this.onSubmit} controlId="tenantapprove">
          <Row className='justify-content-center'>
            <Col md="4">
              <FormGroup controlId="company_name">
                <Label>{<FormattedMessage id="Tenant.company_name" />}</Label>
                <Input
                  type="text"
                  readOnly={this.props.loginUser.level != 8}
                  value={company_name}
                  name="company_name"
                  onChange={(e) => this.setState({ company_name: e.target.value })}
                  placeholder="Enter company name" />
              </FormGroup>
            </Col>

            <Col md="4">
              <FormGroup controlId="company_email">
                <Label>{<FormattedMessage id="Tenant.company_email" />}</Label>
                <Input
                  type="text"
                  value={company_email}
                  readOnly={(IsAddTenant ? false : true)}
                  name="company_email"
                  onBlur={this._handleKeyDown}
                  onChange={(e) => this.setState({ company_email: e.target.value })}
                  placeholder="Enter company Email"
                  maxLength="256" />
              </FormGroup>
              {isEmailUnique === true && <p className="text-danger" style={{ margin: "5px" }}>Tenant Business Email Already Exist.</p>}
            </Col>

            <Col md="4">
              <FormGroup controlId="emailDomain">
                <Label>Email Domain</Label>
                <Input
                  type="text"
                  value={emailDomain}
                  readOnly={(IsAddTenant ? false : true)}
                  name="emailDomain"
                  onBlur={this._handleKeyDown}
                  onChange={(e) => this.setState({ emailDomain: e.target.value })}
                  placeholder="Enter company email Domain"
                  maxLength="256" />
              </FormGroup>
              {isEmailDomain === true && <p className="text-danger" style={{ margin: "5px" }}>Email Domain Already Exist.</p>}
            </Col>
            <Col md="4">
              <FormGroup controlId="hostname">
                <Label>Tenant Name</Label>
                <Input
                  type="text"
                  value={hostname}
                  readOnly={(IsAddTenant ? false : true)}
                  name="hostname"
                  onBlur={this._handleKeyDown}
                  onChange={this.OnchnageTenantInputForm}
                  placeholder="Enter tenant name"
                  maxLength="256" />
              </FormGroup>
              {isTenantUnique === true && <p className="text-danger" style={{ margin: "5px" }}>Tenant Domain Already Exist.</p>}
              {inValidTenant === true && <p className="text-danger" style={{ margin: "5px" }}>Tenant Domain Not Valid.</p>}
            </Col>
            <Col md="4">
              <FormGroup controlId="firstname">
                <Label><FormattedMessage id="Tenant.firstname" /></Label>
                <Input
                  type="text"
                  value={firstname}
                  readOnly={this.props.loginUser.level != 8}
                  name="firstname"
                  onChange={(e) => this.setState({ firstname: e.target.value })}
                  placeholder="Enter first name"
                  maxLength="256" />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup controlId="lastname">
                <Label><FormattedMessage id="Tenant.lastname" /></Label>
                <Input
                  type="text"
                  value={lastname}
                  readOnly={this.props.loginUser.level != 8}
                  name="lastname"
                  onChange={(e) => this.setState({ lastname: e.target.value })}
                  placeholder="Enter last name"
                  maxLength="256" />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup controlId="mobile">
                <Label>Mobile</Label>
                <Input
                  type="text"
                  value={mobile}
                  readOnly={this.props.loginUser.level != 8}
                  name="mobile"
                  onChange={(e) => this.setState({ mobile: e.target.value })}
                  placeholder="Enter mobile number"
                  maxLength="10" />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup controlId="address">
                <Label><FormattedMessage id="Tenant.address" /></Label>
                <Input
                  type="text"
                  value={address}
                  readOnly={this.props.loginUser.level != 8}
                  name="address"
                  onChange={(e) => this.setState({ address: e.target.value })}
                  placeholder="Enter address"
                  maxLength="256" />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup controlId="country">
                <Label><FormattedMessage id="Tenant.country" /></Label>
                <Input
                  type="text"
                  value={country}
                  readOnly={this.props.loginUser.level != 8}
                  name="country"
                  onChange={(e) => this.setState({ country: e.target.value })}
                  placeholder="Enter country"
                  maxLength="256" />
              </FormGroup>
            </Col>
            {(db_url || this.props.loginUser.level == 8) &&
              <Col md="12">
                <FormGroup controlId="db_user">
                  <Label><FormattedMessage id="Tenant.db_user" /></Label>
                  <Input
                    type="text"
                    value={hiddenDatabasePassword(db_url)}
                    readOnly={true}
                    name="db_url"
                    onChange={(e) => this.setState({ db_url: e.target.value })}
                    placeholder="Enter mongo database " />
                </FormGroup>
              </Col>
            }

            {(dev_db_url || this.props.loginUser.level == 8) &&
              <Col md="12">
                <FormGroup controlId="dev_db_url">
                  <Label><FormattedMessage id="Tenant.dev_db_user" /></Label>
                  <Input
                    type="text"
                    value={hiddenDatabasePassword(dev_db_url)}
                    readOnly={true}
                    name="dev_db_url"
                    onChange={(e) => this.setState({ dev_db_url: e.target.value })}
                    placeholder="Enter mongo database " />
                </FormGroup>
              </Col>
            }

            {(request_status == 1 && this.props.loginUser.level == 8) &&
              <Col md="12" className='pt-2'>
                <div className="custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" id="customSwitch1" checked={is_active}
                    onChange={(e) => this.ActiveDeactiveTenantCompany(_id, e.target.checked)} />
                  <label className="custom-control-label" htmlFor="customSwitch1">{is_active ? "Activate" : "Deactivate"}</label>
                </div>
              </Col>
            }
            {(!is_active && request_status == 0 && this.props.loginUser.level == 8) &&
              <Fragment>
                <Col md="6">
                  <FormGroup controlId="formBasicCheckbox1">
                    <Label>Approve Tenant</Label>
                    <Input
                      type="checkbox"
                      className="ml-2"
                      checked={updated_request_status == 1}
                      onChange={event => this.handleCheckUpdatedStatus(event, 1)}
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  {!IsAddTenant &&
                    <FormGroup controlId="formBasicCheckbox2">
                      <Label className="mr-5">Reject Tenant</Label>
                      <Input
                        type="checkbox"
                        checked={updated_request_status == 2}
                        onChange={event => this.handleCheckUpdatedStatus(event, 2)}
                      />
                    </FormGroup>
                  }
                </Col>
              </Fragment>
            }
          </Row>

          {((request_status == 0 || request_status == 1) && this.props.loginUser.level == 8) && <div className="text-center py-4">
            <Button type="submit" className='w-10 mt-2 p-2' onClick={(e) => this.onSubmit(e)} disabled={isLoginButtonDisabled}>
              {IsAddTenant ? "Add Company" : "Update Company"}
            </Button>
          </div>
          }
        </Form>
      </Fragment>
    )

  }
}

export default TenantApprovedForms