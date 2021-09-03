import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Card, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledDropdown } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import axiosService from '../../utils/axiosService';
import API from '../../config';
import constants from '../../config';
import { GetAppName, AppDesign } from '../../utils/helperFunctions';
import CardLists from '../../components/CardLists';
import folderImage from '../../assets/images/Folder_girl.svg';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import DataTable from "../../components/DataTable";
import CustomToggle from '../../components/CustomToggle';
import CloudDropdown from '../../components/InputComponent/CloudDropdown';

const apiUrl = API.API_URL;

const cloudDropdownItem = [{
	key: 1,
	title: "ALl",
	value: constants.TYPE_GRIDF
}, {
	key: 2,
	title: "GRID FS",
	value: constants.TYPE_GRIDFS
}, {
	key: 3,
	title: "Google Drive",
	value: constants.TYPE_GDRIVE
}, {
	key: 4,
	title: "One Drive",
	value: constants.TYPE_ONEDRIVE
}, {
	key: 5,
	title: "Nintex",
	value: constants.TYPE_NINTEX
}];

class ContainerListPage extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			containers: [],
			connections: [],
			container_type: constants.TYPE_GRIDFS,
			title: "",
			content: "",
			connectionId: "",
			containerId: "",
			rootFolderId: "",
			rootFolders: [],
			filterType: '',
			search: '',
			display_layout: 1
		}
	}

	async handleInputChange(e) {
		const { name, value } = e.target;
		await this.setState({ [name]: value });
		this.getContainerList()
	}

	componentDidMount() {
		this.getContainerList();
	}

	getContainerList() {
		const { User_data, app_id } = this.props.user;
		const { filterType, search } = this.state;
		// axiosService.apis('GET', '/api/containers?appi_id=' + app_id)
		// 	.then(response => {
		// 		this.setState({ containers: response })
		// 	})
		const payload = { "userId": User_data.id, appId: app_id, filterType, search };
		axiosService.apis('POST', '/api/GetAllContainers', payload)
			.then(response => {
				this.setState({ containers: response })
			})
	}

	getType = type => {
		if (type)
			return constants.storageTypes[type];
		else
			return constants.storageTypes;
	}

	getTableRows = () => {
		const that = this;
		const { containers } = this.state;
		var rootPath = GetAppName(this.props.user);
		let rows = containers && containers.map((test, i) => ({
			name: test.title,
			type: test.type,
			description: test.content,
			date: test.createdTime,
			action: <div style={{ "width": "70px", "display": "flex" }}>
				<UncontrolledDropdown className="CustomToggle" setActiveFromChild>
					<DropdownToggle tag={CustomToggle} />
					<DropdownMenu size="sm" title="" right flip>
						<DropdownItem className="d-flex" onClick={() => that.props.history.push(rootPath + test.urlCollection + `&name=${calendar.name}`)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Open">visibility</i>open</span></DropdownItem>
						<DropdownItem className="d-flex" onClick={() => that.props.history.push((test.urlDesigner) ? rootPath + test.urlDesigner : null)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>
					</DropdownMenu>
				</UncontrolledDropdown>
			</div>
		}));
		return rows
	}

	handleTypeChange = async (value) => {
		await this.setState({ filterType: value });
		this.getContainerList()
	}

	render() {
		const { containers, display_layout, filterType } = this.state;
		const { User_data, app_id } = this.props.user
		var rootPath = GetAppName(this.props.user);
		if (!User_data && typeof app_id == "undefined") return false;

		const data = {
			columns: [
				{
					label: <FormattedMessage id="page.names" />,
					field: 'name',
				},
				{
					label: <FormattedMessage id="type" />,
					field: 'type',
				},
				{
					label: <FormattedMessage id="page.description" />,
					field: 'description',
				},
				{
					label: <FormattedMessage id="page.created_date_time" />,
					field: 'date',
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
				{/* <Breadcrumbs title="File Folders" breadcrumbItem="Dashboard" /> */}
				<div style={{ marginBottom: '20px' }}>
					<Row className="page-header">
						<Col col='6'>
							<div className='page-heading-title'>
								<h3><b>File Folders</b></h3>
							</div>
						</Col>
						<Col col='6'>
							<div className="d-flex align-items-center justify-content-end">
								<div className="search-box">
									<div className="position-relative">
										<input onChange={(e) => this.handleInputChange(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
										<i className="fa fa-search" aria-hidden="true"></i>
									</div>
								</div>
								<CloudDropdown cloudDropdownItem={cloudDropdownItem} handleTypeChange={this.handleTypeChange} filterType={filterType} />
								<div className="page-title-right d-flex ">
									<div className="pt-1">
										<i onClick={() => this.setState({ display_layout: 2 })} className="fa fa-align-justify table-type pointer" aria-hidden="true" style={{ "margin": "0px 10px 0px 10px" }}></i>
										<i onClick={() => this.setState({ display_layout: 1 })} className="fa fa-th-large table-type pointer" aria-hidden="true"></i>
									</div>
									{AppDesign() &&
										<Link to={"/design" + GetAppName(this.props.user) + '/add-container?id=new'}>
											<Button className="btn-default mr-1" size="sm">Add File Container</Button>
										</Link>
									}
								</div>
							</div>
						</Col>
					</Row>

					{(display_layout == 1 && containers.length != 0) &&
						<div style={{ marginBottom: '20px' }}>

							<Row>
								{
									containers && containers.map((item, i) => (
										<Col style={{ marginTop: '10px' }} md='2' key={i}>
											<CardLists
												key={i}
												title={item.title}
												subTitle={this.getType(item.type)}
												description={item.content}
												button1Text='Open'
												button1Url={rootPath + '/file-explorer/' + item._id}
												button2Text='Edit'
												button2Url={rootPath + '/add-container?id=' + item._id} />
										</Col>
									))
								}
							</Row>
						</div>
					}
					{(display_layout == 2 && containers.length != 0) &&
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
					{containers && !containers.length &&
						<div className='h-100 container-fluid'>
							<div className='row h-100 justify-content-center full-height'>
								<div className='col-12 h-100 align-self-center text-center'>
									<img src={folderImage} className="figure-img img-fluid" style={{ height: "200px" }} />
									<p>List of Connection</p>
								</div>
							</div>
						</div>
					}
				</div>
			</Fragment>

		);
	}
}

const mapStateToProps = ({ user }) => ({
	user
})

export default connect(mapStateToProps, null)(ContainerListPage)