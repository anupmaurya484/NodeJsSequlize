import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PaginationFooter from '../../../components/PaginationFooter';
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, Row, Container, DropdownItem, Button } from 'reactstrap';
import moment from 'moment';

import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import API from '../../../config';
import DataTableView from './DataTableView';
import { GetAppName, AppDesign } from '../../../utils/helperFunctions';
import docImage from '../../../assets/images/Documents_illustrator.svg';
import { Getrecords, GetTableView, Deleterecorde } from "../../../actions/collection";
import ModalConfirmation from '../../../components/ModalConfirmation';
import CardLists from '../../../components/CardLists';

function dateFormatter(cell, row) {
  return (
    <span>
      {moment(cell).format("MMM Do YYYY, h:mm a")}
    </span>
  );
}


const apiUrl = API.API_URL;

class CollectionViewList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      collectionName: '',
      tempformId: 0,
      temprecordId: 0,
      records: [],
      IsModalConfirmation: false,
      viewConfiguration: undefined,
      display_layout: 'DataTable',
      rows: [],
      display_layouts: [],
      orderBy: "",
      addDocumentBtn: "",
      allowPagination: "",
      allowSearch: "",
      isBackBtn: "",
      viewSelection: "",
      pagination: {
        search: "",
        currentPage: 1,
        totalPage: 0,
        pageRecord: 10,
        dataCount: 0
      },
      viewColumns: [{
        dataField: 'createdTime',
        text: 'Created',
        formatter: dateFormatter,
        headerStyle: (colum, colIndex) => {
          return { whiteSpace: 'nowrap', width: '30%', textAlign: 'left' };
        },
        sort: true
      }],
      colId: undefined,
      rootPath: undefined,
    }
  }

  async componentDidMount() {

    const { name } = queryString.parse(this.props.location.search)
    const id = this.props.match.params.id;
    const tableView = await this.props.GetTableView({ id: id });
    let display_layout = "DataTable";

    let addDocumentBtn = true
    let allowPagination = false
    let allowSearch = true
    let isBackBtn = true
    let viewSelection = true

    let orderBy = "";
    if (tableView && tableView.data.length) {
      var index = tableView.data.findIndex(x => x.is_defualt == true);
      if (index >= 0) {
        display_layout = tableView.data[index].viewType;
        orderBy = tableView.data[index].orderBy;
        addDocumentBtn = tableView.data[index].addDocumentBtn || true;
        allowPagination = tableView.data[index].allowPagination || true;
        allowSearch = tableView.data[index].allowSearch || true;
        isBackBtn = tableView.data[index].isBackBtn || true;
        viewSelection = tableView.data[index].viewSelection || true;
      }
    }

    // const { viewConfig, data } = props;
    const viewConfig = tableView && tableView.data && tableView.data[0] ? tableView.data[0] : [];
    // console.log(data)
    let viewColumns = [];
    viewConfig && viewConfig.properties.map((x, i) => {
      if (x.visible) {
        viewColumns.push({
          dataField: x.key,
          text: x.title,
          length: x.length,
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

    this.setState({
      collectionName: tableView.collection_name,
      display_layouts: tableView.data,
      colId: id,
      rootPath: GetAppName(this.props.user),
      collectionName: name ? name : "",
      rootPath: GetAppName(this.props.user),
      viewConfiguration: tableView,
      viewColumns: viewColumns,
      display_layout,
      orderBy,
      addDocumentBtn,
      allowPagination,
      allowSearch,
      isBackBtn,
      viewSelection
    });

    this.loadRecord(id, null, orderBy, allowPagination)
  }

  loadRecord = async (id, pagination, orderBy, allowPagination) => {

    pagination = pagination ? pagination : this.state.pagination;
    allowPagination = allowPagination ? allowPagination : this.state.allowPagination;
    const searchKey = this.state.viewColumns[0].dataField;

    var payload = {
      "id": id,
      "page": pagination.currentPage,
      "limit": allowPagination === false ? 1000 : 10,
      "orderBy": orderBy ? orderBy : this.state.orderBy,
      "search": pagination.search ? pagination.search : "",
      'searchKey': searchKey
    }
    try {
      const resdata = await this.props.Getrecords(payload);
      //debugger

      if (resdata.data.length > 0) {
        this.setState({ rows: resdata.data })
        this.setState({
          id: id,
          records: resdata.data,
          pagination: {
            ...pagination,
            search: pagination.search,
            currentPage: pagination.currentPage,
            totalPage: resdata.count,
            dataCount: resdata.data.length
          }
        });
      } else {
        this.setState({
          records: [],
          id: id,
        })
      }
    } catch (e) {

    }
  }

  handleDeleteRow = (row) => {
    this.setState({ IsModalConfirmation: true, tempformId: row.formId, temprecordId: row._id })
  }

  handelConfirm = async (response) => {
    try {
      if (response) {
        const { tempformId, temprecordId } = this.state;
        await this.props.Deleterecorde({ formId: tempformId, recordId: temprecordId })
        const res = await this.props.Getrecords({ id: tempformId, page: this.state.current_page, limit: 100, search: "" })
        this.setState({ records: res.data, IsModalConfirmation: false });
      } else {
        this.setState({ IsModalConfirmation: false })
      }
    } catch (err) {
      console.log(err.message);
      this.setState({ IsModalConfirmation: false })
    }
  }



  mappingEventData = (data) => {
    // data is the event list from db, we want to manipulate the list for rendering on calendar
    var eventList = [];
    eventList = data.map((e, i) => {
      return {
        title: "Recode " + (i + 1),
        description: "Create Date : " + moment(e.createdTime).format('DD/MM/YYYY'),
        start: moment(new Date(e.createdTime)).format("YYYY-MM-DDTHH:mm:ss"),
        overlap: false,
        rendering: 'background',
        color: e.color,
        id: (AppDesign('path') + GetAppName(this.props.user) + `/data-input?id=${e.formId}&record_id=${e._id}`)
      }
    }
    );
    return eventList.flat();
  }


  /*  Calendar Events  */
  onHandleSelectEventForm = (calEvent, jsEvent, view) => {
    const { events } = this.state;
    this.props.history.push(GetAppName(this.props.user) + calEvent.event._def.publicId)
  };



  paginationFooter = () => {
    const { pagination, id } = this.state;
    const that = this;
    return (
      <PaginationFooter
        initialPage={pagination.currentPage}
        totalCount={pagination.totalPage}
        pageRecord={pagination.pageRecord}
        DataCount={pagination.dataCount}
        onEvent={(page) => that.loadRecord(id, { currentPage: page.currentPage })} />)
  }

  doSearch(evt) {
    const { pagination, id } = this.state;
    var searchText = evt.target.value; // this is the search text
    const that = this;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      that.loadRecord(id, { currentPage: 1, search: searchText })
    }, 300);
  }

  searchbar = () => {
    return (
      <label for="search-bar-0" class="search-label">
        <span id="search-bar-0-label" class="sr-only">Search this table</span>
        <input onChange={evt => this.doSearch(evt)} id="search-bar-0" type="text" class="form-control " placeholder="Search" style={{ "height": "44px" }} />
      </label>
    )
  }


  render() {
    const {
      collectionName,
      records,
      display_layout,
      rows,
      viewColumns,
      colId,
      rootPath,
      display_layouts,
      IsModalConfirmation,
      addDocumentBtn,
      allowPagination,
      allowSearch,
      isBackBtn,
      viewSelection
    } = this.state

    return (
      <Fragment>
        {(IsModalConfirmation) && <ModalConfirmation IsModalConfirmation={IsModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}

        {viewColumns.length != 0 &&
          <ToolkitProvider keyField='_id' data={rows} columns={viewColumns} exportCSV search>
            {props => (
              <Fragment>

                {(display_layout == "DataTable" && this.state.viewConfiguration) &&
                  <DataTableView
                    colId={colId}
                    user={this.props.user}
                    collectionName={collectionName}
                    addDocumentBtn={addDocumentBtn}
                    allowPagination={allowPagination}
                    allowSearch={allowSearch}
                    isBackBtn={isBackBtn}
                    viewSelection={viewSelection}
                    data={records}
                    baseProps={props.baseProps}
                    viewConfig={this.state.viewConfiguration.data[0]}
                    onDeleteRow={(row) => this.handleDeleteRow(row)}
                    display_layout={display_layout}
                    display_layouts={display_layouts}
                    paginationFooter={this.paginationFooter}
                    searchbar={this.searchbar}
                    onChangeLayout={(e) => { this.setState({ display_layout: e }) }} />
                }

                {(display_layout !== "DataTable" && !this.state.viewConfiguration) &&
                  <div className='h-100 container-fluid'>
                    <div className='row h-100 justify-content-center full-height'>
                      <div className='col-12 h-100 align-self-center text-center'>
                        <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
                        <p>There is no default view setup for this collection</p>
                      </div>
                    </div>
                  </div>
                }

                {['CardView', 'CalendarView'].includes(display_layout) &&
                  <div className="panel">
                    <div className="panel-heading collection-header d-flex">
                      <div className='panel-title'>
                        <h3>{collectionName ? collectionName : 'Collection'}</h3>
                      </div>
                      <div className="panel-action" style={{ display: 'flex', justifyContent: 'flex-end', alignContent: 'center', alignItems: 'baseline' }}>

                        {allowSearch && <div>{this.searchbar()}</div>}

                        {addDocumentBtn && <Link className="btn btn-primary custom-padding ml-3 mr-3" to={AppDesign('path') + rootPath + `/data-input?id=${colId}`}>New</Link>}

                      </div>
                    </div>
                    <div className="panel-block bg-white">
                      <div className='p-3 w-full collection-data-list ' style={{ "minHeight": "610px", "position": "relative" }}>
                        {
                          display_layout == "CardView" &&
                          <Row>
                            {records && records.map((collection, i) => (
                              <CardLists
                                key={i}
                                style={{ "marginRight": "35px", "marginBottom": "35px", }}
                                title={"Recode " + (i + 1)}
                                description={"Create Date : " + moment(collection.createdTime).format('DD/MM/YYYY')}
                                button1={viewSelection}
                                button1Text='Open'
                                button1Url={GetAppName(this.props.user) + `/data-input?id=${collection.formId}&record_id=${collection._id}`} />
                            ))
                            }
                          </Row>
                        }

                        {
                          display_layout == "CalendarView" &&
                          <div style={{ padding: "30px", backgroundColor: "#fff" }}>
                            <FullCalendar
                              plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                              initialView="dayGridMonth"
                              displayEventTime={true}
                              height="80vh"
                              headerToolbar={{
                                left: "today prev,next",
                                center: "title",
                                right: 'timeGridDay dayGridMonth timeGridWeek listWeek'
                              }}
                              navLinks={true}
                              nowIndicator={true}
                              selectable={true}
                              editable={true}
                              droppable={true}
                              events={this.mappingEventData(records)}
                              eventClick={this.onHandleSelectEventForm}>
                            </FullCalendar>
                          </div>
                        }
                        <div style={{ "bottom": 0, "position": "absolute", "width": "100%", "left": 0 }}>
                          {(allowPagination && display_layout == "CardView") && this.paginationFooter()}
                        </div>
                      </div>
                    </div>
                  </div>
                }

              </Fragment>
            )}
          </ToolkitProvider>
        }

        {(viewColumns.length == 0) &&
          <div className='h-100 container-fluid'>
            <Button onClick={() => window.history.back()}>Back</Button>
            <div className='row h-100 justify-content-center full-height'>
              <div className='col-12 h-100 align-self-center text-center'>
                <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
                <p>There is no default view setup for this collection</p>
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
  Getrecords: (data) => dispatch(Getrecords(data)),
  GetTableView: (data) => dispatch(GetTableView(data)),
  Deleterecorde: (data) => dispatch(Deleterecorde(data)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CollectionViewList)
