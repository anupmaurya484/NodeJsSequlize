import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import { Modal, ModalBody, ModalHeader, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { GetWorkflow, GetInstances, GetInstanceLogs, StartWorkflow, DeleteWorkflow, saveWorkflow } from "../../actions/workflow";
import { getQueryString, GetAppName, Toast, AppDesign } from "../../utils/helperFunctions";
import Designer from './Designer';
import InstancePage from './component/InstancePage';
import ModalConfirmation from '../../components/ModalConfirmation';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import moment from 'moment';
import CustomToggle from '../../components/CustomToggle';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './index.css';

const { SearchBar } = Search;

const rowStyle = { backgroundColor: 'rgb(221 238 236)', headerAttrs: { hidden: true } };
const columns = [{
	dataField: 'id',
	text: 'ID',
	headerAttrs: {
		hidden: true
	}
}, {
	dataField: 'timestamp',
	text: 'Timestamp',
	formatter: dateFormatter,
	headerAttrs: {
		hidden: true
	}
}, {
	dataField: 'data.state',
	text: 'Status',
	headerAttrs: {
		hidden: true
	}
}];
function dateFormatter(cell, row) {
	return (
		<span>
			{ moment(cell).format("MMM Do YYYY, h:mm a")}
		</span>
	);
}

class WorkflowPage extends Component {

	constructor(props) {
		super(props);
		this.state = {
			is_import: false,
			newWorkflowSetup: false,
			workflowList: [],
			workflowobj: null,
			viewColumns: [{
				dataField: 'workflowName',
				text: 'Name',
				formatter: this.genericFormatter,
				headerStyle: (colum, colIndex) => {
					return { whiteSpace: 'nowrap', width: '20%', textAlign: 'left' };
				},
				formatExtraData: { that: this, title: self.title },
				sort: true
			}, {
				dataField: "workflowDescription",
				text: "Description",
				formatter: this.genericFormatter,
				headerStyle: (colum, colIndex) => {
					return { whiteSpace: 'nowrap', width: '40%', textAlign: 'left' };
				},
				formatExtraData: { that: this, title: self.title },
				sort: true
			}, {
				dataField: "createdBy.firstname",
				text: "created By",
				formatter: this.genericFormatter,
				headerStyle: (colum, colIndex) => {
					return { whiteSpace: 'nowrap', width: '20%', textAlign: 'left' };
				},
				formatExtraData: { that: this, title: self.title },
				sort: true
			}, {
				dataField: 'modifiedTime',
				text: 'Modified',
				formatter: this.genericFormatter,
				headerStyle: (colum, colIndex) => {
					return { whiteSpace: 'nowrap', width: '15%', textAlign: 'left' };
				},
				formatExtraData: { that: this, title: self.title },
				sort: true
			}, {
				dataField: "",
				text: "Actions",
				formatter: this.renderButtons,
				formatExtraData: this,
				headerStyle: (column, colIndex) => {
					return { whiteSpace: 'nowrap', width: "5%", textAlign: 'center' };
				},
				sort: false
			}],
			dataMessage: 'Loading...',
			expanded: undefined,
			rows: [],
			openInstancePage: false,
			selectedRow: {},
			logs: {},
			deleteConfirmation: false,
			currentRow: undefined
		}
	}

	componentDidMount = async () => {
		this.onload();
	}

	renderButtons(cell, row, rowIndex, formatExtraData) {
		var that = formatExtraData;
		console.log(row)
		return (
			<span className="more_options">
				<UncontrolledDropdown className="CustomToggle">
					<DropdownToggle tag={CustomToggle} />
					<DropdownMenu size="sm" title="">
						{AppDesign() &&
							<DropdownItem className="d-flex" onClick={(e) => window.location.href = `/design${GetAppName(that.props.user)}/workflow?id=` + row._id}>
								<span className="d-flex">
									<i className="pointer text-success material-icons" data-toggle="tooltip" title="edit">edit</i>
							Edit
						</span>
							</DropdownItem>
						}
						<DropdownItem className="d-flex" onClick={(e) => that.StartWorkflow(row._id)}>
							<span className="d-flex">
								<i className="pointer text-primary material-icons" data-toggle="tooltip" title="Start" style={{ width: '20px' }}>power_setting_new</i>
								Start
							</span>
						</DropdownItem>
						{AppDesign() && <DropdownItem className="d-flex" onClick={(e) => that.setState({ currentRow: row._id, deleteConfirmation: true })}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>}
					</DropdownMenu>
				</UncontrolledDropdown>
			</span>
		);
	}

	genericFormatter(cell, row, rowIndex, formatExtraData) {
		var that = formatExtraData.that;
		const value = (cell && (typeof cell == "string") || typeof cell === 'number') ? cell.toString().trim() : " ";
		let content = (typeof (value) === 'string' || typeof value === 'number') ? value : JSON.stringify(value);

		if (value && moment(value, true).isValid()) {//((Object.prototype.toString.call(value) === "[object Date]") )) {
			content = Object.prototype.toString.call(value) !== "[object Date]" ? moment(value).format("MMM Do YYYY, h:mm a") : value;
		} else if (cell && cell.length > 0 && typeof cell == "object") {
			content = [];
			for (let j = 0; j < cell.length; j++) {
				if (cell[j].url && cell[j].contentType && cell[j].size) {
					var contentType = cell[j].contentType, size = cell[j].size, file = cell[j].fileKey;
					content.push(<p><a className="link-a" target="_blank" href={`${apiUrl}/download?filename=${cell[j].filename}`} key={j}>{file}</a></p>)
				} else {
					content = <a style={{ textDecoration: 'underline' }} onClick={e => that.getDataTableInsideRow(cell, formatExtraData.title)}>
						View
			  </a>
				}
			}
		} else {
			content = (value.split(' ').length > 10) ? value.slice(0, 125) + ' ...' :
				/^data:image\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/.test(value) ? <span><i className="fa fa-picture-o fa-fw" aria-hidden="true"></i> Image</span> : value
		}

		return (<span>{content}</span>)
	}

	handleOnSelect = async (row, isSelect) => {
		if (isSelect) {
			const { location, user } = this.props;
			//this.props.history.push(GetAppName(this.props.user) + "/workflow/InstancePage?id=" + row.id)
			this.setState({ openInstancePage: true, selectedRow: row, logs: await this.props.GetInstanceLogs(row.id) })
			console.log(row.id, "selected", row)
		} else {
			console.log(row.id, "unselected")
		}
	}

	DeleteWorkflow = async (id) => {
		await this.props.DeleteWorkflow(id);
		var resData = await this.props.GetWorkflow();
		this.setState({ workflowList: resData.data })
	}

	handleDeleteConfirm = async (ans) => {
		console.log(ans, this.state.currentRow)
		if (ans) this.DeleteWorkflow(this.state.currentRow)
		this.setState({ deleteConfirmation: false })
	}

	StartWorkflow = async (id) => {
		await this.props.StartWorkflow(id);
	}

	SaveWorkflow = async (jsonData) => {
		try {
			if (getQueryString().id) {
				jsonData["_id"] = getQueryString().id
			}
			const resData = await this.props.saveWorkflow(jsonData);
			if (getQueryString().id) {
				Toast("your workflow design has been successfully saved.")
			} else {
				Toast("your workflow design has been successfully updated.")
			}
			return resData;
		} catch (err) {

		}
	}

	onload = async () => {
		if (getQueryString().id) {
			this.setState({ is_import: true });
		} else {
			var resData = await this.props.GetWorkflow();
			this.setState({ workflowList: resData.data })
		}
	}

	selectRow = {
		mode: 'radio',
		clickToSelect: true,
		style: { backgroundColor: '#c8e6c9' },
		onSelect: this.handleOnSelect
	};

	expandRow = {
		className: 'row-expension-style',
		onlyOneExpanding: true,
		renderer: row => (
			<Fragment>
				{this.state.dataMessage &&
					<div className='no-data-label'>
						{this.state.dataMessage === 'Loading...' ?
							<div>
								<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
							Loading... </div> : this.state.dataMessage
						}
					</div>
				}
				<BootstrapTable keyField='id' data={this.state.rows} columns={columns}
					selectRow={this.selectRow} bordered={false} rowStyle={rowStyle} striped condensed />
			</Fragment>
		),
		//expanded: this.state? this.state.expanded : [],
		//onExpand: this.handleOnExpand
		onExpand: async (row, isExpand, rowIndex, e) => {
			setTimeout(async () => {
				if (isExpand) {
					console.log("isExpanded", isExpand, this.state.expanded)
					this.setState({ expanded: rowIndex, rows: [], dataMessage: 'Loading...' });
					const instances = await this.props.GetInstances(row._id)
					console.log(instances)
					if (instances.responseBody && typeof instances.responseBody == "string") {
						console.log(JSON.parse(instances.responseBody));
						const responseBody = JSON.parse(instances.responseBody);
						if (responseBody.data && responseBody.data.length) {
							this.setState({ rows: responseBody.data, dataMessage: null })
						} else {
							this.setState({ rows: [], dataMessage: "This workflow has no instances yet." })
						}
					}
					this.setState({ expanded: [rowIndex] })
					console.log(isExpand, row._id)
				} else {
					console.log("!isExpanded", this.state.expanded)
					this.setState(() => ({ rows: [] }));
				}
			}, 100)
		}
	}

	onHandeOpenInstancePage = () => {
		this.setState({ openInstancePage: true })
	}

	//Close Instance Page
	onCloseInstancePage = () => {
		this.setState({
			openInstancePage: false,
			selectedRow: {}
		});
	}

	render() {
		let { is_import, newWorkflowSetup, workflowList, viewColumns, rows, expanded, deleteConfirmation } = this.state;
		const that = this;
		return (
			<Fragment>
				<Breadcrumbs title="Workflow" breadcrumbItem="Dashboard" />
				{!is_import &&
					<Fragment>
						<div className="WorkFlow">
							<ToolkitProvider bootstrap4 keyField='_id' data={workflowList} columns={viewColumns} search>
								{props => (
									<div className="panel">
										<div className="panel-heading">
											<div className='panel-title'>
												<h3>Workflows</h3>
											</div>
											<div className="panel-action mr-2">
												<SearchBar {...props.searchProps} />
												{AppDesign() && <span onClick={(e) => that.setState({ is_import: !is_import, newWorkflowSetup: true })} className="btn btn-primary btn-md ml-2">Create Workflow</span>}
											</div>
										</div>
										<div className="panel-block bg-white">
											{/*<button className="btn btn-success" onClick={ this.handleBtnClick }>Expand/Collapse</button>*/}
											<BootstrapTable {...props.baseProps} filter={filterFactory()} expandRow={that.expandRow} striped hover />
										</div>
									</div>
								)}
							</ToolkitProvider>
						</div>
					</Fragment>

				}

				<ModalConfirmation IsModalConfirmation={deleteConfirmation} showOkButton={true} showCancelButton={true} title="Delete workflow" text="You are deleting the workflow" onClick={(response) => this.handleDeleteConfirm(response)} />

				{is_import &&
					<Designer
						onCloseDesigner={() => that.setState({ is_import: false, newWorkflowSetup: false })}
						isNewWorkFlow={newWorkflowSetup}
						onClickDesigner={(e) => window.location = `/design${GetAppName(this.props.user)}/workflow`}
						onClickSaveWorkflow={(jsonData) => that.SaveWorkflow(jsonData)} />
				}

				{this.state.openInstancePage && <Modal isOpen={this.state.openInstancePage} toggle={this.onCloseInstancePage} size="xl" centered>
					<ModalHeader toggle={this.onCloseInstancePage}>
						Instance
					</ModalHeader>
					<ModalBody>
						<InstancePage data={this.state.selectedRow} logs={this.state.logs} />
					</ModalBody>
				</Modal>}
			</Fragment>

		)
	}

}

const mapStateToProps = (state) => {
	return {
		User_data: state.user.User_data,
		user: state.user
	};
}

const mapDispatchToProps = {
	GetWorkflow,
	GetInstances,
	GetInstanceLogs,
	StartWorkflow,
	DeleteWorkflow,
	saveWorkflow
}


export default connect(mapStateToProps, mapDispatchToProps)(WorkflowPage);
