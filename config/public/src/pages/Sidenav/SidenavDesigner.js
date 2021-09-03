import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import './SidenavDesigner.css'
import './SidenavSetup.css'
import ModelAddField from './components/ModelAddView'
import { Row, Col, Container, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
const groupLinkId = 'sidenav-item-group-link'
const headerId = 'sidenav-item-header'
const linkId = 'sidenav-item-link'
const dividerId = 'sidenav-item-divider';
const grid = 8;



const getItems = (count, offset = 0) =>
	Array.from({ length: count }, (v, k) => k).map(k => ({
		id: `item-${k + offset}`,
		content: `item ${k + offset}`
	}));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
};
//Moves an item from one list to another list.
const move = (source, destination, droppableSource, droppableDestination) => {
	const sourceClone = Array.from(source);
	const destClone = Array.from(destination);
	const [removed] = sourceClone.splice(droppableSource.index, 1);

	destClone.splice(droppableDestination.index, 0, removed);

	const result = {};
	result[droppableSource.droppableId] = sourceClone;
	result[droppableDestination.droppableId] = destClone;

	return result;
};
const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: 'none',
	margin: `0 0 ${grid}px 0`,
	cursor: 'pointer',
	// change background colour if dragging
	background: isDragging ? 'lightgreen' : '',

	// styles we need to apply on draggables
	...draggableStyle
});
const getListStyle = isDraggingOver => ({
	background: isDraggingOver ? 'lightblue' : 'lightgrey',
	padding: grid
});

/*  SidenavDesigner Class */
class SidenavDesigner extends Component {
	constructor(props) {
		super(props)
		this.state = {
			items: getItems(10),
			selected: getItems(5, 10),
			is_header: false,
			isShowSidenavItemProperties: false,
			selectedEle: "",
			properties: [],
			type: "",
			sideMenuComponent: [],
			groupLinks: [{ "header": "A1", links: [{ "content": "App Components1" }, { "content": "App Components2" }, { "content": "App Components3" }] }, { "header": "A2", links: [{ "content": "App Components4" }, { "content": "App Components5" }, { "content": "App Components5" }] }],
			modal_choose_view: false,
			defaultgroupLinks: [],
			sidenavItems: [
				{ id: headerId, name: 'Header' },
				{ id: 1, "name": "Default link", "route": "/calendar-list", "icon": "link", "text": "Default link" },
				{ id: 2, "name": "Collections", "route": "/collection-list", "icon": "view_module", "text": "Collections" },
				{ id: 3, "name": "File Folders", "route": "/containers", "icon": "folder", "text": "File Folders" },
				{ id: 4, "name": "Workflow Task", "route": "/external-collection", "icon": "build", "text": "Workflow Task" },
				{ id: 5, "name": "Connections", "route": "/connections", "icon": "settings_input_component", "text": "Connections" },
				{ id: 6, "name": "Page Layout", "route": "/page-list", "icon": "settings", "text": "Page Layout" },
				{ id: 7, "name": "Calendar", "route": "/calendar-list", "icon": "today", "text": "Calendar" }
			],
			currentStates: {
				groupindex: null,
				groupLinksindex: null,
				is_edit: 0,
				linkType: "sidenav-item-header",
				header: "",
				link: {
					"name": "",
					"route": "",
					"icon": "",
					"text": ""
				}
			}
		}
	}

	//getList = id => this.state[this.id2List[id]];
	getList = id => {
		var index = id.split('droppable')[1]
		return (this.state.groupLinks[index].links)
	}


