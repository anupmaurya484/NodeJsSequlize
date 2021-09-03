import React, { Component, Fragment, useState } from 'react';
import Select from "react-select";
import { connect } from "react-redux";
import { Col, Row, Button, Input, Card, Container, Modal, UncontrolledDropdown, ModalHeader, ModalBody, ModalFooter, DropdownItem, DropdownToggle, DropdownMenu, CardBody } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import { TenantRequest, GetTenantRequest, AddCompany, DeletedCompany, GetPassword, Appslist, MergeApssData, ActiveDeactiveTenantCompany, CheckTenantValidForm } from '../../../actions/admin';
import Breadcrumbs from '../../../components/Common/Breadcrumb'
import TenantApprovedForms from '../TenantApprovedForm';
import TenantRequestForm from '../TenantRequestForm';
import { getUrl } from "../../../utils/helperFunctions";
import constant from "../../../utils/constant"
import { Toast } from '../../../utils/helperFunctions';
import DataTable from "../../../components/DataTable"
import ModalConfirmation from '../../../components/ModalConfirmation';
import CustomToggle from '../../../components/CustomToggle';
import API from '../../../config';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './TenantLists.css';
import { faSmileWink } from '@fortawesome/free-solid-svg-icons';


const countryOptions = constant.countrys;

class TenantLists extends Component {

	constructor(props) {
		super(props);
		this.state = {
			hostname: "",
			email: "",
			address: "",
			mobile_number: "",
			company_name: "",
			user: "",
			full_name: "",
			country: "",
			db_user: "",
			db_connection: "",
			db_password: "",
			emailDomain: "",
			is_system: true,
			tenantLists: [],
			is_approved: false,
			is_user_info: false,
			userdata: null,
			is_password: null,
			Allapps: null,
			ConfirmationModelTitle: '',
			ConfirmationText: '',
			selected_data: null,
			is_from: 0,
			IsModalConfirmation: false,
			IsModalConfirmationApproveReject: false,
			selected_id: 0,
			isConfirmFrom: 0,
			isEmailUnique: null,
			isTenantUnique: null,
			isEmailDomain: null,
			isDataBasevalid: null,
			inValidTenant: null,
			is_active_lists: false,
			confirmDeleteValue: "",
			PageRecord: 10,
			PageNo: 1,
			search: "",
			DataCount: 0,
			totalCount: 0,
			isRequestForm: false
		};
		//this.onSubmit = this.onSubmit.bind(this);
	}

	componentDidMount() {
		const { PageRecord } = this.state;
		const { request: requestType } = queryString.parse(this.props.location.search);
		if (!requestType) {
			this.onload();
		} else {
			console.log(requestType);
			this.setState({ isRequestForm: true })
		}
	}

	onload() {
		const that = this;
		const path = window.location.pathname;
		const { User_data } = this.props;
		this.setState({ user: User_data._id, full_name: User_data.firstname + " " + User_data.lastname });
		var RequestPayload = (User_data.level != "8") ? { id: User_data._id } : { id: 0 };
		GetTenantRequest(RequestPayload).then(res => {
			that.setState({ tenantLists: res.data, is_approved: false, userdata: null });
		});
	}

	addCompany = (e) => {
		const { User_data } = this.props;
		const that = this;
		AddCompany(e).then(res_data => {
			this.onload();
			if (!res_data.status) {
				Toast(res_data.message)
				this.setState({ is_approved: false, userdata: null });
			} else {
				Toast(res_data.message)
			}
		});
	}

	GetPassword = (e) => {
		if (e.is_active == true) {
			GetPassword({ email: e.email, hostname: e.name }).then(resData => {
				if (resData.status) {
					this.setState({ is_password: true, userdata: { email: e.email, password: resData.data } })
				} else {
					Toast("Please Enter Business Email Address.")
				}
			})
		}
	}

	OpenModel = (is_approved, items) => {
		if (items.is_active) {
			var payload = {
				"_id": this.props.User_data._id,
				"db_connection": (items.db_connection == "") ? (items.company ? items.company.database_url : "") : items.db_connection,
				"domain": items.domain
			}
			if (items.user) {
				this.props.Appslist(payload).then(data => {
					this.setState({ is_approved: is_approved, userdata: items, Allapps: data.data })
				});
			} else {
				Toast("Something worng, Please contact to support team.")
			}
		} else {
			this.setState({ is_approved: is_approved, userdata: items, Allapps: false })
		}
	}

