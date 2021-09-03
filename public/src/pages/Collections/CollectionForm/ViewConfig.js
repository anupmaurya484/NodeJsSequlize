import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axios from '../../../utils/axiosService';
import { sortableContainer, sortableElement, sortableHandle, } from 'react-sortable-hoc';
import { Row, Col, Card, CardHeader } from 'reactstrap';
import { reconfigViewField } from '../../../utils/helperFunctions';
import { FormattedMessage } from 'react-intl';
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
      isShowChildTable: false,
      is_edit_info: false,
      options: ["0", "1", "2", "4", "6", "8", "10", "20", "40", "80", "160", "320", "640", "1024"],
      collection: {
        _id: '',
        collectionName: "",
        collectionDescription: "",
        formschema: { "display": "form" },
        viewTables: []
      },
      activeTable: {
        title: "",
        viewType: "",
        orderBy: "",
        is_defualt: true,
        addDocumentBtn: true,
        isBackBtn: true,
        viewSelection: true,
        allowSearch: true,
        allowPagination: true,
        allowExportCsv: true,
        properties: []
      },
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
    this.setState({
      collection: collection,
      activeTable: {
        "title": collection.viewTables[0].title,
        "viewType": collection.viewTables[0].viewType,
        "is_defualt": true,
        "orderBy": collection.viewTables[0].orderBy,
        "properties": collection.viewTables[0].properties,
        "addDocumentBtn": collection.viewTables[0].addDocumentBtn || true,
        "isBackBtn": collection.viewTables[0].isBackBtn || true,
        "viewSelection": collection.viewTables[0].viewSelection || true,
        "allowSearch": collection.viewTables[0].allowSearch || true,
        "allowPagination": collection.viewTables[0].allowPagination || true,
        "allowExportCsv": collection.viewTables[0].allowExportCsv || true,
      },
      editviewTableindex: 0
    });
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

  handleInputChange = ({ target }, type) => {
    let { activeTable } = this.state;
    if (type == "checkbox") {
      activeTable[target.name] = !activeTable[target.name]
    } else {
      activeTable[target.name] = target.value
    }

    this.setState({ activeTable: activeTable })
  }

  AddNewTableView = () => {
    let { collection, activeTable, modal_choose_view, editviewTableindex } = this.state;
    this.props.saveViewTable([activeTable]);
    this.setState({ is_edit_info: false, modal_choose_view: !modal_choose_view })
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

  setEditMode(is_edit_info) {
    if (is_edit_info) {
      this.setState({ is_edit_info: is_edit_info })
    } else {
      this.setState({ is_edit_info: false, })
    }
  }

  resetTableProperty = () => {
    let { activeTable } = this.state
    const properties = this.props.defaultViewConfig
    activeTable.properties = properties
    this.setState({ activeTable: activeTable })
  }

  render() {
    const { isShowChildTable, collection, activeTable, editviewlengthindex, editviewfieldindex, is_edit_info } = this.state;
    return (
      <div className="settings-page">
        <Card>
          <CardHeader>
            <div className="d-flex ">
              <div style={{ position: 'relative', width: "98%" }}>
                <h3>Collection View Layout</h3>
              </div>
              {!is_edit_info && <span className="material-icons cursor-pointer" onClick={() => this.setEditMode(true)}>create</span>}
              {is_edit_info &&
                <Fragment>
                  <span className="material-icons cursor-pointer justify-content-end" onClick={this.AddNewTableView}> save</span>
                  <span className="material-icons cursor-pointer justify-content-end" onClick={() => this.setEditMode(false)}>close</span>
                </Fragment>
              }
            </div>
          </CardHeader>
          <Row>
            <Col xs={12} md={4}>View Layout type</Col>
            <Col xs={12} md={8}>
              {!is_edit_info ? activeTable.viewType :
                <select name="viewType" value={activeTable.viewType} className="browser-default custom-select form-select-modified" onChange={event => this.handleInputChange(event)}>
                  <option value="">Choose your option</option>
                  <option value="DataTable">DataTable</option>
                  <option value="CardView">Card View</option>
                  <option value="CalendarView">Calendar View</option>
                </select>
              }
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>Order By</Col>
            <Col xs={12} md={8}>
              {!is_edit_info ? activeTable.orderBy :
                <select name="orderBy" value={activeTable.orderBy} className="browser-default custom-select form-select-modified" onChange={event => this.handleInputChange(event)}>
                  <option value="">Choose your option</option>
                  {activeTable.properties.map((value, index) => {
                    return (<option key={index} value={value.key}>{value.title}</option>)
                  })
                  }
                </select>
              }
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={4}>Allow Pagination</Col>
            <Col xs={12} md={8} className={!is_edit_info ? 'disabledDiv' : ''}>
              <div className="custom-control custom-switch">
                <input
                  readOnly={!is_edit_info}
                  name="allowPagination"
                  onChange={(e) => this.handleInputChange(e, 'checkbox')}
                  type="checkbox"
                  className="custom-control-input"
                  id="allowPagination"
                  checked={activeTable.allowPagination}
                />
                <label className="custom-control-label" for="allowPagination" />
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>Allow Search Field</Col>
            <Col xs={12} md={8} className={!is_edit_info ? 'disabledDiv' : ''}>
              <div className="custom-control custom-switch">
                <input
                  readOnly={!is_edit_info}
                  name="allowSearch"
                  onChange={(e) => this.handleInputChange(e, 'checkbox')}
                  type="checkbox"
                  className="custom-control-input"
                  id="allowSearch"
                  checked={activeTable.allowSearch}
                />
                <label className="custom-control-label" for="allowSearch" />
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>Allow Export CSV</Col>
            <Col xs={12} md={8} className={!is_edit_info ? 'disabledDiv' : ''}>
              <div className="custom-control custom-switch">
                <input
                  readOnly={!is_edit_info}
                  name="allowExportCsv"
                  onChange={(e) => this.handleInputChange(e, 'checkbox')}
                  type="checkbox"
                  className="custom-control-input"
                  id="allowExportCsv"
                  checked={activeTable.allowExportCsv}
                />
                <label className="custom-control-label" for="allowExportCsv" />
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>Set Standard Buttons</Col>
            <Col xs={12} md={8} className={!is_edit_info ? 'disabledDiv' : ''}>
              <Fragment>
                <div className="form-check form-check-inline">
                  <input readOnly={!is_edit_info} className="form-check-input" onChange={(e) => this.handleInputChange(e, 'checkbox')} type="checkbox" name="addDocumentBtn" id="addDocumentBtn" checked={activeTable.addDocumentBtn} />
                  <label className="form-check-label" htmlFor="inlineRadio1">Add Document</label>
                </div>
                <div className="form-check form-check-inline">
                  <input readOnly={!is_edit_info} className="form-check-input" onChange={(e) => this.handleInputChange(e, 'checkbox')} type="checkbox" name="isBackBtn" id="isBackBtn" checked={activeTable.isBackBtn} />
                  <label className="form-check-label" htmlFor="inlineRadio2">Close</label>
                </div>
                <div className="form-check form-check-inline">
                  <input readOnly={!is_edit_info} className="form-check-input" onChange={(e) => this.handleInputChange(e, 'checkbox')} type="checkbox" name="viewSelection" id="viewSelection" checked={activeTable.viewSelection} />
                  <label className="form-check-label" htmlFor="inlineRadio2">View Selection</label>
                </div>
              </Fragment>
            </Col>
          </Row>
          {/* {activeTable.viewType == "DataTable" &&
            <Row>
              <Col xs={12} md={4}>Set Default Property </Col>
              <Col xs={12} md={8}>
                <button color="primary" disabled={!is_edit_info} className='btn btn-success' onClick={this.resetTableProperty}>Reset Field</button>
              </Col>
            </Row>
          } */}
          <Row>
            <Col xs={12} md={12}>
              {(activeTable.viewType == "CalendarView" && activeTable.viewType == "CardView") &&
                <p></p>
              }
              {activeTable.viewType == "DataTable" &&
                <div className={!is_edit_info ? 'disabledDiv' : ''}>
                  <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
                    <div className="row" style={{ "borderBottom": "0", "padding": "0 !important" }}>
                      {['field Key', 'column Name', 'max length', 'column view', 'view order'].map((header, i) =>
                        (<div key={i} className="col-sm" style={tableHeader} key={i}>{header}</div>))
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
                                <div className="col-sm">{field.key} </div>
                                <div className="col-sm">
                                  <div style={{ "display": "flex" }} className={editviewfieldindex == index ? "view-fieldName" : ' view-form hiden'}>
                                    <input
                                      className="form-control border-gray"
                                      group type="email"
                                      success="right"
                                      id={"viewfieldName" + index} />

                                    <i className="material-icons" style={{ fontSize: "20px", lineHeight: "40px", marginLeft: "20px", cursor: "pointer" }}
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
                                      <input name={field.title} className="form-control border-gray"
                                      // value={field.length}
                                      // onChange={event => this.onChangeview('maxLength', event, index)}
                                      />
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
                        return (<SortableItem key={`item-${index}`} index={index} value={value} indexkey={index} />)
                      })}
                    </div>
                  </SortableContainer>
                </div>
              }
            </Col>
          </Row>
        </Card>
      </div >
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