	onDragEnd = result => {
		const that = this;
		const { source, destination } = result;
		const { sidenavItems } = that.state
		// dropped outside the list
		if (!destination) {
			return false
		}
		if ((source.droppableId == "droppable_main" || destination.droppableId == "droppable_main") && destination) {
			//const result = copy(that.getList(source.droppableId), that.getList(destination.droppableId), source, destination);
			var index = Number(destination.droppableId.split('droppable')[1]);
			console.log(source);
			if (source.index == 0) {
				if (destination.index == 0) {
					var groupLinks = [{ "header": "Default", "dividerBottom": true, "links": [{ "name": "Default link", "route": "", "icon": "link", "text": "Default link" }] }]
					var oldGroupLinks = that.state.groupLinks
					var newGroupLinks = groupLinks.concat(oldGroupLinks)
					that.setState({ groupLinks: newGroupLinks });
					this.props.handleSaveApplyDesignConfig(newGroupLinks);
				} else {
					var header = { "header": "Default", "dividerBottom": true, "links": [{ "name": "Default link", "route": "", "icon": "link", "text": "Default link" }] }
					var oldGroupLinks = that.state.groupLinks
					oldGroupLinks.splice(Number(index) + 1, 0, header);
					that.setState({ groupLinks: oldGroupLinks });
					this.props.handleSaveApplyDesignConfig(oldGroupLinks);
				}
			} else {
				let find_menu = JSON.parse(JSON.stringify(sidenavItems[source.index]));
				if (find_menu) {
					var oldGroupLinks = that.state.groupLinks;
					oldGroupLinks[index].links.splice(destination.index, 0, find_menu);
					that.setState({ groupLinks: oldGroupLinks });
					this.props.handleSaveApplyDesignConfig(oldGroupLinks);
				} else {
					var oldGroupLinks = that.state.groupLinks;
					oldGroupLinks[index].links.splice(destination.index, 0, { "name": "Default link", "route": "", "icon": "link", "text": "Default link" });
					that.setState({ groupLinks: oldGroupLinks });
					this.props.handleSaveApplyDesignConfig(oldGroupLinks);
				}
			}
		} else if (source.droppableId === destination.droppableId) {
			const items = reorder(that.getList(source.droppableId), source.index, destination.index);
			var groupLinkindex = source.droppableId.split('droppable')[1];
			that.state.groupLinks[groupLinkindex].links = items;
			that.setState({ groupLinks: that.state.groupLinks });
			console.log(that.state.groupLinks)
			this.props.handleSaveApplyDesignConfig(that.state.groupLinks);
		} else if (source.droppableId.split('droppable')[1] < destination.droppableId.split('droppable')[1]) {
			const result = move(that.getList(source.droppableId), that.getList(destination.droppableId), source, destination);
			var sourceIndex = source.droppableId.split('droppable')[1]
			var destinationIndex = destination.droppableId.split('droppable')[1]
			that.state.groupLinks[sourceIndex].links = result[source.droppableId];
			that.state.groupLinks[destinationIndex].links = result[destination.droppableId];
			that.setState({ groupLinks: that.state.groupLinks });
			console.log(that.state.groupLinks)
			this.props.handleSaveApplyDesignConfig(that.state.groupLinks);
		} else {
			const result = move(that.getList(source.droppableId), that.getList(destination.droppableId), source, destination);
			var sourceIndex = source.droppableId.split('droppable')[1]
			var destinationIndex = destination.droppableId.split('droppable')[1]
			that.state.groupLinks[destinationIndex].links = result[destination.droppableId];
			that.state.groupLinks[sourceIndex].links = result[source.droppableId];
			that.setState({ groupLinks: that.state.groupLinks });
			console.log(that.state.groupLinks)
			this.props.handleSaveApplyDesignConfig(that.state.groupLinks);
		}
		this.state.is_header = false;
	};

	onDragUpdate = result => {
		if (result.draggableId == "item-0") {
			this.state.is_header = true
		}
	}

