import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Formik, ErrorMessage, Form } from "formik";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { GetPathLists } from "../../actions/collection";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import * as Yup from "yup";
import axios from "../../utils/axiosService";
import { TabContent, TabPane, NavLink, NavItem, Nav } from "reactstrap";
import { Toast, GetAppName, AppDesign } from "../../utils/helperFunctions";
import queryString from "query-string";
import { FormBuilder, Components } from "react-formio";
import { FormattedMessage } from "react-intl";
import constant from "../../utils/constant";
import API from "../../config";
import auth from "../../actions/auth";
import components from "../../components/formioCustom";
import jp from "jsonpath";
import { Formio } from "formiojs";
import FormioContrib from "glozic-form";
import classnames from "classnames";
import SimpleBar from "simplebar-react";
import PageLayoutPreview from "./components/PageLayoutPreview";
import PageLayoutFormData from "./components/PageLayoutFormData";
import "./CreatePage.css";

const validationSchema = Yup.object().shape({
  pageName: Yup.string().required("Page Name is a required field."),
  pageDescription: Yup.string().required(
    "Page Description is a required field."
  ),
  pathId: Yup.string().required("Page Group is a required field."),
});

const initState = {
  pageName: "",
  pageDescription: "",
  isSideNav: false,
  isTopNav: false,
  pathId: "",
};