	MergeApss = (RequestData) => {
		this.state.Allapps.tananta.apps.forEach(eleapp => {
			for (var i = 0; i < RequestData.apps.length; i++) {
				if (eleapp.name == RequestData.apps[i].name) {
					RequestData.apps.splice(0, i);
				}
			}
		});
		this.props.MergeApssData(RequestData).then(data => {
			Toast("Tenant apps merge successfull.")
		});
	}

	tenantApprovedRejected(userdata, request_status) {
		let requestPayload = {
			_id: userdata._id,
			user_id: userdata.createdBy,
			company_name: userdata.company_name,
			company_email: userdata.email,
			address: userdata.address,
			country: userdata.country_code,
			hostname: userdata.hostname,
			emailDomain: userdata.emailDomain,
			db_url: userdata.configuration.database_url ? userdata.configuration.database_url : "",
			firstname: userdata.full_name.split(" ")[0],
			lastname: userdata.full_name.split(" ")[1],
			mobile: userdata.mobile_number,
			is_active: userdata.is_active,
			request_status: request_status,
			updated_request_status: request_status,
			domain: userdata.domain
		}
		this.addCompany(requestPayload);
		this.setState({ IsModalConfirmationApproveReject: false });
	}

	openConfirmation(userdata, is_from) {
		// 1 => Delete 
		// 2 => Approve
		// 3 => Reject  
		let ConfirmationModelTitle, ConfirmationText;
		switch (is_from) {
			case 1:
				ConfirmationModelTitle = 'Delete';
				ConfirmationText = 'Are you sure you want to delete?';
				break;
			case 2:
				ConfirmationModelTitle = 'Approve';
				ConfirmationText = 'Are you sure you want to Approve?';
				break;
			case 3:
				ConfirmationModelTitle = 'Reject';
				ConfirmationText = 'Are you sure you want to Reject?';
				break;

			default:
				break;
		}
		this.setState({ selected_id: userdata._id, selected_data: userdata, IsModalConfirmationApproveReject: true, IsModalConfirmation: false, ConfirmationModelTitle, ConfirmationText, isConfirmFrom: is_from })
	}

	handelConfirmApproveReject() {
		const that = this;
		const { isConfirmFrom, selected_data } = this.state;
		debugger;
		if (isConfirmFrom === 2) {
			this.tenantApprovedRejected(selected_data, 1)
		} else if (isConfirmFrom === 3) {
			this.tenantApprovedRejected(selected_data, 2)
		}
	}

	DeletedCompany(userdata) {
		this.setState({ selected_id: userdata._id, IsModalConfirmation: true })
	}

	handelConfirm(response) {
		const that = this;
		const { selected_id } = this.state;
		if (response) {
			const { PageRecord } = this.state;
			DeletedCompany({ _id: selected_id }).then(res_data => {
				if (!res_data.status) {
					this.onload();
					Toast(res_data.message)
				} else {
					GetTenantRequest({ id: 0 }).then(res => {
						that.setState({ tenantLists: res.data, is_approved: false, userdata: null, IsModalConfirmation: false });
						Toast(res_data.message)
					});
				}
			});
		}
		else {
			this.setState({ IsModalConfirmation: false })
		}
	}