	render() {
		const { isShowSidenavItemProperties, properties, sidenavItems, groupLinks, modal_choose_view, currentStates, menu_list } = this.state;
		const that = this;
		return (
			<Row className="sidenav-designer text-left">
				{modal_choose_view &&
					<ModelAddField
						handleAddField={(data) => this.handleonAddMenu(data)}
						currentStates={currentStates}
						toggle_choose_add_field={(e) => this.setState({ modal_choose_view: !modal_choose_view })} />
				}

				<Col md='12' style={{ "padding": "0px" }}>
					<div style={{ display: "flex" }}>
						<DragDropContext onDragEnd={this.onDragEnd} onDragUpdate={this.onDragUpdate}>
							<div style={{ width: "50%", padding: "10px" }} id="sidenav-item-picker" className="offset-s1">
								<Droppable direction="horizontal" isDropDisabled={true} droppableId={"droppable_main"}>
									{(provided, snapshot) => (
										<div ref={provided.innerRef} style={{ "position": "relative" }}>
											<div className="title">
												<span>Sidenav item</span>
											</div>

											<div style={{ "position": "absolute", "top": "33px", "width": "100%" }}>
												{sidenavItems.map((item, i) => (
													<Draggable
														disableInteractiveElementBlocking={true}
														key={'item-' + i}
														draggableId={'item-' + i}
														index={i}>
														{(provided, snapshot) => (
															<div
																ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
																className="sidenav-item">
																<div id={item.id} draggable onDragStart={(e) => this.handleDragSidenavItem(e, item.id)} onDragEnd={this.handleDropSidenavItem} >
																	{i == 0 ?
																		<li><div className="groupLink-links">{item.name}</div></li> :
																		<li><div className="groupLink-links"><i className="material-icons">{item.icon}</i>{item.name}</div></li> 
																	}
																</div>
															</div>
														)}
													</Draggable>
												))}
											</div>
										</div>
									)}
								</Droppable>
								{/* <Btn size='sm' className='custom-btn' onClick={(e) => this.props.handleSaveApplyDesignConfig(this.state.groupLinks)}>Save & Apply</Btn> */}
							</div>
							<div id="sidenav-preview"  >
								{groupLinks && groupLinks.map((groupLink, index) => (
									<Droppable droppableId={"droppable" + index}>
										{(provided, snapshot) => (
											<div key={index} ref={provided.innerRef}>
												{groupLink.header.length > 0 &&
													<Draggable
														isDragDisabled={true}
														disableInteractiveElementBlocking={true}
														key={'item' + index}
														draggableId={'item' + index}
														index={index}>
														{(provided, snapshot) => (
															<div ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
																<li>
																	<span className="subheader">
																		{groupLink.header}
																		<i onClick={(e) => this.handleonDelete(false, index)} className="material-icons delete-links">delete</i>
																		<i onClick={(e) => this.handleonedit(false, index)} className="material-icons edit-links">edit</i>
																	</span>
																</li>
																{this.state.is_header && groupLink.links.map((item, i) => (
																	<li>
																		{
																			item.isExternal ?
																				<div className="groupLink-links groupLink-links-hover" data-id={i}>
																					<i className="material-icons">{item.icon}</i>
																					{item.text}
																					<i className="material-icons edit-links" onClick={(e) => this.handleonedit(true, index, i)}>edit</i>
																					<i className="material-icons delete-links" onClick={(e) => this.handleonDelete(true, index, i)}>delete</i>
																				</div>
																				: <div className="groupLink-links groupLink-links-hover" data-id={i}>
																					<i className="material-icons">{item.icon}</i>
																					{item.text}
																					<i className="material-icons edit-links" onClick={(e) => this.handleonedit(true, index, i)}>edit</i>
																					<i className="material-icons delete-links" onClick={(e) => this.handleonDelete(true, index, i)}>delete</i>
																				</div>
																		}
																	</li>
																))
																}
															</div>
														)}
													</Draggable>
												}

												{this.state.is_header === false && groupLink.links.map((item, i) => (
													<Draggable
														key={'item-' + index + "-" + i}
														draggableId={'item-' + index + "-" + i}
														index={i}>
														{(provided, snapshot) => (
															<div ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																style={getItemStyle(
																	snapshot.isDragging,
																	provided.draggableProps.style
																)}>
																<li>
																	{
																		item.isExternal ?
																			<div className="groupLink-links groupLink-links-hover" data-id={i}>
																				<i className="material-icons">{item.icon}</i>
																				{item.text}
																				<i className="material-icons edit-links" onClick={(e) => this.handleonedit(true, index, i)}>edit</i>
																				<i className="material-icons delete-links" onClick={(e) => this.handleonDelete(true, index, i)}>delete</i>
																			</div>
																			: <div className="groupLink-links groupLink-links-hover" data-id={i}>
																				<i className="material-icons">{item.icon}</i>
																				{item.text}
																				<i className="material-icons edit-links" onClick={(e) => this.handleonedit(true, index, i)}>edit</i>
																				<i className="material-icons delete-links" onClick={(e) => this.handleonDelete(true, index, i)}>delete</i>
																			</div>
																	}
																</li>

															</div>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										)}

									</Droppable>
								))}
							</div>
						</DragDropContext>
					</div>
				</Col>
			</Row >
		)
	}

	componentDidMount() {
		//M.AutoInit()
		this.setState({ groupLinks: this.props.groupLinks, defaultgroupLinks: this.props.groupLinks })
	}

	
	componentWillReceiveProps(props){	
		this.setState({ groupLinks: props.groupLinks, defaultgroupLinks: props.groupLinks })
	}
	
	handleonAddMenu = (data) => {
		if (this.state.groupLinks.length != 0) {
			if (data.is_edit == 0) {
				switch (this.menuIndex) {
					case 'sidenav-item-header':
						var header = { "header": "Default", "dividerBottom": true, "links": [{ "name": "Default link", "route": "", "icon": "link", "text": "Default link" }] }
						var groupLinks = this.state.groupLinks;
						this.over.dataset.id = this.over.dataset.id ? this.over.dataset.id : -1
						var v1 = groupLinks[this.index].length == this.over.dataset.id ? this.index + 1 : this.index
						groupLinks.splice(v1, 0, header)
						this.setState({ groupLinks: groupLinks, modal_choose_view: false });
						this.props.handleSaveApplyDesignConfig(groupLinks);
						break;
					case 'sidenav-item-link':
						var link = { "name": "Default link", "route": "", "icon": "link", "text": "Default link" }
						var groupLinks = this.state.groupLinks;
						var links = groupLinks[this.index].links;
						links.splice(this.over.dataset.id, 0, link)
						groupLinks[this.index].links = links;
						this.setState({ groupLinks: groupLinks, modal_choose_view: false });
						this.props.handleSaveApplyDesignConfig(groupLinks);
						break;
					default:
						break;
				}
			} else if (data.is_edit == 1) {
				const { currentStates } = this.state;
				switch (data.linkType) {
					case 'sidenav-item-header':
						this.state.groupLinks[currentStates.groupindex].header = data.header;
						this.setState({ groupLinks: this.state.groupLinks, modal_choose_view: false });
						this.props.handleSaveApplyDesignConfig(this.state.groupLinks);
						break;
					case 'sidenav-item-link':
						const groupLinks = this.state.groupLinks;
						groupLinks[currentStates.groupindex].links[currentStates.groupLinksindex] = data.link;
						this.setState({ groupLinks: groupLinks, modal_choose_view: false });
						this.props.handleSaveApplyDesignConfig(groupLinks);
						break;
					default:
						break;
				}
			} else {
				var header = { "header": data.header, "dividerBottom": true, "links": [] }
				this.state.groupLinks.push(header);
				var groupLinks = this.state.groupLinks;
				this.setState({ groupLinks: groupLinks, modal_choose_view: false })
				this.props.handleSaveApplyDesignConfig(groupLinks);

			}
		} else {
			var groupLinks = [{ "header": "Default", "dividerBottom": true, "links": [{ "name": "Default link", "route": "", "icon": "link", "text": "Default link" }] }]
			this.setState({ groupLinks: groupLinks, modal_choose_view: false });
			this.props.handleSaveApplyDesignConfig(groupLinks);
		}


	}

	handleonDelete = (is_link, index, i) => {
		if (!is_link) {
			var groupLinks = this.state.groupLinks;
			groupLinks.splice(index, 1);
		} else {
			var groupLinks = this.state.groupLinks;
			var links = groupLinks[index].links;
			delete links[i]
			groupLinks[index].links = links.filter(x => x);
		}
		this.setState({ groupLinks: groupLinks });
		this.props.handleSaveApplyDesignConfig(groupLinks);
	}

	handleonedit = (is_link, index, i) => {
		var currentStates = this.state.currentStates
		currentStates.is_edit = 1
		if (!is_link) {
			currentStates.linkType = "sidenav-item-header";
			currentStates.header = this.state.groupLinks[index].header;
			currentStates.groupindex = index;
		} else {
			currentStates.linkType = "sidenav-item-link";
			currentStates.link = this.state.groupLinks[index].links[i];
			currentStates.groupindex = index;
			currentStates.groupLinksindex = i;
		}
		this.setState({ currentStates: currentStates, modal_choose_view: true })
	}
}

const mapStateToProps = (state) => { return {} }

const mapDispatchToProps = (dispatch) => { return {} }

export default connect(mapStateToProps, mapDispatchToProps)(SidenavDesigner)


