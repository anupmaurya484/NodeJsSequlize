import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axios from '../../../utils/axiosService';
import { sortableContainer, sortableElement, sortableHandle, } from 'react-sortable-hoc';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Input } from 'reactstrap';
import arrayMove from 'array-move';
import auth from "../../../actions/auth";
import './CreateForm.css';


const SortableContainer = sortableContainer(({ children }) => { return <div>{children}</div>; });
const DragHandle = sortableHandle(() => <i className="fa fa-align-justify" style={{ cursor: "pointer" }}></i>);
const tableHeader = {
  color: "#495057",
  backgroundColor: "#e9ecef",
  borderColor: "#dee2e6",
  paddingTop: "1.1rem",
  paddingBottom: "1rem",
  border: "2px solid #dbdada"
}

const ConfigTable = {
  "title": "",
  "viewType": "",
  "viewTheme": "",
  "properties": []
}

class ViewConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal_choose_view: false,
      editviewlengthindex: null,
      editviewfieldindex: null,
      options: ["0", "1", "2", "4", "6", "8", "10", "20", "40", "80", "160", "320", "640", "1024"],
      collection: {
        _id: '',
        collectionName: "",
        collectionDescription: "",
        formschema: { "display": "form" },
        viewTables: []
      },
      activeTable: null,
      editviewTableindex: null
    }
  }

  componentDidMount() {
    this.componentUpdate(this.props);
  }

  componentWillReceiveProps(props) {
    this.componentUpdate(props);
  }

  componentUpdate(props) {
    const { collection } = props;
    this.setState({ collection: collection });
  }

  loadFormData = async (formId) => {
    try {
      var result = await axios.apis('GET', `/api/forms?id=${formId}`, auth.headers);
      console.log(result);
    } catch (e) {
      console.error(e)
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    let { activeTable } = this.state
    let view = activeTable
    if (view) {
      view.properties = arrayMove(view.properties, oldIndex, newIndex);
      activeTable = view;
      this.setState({ activeTable: activeTable });
    }
  };

  onChangeviewfieldName = (type, value, index) => {
    let { activeTable, editviewfieldindex } = this.state
    if (type == "edit") {
      setTimeout(() => { document.getElementById('viewfieldName' + index).value = value }, 200);
      this.setState({ editviewfieldindex: index });
    } else {
      activeTable.properties[editviewfieldindex]['title'] = document.getElementById('viewfieldName' + index).value
      this.setState({ activeTable: activeTable, editviewfieldindex: null });
    }
  }

  onChangeview = (inputType, { target }, index) => {
    let { activeTable } = this.state
    let view = activeTable
    switch (inputType) {
      case 'showInTable':
        view.properties[index]['visible'] = target.checked;
        break;
      case 'maxLength':
        view.properties[index]['length'] = target.value
        break;
      default:
    }
    activeTable = view;
    this.setState({ activeTable: activeTable });
  }

  addViewField = () => {
    let { modal_choose_view, collection } = this.state;
    var activeTable = { "title": "", "viewType": "", "viewTheme": "", "properties": collection.viewTables[0].properties };
    this.setState({ activeTable: activeTable, modal_choose_view: !modal_choose_view, editviewTableindex: null })
  }

  handleInputChange = ({ target }) => {
    let { activeTable } = this.state;
    activeTable[target.name] = target.value
    this.setState({ activeTable: activeTable })
  }

  AddNewTableView = () => {
    let { collection, activeTable, modal_choose_view, editviewTableindex } = this.state;
    if (editviewTableindex == null) {
      collection.viewTables.push(activeTable);
    } else {
      collection.viewTables[editviewTableindex] = activeTable;
    }
    this.setState({ collection: collection, activeTable: null, modal_choose_view: !modal_choose_view, editviewTableindex: null })
  }

  DeleteTableView = (i) => {
    let { collection } = this.state;
    collection.viewTables.splice(i, 1);
    this.setState({ collection: collection });
  }

  ChangeDefaultView = ({ target }, index) => {
    let { collection } = this.state;
    collection.viewTables.map(x => x.is_defualt = false);
    if (target.checked == true) collection.viewTables[index]["is_defualt"] = true; else collection.viewTables[0]["is_defualt"] = true;
    this.setState({ collection: collection });
  }

  EditTableView = (index) => {
    const { collection, modal_choose_view } = this.state;
    const t1 = collection.viewTables[index]
    this.setState({
      activeTable: {
        "title": collection.viewTables[index].title,
        "viewType": collection.viewTables[index].viewType,
        "viewTheme": "",
        "properties": collection.viewTables[index].properties
      },
      modal_choose_view: !modal_choose_view,
      editviewTableindex: index
    })
  }

  openAddTableView = () => {
    console.log(this.props.systemFields);
    const { modal_choose_view } = this.state;
    this.setState({
      activeTable: {
        "title": '',
        "viewType": '',
        "viewTheme": "",
        "properties": this.props.systemFields
      },
      modal_choose_view: !modal_choose_view,
    })
  }

  render() {
    const { collection, activeTable, modal_choose_view } = this.state;
    return (
      <Fragment >
        {(modal_choose_view && activeTable) &&
          this.renderSortable()
        }


        
        {/* <Button size="sm" color='white' className='custom-btn' onClick={(e) => this.addViewField()}>Add</Button> */}
        {/* <div className="row">
          <div className="col-lg-12 text-right">
            <button className="btn btn-primary btn-sm mb-2" onClick={(e) => this.openAddTableView()}>Add Config</button>
          </div>
        </div> */}
        {/* <div className="table-responsive-viewConfig  border-gray">
          <table className="table">
            <thead style={{ backgroundColor: "#E9ECEF" }}>
              <tr>
                {['Title', 'View type', 'Default', 'Action'].map((header, i) => <th key={i}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {collection.viewTables.map((x, i) =>
                <tr key={"tr" + i}>
                  <td className='title'>{x.title}</td>
                  <td>{x.viewType}</td>
                  {/* <td>{x.viewTheme}</td> */}
                 {/* <td>
                    <div className="custom-control custom-switch">
                      <input
                        readOnly
                        name={"is_default"}
                        type="checkbox"
                        className="custom-control-input"
                        id={"is_default" + i}
                        onChange={event => this.ChangeDefaultView(event, i)}
                        checked="true" />
                      <label className="custom-control-label" htmlFor={"is_default" + i} />
                    </div>
                  </td>
                  <td>
                    {i == 0 && <i className="fa fa-edit" style={{ cursor: "pointer" }} onClick={(e) => this.EditTableView(i)}></i>}
                    {i != 0 && <i className="fa fa-trash" style={{ cursor: "pointer" }} onClick={(e) => this.DeleteTableView(i)}></i>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> */}

      </Fragment>
    )
  }

  renderSortable() {
    const {
      editviewlengthindex,
      editviewfieldindex,
      activeTable,
      modal_choose_view
    } = this.state
    return (
      <Modal isOpen={modal_choose_view} toggle={(e) => this.setState({ modal_choose_view: !modal_choose_view, editviewTableindex: null })} size='fluid' className="model-size modal-xl" >
        <ModalHeader toggle={() => this.setState({ modal_choose_view: !modal_choose_view, editviewTableindex: null })} >
          <div className="view-form-header">
            <div className="col-sm">
              <Input
                label="Display Name"
                id="title"
                type="text"
                name="title"
                value={activeTable.title}
                maxLength="256"
                onChange={event => this.handleInputChange(event)}
              />
            </div>
            <div className="col-sm">
              <select name="viewType" value={activeTable.viewType} className="browser-default custom-select" onChange={event => this.handleInputChange(event)}>
                <option value="">Choose your option</option>
                <option value="DataTable">DataTable</option>
                <option value="CardView">Card View</option>
                <option value="CalendarView">Calendar View</option>
              </select>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
            <div className="row">
              {['field name', 'column Name', 'max length', 'show', 'order'].map((header, i) =>
                (<div className="col-sm" style={tableHeader} key={i}>{header}</div>))
              }
            </div>
            {
              !activeTable && <span> loading .... </span>
            }
            <div className="sortable-container">
              {activeTable.properties.map((value, index) => {
                const SortableItem = sortableElement((props) => {
                  const field = props.value;
                  const index = props.indexkey
                  return (
                    <Fragment>
                      <div className="row" style={{ "borderBottom": "1px solid #e1e0e0", "paddingBottom": "20px", 'padding': '10px' }}>
                        <div className="col-sm">
                          {field.key}
                        </div>
                        <div className="col-sm">
                          <div style={{ "display": "flex" }} className={editviewfieldindex == index ? "view-fieldName" : ' view-form hiden'}>
                            <input
                              className="form-control border-gray"
                              group type="email"
                              success="right"
                              id={"viewfieldName" + index} />

                            <i className="material-icons"
                              style={{ fontSize: "20px", lineHeight: "40px", marginLeft: "20px", cursor: "pointer" }}
                              onClick={event => this.onChangeviewfieldName('done', field.title, index, field.title)}>
                              done
                            </i>
                          </div>

                          {editviewfieldindex != index &&
                            <div>
                              <label>{field.title}</label>
                              <i className="material-icons" style={{ fontSize: "15px", cursor: "pointer" }}
                                onClick={event => this.onChangeviewfieldName('edit', field.title, index, field.title)}
                              >edit</i>
                            </div>

                          }
                        </div>
                        <div className="col-sm">
                          {index == editviewlengthindex ?
                            <div style={{ "display": "flex" }}>
                              <select name={field.title} className="browser-default custom-select border-gray" value={field.length}
                                onChange={event => this.onChangeview('maxLength', event, index)}>
                                <option >select an array field</option>
                                {
                                  this.state.options.map((field, index) => (
                                    <option key={index} value={field}>{field == "0" ? "auto" : field}</option>
                                  ))
                                }
                              </select>
                              <i className="material-icons"
                                style={{ fontSize: "20px", lineHeight: "40px", marginLeft: "10px", cursor: "pointer" }}
                                onClick={event => this.setState({ editviewlengthindex: null })}>
                                done
                              </i>
                            </div>
                            :
                            <div>
                              <label>{field.length == "0" ? "auto" : field.length}</label>
                              <i className="material-icons" style={{ fontSize: "15px", cursor: "pointer" }}
                                onClick={event => this.setState({ editviewlengthindex: index })} >edit</i>
                            </div>
                          }

                        </div>
                        <div className="col-sm">
                          <div className="custom-control custom-switch">
                            <input
                              name={field.title}
                              onChange={event => this.onChangeview('showInTable', event, index)}
                              type="checkbox"
                              className="custom-control-input"
                              id={"customSwitches" + index}
                              checked={field.visible} />
                            <label className="custom-control-label" for={"customSwitches" + index} />
                          </div>
                        </div>
                        <div className="col-sm">
                          <DragHandle />
                        </div>
                      </div>
                    </Fragment>
                  )
                });
                return (<SortableItem key={`item-${value}`} index={index} value={value} indexkey={index} />)
              })}
            </div>
          </SortableContainer>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className='btn-md' onClick={(e) => this.AddNewTableView()}>Save</Button>
          <Button color="secondary" className='btn-md' onClick={(e) => this.setState({ modal_choose_view: !modal_choose_view, editviewTableindex: null })}>Close</Button>
        </ModalFooter>
      </Modal>
    )
  }



}

const mapStateToProps = ({ user, form }) => ({
  user,
  collectionList: form.collectionList
})

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(ViewConfig)