import React, { Component, Fragment } from "react";
import { FormBuilder, Components } from "react-formio";
import { connect } from "react-redux";
import { Formik, ErrorMessage, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import queryString from "query-string";
import { FormattedMessage } from "react-intl";
import AceEditor from "react-ace";
import "brace/mode/json";
import Select from "react-select";
import QRCode from "qrcode.react";
import classnames from "classnames";
import moment from "moment";
import SimpleBar from "simplebar-react";
import jp from "jsonpath";
import EndPoint from "./components/endpointapi";
import {
  TabContent,
  TabPane,
  Collapse,
  NavLink,
  NavItem,
  CardText,
  UncontrolledCollapse,
  Nav,
  Button,
  Card,
  Row,
  Col,
  Modal,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  ModalBody,
  DropdownToggle,
  Table,
  Input,
  ModalFooter,
  ModalHeader,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardHeader,
  Container,
  UncontrolledDropdown,
} from "reactstrap";

import axios from "../../../utils/axiosService";
import { fullUrlPathPDF } from "../../../utils/helperFunctions";
import constant from "../../../utils/constant";
import components from "../../../components/formioCustom";
import * as ACT from "../../../actions";
import API from "../../../config";
import auth from "../../../actions/auth";
import TagsInput from "../../../components/TagsInput";
import ModalConfirmation from "../../../components/ModalConfirmation";
import CollectionTemplates from "../CollectionTemplates";
import FormActions from "./FormActions";
import ViewConfig from "./ViewConfig";
import CollectionFormData from "./components/CollectionFormData";
import CollectionPreview from "./components/CollectionPreview";
import "./CollectionForm.css";
import {
  Toast,
  reconfigViewField,
  isEmptyString,
  getHostInfo,
  GetAppName,
  SetFormSchemaDefaultAndComputedValue,
  GetTenantName,
} from "../../../utils/helperFunctions";

Components.setComponents(components);

const languages = constant.languages;

const systemFields = [
  { title: "Created", key: "createdTime", visible: false, length: "0" },
  { title: "Created By", key: "createdBy", visible: false, length: "0" },
  { title: "Modified", key: "modifiedTime", visible: false, length: "0" },
  { title: "Modified By", key: "modifiedBy", visible: false, length: "0" },
];

const validationSchema = Yup.object().shape({
  collectionName: Yup.string().required("collection Name is a required field."),
  collectionDescription: Yup.string().required(
    "collection Description is a required field."
  ),
});

const initState = {
  collectionName: "",
  collectionDescription: "",
};

const formOptions = {
  builder: {
    basic: {
      components: {
        CkeditorCutome: true,
        button: {
          title: "Button (Submit)",
          key: "submit",
          icon: "stop",
          weight: 110,
          schema: {
            label: "Submit",
            type: "button",
            key: "submit",
            action: "submit",
            input: true,
          },
        },
        btnCustom: {
          title: "Button (Custom)",
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
        btnEvent: {
          title: "Button (Event)",
          key: "btnEvent",
          icon: "stop",
          weight: 130,
          schema: {
            label: "Event",
            type: "button",
            key: "btnEvent",
            action: "event",
            input: true,
          },
        },
      },
    },
    advanced: {
      components: {
        dataTableCustomComp: true,
        progressBarCustomComp: true,
        recaptcha: false,
        resource: false,
        file: {
          title: "File",
          key: "upload",
          icon: "file",
          weight: 130,
          schema: {
            label: "Upload",
            type: "file",
            storage: "base64",
            fileMaxSize: "100MB",
            key: "upload",
            input: true,
          },
        },
        form: false,
        unknown: true,
      },
    },
    layout: {
      components: {
        horizontalDividerCustomComp: true,
        qrCodeCustomComp: true,
        pictureAnnotationCustomComp: true,
      },
    },
    premium: false,
  },
  editForm: {
    file: [
      {
        key: "file",
        components: [
          { key: "storage", ignore: true },
          { key: "dir", ignore: true },
          { key: "fileNameTemplate", ignore: true },
        ],
      },
    ],
    button: [{ key: "display", components: [{ key: "action", ignore: true }] }],
  },
};

class collectionForm extends Component {
  constructor(props) {
    super(props);
    this.localFormschema = { display: "form" };
    this.defaultViewConfig = [];
    this.state = {
      is_refersh_form: true,
      selectedFilePDF: null,
      current_step: 1,
      tabSelected: 1,
      formLanguage: {
        options: [{ en: "English" }],
        language: "en",
        i18n: { en: {} },
      },
      submission: { isNew: true },
      previewSchema: { display: "form", components: [] },
      hasFormFieldsChanged: false,
      createdActionAPI: null,
      modifiedActionAPI: null,
      is_system: false,
      is_anonymous_form: false,
      is_pdf_upload: false,
      external_redirect_url: "",
      internal_redirect_url: "",
      is_default_external_redirect_url: true,
      is_default_internal_redirect_url: true,
      extAccessAuthentication: true,
      multipleSubmissions: true,
      templateModal: false,
      formType: "form",
      Pdf_file_name: "",
      viewField: JSON.parse(JSON.stringify(systemFields)),
      selectTemplate: null,
      TemplateList: [],
      Mastertemplate: [],
      sharepointList: [],
      temPermission: { read: [], readAl: [], write: [], design: [] }, //values assigned and used in form
      collection: {
        _id: "",
        collectionName: "",
        collectionDescription: "",
        otpContacts: "",
        externalAccess: false,
        formschema: { display: "form", components: [] },
        viewTables: [
          {
            title: "Default",
            viewType: "DataTable",
            viewTheme: "",
            is_defualt: true,
            properties: JSON.parse(JSON.stringify(systemFields)),
          },
        ],
        eventsConfig: null,
        permission: {}, //values to assigned from and saved to collection
        dataEventsConfig: [
          {
            id: 0,
            name: "collectionBeingLoaded",
            type: "event",
            eventName: "Collection being loaded",
            actions: [],
            conditions: {},
          },
        ],
        dataActionsConfig: [],
        extSources: [{ var: "user", type: "Object" }],
        last_publish_date: "",
        enableEndPoint: false,
      },
      formId: undefined,
      lang2Add: null,
      lang2Del: null,
      deleteLangModal: false,
      options: [],
      dataSrcModal: false,
      dataSrc: {
        i: -1,
        url: "",
        type: "Web request",
        var: "",
        verified: false,
      },
      deleteModal: false,
      deleteMessage: "",
      publishConfirm: false,
      setting_step: 1,
      form_setting_step: 0,
      isSetting: false,
      is_lang_menu: false,
      lng: "fran?aise",
      setNewCollectionModal: false,
    };
  }

  addConfiguration(data) {
    this.setState({
      ...this.state,
      collection: {
        ...this.state.collection,
        viewTables: [...this.state.collection.viewTables, data],
      },
    });
  }

  componentDidMount = async () => {
    const { id: formId } = queryString.parse(this.props.location.search);
    var { options } = this.state;

    //Load Form
    if (formId != "new") {
      await this.loadFormData(formId);
      this.setState({ formId: formId });
    } else {
      const TemplateList = await axios.apis(
        "GET",
        `/api/GetCollectionTemplateList/` + this.props.user.User_data._id,
        auth.headers
      );
      this.localFormschema = JSON.parse(JSON.stringify({ display: "form" }));
      this.setState({
        setNewCollectionModal: true,
        TemplateList: TemplateList.data,
        Mastertemplate: TemplateList.dataMaster,
      });
    }

    //Set User Member List
    if (this.props.user.User_data.isTenantUser) {
      const users = await axios.apis("GET", `/api/users`, auth.headers);
      //console.log(users)
      options = users.map((member) => ({
        value: member._id,
        label: member.email,
      }));
    } else {
      if (
        this.props.user.User_data.team &&
        this.props.user.User_data.team.members
      ) {
        options = this.props.user.User_data.team.members.map((member) => ({
          value: member.id,
          label: member.email,
        }));
        options.unshift({
          value: this.props.user.User_data._id,
          label: this.props.user.User_data.email,
        });
      }
    }

    this.setState({ options });
    window.addEventListener("scroll", this.handleScrollToElement);
  };

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScrollToElement);
  }

  handleScrollToElement(event) {
    const scroll_bar = document.getElementsByClassName(
      "builder-sidebar_scroll"
    );
    if (scroll_bar && scroll_bar.length)
      if (window.scrollY > 603) {
        if (!scroll_bar[0].classList.contains("fixed-scroll"))
          scroll_bar[0].classList.add("fixed-scroll");
      } else {
        if (scroll_bar[0].classList.contains("fixed-scroll"))
          scroll_bar[0].classList.remove("fixed-scroll");
      }
  }

  changeCurrentView = (id) => {
    if (this.state.current_step != id)
      if (id == 6) {
        let event = new Event("submit");
      }
    this.setState({ current_step: id });
  };

  handleInputChange = (inputType, e) => {
    var { collection, temPermission, lang2Add, formLanguage } = this.state;
    if (inputType == "collection_name") {
      collection.collectionName = e.target.value;
      this.setState({ hasFormFieldsChanged: true, collection: collection });
    } else if (inputType == "collection_description") {
      collection.collectionDescription = e.target.value;
      this.setState({ collection: collection });
    } else if (inputType === "permissionRead") {
      temPermission.read = e; //.map(({value}) => value)
      console.log("permissionRead: ", temPermission.read);
      this.setState({ temPermission: temPermission });
    } else if (inputType === "permissionReadAll") {
      temPermission.readAll = e; //.map(({value}) => value)
      console.log("permissionReadAll: ", temPermission.readAll);
      this.setState({ temPermission: temPermission });
    } else if (inputType === "permissionWrite") {
      temPermission.write = e; //.map(({value}) => value)
      console.log("permissionWrite: ", temPermission.write);
      this.setState({ temPermission: temPermission });
    } else if (inputType === "permissionDesign") {
      temPermission.design = e; //.map(({value}) => value)
      console.log("permissionDesign: ", temPermission.design);
      this.setState({ temPermission: temPermission });
    } else if (inputType === "selectLang") {
      lang2Add = e.target.value; //.map(({value}) => value)
      console.log("lang2Add: ", lang2Add);
      this.setState({ lang2Add: lang2Add });
    } else if (inputType === "formDefaultLang") {
      console.log(
        e.target.id,
        Object.keys(formLanguage.options[e.target.id])[0],
        formLanguage.options
      );
      formLanguage.language = Object.keys(formLanguage.options[e.target.id])[0];
      this.setState({ formLanguage: formLanguage });
    } else if (
      inputType === "external_redirect_url" ||
      inputType === "internal_redirect_url"
    ) {
      this.setState({ [inputType]: e.target.value });
    } else if (inputType === "deleteMessage") {
      this.setState({ [inputType]: e.target.value });
    }
  };

  handleInputLabel = (lang, e) => {
    const { formLanguage } = this.state;
    formLanguage.i18n[lang][e.target.placeholder] = e.target.value;
    console.log(lang, e.target);
    this.setState({ formLanguage: formLanguage });
  };

  handleAddLanguage = (defLang) => {
    var { lang2Add, formLanguage } = this.state;
    var newLangOption = {};
    lang2Add = lang2Add ? lang2Add : defLang;
    newLangOption[lang2Add] = languages.find(
      (obj) => obj.key === lang2Add
    ).title;
    formLanguage.options.push(newLangOption);
    formLanguage.i18n[lang2Add] = { ...formLanguage.i18n.en };
    this.setState({ formLanguage: formLanguage, lang2Add: null });
  };

  handleDeleteLanguage = () => {
    var { lang2Del, formLanguage } = this.state;
    this.setState({ deleteLangModal: false });
    var delIndex = formLanguage.options.findIndex(
      (v) => Object.keys(v)[0] === lang2Del
    );
    formLanguage.options.splice(delIndex, 1);
    delete formLanguage.i18n[lang2Del];
    console.log(formLanguage);
    this.setState({ lang2Del: null, formLanguage: formLanguage });
  };

  handleCheckCollectionName = () => {
    let { hasFormFieldsChanged } = this.state;
    let { collection, isCollectionNameOK } = this.state;
    const { app_id, User_data } = this.props.user;
    var reqData = {
      userId: User_data._id,
      appId: app_id,
      name: collection.collectionName,
      id: collection._id == "" ? 0 : collection._id,
    };
    axios
      .apis("POST", `/api/check-collections-name`, reqData)
      .then((res) => {
        const { isFound, currentName } = res;
        let message;
        if (isFound) {
          if (currentName === collection.collectionName.toLowerCase()) {
            message = "Name is the same with current collection name";
            isCollectionNameOK = true;
          } else {
            message =
              "Name is already used for other collection, please change";
            isCollectionNameOK = false;
          }
        } else {
          // not found
          message = "Name is unique, you can create new collection with it";
          isCollectionNameOK = true;
          hasFormFieldsChanged = true;
        }
        Toast(message);
        this.setState({ collection, hasFormFieldsChanged, isCollectionNameOK });
      })
      .catch((e) => console.error(e));
  };

  handlePublishConfirm = (ans) => {
    if (ans) {
      this.handleCreateUpdateCollection(true);
    } else {
      Toast("Cancelled publishing form");
    }
    this.setState({ publishConfirm: false });
  };

  handleCreateUpdateCollection = (isPublishForm) => {
    try {
      const { location, user } = this.props;
      const { app_id, User_data } = this.props.user;
      const {
        dataEventsConfig,
        formId,
        collection,
        formType,
        temPermission,
        formLanguage,
        is_anonymous_form,
        external_redirect_url,
        internal_redirect_url,
        is_default_external_redirect_url,
        is_default_internal_redirect_url,
        extAccessAuthentication,
        multipleSubmissions,
      } = this.state;
      const id = formId ? formId : "new";
      let permission = collection.permission;
      let localFormschema = this.localFormschema;

      if (formType == "pdf") {
        localFormschema.settings.pdf.src =
          localFormschema.settings.pdf.src.split("/upload/")[1] + ".html";
      }

      permission.read = temPermission.read
        ? temPermission.read.map((member) => ({
            id: member.value,
            email: member.label,
          }))
        : [];
      permission.readAll = temPermission.readAll
        ? temPermission.readAll.map((member) => ({
            id: member.value,
            email: member.label,
          }))
        : [];
      permission.write = temPermission.write
        ? temPermission.write.map((member) => ({
            id: member.value,
            email: member.label,
          }))
        : [];
      permission.design = temPermission.design
        ? temPermission.design.map((member) => ({
            id: member.value,
            email: member.label,
          }))
        : [];

      if (collection.collectionName == "" && !collection.collectionName) {
        Toast("Collection name is required.", "error");
      } else if (
        collection.collectionDescription == "" &&
        !collection.collectionDescription
      ) {
        Toast("Collection description is required.", "error");
      } else {
        var data = {
          appId: app_id,
          collectionName: collection.collectionName,
          collectionDescription: collection.collectionDescription,
          externalAccess: this.state.is_system,
          is_anonymous_form: is_anonymous_form,
          otpContacts: collection.otpContacts,
          formschema: JSON.stringify(localFormschema),
          viewTables: collection.viewTables,
          eventsConfig: collection.eventsConfig,
          createdTime: null,
          createdBy: user.User_data._id,
          modifiedTime: null,
          modifiedBy: user.User_data._id,
          formType: formType,
          permission: permission,
          formLanguage: formLanguage,
          external_redirect_url: !is_default_external_redirect_url
            ? external_redirect_url
            : "",
          internal_redirect_url: !is_default_internal_redirect_url
            ? internal_redirect_url
            : "",
          extAccessAuthentication: extAccessAuthentication,
          multipleSubmissions: multipleSubmissions,
          last_publish_date: collection.last_publish_date,
          //Data Event
          dataEventsConfig: collection.dataEventsConfig || dataEventsConfig,
          dataActionsConfig: collection.dataActionsConfig || [],
          extSources: collection.extSources || [],
          enableEndPoint: collection.enableEndPoint || false,
        };

        if (isPublishForm) {
          this.OnPublishForm(data);
        } else {
          axios
            .apis("POST", `/api/createForms?id=${id}`, data, auth.headers)
            .then((response) => {
              Toast(response.message);
              console.log(response.result);
              this.setState({ formId: response.result._id });
            })
            .catch((error) => console.error(error));
        }
      }
    } catch (err) {
      Toast("Something went wrong, Please try again.");
    }
  };

  OnPublishForm = async (data) => {
    try {
      let { collection, formId } = this.state;
      const nowDate = new Date().toISOString();
      data["last_publish_date"] = nowDate;
      collection["last_publish_date"] = nowDate;
      const id = formId ? formId : "new";
      if (id != "new") {
        const response = await axios.apis(
          "POST",
          `/api/SavePublishCollection?id=${id}`,
          data
        );
        this.setState({ collection: collection });
        Toast(response.message);
      } else {
        Toast(
          "Collection is not save, Please save the collection after publish form.",
          "error"
        );
      }
    } catch (err) {
      Toast("Something want to worng.");
    }
  };

  loadFormData = async (formId) => {
    var { previewSchema } = this.state;
    try {
      const res = await axios.apis(
        "GET",
        `/api/forms?id=${formId}`,
        auth.headers
      );
      const TemplateList = await axios.apis(
        "GET",
        `/api/GetCollectionTemplateList/` + this.props.user.User_data._id,
        auth.headers
      );
      var {
        _id,
        collectionName,
        collectionDescription,
        externalAccess,
        otpContacts,
        createdActionAPI,
        modifiedActionAPI,
        viewTables,
        eventsConfig,
        formType,
        permission,
        formLanguage,
        createdBy,
        last_publish_date,
        extAccessAuthentication,
        multipleSubmissions,
        //Data Event
        dataEventsConfig,
        dataActionsConfig,
        extSources,
        enableEndPoint,
      } = res;

      this.localFormschema = JSON.parse(res.formschema);
      formLanguage = formLanguage
        ? formLanguage
        : { options: [{ en: "English" }], language: "en", i18n: { en: {} } };
      formLanguage = formLanguage.i18n
        ? formLanguage
        : {
            options: formLanguage.options,
            language: formLanguage.language,
            i18n: { en: {} },
          };

      if (formType == "pdf") {
        this.localFormschema.settings.pdf.src = fullUrlPathPDF(
          this.localFormschema.settings.pdf.src
        );
      }

      var varComp = {
        type: "var",
        hidden: true,
        key: "custom",
        persistent: false,
        tableView: false,
        input: true,
        label: "",
        protected: false,
        id: "ef2yqwq",
        user: this.props.user.User_data,
        customDefaultValue: "form.user = component.user",
      };

      previewSchema = JSON.parse(JSON.stringify(this.localFormschema)); //{ ...formschema }
      if (previewSchema.components) {
        previewSchema.components.push(varComp);
      }
      this.setState({ previewSchema });

      let temPermission = permission
        ? { ...permission }
        : { read: [], readAl: [], write: [], design: [] };
      temPermission.read = temPermission.read
        ? temPermission.read.map((member) => ({
            value: member.id,
            label: member.email,
          }))
        : [];
      temPermission.readAll = temPermission.readAll
        ? temPermission.readAll.map((member) => ({
            value: member.id,
            label: member.email,
          }))
        : [];
      temPermission.write = temPermission.write
        ? temPermission.write.map((member) => ({
            value: member.id,
            label: member.email,
          }))
        : [];
      temPermission.design = temPermission.design
        ? temPermission.design.map((member) => ({
            value: member.id,
            label: member.email,
          }))
        : [];
      let viewField =
        viewTables && viewTables.length != 0 && viewTables[0].properties
          ? viewTables[0].properties
          : [];
      var collection = {
        _id: _id,
        formschema: this.localFormschema,
        collectionName: collectionName,
        collectionDescription: collectionDescription,
        externalAccess: externalAccess,
        otpContacts: otpContacts ? otpContacts : "",
        viewTables:
          viewTables && viewTables.length != 0
            ? viewTables
            : this.state.collection.viewTables,
        eventsConfig: eventsConfig,
        formType: this.localFormschema.display,
        permission: permission
          ? permission
          : { read: [], readAll: [], write: [], design: [] },
        createdBy: createdBy,
        formLanguage: formLanguage,
        last_publish_date: last_publish_date ? last_publish_date : "",
        //Data Event
        dataEventsConfig: dataEventsConfig || this.state.dataEventsConfig,
        dataActionsConfig: dataActionsConfig || [],
        extSources: extSources || [],
        enableEndPoint: enableEndPoint || false,
      };

      this.setState({
        formType: this.localFormschema.display,
        viewField: viewField,
        collection: collection,
        TemplateList: TemplateList.data,
        Mastertemplate: TemplateList.dataMaster,
        createdActionAPI: createdActionAPI,
        modifiedActionAPI: modifiedActionAPI,
        is_system: externalAccess,
        is_anonymous_form: res.is_anonymous_form || false,
        external_redirect_url: res.external_redirect_url || "",
        internal_redirect_url: res.internal_redirect_url || "",
        is_default_external_redirect_url:
          res.external_redirect_url && res.external_redirect_url != ""
            ? false
            : true,
        is_default_internal_redirect_url:
          res.internal_redirect_url && res.internal_redirect_url != ""
            ? false
            : true,
        temPermission: temPermission,
        formLanguage: formLanguage,
        extAccessAuthentication: extAccessAuthentication,
        multipleSubmissions: multipleSubmissions,
      });
      this.defaultViewConfig = reconfigViewField(
        this.localFormschema.components,
        viewField
      );
    } catch (err) {
      console.log(err);
      Toast(err.message, "error");
    }
  };

  loadViewConfig = (e, type) => {
    let { viewField, formLanguage, collection } = this.state;
    let key = "",
      editGrid = null,
      inputTypes = [
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
        "file",
        "pictureAnnotationCustomComp",
        "CkeditorCutome",
        "editgrid",
      ];

    if (collection.formType == "pdf") {
      if (type == "save" && inputTypes.includes(e.type)) {
        var indexKey = viewField.findIndex((x) => x.key == e.key);
        if (indexKey >= 0) {
          viewField[indexKey] = {
            title: e.label,
            key: e.key,
            visible: true,
            length: "0",
          };
        } else {
          viewField.push({
            title: e.label,
            key: e.key,
            visible: true,
            length: "0",
          });
        }

        if (formLanguage.i18n)
          Object.keys(formLanguage.i18n).map((lngKey) => {
            formLanguage.i18n[lngKey][e.label] = e.label;
            if (e.description)
              formLanguage.i18n[lngKey][e.description] = e.description;
            if (e.tooltip) formLanguage.i18n[lngKey][e.tooltip] = e.tooltip;
            if (e.placeholder)
              formLanguage.i18n[lngKey][e.placeholder] = e.placeholder;
          });
      } else if (type == "delete" && inputTypes.includes(e.type)) {
        var indexKey = viewField.findIndex((x) => x.key == e.key);
        if (indexKey >= 0) {
          viewField.splice(indexKey, 1);
        }
        if (formLanguage.i18n)
          Object.keys(formLanguage.i18n).map((lngKey) => {
            delete formLanguage.i18n[lngKey][e.label];
            if (formLanguage.i18n[lngKey][e.description])
              delete formLanguage.i18n[lngKey][e.description];
            if (formLanguage.i18n[lngKey][e.tooltip])
              delete formLanguage.i18n[lngKey][e.tooltip];
            if (formLanguage.i18n[lngKey][e.placeholder])
              delete formLanguage.i18n[lngKey][e.placeholder];
          });
      }
    } else {
      const components = this.localFormschema.components;
      const pathEditgridExp = "$..*[?(@.type== 'editgrid')]";
      const editgridComponents = jp.query(
        { object: components },
        pathEditgridExp,
        1000
      );

      editgridComponents
        .filter((v, i, a) => a.findIndex((t) => t.key === v.key) === i)
        .forEach((ele) => {
          const pathExp = "$..*[?(@.key== '" + e.key + "')]";
          if (jp.query(ele.components, pathExp, 1000)) {
            editGrid = ele.key;
            return false;
          }
        });

      if (type == "save" && inputTypes.includes(e.type)) {
        let obj = { title: e.label, key: e.key, visible: true, length: "0" };
        if (e.type == "editgrid") obj["viewFields"] = [];
        if (editGrid && e.type != "editgrid") {
          var editGridKey = viewField.findIndex((x) => x.key == editGrid);
          if (editGridKey >= 0) {
            let viewFields = viewField[editGridKey].viewFields;
            var indexKey = viewField.findIndex((x) => x.key == e.key);
            if (indexKey >= 0) {
              viewFields[indexKey] = obj;
            } else {
              viewFields.push(obj);
            }
            viewField[editGridKey].viewFields = viewFields;
          } else {
            viewField.push(obj);
          }
        } else {
          var indexKey = viewField.findIndex((x) => x.key == e.key);
          if (indexKey >= 0) {
            viewField[indexKey] = obj;
          } else {
            viewField.push(obj);
          }
        }

        if (formLanguage.i18n)
          Object.keys(formLanguage.i18n).map((lngKey) => {
            formLanguage.i18n[lngKey][e.label] = e.label;
            if (e.description)
              formLanguage.i18n[lngKey][e.description] = e.description;
            if (e.tooltip) formLanguage.i18n[lngKey][e.tooltip] = e.tooltip;
            if (e.placeholder)
              formLanguage.i18n[lngKey][e.placeholder] = e.placeholder;
          });
      } else if (type == "delete" && inputTypes.includes(e.type)) {
        if (editGrid && e.type != "editgrid") {
          var editGridKey = viewField.findIndex((x) => x.key == editGrid);

          if (editGridKey >= 0) {
            let viewFields = viewField[editGridKey].viewFields;
            var indexKey = viewField.findIndex((x) => x.key == e.key);
            viewFields.splice(indexKey, 1);
            viewField[editGridKey].viewFields = viewFields;
          }
        } else {
          var indexKey = viewField.findIndex((x) => x.key == e.key);
          viewField.splice(indexKey, 1);
        }

        if (formLanguage.i18n)
          Object.keys(formLanguage.i18n).map((lngKey) => {
            delete formLanguage.i18n[lngKey][e.label];
            if (formLanguage.i18n[lngKey][e.description])
              delete formLanguage.i18n[lngKey][e.description];
            if (formLanguage.i18n[lngKey][e.tooltip])
              delete formLanguage.i18n[lngKey][e.tooltip];
            if (formLanguage.i18n[lngKey][e.placeholder])
              delete formLanguage.i18n[lngKey][e.placeholder];
          });
      }
      collection.viewTables[0].properties = viewField;
      this.defaultViewConfig = reconfigViewField(
        this.localFormschema.components,
        viewField
      );
    }

    var varComp = {
      type: "var",
      hidden: true,
      key: "custom",
      persistent: false,
      tableView: false,
      input: true,
      label: "",
      protected: false,
      id: "ef2yqwq",
      user: this.props.user.User_data,
      customDefaultValue: "form.user = component.user",
    };

    var previewSchema = JSON.parse(JSON.stringify(this.localFormschema));
    previewSchema.components.push(varComp);
    this.setState({
      previewSchema: previewSchema,
      collection,
      formLanguage,
      viewField,
    });
  };

  saveViewTable = (viewTables) => {
    let { collection } = this.state;
    collection.viewTables = viewTables;
    this.setState({
      collection: collection,
      viewField: viewTables[0].properties,
    });
  };

  SaveEventActions = (eventCfg) => {
    let { collection } = this.state;
    collection.eventsConfig = eventCfg;
    this.setState({ collection: collection });
  };

  selectedTags = (tags) => {
    const { collection } = this.state;
    collection.otpContacts = tags.toString();
    this.setState({ collection: collection });
  };

  selectFormType = (formType) => {
    let { collection, is_pdf_upload, templateModal } = this.state;
    if (formType == "PDF") {
      is_pdf_upload = true;
      this.setState({
        is_pdf_upload: is_pdf_upload,
        formType: formType,
        templateModal: false,
      });
    } else if (formType == "Template") {
      this.setState({ templateModal: false });
    } else {
      this.localFormschema = { display: formType };
      this.setState({
        collection: collection,
        formType: formType,
        is_pdf_upload: false,
        templateModal: false,
      });
    }
  };

  UploadPdfFile = (e) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  onFilePDFUpload = async () => {
    try {
      let { collection, formType } = this.state;
      const formData = new FormData();
      formData.append(
        "file",
        this.state.selectedFile,
        this.state.selectedFile.name
      );
      var res = await axios.apis("POST", `/api/UploadPdfFile`, formData);
      this.localFormschema.display = formType = "pdf";
      this.localFormschema = {
        display: "pdf",
        settings: { pdf: { src: fullUrlPathPDF(res.file) } },
      };
      collection.viewTables = [
        {
          title: "Default",
          viewType: "DataTable",
          viewTheme: "",
          is_defualt: true,
          properties: JSON.parse(JSON.stringify(systemFields)),
        },
      ];
      this.setState({
        viewField: JSON.parse(JSON.stringify(systemFields)),
        collection: collection,
        formType: formType,
        is_pdf_upload: false,
        Pdf_file_name: res.file,
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  exportTemplate = async () => {
    this.localFormschema["viewTables"] = this.state.collection.viewTables;
    this.localFormschema["formLanguage"] = this.state.collection.formLanguage;

    //Data Event
    this.localFormschema["dataEventsConfig"] =
      this.state.collection.dataEventsConfig;
    this.localFormschema["dataActionsConfig"] =
      this.state.collection.dataActionsConfig;
    this.localFormschema["extSources"] = this.state.collection.extSources;

    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(this.localFormschema));
    var dlAnchorElem = document.getElementById("downloadAnchorElem");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute(
      "download",
      this.state.collection.collectionName.replace(" ", "") + ".json"
    );
    dlAnchorElem.click();
  };

  applyTemplate = async (data) => {
    let collection = this.state.collection;
    let TemplateList = this.state.TemplateList;
    let previewSchema = this.state.previewSchema;
    collection["userId"] = this.props.user.User_data._id;
    var varComp = {
      type: "var",
      hidden: true,
      key: "custom",
      persistent: false,
      tableView: false,
      input: true,
      label: "",
      protected: false,
      id: "ef2yqwq",
      user: this.props.user.User_data,
      customDefaultValue: "form.user = component.user",
    };

    if (data.type == "3") {
      data.formLanguage = data.formLanguage
        ? data.formLanguage
        : { options: [{ en: "English" }], language: "en", i18n: { en: {} } };
      if (data.formLanguage.i18n) {
        data.formLanguage = data.formLanguage.i18n
          ? data.formLanguage
          : {
              options: data.formLanguage.options,
              language: data.formLanguage.language,
              i18n: { en: {} },
            };
      }

      this.localFormschema = JSON.parse(data.formschema);
      collection["viewTables"] = data.viewTables;
      collection["formLanguage"] = data.formLanguage;
      //Data Event
      collection["dataEventsConfig"] =
        data.dataEventsConfig || this.state.collection.dataEventsConfig;
      collection["dataActionsConfig"] = data.dataActionsConfig || [];
      collection["extSources"] = data.extSources || [];

      previewSchema = JSON.parse(data.formschema);
      previewSchema["components"].push(varComp);
      let viewField =
        collection["viewTables"] &&
        collection["viewTables"].length != 0 &&
        collection["viewTables"][0].properties
          ? collection["viewTables"][0].properties
          : [];
      this.setState({
        viewField: viewField,
        formLanguage: data.formLanguage,
        templateModal: false,
        collection: collection,
        selectTemplate: null,
        previewSchema: previewSchema,
      });
      setTimeout(
        () =>
          (this.defaultViewConfig = reconfigViewField(
            this.localFormschema.components,
            viewField
          )),
        1000
      );
    } else if (data.type == "2") {
      data.template_file.formLanguage = data.template_file.formLanguage
        ? data.template_file.formLanguage
        : { options: [{ en: "English" }], language: "en", i18n: { en: {} } };
      if (data.template_file.formLanguage) {
        data.template_file.formLanguage = data.template_file.formLanguage.i18n
          ? data.template_file.formLanguage
          : {
              options: data.template_file.formLanguage.options,
              language: data.template_file.formLanguage.language,
              i18n: { en: {} },
            };
      }

      collection["viewTables"] = data.template_file["viewTables"];
      collection["formLanguage"] = data.template_file["formLanguage"];

      //Data Event
      collection["dataEventsConfig"] =
        data.template_file["dataEventsConfig"] ||
        this.state.collection.dataEventsConfig;
      collection["dataActionsConfig"] =
        data.template_file["dataActionsConfig"] || [];
      collection["extSources"] = data.template_file["extSources"] || [];
      this.localFormschema = data.template_file;
      delete data.template_file.viewTables;

      if (data.is_save) {
        if (data.file_name && data.file_name && data.file_name != "") {
          let savePayload = {
            is_online: this.props.user.User_data.level == 8 ? true : false,
            file_name: data.file_name,
            description: data.description,
            formschema: JSON.stringify(data.template_file),
            viewTables: collection["viewTables"],
            dataEventsConfig: collection["dataEventsConfig"],
            dataActionsConfig: collection["dataActionsConfig"],
            extSources: collection["extSources"],
            formLanguage: collection["formLanguage"],
            userId: collection.userId,
          };
          var res = await axios.apis(
            "POST",
            `/api/SaveCollectionTemplate`,
            savePayload
          );
          TemplateList.push(savePayload);
        } else {
          Toast("Enter Template Name", "error");
        }
      }
      previewSchema = JSON.parse(JSON.stringify(data.template_file));
      previewSchema["components"].push(varComp);
      let viewField =
        collection["viewTables"] &&
        collection["viewTables"].length != 0 &&
        collection["viewTables"][0].properties
          ? collection["viewTables"][0].properties
          : [];
      this.setState({
        viewField: viewField,
        formLanguage: collection.formLanguage,
        templateModal: false,
        TemplateList: TemplateList,
        collection: collection,
        selectTemplate: null,
        previewSchema: previewSchema,
      });

      setTimeout(
        () =>
          (this.defaultViewConfig = reconfigViewField(
            this.localFormschema,
            viewField
          )),
        1000
      );
    }
  };

  setLanguage = (lang) => {
    var { formLanguage, is_refersh_form } = this.state;
    const that = this;
    formLanguage.language = lang;
    is_refersh_form = false;
    that.setState({ formLanguage, is_refersh_form });
    is_refersh_form = true;
    setTimeout(() => that.setState({ is_refersh_form }), 100);
    //console.log(formLanguage);
  };

  getTranslate = (reqData) => {
    var { formLanguage } = this.state;
    var lang = reqData.i18nLang;
    var target =
      reqData.target === "tw"
        ? "zh-TW"
        : reqData.target === "cn"
        ? "zh-cn"
        : reqData.target;
    var source = Object.keys(formLanguage.i18n[lang]); //.join(" , ");
    //console.log(lang, target, source);
    axios
      .apis("POST", "/api/translate", {
        q: source,
        target: target,
      })
      .then((data) => {
        console.log(data);
        //var result = data.data.translations[0] //.translatedText.split(",");
        Object.keys(formLanguage.i18n[lang]).map(
          (label, i) => (formLanguage.i18n[lang][label] = data[i])
        );
        console.log(data, formLanguage.i18n[lang]);
        this.setState({ formLanguage: formLanguage });
      })
      .catch((err) => {
        console.log("error");
      });
  };

  componentFormIoSettings() {
    try {
      if (
        document.querySelectorAll("div .component-edit-container .row")
          .length != 0
      ) {
        document
          .querySelectorAll("div .component-edit-container .row")[0]
          .querySelectorAll("div .col a")[0].style.display = "none";
      }
    } catch (err) {
      console.log(err);
    }
  }

  handleDeleteCollection() {
    const { deleteMessage } = this.state;
    const { location, user } = this.props;
    const { id } = queryString.parse(location.search);
    if (deleteMessage == "delete") {
      axios
        .apis("DELETE", "/api/delete-collection/" + id)
        .then((data) => {
          this.props.history.push(
            "/design" + GetAppName(this.props.user) + "/collection-list"
          );
        })
        .catch((err) => {
          console.log("error");
        });
    }
  }

  PreviewForm = () => {
    const { submission, previewSchema, formLanguage, is_refersh_form } =
      this.state;
    return (
      <div className="p-2 bg-white rounded shadow my-3 mx-5">
        <Col md="12" className="mx-auto float-none">
          {formLanguage && (
            <div className="d-flex justify-content-end">
              <Dropdown size="sm">
                <DropdownToggle caret color="white">
                  {
                    Object.values(
                      formLanguage.options[
                        formLanguage.options.findIndex(
                          (v) => Object.keys(v)[0] === formLanguage.language
                        )
                      ]
                    )[0]
                  }
                </DropdownToggle>
                <DropdownMenu right>
                  {formLanguage.options.map((option, i) => (
                    <DropdownItem
                      key={i}
                      onClick={() => this.setLanguage(Object.keys(option)[0])}
                    >
                      {Object.values(option)[0]}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </Col>
      </div>
    );
  };

  render() {
    const {
      templateModal,
      isSetting,
      form_setting_step,
      setting_step,
      sharepointList,
      deleteModal,
      deleteMessage,
      options,
      collection,
      previewSchema,
      current_step,
      is_system,
      is_anonymous_form,
      multipleSubmissions,
      external_redirect_url,
      internal_redirect_url,
      is_default_external_redirect_url,
      is_default_internal_redirect_url,
      formLanguage,
      submission,
      temPermission,
      deleteLangModal,
      lang2Del,
      is_refersh_form,
      formId,
      publishConfirm,
      viewField,
      previewModal,
      selectedDevice,
      is_lang_menu,
      lng,
      setNewCollectionModal,
      formType,
    } = this.state;
    const { location, user } = this.props;
    const { id } = queryString.parse(location.search);
    const payload = { User_data: user.User_data };
    const last_publish_date = collection.last_publish_date;

    let otpContacts = [];
    if (collection.otpContacts != "") {
      collection.otpContacts.split(",").forEach((x) => otpContacts.push(x));
    }

    //console.log(formLanguage);
    var newLangAddOptions = languages.filter(
      (obj) =>
        !formLanguage.options
          .map((lang) => Object.keys(lang)[0])
          .includes(obj.key)
    );
    console.log(collection.enableEndPoint);

    return (
      <Fragment>
        <a id="downloadAnchorElem" style={{ display: "none" }}></a>
        {/* Collection Header Tabs */}
        <div
          tabs
          className="topnav nav-tabs nav-justified collection-form"
          style={{ marginTop: "-29px" }}
        >
          <div className="container-fluid d-flex">
            <div className="navTop-button" style={{ paddingTop: "9px" }}>
              <label
                onClick={() => this.setState({ isSetting: !isSetting })}
                title="App Setup"
                className="mr-3"
              >
                <i className="fa fa-cog" aria-hidden="true"></i>
              </label>
            </div>
            <Nav className="">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: [1, 11, 12, 13, 14].includes(current_step),
                  })}
                  onClick={() => {
                    this.changeCurrentView(1);
                  }}
                >
                  <span className="d-none d-sm-block">
                    <FormattedMessage id="collection.form_designer" />
                  </span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 2 })}
                  onClick={() => this.changeCurrentView(2)}
                >
                  <span className="d-none d-sm-block">
                    <FormattedMessage id="collection.view_config" />
                  </span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: current_step == 3 })}
                  onClick={() => this.changeCurrentView(3)}
                >
                  <span className="d-none d-sm-block">
                    <FormattedMessage id="collection.event_config" />
                  </span>
                </NavLink>
              </NavItem>

              {user.User_data.level == "8" && (
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({ active: current_step == 4 })}
                    onClick={() => this.changeCurrentView(4)}
                  >
                    <span className="d-none d-sm-block">
                      <FormattedMessage id="collection.source" />
                    </span>
                  </NavLink>
                </NavItem>
              )}
            </Nav>

            {/* Form Tabls */}
            {current_step == 1 && (
              <div className="form_designer-tabls pl-3 ml-3 pt-2 d-flex">
                <Button
                  title="Preview"
                  onClick={() => this.setState({ form_setting_step: 1 })}
                  className={`mr-3 btn  btn-sm  waves-effect btn btn-secondary  ${
                    form_setting_step === 1 ? "active" : ""
                  }`}
                >
                  <span
                    className="material-icons stroke-transparent"
                    style={{ marginLeft: "-6px", marginTop: "-2px" }}
                  >
                    pageview
                  </span>
                </Button>
                <Button
                  title="Language"
                  onClick={() => this.setState({ form_setting_step: 2 })}
                  className={`mr-3 p-1 btn btn-sm waves-effect btn-secondary ${
                    form_setting_step === 2 ? "active" : ""
                  }`}
                >
                  <i
                    className="fa fa-language stroke-transparent"
                    aria-hidden="true"
                  ></i>
                </Button>
                <Button
                  title="Data"
                  onClick={() => this.setState({ form_setting_step: 3 })}
                  className={`mr-3 btn btn-sm waves-effect btn-secondary ${
                    form_setting_step === 3 ? "active" : ""
                  }`}
                >
                  <span
                    className="material-icons stroke-transparent"
                    style={{ marginLeft: "-6px", marginTop: "-2px" }}
                  >
                    settings_ethernet
                  </span>
                </Button>
                <Button
                  title="Access"
                  onClick={() => this.setState({ form_setting_step: 4 })}
                  className={`mr-3 p-1 btn btn-sm waves-effect btn-secondary ${
                    form_setting_step === 4 ? "active" : ""
                  }`}
                >
                  <i
                    className="fa fa-lock stroke-transparent"
                    aria-hidden="true"
                  ></i>
                </Button>
                <Button
                  title="Templates"
                  onClick={() => this.setState({ templateModal: true })}
                  className={`mr-3 btn btn-sm waves-effect btn-secondary ${
                    templateModal ? "active" : ""
                  }`}
                >
                  <span
                    style={{ marginLeft: "-6px", marginTop: "-2px" }}
                    className="material-icons stroke-transparent"
                  >
                    palette
                  </span>
                </Button>
              </div>
            )}

            <div
              className="d-flex justify-content-end mt-1"
              style={{ right: "25px", position: "absolute" }}
            >
              <div className="p-2">
                <Link
                  to={
                    "/design" + GetAppName(this.props.user) + "/collection-list"
                  }
                >
                  <button className="btn btn-secondary btn-sm">Exit</button>
                </Link>
              </div>
              <div className="p-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => this.handleCreateUpdateCollection()}
                >
                  {!formId ? "Save" : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* //Update PDF File Modal */}
        {this.state.is_pdf_upload && (
          <Modal
            isOpen={this.state.is_pdf_upload}
            toggle={() => this.setState({ is_pdf_upload: false })}
            size="lg"
          >
            <Fragment>
              <ModalBody>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => this.UploadPdfFile(e)}
                ></input>
                <Button
                  size="sm"
                  color="blue"
                  className="custom-btn"
                  onClick={(e) => this.onFilePDFUpload()}
                >
                  Upload
                </Button>
                <Button
                  onClick={(e) => this.setState({ is_pdf_upload: false })}
                  size="sm"
                  color="blue"
                  className="custom-btn"
                >
                  Cancel
                </Button>
              </ModalBody>
            </Fragment>
          </Modal>
        )}

        {/* Collection Template */}
        {this.state.templateModal && (
          <CollectionTemplates
            onChangeFormType={this.selectFormType}
            TemplateList={this.state.TemplateList}
            Mastertemplate={this.state.Mastertemplate}
            applyTemplate={(e) => this.applyTemplate(e)}
            isAdmin={user.User_data.level == 8 ? true : false}
            toggletemplateModal={() => this.setState({ templateModal: false })}
            exportTemplate={() => this.exportTemplate()}
          />
        )}

        {/* Delete Language confirmation modal */}
        {deleteLangModal && (
          <Modal
            isOpen={deleteLangModal}
            toggle={() => this.setState({ deleteLangModal: false })}
            centered
          >
            <ModalHeader toggle={() => this.setState({ deleteModal: false })}>
              Delete Form Language:{" "}
              {lang2Del
                ? Object.values(
                    formLanguage.options[
                      formLanguage.options.findIndex(
                        (v) => Object.keys(v)[0] === lang2Del
                      )
                    ]
                  )[0]
                : ""}
            </ModalHeader>
            <ModalBody>
              You are about to delete{" "}
              {lang2Del
                ? Object.values(
                    formLanguage.options[
                      formLanguage.options.findIndex(
                        (v) => Object.keys(v)[0] === lang2Del
                      )
                    ]
                  )[0]
                : ""}
              , please confirm!
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => this.setState({ deleteLangModal: false })}
              >
                Cancel
              </Button>
              <Button onClick={() => this.handleDeleteLanguage()}>
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* Delete confirmation modal */}
        {deleteModal && (
          <Modal
            isOpen={deleteModal}
            toggle={() => this.setState({ deleteModal: false })}
            centered
          >
            <ModalHeader toggle={() => this.setState({ deleteModal: false })}>
              Delete Collection
            </ModalHeader>
            <ModalBody>
              {" "}
              This action will delete collection from collection list page,
              please type <b>delete</b> and click <b>confirm</b> to confirm
              <Input
                label="delete"
                placeholder="delete"
                type="text"
                value={deleteMessage}
                maxLength="256"
                onChange={(event) =>
                  this.handleInputChange("deleteMessage", event)
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() =>
                  this.setState({
                    ...this.state,
                    deleteModal: false,
                    deleteMessage: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={() => this.handleDeleteCollection()}
              >
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {/* Publish confirmation modal */}
        {publishConfirm && (
          <ModalConfirmation
            IsModalConfirmation={publishConfirm}
            showOkButton={true}
            showCancelButton={true}
            title="Publish Form"
            text="A published form allows any users of external portal to submit form data to your collection, 
                              select 'OK' to confirm, or 'CANCEL' to cancel publishing."
            onClick={(response) => this.handlePublishConfirm(response)}
          />
        )}

        {/* Collection Perant Tabls */}
        <TabContent activeTab={current_step}>
          <br />
          <br />

          {isSetting && (
            <>
              <div className="side-menu left-bar collection-setting">
                <SimpleBar style={{ overflowX: "hidden", overflowY: "hidden" }}>
                  <div data-simplebar className="h-100">
                    <div className="float-right">
                      <i
                        onClick={() => this.setState({ isSetting: false })}
                        className="fa fa-times"
                        aria-hidden="true"
                      ></i>
                    </div>
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: setting_step == 1 })}
                          onClick={() => this.setState({ setting_step: 1 })}
                        >
                          <label
                            title="Collection Setting"
                            className="mt-2"
                            style={{ fontSize: "18px" }}
                          >
                            <i className="fa fa-cog" aria-hidden="true"></i>
                          </label>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: setting_step == 2 })}
                          onClick={() => this.setState({ setting_step: 2 })}
                        >
                          <label
                            title="Collection Permission"
                            className="mt-2"
                            style={{ fontSize: "18px" }}
                          >
                            <i className="fa fa-lock" aria-hidden="true"></i>
                          </label>
                        </NavLink>
                      </NavItem>
                    </Nav>
                    {setting_step == 1 && (
                      <>
                        <Row>
                          {collection._id && (
                            <Col md="12" className="mt-3">
                              <p className="font-weight-bold mb-0 pb-1">
                                <FormattedMessage id="collection.id" />
                              </p>
                              {collection._id}
                              <hr className="mt-1" />
                              <p className="font-weight-bold mb-0 pb-1">
                                <FormattedMessage id="collection.owner" />
                              </p>
                              {collection.createdBy.firstname +
                                collection.createdBy.lastname}
                              <hr className="mt-1" />
                            </Col>
                          )}
                          <Col md="12" className="custom-input-margin">
                            <label
                              htmlFor="collection_description"
                              className="font-weight-bold mt-3"
                            >
                              <FormattedMessage id="collection.name" />
                            </label>
                            <Input
                              id="collection_display_name"
                              type="text"
                              className="collection-name-input"
                              value={collection.collectionName}
                              maxLength="256"
                              onChange={(event) =>
                                this.handleInputChange("collection_name", event)
                              }
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12" className="custom-input-margin">
                            <div className="form-group">
                              <label
                                htmlFor="collection_description"
                                className="font-weight-bold mt-3"
                              >
                                <FormattedMessage id="collection.description" />
                              </label>
                              <textarea
                                className="form-control collection-description-input"
                                id="collection_description"
                                value={collection.collectionDescription}
                                rows="2"
                                onChange={(event) =>
                                  this.handleInputChange(
                                    "collection_description",
                                    event
                                  )
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          {id != "new" && (
                            <Col md="12" className="pt-2">
                              <button
                                className="btn btn-danger btn-md"
                                onClick={() =>
                                  this.setState({ deleteModal: true })
                                }
                              >
                                Delete
                              </button>
                            </Col>
                          )}
                        </Row>
                      </>
                    )}

                    {setting_step == 2 && (
                      <Row>
                        <Col md="12">
                          <Card className="w-100 mb-6 border-gray">
                            <CardHeader
                              style={{
                                textTransform: "capitalize",
                                padding: ".75rem 1.25rem",
                              }}
                            >
                              <FormattedMessage id="collection.permission" />
                            </CardHeader>
                            <CardBody
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                overflowX: "hidden",
                                overflowY: "visible",
                              }}
                            >
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th scope="col" style={{ width: "20%" }}>
                                      Access
                                    </th>
                                    <th scope="col" style={{ width: "80%" }}>
                                      Users
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                      Read own documents
                                      <br />
                                      {user.User_data.isTenantUser
                                        ? "(None=Everyone)"
                                        : "(None=No one except owner)"}
                                    </td>
                                    <td>
                                      <Select
                                        value={temPermission.read}
                                        isMulti
                                        name="permissionRead"
                                        options={options}
                                        className="basic-multi-select "
                                        classNamePrefix="select"
                                        onChange={(e) =>
                                          this.handleInputChange(
                                            "permissionRead",
                                            e
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      Read all documents
                                      <br />
                                      (None=No one)
                                    </td>
                                    <td>
                                      <Select
                                        value={temPermission.readAll}
                                        isMulti
                                        name="permissionReadAll"
                                        options={options}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        onChange={(e) =>
                                          this.handleInputChange(
                                            "permissionReadAll",
                                            e
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      Write/Add new documents
                                      <br />
                                      (None=Everyone)
                                    </td>
                                    <td>
                                      <Select
                                        value={temPermission.write}
                                        isMulti
                                        name="permissionWrite"
                                        options={options}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        onChange={(e) =>
                                          this.handleInputChange(
                                            "permissionWrite",
                                            e
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      Design collection
                                      <br />
                                      (None=No one except owner)
                                    </td>
                                    <td>
                                      <Select
                                        value={temPermission.design}
                                        isMulti
                                        name="permissionDesign"
                                        options={options}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        onChange={(e) =>
                                          this.handleInputChange(
                                            "permissionDesign",
                                            e
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    )}
                  </div>
                </SimpleBar>
              </div>
              <div
                className="leftbar-overlay"
                onClick={() => this.setState({ isSetting: false })}
              ></div>
            </>
          )}

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

          {current_step == 2 && (
            <TabPane tabId={2}>
              <ViewConfig
                defaultViewConfig={this.defaultViewConfig}
                collection={collection}
                saveViewTable={(e) => this.saveViewTable(e)}
                addConfiguration={this.addConfiguration}
                systemFields={systemFields}
              />
            </TabPane>
          )}

          {current_step == 3 && (
            <TabPane tabId={3}>
              <FormActions
                user={user}
                collection={collection}
                submission={submission}
                SaveEventActions={(e, i) => this.SaveEventActions(e, i)}
              />
            </TabPane>
          )}

          {current_step == 4 && (
            <TabPane tabId={4}>
              <Row>
                <Col>
                  {user.User_data.level == "8" && (
                    <AceEditor
                      name="eConfigSrc"
                      mode="json"
                      readOnly={true}
                      width="100%"
                      height="70vh"
                      value={JSON.stringify(collection, null, 2)}
                    />
                  )}
                </Col>
              </Row>
            </TabPane>
          )}
        </TabContent>

        {/* Collection Preview */}
        {form_setting_step == 1 && (
          <CollectionPreview
            previewSchema={previewSchema}
            formLanguage={formLanguage}
            previewModal={true}
            toggle={() => this.setState({ form_setting_step: 0 })}
          />
        )}

        {/* Collection Language */}
        {form_setting_step == 2 && (
          <>
            <div className="side-menu right-bar collection-translation overflow">
              <SimpleBar
                style={{
                  maxheight: "100%",
                  maxWidth: "100%",
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
                    <h5 className="title">Form Language</h5>
                  </div>
                  <Row className="align-items-end">
                    <Col className="mb-2" md="12">
                      <div className="col-auto my-1 mb-2">
                        <span className="font-weight-bold mr-5">
                          Default language
                        </span>
                        {
                          Object.values(
                            formLanguage.options[
                              formLanguage.options.findIndex(
                                (v) =>
                                  Object.keys(v)[0] === formLanguage.language
                              )
                            ]
                          )[0]
                        }
                      </div>
                    </Col>
                    <Col className="mb-2" md="12">
                      <div className="col-auto d-flex justify-content-between mb-2 form-lang">
                        <label
                          className="w-150"
                          htmlFor="addLang"
                          className="font-weight-bold"
                        >
                          Add a language
                        </label>
                        <select
                          className="custom-select mr-sm-2 ml-2  w-250"
                          onChange={(e) =>
                            this.handleInputChange("selectLang", e)
                          }
                        >
                          {newLangAddOptions.map((lang, i) => (
                            <option key={i} value={lang.key} selected={i == 0}>
                              {lang.title + ` (${lang.key})`}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm mb-2  w-150"
                          onClick={() =>
                            this.handleAddLanguage(newLangAddOptions[0].key)
                          }
                          disabled={newLangAddOptions.length === 0}
                        >
                          Add Language
                        </button>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <div id="accordion">
                        {Object.keys(formLanguage.i18n).map((lang, i) => {
                          let key = "#target" + i;
                          return (
                            <Card
                              key={i}
                              className="text-left border shadow-card rounded-lg"
                            >
                              <CardHeader className="border-bottom rounded-top">
                                <Row className="align-items-center">
                                  <Col md="3">
                                    <a variant="link">
                                      {
                                        Object.values(
                                          formLanguage.options[
                                            formLanguage.options.findIndex(
                                              (v) => Object.keys(v)[0] === lang
                                            )
                                          ]
                                        )[0]
                                      }
                                      {/*Object.values(formLanguage.options[i])[0],*/}
                                    </a>
                                  </Col>
                                  <Col md="6">
                                    <label className="mr-2 mb-2">
                                      Default form language
                                    </label>
                                    <Input
                                      type="radio"
                                      name="formDefaultLang"
                                      id={`${i}`}
                                      onChange={(e) =>
                                        this.handleInputChange(
                                          "formDefaultLang",
                                          e
                                        )
                                      }
                                      checked={
                                        formLanguage.options.findIndex(
                                          (v) =>
                                            Object.keys(v)[0] ===
                                            formLanguage.language
                                        ) === i
                                      }
                                      className="lang-radio"
                                    />
                                  </Col>
                                  <Col md="3" className="d-flex">
                                    <Button
                                      size="sm"
                                      color="primary"
                                      className="mr-3"
                                      onClick={() =>
                                        this.getTranslate({
                                          i18nLang: lang,
                                          target: lang,
                                        })
                                      }
                                    >
                                      <i className="fa fa-language" size="lg" />
                                    </Button>
                                    {formLanguage.options.findIndex(
                                      (v) =>
                                        Object.keys(v)[0] ===
                                        formLanguage.language
                                    ) !== i && (
                                      <Button
                                        size="sm"
                                        color="primary"
                                        className=""
                                        onClick={() =>
                                          this.setState({
                                            lang2Del: lang,
                                            deleteLangModal: true,
                                          })
                                        }
                                      >
                                        <i className="fa fa-trash" size="lg" />
                                      </Button>
                                    )}
                                    <span id={"target" + i} className="ml-4">
                                      <i
                                        className="fa fa-angle-down fa-2x"
                                        aria-hidden="true"
                                      ></i>
                                    </span>
                                  </Col>
                                </Row>
                              </CardHeader>
                              <UncontrolledCollapse
                                toggler={key}
                                style={{ width: "100%" }}
                              >
                                <CardBody>
                                  <table className="table table-sm">
                                    <thead>
                                      <tr>
                                        <th
                                          scope="col"
                                          style={{ width: "50%" }}
                                        >
                                          Label/Description/Tooltip/Placeholder
                                        </th>
                                        <th
                                          scope="col"
                                          style={{ width: "50%" }}
                                        >
                                          Label/Description/Tooltip/Placeholder
                                          in{" "}
                                          {
                                            Object.values(
                                              formLanguage.options[
                                                formLanguage.options.findIndex(
                                                  (v) =>
                                                    Object.keys(v)[0] === lang
                                                )
                                              ]
                                            )[0]
                                          }
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.keys(formLanguage.i18n[lang])
                                        .length > 0 &&
                                        Object.keys(
                                          formLanguage.i18n[lang]
                                        ).map((label, j) => (
                                          <tr key={j}>
                                            <td>{label}</td>
                                            <td>
                                              <input
                                                value={
                                                  formLanguage.i18n[lang][label]
                                                }
                                                id={j}
                                                className="form-control"
                                                type="text"
                                                placeholder={label}
                                                onChange={(e) =>
                                                  this.handleInputLabel(lang, e)
                                                }
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </CardBody>
                              </UncontrolledCollapse>
                            </Card>
                          );
                        })}
                      </div>
                    </Col>
                  </Row>
                  <Row></Row>
                </div>
              </SimpleBar>
            </div>
            <div
              className="rightbar-overlay"
              onClick={() => this.setState({ form_setting_step: 0 })}
            ></div>
          </>
        )}

        {/* Action flow  */}
        {form_setting_step == 3 && (
          <>
            <div className="side-menu right-bar collection-setting overflow">
              <SimpleBar
                style={{
                  maxWidth: "100%",
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
                  <CollectionFormData
                    dataEventsConfig={collection.dataEventsConfig}
                    dataActionsConfig={collection.dataActionsConfig}
                    extSources={collection.extSources}
                    viewField={viewField}
                    user={user}
                    saveActionsConfig={(config, type) => {
                      let tempCollection = collection;
                      if (type == "variable") {
                        tempCollection["extSources"] = config;
                      } else if (type == "event") {
                        tempCollection["dataEventsConfig"] = config;
                      } else {
                        tempCollection["dataActionsConfig"] = config;
                      }
                      this.setState({ collection: tempCollection });
                    }}
                  />
                </div>
              </SimpleBar>
            </div>
            <div
              className="rightbar-overlay"
              onClick={() => this.setState({ form_setting_step: 0 })}
            ></div>
          </>
        )}

        {/* Share Connection */}
        {form_setting_step == 4 && (
          <>
            <div className="side-menu right-bar collection-access overflow">
              <SimpleBar
                style={{
                  height: "auto",
                  maxWidth: "100%",
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
                    <h5 className="title">Access Collection</h5>
                  </div>
                  <Card className="mt-3 Access-card">
                    <CardHeader
                      className="header-Access-card"
                      style={{
                        textTransform: "capitalize",
                        padding: ".75rem 1.25rem",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="d-flex justify-content-start">
                          <h5>External Access Settings</h5>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col className={is_system ? "border" : ""}>
                          <div className="d-flex align-items-center">
                            <div className="d-flex justify-content-start">
                              <div className="custom-control custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="customSwitch2"
                                  checked={is_system}
                                  onChange={(e) =>
                                    this.setState({
                                      is_system: !is_system,
                                      is_anonymous_form: false,
                                    })
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="customSwitch2"
                                >
                                  <FormattedMessage id="collection.ext_form_checkbox" />{" "}
                                  ? {is_system}
                                </label>
                              </div>
                            </div>
                            {GetTenantName() !== "portal" && is_system && (
                              <div
                                className="d-flex justify-content-end"
                                style={{ marginLeft: "auto" }}
                              >
                                {last_publish_date != "" && formId && (
                                  <div
                                    className="d-flex align-self-end"
                                    style={{ opacity: 0.3, fontWeight: 700 }}
                                  >
                                    Published on{" "}
                                    {moment(last_publish_date).format(
                                      "DD MMM YYYY h:mm a"
                                    )}
                                  </div>
                                )}
                                <Button
                                  color="white"
                                  className="custom-btn btn-secondary"
                                  onClick={() =>
                                    this.setState({ publishConfirm: true })
                                  }
                                  disabled={formId ? false : true}
                                >
                                  Publish
                                </Button>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      {is_system && (
                        <Row>
                          <Col md="6" className="p-3 border">
                            <h5>Direct sharing</h5>
                            <Row>
                              <Col md="10" className="py-3 pl-0">
                                <p>
                                  URL :{" "}
                                  <a
                                    href={`${API.BASE_URL}/public/form?id=${collection._id}`}
                                    target="_bank"
                                  >{`${API.BASE_URL}/public/form?id=${collection._id}`}</a>
                                </p>
                              </Col>
                              <Col md="2" className="py-3">
                                <QRCode
                                  value={`${API.BASE_URL}/public/form?id=${collection._id}`}
                                  size="64"
                                />
                              </Col>
                            </Row>
                            <Row>
                              <Col md="12" className="px-0">
                                {is_system && (
                                  <div className="custom-control custom-switch">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input"
                                      id="customSwitch1"
                                      checked={is_anonymous_form}
                                      onChange={(e) =>
                                        this.setState({
                                          is_anonymous_form: !is_anonymous_form,
                                        })
                                      }
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor="customSwitch1"
                                    >
                                      <FormattedMessage id="collection.is_anonymous_form_checkbox" />{" "}
                                      ? {is_anonymous_form}
                                    </label>
                                  </div>
                                )}
                              </Col>
                            </Row>
                            {!is_anonymous_form && (
                              <div>
                                <Row>
                                  <Col md="12" className="px-0 pt-3">
                                    <label htmlFor="otp_contacts">
                                      {" "}
                                      OTP ({" "}
                                      <FormattedMessage id="collection.otp_message" />{" "}
                                      )
                                    </label>
                                    {otpContacts.length != 0 && (
                                      <TagsInput
                                        id="otp_contacts"
                                        readOnly={!is_system}
                                        isEmailOrisPhone={true}
                                        selectedTags={this.selectedTags}
                                        tags={otpContacts}
                                      ></TagsInput>
                                    )}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col md="12" className="px-0">
                                    {otpContacts.length == 0 && (
                                      <TagsInput
                                        id="otp_contacts"
                                        readOnly={!is_system}
                                        isEmailOrisPhone={true}
                                        selectedTags={this.selectedTags}
                                        tags={otpContacts}
                                      ></TagsInput>
                                    )}
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Col>
                          <Col md="6" className="p-3 border">
                            <h5>Sharing via external portal</h5>
                            {last_publish_date != "" && formId && (
                              <Row>
                                <Col md="10" className="py-3 pl-0">
                                  <p>
                                    URL :{" "}
                                    <a
                                      href={`${API.PORTAL_URL}/public/form?id=${
                                        collection._id
                                      }${
                                        GetTenantName() !== "portal"
                                          ? "&sharing=true"
                                          : ""
                                      }`}
                                      target="_bank"
                                    >{`${API.PORTAL_URL}/public/form?id=${
                                      collection._id
                                    }${
                                      GetTenantName() !== "portal"
                                        ? "&sharing=true"
                                        : ""
                                    }`}</a>
                                  </p>
                                </Col>
                                <Col md="2" className="py-3">
                                  <QRCode
                                    value={`${API.PORTAL_URL}/public/form?id=${
                                      collection._id
                                    }${
                                      GetTenantName() !== "portal"
                                        ? "&sharing=true"
                                        : ""
                                    }`}
                                    size="64"
                                  />
                                </Col>
                              </Row>
                            )}
                            {last_publish_date != "" && (
                              <div className="custom-control custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="multipleSubmissions"
                                  checked={multipleSubmissions}
                                  onChange={(e) =>
                                    this.setState({
                                      multipleSubmissions: !multipleSubmissions,
                                    })
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="multipleSubmissions"
                                >
                                  <FormattedMessage id="collection.multipleSubmissions" />{" "}
                                  ? {multipleSubmissions}
                                </label>
                              </div>
                            )}
                          </Col>
                        </Row>
                      )}

                      {is_system && (
                        <Row>
                          <Col md="12" className="p-3 border">
                            <div className="custom-control custom-switch">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id="is_default_external_redirect_url"
                                checked={is_default_external_redirect_url}
                                onChange={(e) =>
                                  this.setState({
                                    is_default_external_redirect_url:
                                      !is_default_external_redirect_url,
                                    external_redirect_url:
                                      is_default_external_redirect_url === true
                                        ? external_redirect_url
                                        : "",
                                  })
                                }
                              />

                              <label
                                className="custom-control-label"
                                htmlFor="is_default_external_redirect_url"
                              >
                                <FormattedMessage id="collection.default_external_confirmation" />
                                {is_default_external_redirect_url}
                              </label>
                            </div>
                            <input
                              disabled={is_default_external_redirect_url}
                              value={external_redirect_url}
                              id="external_redirect_url"
                              type="text"
                              placeholder="URL of custom confirmation page"
                              className="form-control input-bottom-line"
                              onChange={(event) =>
                                this.handleInputChange(
                                  "external_redirect_url",
                                  event
                                )
                              }
                            />
                          </Col>
                        </Row>
                      )}
                    </CardBody>
                  </Card>
                  <Card className="mt-3 Access-card">
                    <CardHeader
                      className="header-Access-card"
                      style={{
                        textTransform: "capitalize",
                        padding: ".75rem 1.25rem",
                      }}
                    >
                      <Row>
                        <Col>
                          <h5>Internal Access Settings</h5>
                        </Col>
                      </Row>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col md="12" className="p-3">
                          <div className="custom-control custom-switch">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="is_default_internal_redirect_url"
                              checked={is_default_internal_redirect_url}
                              onChange={(e) =>
                                this.setState({
                                  is_default_internal_redirect_url:
                                    !is_default_internal_redirect_url,
                                  internal_redirect_url:
                                    is_default_internal_redirect_url === true
                                      ? internal_redirect_url
                                      : "",
                                })
                              }
                            />

                            <label
                              className="custom-control-label"
                              htmlFor="is_default_internal_redirect_url"
                            >
                              <FormattedMessage id="collection.default_internal_confirmation" />
                              {is_default_internal_redirect_url}
                            </label>
                          </div>
                        </Col>
                        <Col md="12" className="p-30">
                          <input
                            disabled={is_default_internal_redirect_url}
                            value={internal_redirect_url}
                            id="internal_redirect_url"
                            type="text"
                            placeholder="URL of custom confirmation page"
                            className="form-control input-bottom-line"
                            onChange={(event) =>
                              this.handleInputChange(
                                "internal_redirect_url",
                                event
                              )
                            }
                          />
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>

                  <EndPoint
                    onChange={() =>
                      this.setState({
                        collection: {
                          ...collection,
                          enableEndPoint: !collection.enableEndPoint,
                        },
                      })
                    }
                    enableEndPoint={collection.enableEndPoint}
                    collectionId={formId}
                    properties={collection.viewTables[0].properties}
                  />
                </div>
              </SimpleBar>
            </div>
            <div
              className="rightbar-overlay"
              onClick={() => this.setState({ form_setting_step: 0 })}
            ></div>
          </>
        )}

        <Modal className="modal-md" isOpen={setNewCollectionModal}>
          <ModalHeader
            toggle={() =>
              (window.location.href =
                "/design" + GetAppName(this.props.user) + "/collection-list")
            }
          >
            Collection Setup
          </ModalHeader>
          <ModalBody>
            <Formik
              initialValues={initState}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={(values) => {
                const data = {
                  collectionName: values.collectionName,
                  collectionDescription: values.collectionDescription,
                };

                this.setState({
                  collection: { ...collection, ...data },
                  setNewCollectionModal: false,
                });
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
                          Collection Name
                          <span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="collectionName"
                          name="collectionName"
                          rows="4"
                          value={values.collectionName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <ErrorMessage
                          className="validation-error"
                          name="collectionName"
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
                          Collection Description
                          <span className="required-star">*</span>
                        </label>
                        <textarea
                          style={{ width: "100%" }}
                          className="form-control"
                          id="collectionDescription"
                          name="collectionDescription"
                          type="text"
                          maxLength="256"
                          value={values.collectionDescription}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        ></textarea>
                        <ErrorMessage
                          className="validation-error"
                          name="collectionDescription"
                          component="div"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12 mt-3">
                      <Link
                        to={
                          "/design" +
                          GetAppName(this.props.user) +
                          "/collection-list"
                        }
                      >
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
      </Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user,
});

const mapDispatchToProps = (dispatch) => ({
  GetCollections: (data) => dispatch(GetCollections(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(collectionForm);
