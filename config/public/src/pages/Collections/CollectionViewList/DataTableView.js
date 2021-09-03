import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { downloadURI, GetAppName, AppDesign } from '../../../utils/helperFunctions';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import moment from 'moment';
import { Modal, ModalBody, ModalHeader, Table, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import CustomToggle from '../../../components/CustomToggle';
import './index.css';
import API from '../../../config';


const apiUrl = API.API_URL;
const { ExportCSVButton } = CSVExport;
function dateFormatter(cell, row) {
  return (
    <span>
      {moment(cell).format("MMM Do YYYY, h:mm a")}
    </span>
  );
}


class DataTableView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rows: this.props.data,
      collectionName: '',
      columns: [],
      viewConfig: this.props.viewConfig,
      downloadProgress: 0,
      modalStatus: false,
      dynamicTableHeader: [],
      dynamicTableData: [],
      dynamicTableTitle: "",
      clientUploadProgress: 0,
      modal_choose_add_field: false,
      rootPath: undefined,
      colId: undefined,
      colName: undefined,
      viewConfiguration: undefined,
      viewColumns: [{
        dataField: 'createdTime',
        text: 'Created',
        formatter: dateFormatter,
        headerStyle: (colum, colIndex) => {
          return { whiteSpace: 'nowrap', width: '30%', textAlign: 'left' };
        },
        sort: true
      }]
    }
  }

  async componentDidMount() {
    const { name } = queryString.parse(this.props.location.search)
    console.log("componentDidMount", this.props, id, name)
    this.loadView(this.props);
    this.setState({ colName: name })
  }


  componentWillReceiveProps(props) {
    console.log("componentWillReceiveProps", props)
    this.loadView(props);
  }


  renderButtons(cell, row, rowIndex, formatExtraData) {
    console.log(row)
    var that = formatExtraData;
    return (
      <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
        <DropdownToggle tag={CustomToggle} />
        <DropdownMenu size="sm" title="" right>
          <DropdownItem className="d-flex" onClick={e => that.props.history.push(AppDesign('path') + that.state.rootPath + `/data-input?id=${row.formId}&record_id=${row._id}`)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>
          <DropdownItem className="d-flex" onClick={e => that.props.onDeleteRow(row)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown >
    );
  }

  genericFormatter(cell, row, rowIndex, formatExtraData) {
    var that = formatExtraData.that;
    const value = (cell && (typeof cell == "string") || typeof cell === 'number') ? cell.toString().trim() : " ";
    let content = (typeof (value) === 'string' || typeof value === 'number') ? value : JSON.stringify(value);


    if (value && moment(value, true).isValid()) {//((Object.prototype.toString.call(value) === "[object Date]") )) {
      console.log(value)
      content = Object.prototype.toString.call(value) !== "[object Date]" ? moment(value).format("MMM Do YYYY, h:mm a") : value;
    } else if (cell && cell.length > 0 && typeof cell == "object") {
      content = [];
      for (let j = 0; j < cell.length; j++) {
        if (cell[j].url && cell[j].contentType && cell[j].size) {
          var contentType = cell[j].contentType, size = cell[j].size, file = cell[j].fileKey;
          content.push(<p><a className="link-a" target="_blank" href={`${apiUrl}/download?filename=${cell[j].filename}`} key={j}>{file}</a></p>)
        } else {
          content = <a style={{ textDecoration: 'underline' }} onClick={e => that.getDataTableInsideRow(cell, formatExtraData.title)}>View</a>
        }
      }
    } else {
      content = (value.split(' ').length > 10) ? value.slice(0, 25) + ' ...' :
        /^data:image\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/.test(value) ? <span><i className="fa fa-picture-o fa-fw" aria-hidden="true"></i> Image</span> : value
    }
    console.log("content", content);

    if (formatExtraData.length && formatExtraData.length != "" && formatExtraData.length != "0" && typeof content == "string") {
      content = content.substring(0, formatExtraData.length)
    }

    return (<span>{content}</span>)
  }

  loadView = (props) => {
    const { viewConfig, data, collectionName } = props;
    var dataLists = data;
    dataLists.forEach(element => {
      var objKeys = Object.keys(element);
      objKeys.forEach(element2 => {
        element[element2] = (element[element2] && typeof element[element2] == "number") ? parseFloat(element[element2]).toFixed(2) : element[element2];
      });
    });

    let viewColumns = [];
    viewConfig && viewConfig.properties.map((x, i) => {
      if (x.visible) {
        viewColumns.push({
          dataField: x.key,
          text: x.title,
          formatter: this.genericFormatter,
          formatExtraData: { that: this, title: x.title, length: x.length },
          headerStyle: (column, colIndex) => {
            return { whiteSpace: 'nowrap', width: (1 / viewConfig.properties.length * 95).toString() + "%", textAlign: 'left' };
          },
          sort: true
        })
      }
    });
    if (viewColumns.length >= 1) {
      viewColumns.push({
        dataField: "x.key",
        text: "Actions",
        formatter: this.renderButtons,
        formatExtraData: this,
        headerStyle: (column, colIndex) => {
          return { whiteSpace: 'nowrap', width: "5%", textAlign: 'center' };
        },
        sort: false
      });
    }

    this.setState({ colId: this.props.colId, rootPath: GetAppName(this.props.user), collectionName: collectionName, viewColumns: viewColumns, rows: dataLists })
  }

  getDataTableInsideRow(value, title) {
    let arrKeys = Object.keys(value[0])
    this.setState({ dynamicTableHeader: arrKeys, dynamicTableData: value, modalStatus: true, dynamicTableTitle: title })
  }

  countUploadProgress = () => {
    const { totalSize, second } = this.state

    // used 125000bytes/second as average upload speed
    const progress = Math.round((125000 * second) / totalSize * 100)
    return progress < 100 ? progress : 100
  }

  downloadFile = (filename, contentType, size) => {
    // open progress modal
    // let modal = document.getElementById('modal-download-progress')
    // M.Modal.getInstance(modal).open()
    this.setState({ modal_choose_add_field: true })
    const config = {
      responseType: 'arraybuffer',
      onDownloadProgress: progressEvent => {
        const progress = Math.round(progressEvent.loaded / size * 100)
        this.setState({ downloadProgress: progress })
      }
    }

    axios.get(`${apiUrl}/download?filename=${filename}`, config)
      .then(res => {
        const file = new Blob([res.data], { type: contentType });
        const fileURL = URL.createObjectURL(file);
        const originalName = filename.slice(33)

        downloadURI(fileURL, originalName)

        // close modal dowload progress and reset value
        this.setState({ modal_choose_add_field: false })
        //M.Modal.getInstance(modal).close()
        this.setState({ downloadProgress: 0 })
      })
      .catch(err => console.log(err))
  }

  b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    console.log(b64Data.toString());
  }

  getSubIndexValue = (value) => {
    let result = value ? value : '-';
    if ((typeof value) == "number") {
      result = parseFloat(value).toFixed(2)
    }
    return result;
  }



  render() {
    const { colId, collectionName, rootPath, viewColumns, viewConfig, rows, dynamicTableData, dynamicTableHeader, dynamicTableTitle } = this.state
    const {
      display_layout,
      display_layouts,
      onChangeLayout,
      isBackBtn,
      allowSearch,
      allowPagination,
      addDocumentBtn,
    } = this.props;
    const that = this;
    return (
      <Fragment>
        {viewConfig &&
          <ToolkitProvider keyField='_id' data={rows} columns={viewColumns} exportCSV search>
            {props => (
              <div className="panel">
                <div className="panel-heading collection-header">
                  <div className='panel-title'>
                    <h3>{collectionName ? collectionName : 'Collection'}</h3>
                  </div>
                  <div className="panel-action" style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignContent: 'center',
                    alignItems: 'baseline'
                  }}>

                    {allowSearch && this.props.searchbar()}
                    {allowSearch && <ExportCSVButton className="btn  btn-primary custom-padding ml-3 mr-3" {...props.csvProps}>Export CSV</ExportCSVButton>}
                    {addDocumentBtn && <Link className="btn  btn-primary custom-padding mr-3" to={AppDesign('path') + rootPath + `/data-input?id=${colId}`}>New</Link>}
                    {isBackBtn && <Button className="btn  btn-primary custom-padding mr-3" onClick={() => window.history.back()}>Back</Button>}
                    {display_layouts.length >= 2 &&
                      <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
                        <DropdownToggle id="dropdown-basic" className="btn custom-padding">
                          {display_layouts.find(x => x.viewType == display_layout).title}
                        </DropdownToggle>

                        <DropdownMenu>
                          {display_layouts.map(x => {
                            return (
                              <DropdownItem onClick={(e) => { onChangeLayout(x.viewType) }} >{x.title}</DropdownItem>
                            )
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    }
                  </div>
                </div>
                <div className="panel-block bg-white">
                  <div className='w-full overflow-auto collection-data-list'>
                    <BootstrapTable {...props.baseProps} filter={filterFactory()} striped hover />
                  </div>
                  {allowPagination && this.props.paginationFooter()}
                </div>
              </div>
            )
            }
          </ToolkitProvider>
        }


        {(viewConfig.length == 0) &&
          <div className='h-100 container-fluid'>
            <div className='row h-100 justify-content-center full-height'>
              <div className='col-12 h-100 align-self-center text-center'>
                <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
                <p>There is no document(s) in this collection for you to view now<br />click "New" button to add a document in this collection.</p>
              </div>
            </div>
          </div>

        }
        <Modal isOpen={this.state.modalStatus} toggle={() => this.setState({ modalStatus: !this.state.modalStatus })} size="lg">
          <ModalHeader toggle={() => this.setState({ modalStatus: !this.state.modalStatus })}>{dynamicTableTitle}</ModalHeader>
          <ModalBody>
            <div className='overflow-auto'>
              <Table>
                <thead>
                  <tr>{
                    dynamicTableHeader.map((k, i) => <th key={i}>{k}</th>)
                  }
                  </tr>
                </thead>
                <tbody>
                  {dynamicTableData.map((k, i) => {
                    return (
                      <tr key={i}>
                        {dynamicTableHeader.map((data, idx) => {
                          if (typeof k[data] != 'object') {
                            return (<td key={idx}>{that.getSubIndexValue(k[data])}</td>)
                          } else {
                            return (
                              <td key={idx}>
                                <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
                                  <DropdownToggle tag={CustomToggle} />
                                  <DropdownMenu size="sm" title="" right>
                                    {k[data].map((datay, idy) => <DropdownItem key={idy * 2} className="d-flex" onClick={() => that.b64toBlob(datay.url, datay.type)}>{datay.name}</DropdownItem>)}
                                  </DropdownMenu>
                                </UncontrolledDropdown >
                              </td>

                            )
                          }
                        })
                        }
                      </tr>
                    )
                  }
                  )}
                </tbody>
              </Table>
            </div>
          </ModalBody>
        </Modal>

      </Fragment>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DataTableView))