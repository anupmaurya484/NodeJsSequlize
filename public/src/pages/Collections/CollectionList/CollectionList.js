import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledDropdown, Card } from "reactstrap";
import { FormattedMessage } from 'react-intl';
import { GetCollections } from "../../../actions/collection";
import { GetAppName, AppDesign } from '../../../utils/helperFunctions';
import CardLists from '../../../components/CardLists';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DataTable from "../../../components/DataTable"
import CustomToggle from '../../../components/CustomToggle';
import docImage from '../../../assets/images/Documents_illustrator.svg';
import CloudDropdown from '../../../components/InputComponent/CloudDropdown';


const cloudDropdownItem = [{
	key: 1,
	title: "ALl",
	value: ""
}, {
	key: 2,
	title: "Form",
	value: 'form'
}, {
	key: 3,
	title: "wizard",
	value: 'wizard'
}, {
	key: 4,
	title: "PDF",
	value: "pdf"
}];

class CollectionList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			collectionList: [],
			display_layout: 1,
			filterType: '',
			isMenu: false,
			search: "",
			formType: '',
		}
	}

	componentWillMount() {
		this.loadCollectionList()
	}

	loadCollectionList = async (option) => {
		try {
			const optionPayload = option ? option : { search: "", currentPage: 1, formType: "" }
			const { app_id, User_data } = this.props.user
			const reqData = {
				userId: User_data._id,
				appId: app_id,
				...optionPayload
			}
			var res = await this.props.GetCollections(reqData);
			this.setState({ collectionList: res.data, ...optionPayload });
		} catch (err) {
			console.log(err.message);
		}
	}

	doSearch(evt) {
		const that = this;
		var searchText = evt.target.value; // this is the search text
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			that.loadCollectionList({ currentPage: 1, search: searchText, formType: this.state.formType })
		}, 300);
	}

	getTableRows = () => {
		const that = this;
		const { collectionList } = this.state;
		var rootPath = GetAppName(this.props.user);
		let rows = collectionList && collectionList.map((collection, i) => ({
			name: collection.name,
			description: collection.description,
			action: <div style={{ "width": "70px", "display": "flex" }}>
				<UncontrolledDropdown className="CustomToggle" setActiveFromChild>
					<DropdownToggle tag={CustomToggle} />
					<DropdownMenu size="sm" title="" right flip>
						<DropdownItem className="d-flex" onClick={() => that.props.history.push(AppDesign('path') + rootPath + collection.urlCollection + `?name=${collection.name}`)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Open">visibility</i>open</span></DropdownItem>
						{AppDesign() && <DropdownItem className="d-flex" onClick={() => that.props.history.push((collection.urlDesigner) ? rootPath + collection.urlDesigner : null)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>}
					</DropdownMenu>
				</UncontrolledDropdown>
			</div>
		}));
		return rows
	}

	handleTypeChange = async (value) => {
		this.loadCollectionList({ currentPage: 1, search: this.state.value, formType: value })
	}


	render() {

		const { collectionList, display_layout, formType } = this.state;
		const { User_data, app_id } = this.props.user
		if (!collectionList && !User_data && !app_id) return false;
		var rootPath = GetAppName(this.props.user);


		const data = {
			columns: [
				{
					label: <FormattedMessage id="page.names" />,
					field: 'name',
				},
				{
					label: <FormattedMessage id="page.description" />,
					field: 'description',
				},
				{
					label: 'Action',
					field: 'action',
					sort: 'disabled'
				}
			],
			rows: this.getTableRows(),
		}

		return (
			<Fragment>
				{/* <Breadcrumbs title="Collection" breadcrumbItem="Dashboard" /> */}
				<Row className="page-header">
					<Col col='6'>
						<div className='page-heading-title'>
							<h3><b></b></h3>
							<h4 className="mb-0 font-size-18">Collection List</h4>
						</div>
					</Col>
					<Col col="6">
						<div className="d-flex align-items-center justify-content-end">
							<div className="search-box">
								<div className="position-relative">
									<input onChange={(e) => this.doSearch(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
									<i className="fa fa-search" aria-hidden="true"></i>
								</div>
							</div>
							<CloudDropdown cloudDropdownItem={cloudDropdownItem} handleTypeChange={this.handleTypeChange} filterType={formType} />
							<div className="page-title-right d-flex ">

								<div className="pt-1">
									<i onClick={() => this.setState({ display_layout: 2 })} className="fa fa-align-justify table-type pointer" aria-hidden="true" style={{ "margin": "0px 10px 0px 10px" }}></i>
									<i onClick={() => this.setState({ display_layout: 1 })} className="fa fa-th-large table-type pointer" aria-hidden="true"></i>
								</div>

								{AppDesign() &&
									<Link to={"/design" + rootPath + "/create-form?id=new"}>
										<Button className="btn-default mr-1" size="sm">Add Collection</Button>
									</Link>
								}

							</div>
						</div>
					</Col>
				</Row>

				{(display_layout == 1 && collectionList.length != 0) &&
					<div style={{ marginBottom: '20px' }}>
						<Row>
							{
								collectionList.map((collection, i) => (
									<Col style={{ marginTop: '10px' }} md='2' key={i}>
										<CardLists
											key={i}
											title={collection.name}
											description={collection.description}
											button1Text='Open'
											button1Url={rootPath + collection.urlCollection + `?name=${collection.name}`}
											button2Text='Design'
											button2Url={(collection.urlDesigner) ? rootPath + collection.urlDesigner : null} />
									</Col>
								))
							}</Row>
					</div>
				}
				{(display_layout == 2 && collectionList.length != 0) &&
					<div style={{ marginBottom: '20px' }}>
						<Row>
							<Col className="mt-1">
								<Card>
									<DataTable
										isPagination={false}
										isSearch={false}
										totalPage={25}
										correntPage={1}
										data={data}
										onClicks={(e) => console.log(e)} />
								</Card>
							</Col>
						</Row>
					</div>
				}

				{(collectionList && collectionList.length == 0) &&
					<div className='h-100 container-fluid'>
						<div className='row h-100 justify-content-center full-height'>
							<div className='col-12 h-100 align-self-center text-center'>
								<img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
								<p>List of Collections to store documents</p>
							</div>
						</div>
					</div>
				}

			</Fragment>
		)
	}
}

const mapStateToProps = ({ user }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({
	GetCollections: (data) => dispatch(GetCollections(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(CollectionList)