	getTableRows() {
		let { tenantLists } = this.state;
		let rows = tenantLists && tenantLists.map((r, i) => {
			const isView = <DropdownItem className="d-flex" onClick={() => this.setState({ is_approved: true, userdata: r })}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="View">remove_red_eye</i>View</span></DropdownItem>
			const isDelete = <DropdownItem className="d-flex" onClick={() => this.DeletedCompany(r)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>
			var isApproved = false, isReject = false;
			if (this.props.User_data.level == "8" && r.request_status == 0) {
				isApproved = <DropdownItem className="d-flex" onClick={() => this.openConfirmation(r, 2)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Approval">check_circle</i>Approve</span></DropdownItem>
				isReject = <DropdownItem className="d-flex" onClick={() => this.openConfirmation(r, 3)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Reject">report_off</i>Reject</span></DropdownItem>
			}
			return ({
				full_name: r.full_name,
				company_name: r.company_name,
				hostname: r.hostname,
				domain: <a href={API.TENANT_BASE_URL.replace("<<tenant>>", r.hostname)} target="_blank">{API.TENANT_BASE_URL.replace("<<tenant>>", r.hostname)}</a>,
				email: r.email,
				status: r.request_status == 1 ? <b className="text-success">Approved</b > : r.request_status == 0 ? <span ><b className="text-warning">Pending</b></span> : <b className="text-danger">Rejected</b>,
				action: <div className="d-flex">
					<UncontrolledDropdown className="CustomToggle" setActiveFromChild>
						<DropdownToggle tag={CustomToggle} />
						<DropdownMenu size="sm" title="" right>
							{isView}
							{isDelete}
							{isApproved}
							{isReject}
						</DropdownMenu>
					</UncontrolledDropdown>
				</div>
			});
		});
		return rows
	}

	getTableColumns() {
		let col = [
			{
				label: <FormattedMessage id="userlists.fullname" />,
				field: 'full_name',
			},
			{
				label: "Company Name",
				field: 'company_name',
			},
			{
				label: <FormattedMessage id="userlists.email" />,
				field: 'email',
			},
			{
				label: 'Host Name',
				field: 'hostname',
			},
			{
				label: 'Domain',
				field: 'domain',
			},
			{
				label: <FormattedMessage id="userlists.statut" />,
				field: 'status',
			}, {
				label: 'action',
				field: 'action',
				sort: 'disabled'
			}]
		return col
	}

	_handleKeyDown = async ({ target }) => {
		if (target.value != "") {
			var payload = { name: target.name, value: target.value }
			const result = await CheckTenantValidForm(payload);
			const status = result.data;
			if (target.name == "email") {
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

	_propsHandleKey = async (payload) => {
		const result = await CheckTenantValidForm(payload);
		return result;
	}

	OnchnageTenantInputForm = ({ target }) => {
		var inValidTenantName = ["intranet", "internet", "home", "www", "dashboard", "api", "history", "reports", "workflow", "public"];
		const name = target.value.replace(" ", "")
		this.setState({ name: name, inValidTenant: inValidTenantName.includes(name) })
	}

	AddnewTenant = () => {
		window.location.href = "/home/tenantrequest?request=new"
	}


	render() {

		let {
			email,
			hostname,
			address,
			mobile_number,
			company_name,
			db_connection,
			db_user,
			db_password,
			country,
			is_system,
			emailDomain,
			IsModalConfirmation,
			IsModalConfirmationApproveReject,
			ConfirmationModelTitle,
			ConfirmationText,
			tenantLists,
			isEmailUnique,
			isTenantUnique,
			isEmailDomain,
			inValidTenant,
			confirmDeleteValue,
			is_active_lists,
			isRequestForm

		} = this.state;
		const { User_data } = this.props;
		const { PageNo, totalCount, PageRecord, DataCount, search } = this.state;
		const isLoginButtonDisabled = !email || !name || isEmailUnique || isTenantUnique || isEmailDomain || inValidTenant;
		const that = this;

		const data = {
			columns: this.getTableColumns(),
			rows: this.getTableRows(),
		}

		const initState = {
			email,
			hostname,
			address,
			mobile_number,
			company_name,
			db_connection,
			db_user,
			db_password,
			country,
			is_system,
			emailDomain
		}

		if (!tenantLists) {
			return false
		} else {
			if ((tenantLists.length == 0 && User_data.level != "8") || isRequestForm) {
				return (
					<div style={{ "padding": "28px", "margin": "-28px" }}>
						<Breadcrumbs title="Tenant" breadcrumbItem={"Home"} />
						<TenantRequestForm user={User_data} CheckTenantValidForm={CheckTenantValidForm} getUrl={getUrl} />
					</div>
				)
			} else {
				return (
					<Fragment>
						<Breadcrumbs title="Tenant" breadcrumbItem={"Admin"} />
						<div id="TenantRequestList">
							{
								this.state.is_approved &&
								<Modal isOpen={this.state.is_approved} toggle={() => this.setState({ is_approved: false, userdata: null })} size="lg">
									{this.state.userdata &&
										<Fragment>
											<ModalHeader toggle={() => this.setState({ is_approved: false, userdata: null })}>
												{(this.state.userdata.company) ? <FormattedMessage id="Tenant.view_company_details" /> : <FormattedMessage id="Tenant.add_company_details" />}
											</ModalHeader>
											<ModalBody>
												<TenantApprovedForms
													CheckTenantValidForm={this._propsHandleKey}
													ActiveDeactiveTenantCompany={(data) => ActiveDeactiveTenantCompany(data)}
													MergeApss={(data) => this.MergeApss(data)}
													Allapps={this.state.Allapps}
													addCompany={this.addCompany}
													loginUser={User_data}
													userdata={this.state.userdata} />
											</ModalBody>
										</Fragment>
									}
								</Modal>
							}

							{data &&
								<Modal isOpen={IsModalConfirmationApproveReject} toggle={() => this.setState({ IsModalConfirmationApproveReject: false })} size="lg">
									<ModalHeader toggle={() => this.setState({ IsModalConfirmationApproveReject: false })}>
										{ConfirmationModelTitle}
									</ModalHeader>
									<ModalBody>
										{ConfirmationText}
									</ModalBody>
									<ModalFooter>
										<Button variant="danger" onClick={() => this.setState({ IsModalConfirmationApproveReject: false })}>No</Button>
										<Button variant="success" onClick={() => this.handelConfirmApproveReject()}>Yes</Button>
									</ModalFooter>
								</Modal>
							}

							{data &&
								<ModalConfirmation
									value={confirmDeleteValue}
									onChange={(e) => this.setState({ confirmDeleteValue: e.target.value })}
									inputConfirmation={true}
									IsModalConfirmation={IsModalConfirmation}
									showOkButton={true}
									showCancelButton={true}
									title="Delete"
									text="Are you sure you want to delete?"
									onClick={(response) => this.handelConfirm(response)} />}

							{(User_data.level == "8") &&
								<Row>
									<Col xs="12">
										<Card>
											<CardBody>
												<Row className="mb-2">
													<Col sm="4">
														<div className="search-box mr-2 mb-2 d-inline-block">
														</div>
													</Col>
													<Col sm="8">
														<div className="text-sm-right">
															<Button onClick={this.AddnewTenant} className='m-0 p-2'><span>Add New Tenant</span></Button>
														</div>
													</Col>
												</Row>
												<DataTable
													HeaderAddButton={(User_data.level == "8") ? "Add New Tenant" : false}
													tableTitle={(User_data.level == "8") ? "Tenants Lists" : "Request Tenant Lists"}
													data={data}
													addOnClieck={this.AddnewTenant}
												// pagination={{
												// 	onEventPage: this.onEventPage,
												// 	PageNo: PageNo,
												// 	totalCount: totalCount,
												// 	PageRecord: PageRecord,
												// 	DataCount: DataCount
												// }}
												/>
											</CardBody>
										</Card>
									</Col>
								</Row>
							}

							{(User_data.level != "8") &&
								<DataTable
									HeaderAddButton={(User_data.level == "8") ? "Add New Tenant" : false}
									tableTitle={(User_data.level == "8") ? "Tenants Lists" : "Request Tenant Lists"}
									data={data}
									addOnClieck={this.AddnewTenant}
								// pagination={{
								// 	onEventPage: this.onEventPage,
								// 	PageNo: PageNo,
								// 	totalCount: totalCount,
								// 	PageRecord: PageRecord,
								// 	DataCount: DataCount
								// }}
								/>
							}
						</div>
					</Fragment>
				)
			}
		}
	}

}

const validationSchema = Yup.object().shape({
	company_name: Yup.string().required("company name is a required field."),
	email: Yup.string().email().required("Email is a required field."),
	address: Yup.string().required("address is a required field."),
	hostname: Yup.string().required("hostname is a required field."),
	country: Yup.object().required("country is a required field."),
	address: Yup.string().required("address is a required field."),
	mobile_number: Yup.string().required("mobile number is a required field."),
	emailDomain: Yup.string().required("emailDomain is a required field."),
});

const mapStateToProps = (state) => {
	return {
		User_data: state.user.User_data
	};
}

const mapDispatchToProps = (dispatch) => {
	return {
		Appslist: (data) => dispatch(Appslist(data)),
		MergeApssData: (data) => dispatch(MergeApssData(data))
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(TenantLists);