//import FormioContrib from '@formio/contrib';
Formio.use(FormioContrib);
Components.setComponents(components);
// import { Toast, isEmptyString, getHostInfo, GetAppName, SetFormSchemaDefaultAndComputedValue } from '../../../utils/helperFunctions';
const formOptions = {
  builder: {
    custom: {
      title: "Layout",
      default: true,
      weight: 10,
      components: {
        edgeframe: true,
        divcomponent: true,
        htmlelement: true,
        content: true,
        modal: true,
        card: true,
        columns: true,
        fieldset: true,
        panel: true,
        table: true,
        tabs: true,
        textfield: false,
        textarea: false,
        number: false,
        password: false,
        checkbox: false,
        select: false,
        radio: false,
        button: false,
        horizontalDividerCustomComp: true,
      },
    },
    basic: {
      title: "Form",
      default: false,
      weight: 20,
      components: {
        button: false,
        customform: true,
        CkeditorCutome: true,
        btnCustom: {
          title: "Button",
          key: "btnCustom",
          icon: "stop",
          weight: 120,
          schema: {
            label: "Custom",
            type: "button",
            key: "btnCustom",
            action: "custom",
            input: true,
          },
        },
      },
    },
    layout: false,
    advanced: false,
    data: {
      weight: 30,
      components: {
        hidden: true,
        container: false,
        datamap: false,
        datagrid: false,
        editgrid: true,
        tree: false,
        dataTableCustomComp: true,
        tocCustomComp: true,
        // pictureAnnotationCustomComp: true,
      },
    },
    premium: false,
  },
  noDefaultSubmitButton: true,
};
class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.localFormschema = { display: "form" };
    this.state = {
      _id: undefined,
      jsEditor: "",
      current_step: 1,
      pageName: "",
      pageDescription: "",
      externalAccess: false,
      isSideNav: true,
      isTopNav: true,
      showActionModal: true,
      actionType: "event",
      viewField: [],
      is_dashboard: false,
      extSources: [{ var: "user", type: "Object" }],
      eventsConfig: [
        {
          id: 0,
          name: "pageBeingLoaded",
          type: "event",
          eventName: "Page being loaded",
          actions: [],
          conditions: {},
        },
      ],
      actionsConfig: [],
      actionsFlow: undefined,
      actionsFlowIdx: 0,
      editRow: -1,
      editName: "",
      editDesc: "",
      setting_step: 1,
      form_setting_step: 0,
      isSetting: false,
      pathId: "",
      pageName: "",
      pageDescription: "",
      setNewPageModal: false,
      PageList: [],
      pathLists: [],
    };
  }

  changeCurrentView = (id) => {
    if (this.state.current_step != id) this.setState({ current_step: id });
  };

  componentDidMount = async () => {
    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    var pathLists = await this.props.GetPathLists();
    if (id && id != "new") {
      this.loadFormData(id);
      this.setState({ pathLists: pathLists.data });
    } else {
      this.setState({ setNewPageModal: true, pathLists: pathLists.data });
    }
  };

  loadFormData = async (formId) => {
    try {
      const res = await axios.apis(
        "GET",
        `/api/page-layout-list/${formId}`,
        auth.headers
      );
      var {
        _id,
        pathId,
        pageName,
        pageDescription,
        isSideNav,
        isTopNav,
        externalAccess,
        eventsConfig,
        actionsConfig,
        viewField,
        extSources,
        is_dashboard,
        jsEditor,
      } = res.data;

      this.localFormschema = JSON.parse(res.data.formSchema);

      this.setState({
        _id: _id,
        pathId: pathId,
        pageName: pageName,
        pageDescription: pageDescription,
        externalAccess: externalAccess,
        isSideNav: isSideNav,
        isTopNav: isTopNav,
        viewField: viewField,
        is_dashboard: is_dashboard || false,
        eventsConfig: eventsConfig,
        actionsConfig: actionsConfig,
        extSources: extSources || [],
        jsEditor: jsEditor,
      });
    } catch (err) {
      Toast(err.message, "error");
    }
  };

  handleInputChange(e, type) {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);
    if (type == "checkbox") {
      this.setState({ [name]: !this.state[name] });
    } else {
      this.setState({ [name]: value });
    }
  }

  handleFormOnChange = (e) => {
    var { submission } = this.state;
    if (
      e.changed &&
      e.changed.component.key === "customerNumber" &&
      e.changed.value
    ) {
      console.log("passed...");
    }
  };

  handleCreateUpdate = async (reqPayload) => {
    try {
      console.log(reqPayload);
      const { location } = this.props;
      const { app_id } = this.props.user;
      const {
        _id,
        pageName,
        pageDescription,
        is_dashboard,
        actionsConfig,
        eventsConfig,
        viewField,
        extSources,
        isSideNav,
        isTopNav,
        jsEditor,
        pathId,
        externalAccess,
      } = this.state;
      const id = _id && _id != "" ? _id : queryString.parse(location.search).id;
      var data = {
        pageId: id,
        appId: app_id,
        pathId: reqPayload.pathId || (pathId ? null : pathId),
        pageName: reqPayload.pageName || pageName,
        isSideNav: reqPayload.isSideNav || isSideNav,
        isTopNav: reqPayload.isTopNav || isTopNav,
        pageDescription: reqPayload.pageDescription || pageDescription,
        is_dashboard: is_dashboard,
        viewField: viewField,
        externalAccess: externalAccess,
        formSchema: JSON.stringify(this.localFormschema),
        eventsConfig: eventsConfig,
        actionsConfig: actionsConfig,
        extSources: extSources,
        jsEditor: jsEditor,
      };

      const resData = await axios.apis(
        "POST",
        `/api/create-page-layout`,
        data,
        auth.headers
      );
      if (resData.status) {
        if (id === "new" && !reqPayload.pageName)
          this.props.history.push(
            "/design" + GetAppName(this.props.user) + "/page-list"
          );
        if (reqPayload.pageName)
          this.setState({
            setNewPageModal: false,
            ...data,
            _id: resData.insertData,
          });
        if (!reqPayload.pageName) Toast(resData.message, "success", 1000);
      } else {
        Toast(resData.message, "error", 1000);
      }
    } catch (err) {
      Toast(resData.message, "error", 1000);
    }
  };

  loadViewConfig(e, type) {
    let { viewField } = this.state;
    let inputTypes = [
      "modal",
      "textfield",
      "textarea",
      "number",
      "password",
      "checkbox",
      "selectboxes",
      "select",
      "radio",
      "dataTableCustomComp",
      "tocCustomComp",
    ];

    if (type == "save" && inputTypes.includes(e.type)) {
      var indexKey = viewField.findIndex((x) => x.key == e.key);
      if (indexKey >= 0) {
        viewField[indexKey] = {
          title: e.label ? e.label : e.type,
          key: e.key,
          visible: true,
          length: "0",
          value: "",
          component: JSON.stringify(e),
        };
      } else {
        viewField.push({
          title: e.label ? e.label : e.type,
          key: e.key,
          visible: true,
          length: "0",
          value: "",
          component: JSON.stringify(e),
        });
      }
    } else if (type == "delete" && inputTypes.includes(e.type)) {
      var indexKey = viewField.findIndex((x) => x.key == e.key);
      if (indexKey >= 0) {
        viewField.splice(indexKey, 1);
      }
    }
    this.setState((prevState) => ({ viewField: viewField }));
  }

  onCopyText = (name) => {
    console.log(name);
    var copyText = document.getElementById(name);
    copyText.select();
    document.execCommand("copy");
    Toast("Copied", "info", 1000);
  };

  render() {
    const { location, user } = this.props;
    const { id } = queryString.parse(location.search);
    const {
      viewField,
      current_step,
      _id,
      isSideNav,
      isTopNav,
      actionsConfig,
      eventsConfig,
      extSources,
      setting_step,
      form_setting_step,
      isSetting,
      setNewPageModal,
      pathLists,
      pageName,
      pathId,
      externalAccess,
      pageDescription,
    } = this.state;

    const externalPathName = pathLists.find((item) => item._id == pathId)
      ? pathLists.find((item) => item._id == pathId).path_name
      : null;
    var rootPath = GetAppName(this.props.user);
    localStorage.setItem("EXTSOU", JSON.stringify(extSources));
    localStorage.setItem("_MANUALACTIONS", JSON.stringify(actionsConfig));

    return (
      <Fragment>
        {/* Page Layout Penal  */}
        <div
          tabs
          className="topnav nav-tabs nav-justified"
          style={{ marginTop: "-29px" }}
        >
          <div className="container-fluid d-flex">
            <div className="form_designer-tabls" style={{ paddingTop: "9px" }}>
              <lable
                type="button"
                class="mr-3 ml-2 outline-tabs-icon"
                title='Action'
                onClick={() => this.setState({ isSetting: !isSetting })}
                style={{ "margin-left": "-6px", "margin-top": "7px" }}
              >
                <i
                  class="fa fa-cog"
                  aria-hidden="true"
                ></i>
              </lable>
            </div>
            <Nav className="">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 1 })}
                  onClick={() => {
                    this.changeCurrentView(1);
                  }}
                >
                  <span>
                    <FormattedMessage id="page.page_layout" />
                  </span>
                </NavLink>
              </NavItem>
            </Nav>

            {current_step == 1 && (
              // <div
              //   className="form_designer-tabls float-left ml-3 d-flex"
              //   style={{ paddingTop: "9px" }}
              // >
              //   <Button
              //     title="Preview"
              //     onClick={() => this.setState({ form_setting_step: 1 })}
              //     className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary ${
              //       form_setting_step === 1 ? "active" : ""
              //     }`}
              //   >
              //     <span
              //       className="material-icons "
              //       style={{ marginLeft: "-6px", marginTop: "-2px" }}
              //     >
              //       pageview
              //     </span>
              //   </Button>
              //   <Button
              //     title="Data"
              //     onClick={() => this.setState({ form_setting_step: 2 })}
              //     className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary ${
              //       form_setting_step === 2 ? "active" : ""
              //     }`}
              //   >
              //     <span
              //       className="material-icons "
              //       style={{ marginLeft: "-6px", marginTop: "-2px" }}
              //     >
              //       settings_ethernet
              //     </span>
              //   </Button>
              //   <Button
              //     title="Data"
              //     onClick={() => this.setState({ form_setting_step: 3 })}
              //     className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary ${
              //       form_setting_step === 2 ? "active" : ""
              //     }`}
              //   >
              //     <span
              //       className="material-icons "
              //       style={{ marginLeft: "-6px", marginTop: "-2px" }}
              //     >
              //       hide_image
              //     </span>
              //   </Button>
              //   <Button
              //     title="Data"
              //     className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary `}
              //   >
              //     <span
              //       className="material-icons "
              //       style={{ marginLeft: "-6px", marginTop: "-2px" }}
              //     >
              //       help
              //     </span>
              //   </Button>
              //   {/* <Button title="Open" onClick={() => window.open(`${AppDesign('path') + rootPath + "/page/" + _id}`, '_blank')} className="mr-3 pl-2 pr-2" style={{ "marginBottom": "0", "paddingTop": "2px" }}><i className="pointer material-icons" data-toggle="tooltip" title="Open">call_missed_outgoing</i></Button> */}
              // </div>
              <div
                class="form_designer-tabls float-left ml-3 d-flex"
                style={{'padding-top': '9px'}}>
                <lable
                  type="button"
                  class="mr-3 ml-2 outline-tabs-icon"
                  title='Action'
                  onClick={() => this.setState({ form_setting_step: 1 })}
                  style={{'margin-left': '-6px',
                    'margin-top': '7px'}}>
                  <i
                    class="fa  fa-laptop"
                    aria-hidden="true"
                   ></i>
                </lable>
                <lable
                  type="button"
                  class="mr-3 ml-2 outline-tabs-icon "
                  title='Action'
                  onClick={() => this.setState({ form_setting_step: 2 })}
                  style={{'margin-left': '-6px',
                    'margin-top': '7px'}}>
                  <i
                    class="fa fa-usb  "
                    aria-hidden="true"
                   ></i>
                </lable>
                <lable
                  type="button"
                  class="mr-3 ml-2 outline-tabs-icon"
                  title='Action'
                  onClick={() => this.setState({ form_setting_step: 3})}
                  style={{'margin-left': '-6px',
                  'margin-top': '7px'}}>
                  <i
                    class="fa fa-code"
                    aria-hidden="true"
                    ></i>
                </lable>
                <lable
                  type="button"
                  class="mr-3 ml-2 outline-tabs-icon"
                  title='Action'
                  style={{'margin-left': '-6px',
                  'margin-top': '7px'}}>
                  <i
                    class="fa fa-question-circle"
                    aria-hidden="true"
                    ></i>
                </lable>
              </div>
            )}

          <div
            className="d-flex justify-content-end"
            style={{ right: "25px", position: "absolute", paddingTop: "2px" }}
          >
            <div className="p-2">
              <Link to={"/design" + rootPath + "/page-list"}>
                <button className="btn btn-sm btn-primary">Exit</button>
              </Link>
            </div>
            <div className="p-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={this.handleCreateUpdate}
              >
                {id == "new" ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Page Layout Tabs  */ }
    <TabContent activeTab={current_step}>
      <br />
      <br />
      {current_step == 1 && (
        <TabPane tabId={1}>
          <FormBuilder
            onSaveComponent={(e) => this.loadViewConfig(e, "save")}
            onDeleteComponent={(e) => this.loadViewConfig(e, "delete")}
            form={this.localFormschema}
            options={formOptions}
            onChange={(schema) => (this.localFormschema = schema)}
          />
        </TabPane>
      )}
    </TabContent>

    {/* //Setting Tabs  */ }
    {
      isSetting && (
        <>
          <div
            className="side-menu left-bar collection-setting "
            style={{ overflow: "scroll" }}
          >
            <SimpleBar
              className="page-sett-bar"
              style={{
                height: "900px",
                maxWidth: "100%",
                overflowX: "hidden",
                overflowY: "scroll",
              }}
            >
              <div data-simplebar className="h-100">
                <div className="mb-2 d-flex justify-content-between">
                  <label
                    title="Collection Setting"
                    className="mt-2 mr-5"
                    style={{ fontSize: "18px" }}
                  >
                    Page Setting
                  </label>
                  <i
                    onClick={() => this.setState({ isSetting: false })}
                    className="fa fa-times"
                    aria-hidden="true"
                  ></i>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div
                      className="form-group"
                      style={{ paddingLeft: "2px" }}
                    >
                      <label className="font-weight-bold">
                        <FormattedMessage id="page.name" />
                      </label>
                      <input
                        style={{ width: "100%" }}
                        className="form-control page-setting-input"
                        placeholder="Page Pame"
                        id="collection_display_name"
                        type="text"
                        value={pageName}
                        maxLength="256"
                        name="pageName"
                        onChange={(event) => this.handleInputChange(event)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div
                      className="form-group"
                      style={{ paddingLeft: "2px" }}
                    >
                      <label className="font-weight-bold">
                        <FormattedMessage id="page.description" />
                      </label>
                      <textarea
                        style={{ width: "100%" }}
                        className="form-control page-setting-input"
                        placeholder="Page Description"
                        id="collection_display_desc"
                        type="text"
                        value={pageDescription}
                        maxLength="256"
                        name="pageDescription"
                        onChange={(event) => this.handleInputChange(event)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div
                      className="form-group"
                      style={{ paddingLeft: "2px", width: "100%" }}
                    >
                      <label className="font-weight-bold">Page Group</label>
                      <select
                        className="form-control form-select-modified"
                        name="pathId"
                        value={pathId}
                        id="pathId"
                        onChange={(event) => this.handleInputChange(event)}
                      >
                        <option value="">Select Access Path</option>
                        <option value="5a190371db85375976b48001">
                          Root Path
                        </option>
                        {pathLists.map((item, i) => (
                          <option key={i} value={item._id}>
                            {item.path_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <hr className="mt-1 mb-1" />
                  </div>

                  <div className="col-lg-12" style={{ alignSelf: "center" }}>
                    {_id && (
                      <div>
                        <div>
                          <span
                            className="form-control font-weight-bold"
                            style={{
                              border: "none",
                              paddingLeft: "2px",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {" "}
                            Allow External Access
                            <div className="custom-control custom-switch mb-2">
                              <input
                                name="externalAccess"
                                checked={externalAccess}
                                onChange={(e) =>
                                  this.handleInputChange(e, "checkbox")
                                }
                                type="checkbox"
                                className="custom-control-input"
                                id="externalAccess"
                              />
                              <label
                                className="custom-control-label"
                                for="externalAccess"
                              />
                            </div>
                          </span>

                          {externalAccess && (
                            <div>
                              {pathId && (
                                <label className="font-weight-bold">
                                  External URL
                                </label>
                              )}

                              {pathId && (
                                <div className="input-group">
                                  <input
                                    type="text"
                                    id="external_url"
                                    className="form-control input-monospace input-sm color-bg-secondary"
                                    data-autoselect=""
                                    value={
                                      API.BASE_URL +
                                      "/page" +
                                      externalPathName +
                                      "/" +
                                      pageName
                                    }
                                    readOnly=""
                                  />
                                  <div className="input-group-button">
                                    <clipboard-copy
                                      onClick={() =>
                                        this.onCopyText("external_url")
                                      }
                                      style={{ fontSize: "20px" }}
                                      value={
                                        API.BASE_URL +
                                        "/page/" +
                                        externalPathName +
                                        "/" +
                                        pageName
                                      }
                                      tabindex="0"
                                      role="button"
                                    >
                                      <svg
                                        aria-hidden="true"
                                        viewBox="0 0 16 16"
                                        version="1.1"
                                        data-view-component="true"
                                        height="16"
                                        width="16"
                                        className="octicon octicon-clippy js-clipboard-clippy-icon d-inline-block"
                                      >
                                        <path d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path>
                                      </svg>
                                    </clipboard-copy>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <hr className="mt-1 mb-1" />
                  </div>

                  <div className="col-lg-12" style={{ alignSelf: "center" }}>
                    {_id && (
                      <div>
                        <span
                          className="form-control font-weight-bold"
                          style={{ border: "none", paddingLeft: "2px" }}
                        >
                          {" "}
                          Public URL{" "}
                        </span>
                        <div className="input-group">
                          <input
                            type="text"
                            id="external_url"
                            className="form-control input-monospace input-sm color-bg-secondary"
                            data-autoselect=""
                            value={API.BASE_URL + "/public/page/" + _id}
                            readOnly=""
                          />
                          <div className="input-group-button">
                            <clipboard-copy
                              onClick={() => this.onCopyText("external_url")}
                              style={{ fontSize: "20px" }}
                              value={API.BASE_URL + "/public/page/" + _id}
                              tabindex="0"
                              role="button"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 16 16"
                                version="1.1"
                                data-view-component="true"
                                height="16"
                                width="16"
                                className="octicon octicon-clippy js-clipboard-clippy-icon d-inline-block"
                              >
                                <path d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path>
                              </svg>
                            </clipboard-copy>
                          </div>
                        </div>
                      </div>
                    )}
                    <hr className="mt-1 mb-1" />
                  </div>
                  <div className="col-lg-12" style={{ alignSelf: "center" }}>
                    {_id && (
                      <div>
                        <span
                          className="form-control font-weight-bold"
                          style={{ border: "none", paddingLeft: "2px" }}
                        >
                          {" "}
                          Internal URL{" "}
                        </span>
                        <div className="input-group">
                          <input
                            type="text"
                            id="interal_url"
                            className="form-control input-monospace input-sm color-bg-secondary"
                            data-autoselect=""
                            value={API.BASE_URL + rootPath + "/page/" + _id}
                            readOnly=""
                          />
                          <div className="input-group-button">
                            <clipboard-copy
                              onClick={() => this.onCopyText("interal_url")}
                              style={{ fontSize: "20px" }}
                              value={API.BASE_URL + rootPath + "/page/" + _id}
                              tabindex="0"
                              role="button"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 16 16"
                                version="1.1"
                                data-view-component="true"
                                height="16"
                                width="16"
                                className="octicon octicon-clippy js-clipboard-clippy-icon d-inline-block"
                              >
                                <path d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path>
                              </svg>
                            </clipboard-copy>
                          </div>
                        </div>
                      </div>
                    )}
                    <hr className="mt-1 mb-1" />
                  </div>

                  <div className="col-lg-12" style={{ alignSelf: "center" }}>
                    {_id && (
                      <div className>
                        <label>&nbsp;</label>
                        <span
                          className="form-control font-weight-bold"
                          style={{ border: "none", paddingLeft: "2px" }}
                        >
                          {" "}
                          URL Path{" "}
                        </span>
                        <div className="input-group">
                          <input
                            type="text"
                            id="url_path"
                            className="form-control input-monospace input-sm color-bg-secondary"
                            value={"/" + "<<AppName>>/page/" + _id}
                            readOnly=""
                          />
                          <div className="input-group-button">
                            <clipboard-copy
                              onClick={() => this.onCopyText("url_path")}
                              style={{ fontSize: "20px" }}
                              value={"/" + "<<AppName>>/page/" + _id}
                              tabindex="0"
                              role="button"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 16 16"
                                version="1.1"
                                data-view-component="true"
                                height="16"
                                width="16"
                                className="octicon octicon-clippy js-clipboard-clippy-icon d-inline-block"
                              >
                                <path d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path>
                              </svg>
                            </clipboard-copy>
                          </div>
                        </div>
                      </div>
                    )}
                    <hr />
                  </div>
                  <div className="col-lg-12" style={{ alignSelf: "center" }}>
                    <span
                      className="form-control font-weight-bold"
                      style={{ border: "none", paddingLeft: "2px" }}
                    >
                      {" "}
                      Layout Setting{" "}
                    </span>
                    <div className="d-flex justify-content-start">
                      <div className="custom-control custom-switch pointer">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch1"
                          checked={isTopNav}
                          onChange={(e) =>
                            this.setState({ isTopNav: !isTopNav })
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch1"
                        >
                          Display Top Navigation
                        </label>
                      </div>
                    </div>
                  </div>
                  <div
                    className="col-lg-12 mt-2"
                    style={{ alignSelf: "center" }}
                  >
                    <div className="d-flex justify-content-start">
                      <div className="custom-control custom-switch pointer">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch2"
                          checked={isSideNav}
                          onChange={(e) =>
                            this.setState({ isSideNav: !isSideNav })
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch2"
                        >
                          Display Side Navigation
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SimpleBar>
          </div>
          <div
            className="leftbar-overlay"
            onClick={() => this.setState({ isSetting: false })}
          ></div>
        </>
      )
    }

    {/* Collection Preview */ }
    {
      form_setting_step == 1 && (
        <PageLayoutPreview
          previewSchema={this.localFormschema}
          previewModal={true}
          toggle={() => this.setState({ form_setting_step: 0 })}
        />
      )
    }

    {/* Action flow  */ }
    {
      form_setting_step == 2 && (
        <>
          <div className="side-menu right-bar collection-setting overflow">
            <SimpleBar
              style={{
                "max-width": "100%",
                overflowX: "hidden",
                overflowY: "hidden",
              }}
            >
              <div data-simplebar className="h-100">
                <div className="mb-3 d-flex position-relative side-menu-header">
                  <i
                    onClick={() => this.setState({ form_setting_step: 0 })}
                    className="fa fa-times"
                    aria-hidden="true"
                  ></i>
                  <h5 className="title">Actions</h5>
                </div>
                <PageLayoutFormData
                  AppId={this.props.user.app_id}
                  ExtSources={extSources}
                  EventsConfig={eventsConfig}
                  ActionsConfig={actionsConfig}
                  viewField={viewField}
                  user={this.props.user}
                  saveActionsConfig={(config, type) => {
                    console.log("config", config);
                    console.log("type", type);
                    if (type == "variable") {
                      this.setState({ extSources: config });
                    } else if (type == "event") {
                      this.setState({ eventsConfig: config });
                    } else {
                      this.setState({ actionsConfig: config });
                    }
                  }}
                />
              </div>
            </SimpleBar>
          </div>
          <div
            className="leftbar-overlay"
            onClick={() => this.setState({ form_setting_step: 0 })}
          ></div>
        </>
      )
    }

    {
      form_setting_step == 3 && (
        <>
          <div className="side-menu right-bar page-html-js-editor overflow">
            <SimpleBar
              style={{
                height: "900px",
                "max-width": "100%",
                overflowX: "hidden",
                overflowY: "hidden",
              }}
            >
              <div data-simplebar className="h-100">
                <div className="mb-3">
                  <i
                    onClick={() => this.setState({ form_setting_step: 0 })}
                    className="fa fa-times"
                    aria-hidden="true"
                  ></i>
                </div>
                <AceEditor
                  name="value"
                  id="value"
                  mode="json"
                  width="100%"
                  height="100vh"
                  readOnly={false}
                  value={this.state.jsEditor}
                  highlightActiveLine={true}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 2,
                  }}
                  onChange={(e) => this.setState({ jsEditor: e })}
                />
              </div>
            </SimpleBar>
          </div>
          <div
            className="leftbar-overlay"
            onClick={() => this.setState({ form_setting_step: 0 })}
          ></div>
        </>
      )
    }
    <Modal className="modal-md overlay" isOpen={setNewPageModal}>
      <ModalHeader
        toggle={() =>
          (window.location.href = "/design" + rootPath + "/page-list")
        }
      >
        Page setting
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={initState}
          validationSchema={validationSchema}
          validateOnChange
          validateOnBlur
          onSubmit={(values) => {
            const data = {
              pageName: values.pageName,
              pageDescription: values.pageDescription,
              isTopNav: values.isTopNav,
              isSideNav: values.isSideNav,
              pathId: values.pathId,
            };
            this.handleCreateUpdate(data);
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            isSubmitting,
            submitCount,
            setFieldValue,
          }) => (
            <Form>
              <div className="row">
                <div className="col-lg-12">
                  <div
                    className="form-group"
                    style={{ paddingLeft: "2px" }}
                  >
                    <label className="font-weight-bold">
                      Page Name<span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pageName"
                      name="pageName"
                      rows="4"
                      value={values.pageName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage
                      className="validation-error"
                      name="pageName"
                      component="div"
                    />
                  </div>
                </div>
                <div className="col-lg-12">
                  <div
                    className="form-group"
                    style={{ paddingLeft: "2px" }}
                  >
                    <label className="font-weight-bold">
                      Page Description
                      <span className="required-star">*</span>
                    </label>
                    <textarea
                      style={{ width: "100%" }}
                      className="form-control"
                      id="pageDescription"
                      name="pageDescription"
                      type="text"
                      maxLength="256"
                      value={values.pageDescription}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    ></textarea>
                    <ErrorMessage
                      className="validation-error"
                      name="pageDescription"
                      component="div"
                    />
                  </div>
                </div>

                <div className="col-lg-12">
                  <div
                    className="form-group"
                    style={{ paddingLeft: "2px", width: "100%" }}
                  >
                    <label className="font-weight-bold">
                      Page Group<span className="required-star">*</span>
                    </label>
                    <select
                      className="form-control form-select-modified"
                      name="pathId"
                      id="pathId"
                      value={values.pathId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select Access Path</option>
                      <option value="5a190371db85375976b48001">
                        Root Path
                      </option>
                      {pathLists.map((item, i) => (
                        <option key={i} value={item._id}>
                          {item.path_name}
                        </option>
                      ))}
                    </select>
                    <ErrorMessage
                      className="validation-error"
                      name="pathId"
                      component="div"
                    />
                  </div>
                </div>

                <div className="col-lg-12">
                  <span
                    className="form-control font-weight-bold"
                    style={{ border: "none", paddingLeft: "2px" }}
                  >
                    {" "}
                    Layout Setting{" "}
                  </span>
                  <div className="d-flex justify-content-start">
                    <div className="custom-control custom-switch pointer">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="isTopNav"
                        name="isTopNav"
                        checked={values.isTopNav}
                        onChange={(e) =>
                          setFieldValue("isTopNav", !values.isTopNav)
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="isTopNav"
                      >
                        Display Top Navigation
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12 mt-2">
                  <div className="d-flex justify-content-start">
                    <div className="custom-control custom-switch pointer">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="isSideNav"
                        name="isSideNav"
                        checked={values.isSideNav}
                        onChange={(e) =>
                          setFieldValue("isSideNav", !values.isSideNav)
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="isSideNav"
                      >
                        Display Side Navigation
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12 mt-3">
                  <Link to={"/design" + rootPath + "/page-list"}>
                    <Button className="btn btn-secondary float-left">
                      cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="btn btn-secondary float-right"
                  >
                    submit
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
      </Fragment >
    );
  }
}

const mapStateToProps = ({ user, PageLayoutFormSchema }) => ({
  user,
  PageLayoutFormSchema,
});

const mapDispatchToProps = (dispatch) => ({
  GetPathLists: (data) => dispatch(GetPathLists(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreatePage);
