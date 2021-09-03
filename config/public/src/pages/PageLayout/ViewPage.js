import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import auth from "../../actions/auth";
import { setTopNavAction, setSideNavAction, setExternalAccessProfile } from "../../actions";
import axios from '../../utils/axiosService';
import { Toast, callDataTableFormio, showLoader, datatableIdLists } from '../../utils/helperFunctions';
import { Form } from 'react-formio';
import jp from 'jsonpath';
import runClientSideActions from '../../utils/ActionEvent';
import { loadExtData } from '../../utils//ActionEvent/loadVariables';
import API from "../../config";
import {
  Card, CardBody, CardHeader, CardText, Row, Col, Button, Input,
  Modal, ModalHeader, ModalBody, ModalFooter, Container
} from 'reactstrap'
const $ = require('jquery');
$.DataTable = require('datatables.net');

import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/monokai';

let blockDuplicateCall = 0;

class PageLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: undefined,
      isLoading: true,
      pageName: undefined,
      pageDescription: undefined,
      formschema: { "display": "form" },
      eventsConfig: undefined,
      actionsConfig: undefined,
      submission: { data: {} },
      varVault: {}
    }
  }

  componentDidMount = async () => {
    const { formId, history, user } = this.props;
    const pageId = this.props.match.params.pageId;
    const path_name = this.props.match.params.path_name;
    const page_name = this.props.match.params.page_name;
    const requestFormId = formId;
    let isPageAllow = true;

    if (this.props.match.params.path_name) {
      const externalAccessData = await this.onCheckAllowExternalAccess(page_name);
      if (externalAccessData.status) {
        if (!user.isLoggedIn) {
          this.props.setExternalAccessProfile(externalAccessData.external_access_profile)
          localStorage.setItem('_LOGINAFTERDFALTPATH', window.location.pathname);
          if (externalAccessData.external_access_profile.authentication_profile_type == 2) {
            window.location.href = `${API.BASE_API_URL}/auth/saml/external/login?access_profile_id=${externalAccessData.authentication_profile_id}`
          } else {
            window.location.href = `${API.BASE_API_URL}/external/login`
          }
        }
      } else {
        isPageAllow = false;
      }
    }

    //Reset Header And Side Nav 
    if (history) {
      this.unblock = history.block(() => {
        // take your action here     
        this.props.setTopNavAction(true)
        this.props.setSideNavAction(true)
        return true;
      });
    }

    //Get Page details
    if (isPageAllow && formId) {
      this.loadFormData(requestFormId);
    } else if (isPageAllow && (pageId && pageId != 'new')) {
      this.loadFormData(pageId);
    } else if (isPageAllow && path_name && page_name && user.isLoggedIn) {
      this.loadFormData(page_name);
    } else if (!isPageAllow) {
      this.setState({ isLoading: false })
    }
  }

  onCheckAllowExternalAccess = async (pageId) => {
    try {
      const res = await axios.apis('GET', `/api/page-external-access/${pageId}`, auth.headers);
      if (!res.status) {
        this.setState({ isExternalAccess: false })
      } else {
        this.setState({ isExternalAccess: true })
      }
      return res
    } catch (err) {
      return false
    }
  }

  loadFormData = async (pageId) => {
    try {
      const res = await axios.apis('GET', `/api/page-layout-list/${pageId}`, auth.headers);
      let { submission, varVault } = this.state;
      const that = this;
      var {
        _id,
        pageName,
        pageDescription,
        isSideNav,
        isTopNav,
        eventsConfig,
        actionsConfig,
        extSources,
        viewField,
        jsEditor
      } = res.data

      let formschema = JSON.parse(res.data.formSchema);

      const varComp = {
        "type": "var",
        "hidden": true,
        "key": "_varComp",
        "persistent": false,
        "tableView": false,
        "input": true,
        "label": "",
        "protected": false,
        "id": "ef2yqwq",
        "user": this.props.user ? this.props.user.User_data : {},
        "data": [],
        "pathname": window.location.pathname,
        "isNew": this.state.submission.isNew,
        "customDefaultValue": "form.user = component.user; form.data = component.data; form.pathname = component.pathname; submission.isNew = component.isNew;"
      }

      if (extSources) {
        varComp.data = await loadExtData(extSources, this.props);
        console.log(varComp.data);
        Object.keys(varComp.data).map(key => {
          varVault[key] = JSON.stringify(varComp.data[key])
          if (!varComp[key]) {
            varComp[key] = varComp.data[key];
            varComp.customDefaultValue += "form." + key + " = component." + [key] + ";"
          }
        });
      }

      if (eventsConfig && eventsConfig[0]) {
        const resActionData = await runClientSideActions(eventsConfig[0].actions, { submission, varVault, formschema, viewField });
        submission = resActionData.submission;
      }

      //Push Components
      formschema = { ...varComp, ...formschema }
      formschema.components.push(varComp);

      //Update States
      this.setState({
        _id: _id,
        pageName: pageName,
        submission: submission,
        pageDescription: pageDescription,
        isSideNav: isSideNav,
        isTopNav: isTopNav,
        formschema: formschema,
        eventsConfig: eventsConfig,
        isLoading: false,
        actionsConfig: actionsConfig
      });

      //Config Page Layouts
      this.props.setTopNavAction(isTopNav)
      this.props.setSideNavAction(isSideNav)

      const pathExp = "$..*[?(@.type== 'dataTableCustomComp')]";
      const editDataTableComponents = jp.query({ object: formschema.components }, pathExp, 1000);
      if (editDataTableComponents.length != 0) {
        showLoader(1);
        that.callDataTable(formschema, jsEditor);
      } else {
        eval(jsEditor);
      }
    } catch (err) {
      Toast(err.message, "error")
    }
  }


  callDataTable = (formschema, jsEditor) => {
    const superThat = this;
    let { submission } = this.state;
    const pathExp = "$..*[?(@.type== 'dataTableCustomComp')]";
    const editDataTableComponents = jp.query({ object: formschema.components }, pathExp, 1000);

    //Handal Action Event
    setTimeout(function () {
      callDataTableFormio(editDataTableComponents);
      eval(jsEditor);
      setTimeout(() => {
        $('.dt-action').each(function () {
          $(this).on('click', function (evt) {
            const that = $(this);
            var dtRow = that.parents('tr');
            const selectedRow = dtRow[0].rowIndex;
            console.log(datatableIdLists()[selectedRow]);
            superThat.onCustomEvent({ type: that[0].id, data: { selectedRow: JSON.parse(JSON.stringify(datatableIdLists()[selectedRow])) }, isDataTable: true });
            // $('div.modal-body').innerHTML='';
            // $('div.modal-body').append('Row index: '+'<br/>');
            // $('div.modal-body').append('Number of columns: '++'<br/>');
            // for(var i=0; i < dtRow[0].cells.length; i++){
            //   $('div.modal-body').append('Cell (column, row) '+dtRow[0].cells[i]._DT_CellIndex.column+', '+dtRow[0].cells[i]._DT_CellIndex.row+' => innerHTML : '+dtRow[0].cells[i].innerHTML+'<br/>');
            // }
            // $('#myModal').modal('show');
          });
        });
      }, 1000)
    }, 1000);

    //Close Modal Event
    if (document.querySelector(".formio-dialog-close")) {
      const formioDialogClose = document.querySelector(".formio-dialog-close");
      $(formioDialogClose).click(function (e) {
        const modalKey = document.querySelector(".formio-dialog").id.replaceAll("formio-modal", "")
        submission.data[modalKey] = false;
        superThat.setState({ submission: submission });
        superThat.callDataTable(formschema, jsEditor)
      });
    }

  }

  componentWillUnmount() {
    const { history } = this.props;
    if (history) {
      this.unblock();
    }
  }

  //Coll Custome Event's
  onCustomEvent = async (e) => {
    const that = this;
    let { submission, varVault, formschema, jsEditor } = that.state;

    if (e.isDataTable) {
      console.log(formschema);
      formschema["selectedRow"] = e.data.selectedRow;
      formschema.customDefaultValue += "form.selectedRow" + " = component.selectedRow;"
    }

    submission["data"] = { ...submission["data"], ...e.data };
    if (blockDuplicateCall != 1) {
      blockDuplicateCall = 1;
      const { actionsConfig } = this.state;
      const actionsCfg = actionsConfig.find(x => x.name == e.type)
      if (actionsCfg) {
        console.log(actionsCfg);
        const resActionData = await runClientSideActions([...actionsCfg.actions], { submission, varVault, formschema })
        this.setState({ submission: resActionData.submission, isLoading: false, formschema });
        setTimeout(() => {
          that.callDataTable(formschema, jsEditor);
        }, 100)
      } else {
        setTimeout(() => {
          that.callDataTable(formschema, jsEditor);
          that.setState({ submission: submission, isLoading: false, formschema })
        }, 100)
      }
    }
    setTimeout(() => blockDuplicateCall = 0, 1000);
  }

  render() {
    const { submission, isExternalAccess, isLoading } = this.state;
    var formschema = JSON.parse(JSON.stringify(this.state.formschema));

    if (isLoading) {
      return (
         <Card className='mt-3 w-60 mx-5 no-access'>
          <CardBody>
            <div className='m-auto p-3'>
	      <div className='text-center'>
          <span>Sorry, you are not allowed to access this page.</span><br/>
          <button className='btn btn-primary mt-2'>Go to HomePage</button>
          </div>
	   </div>
        </CardBody>
        </Card>
      )
    } else {
      return (
        <Fragment>
          {(!isExternalAccess && this.props.match.params.path_name) ?
            <h1>Not Allow Page Access</h1>
            :
            <div className={`p-3 h-100 bg-white ${this.props.formId ? 'home-page-remove-margin' : 'home-page-remove-margin-default'}`}>
              <Form
                form={formschema}
                options={{ noAlerts: true }}
                submission={submission}
                onCustomEvent={(e) => this.onCustomEvent(e)} />
            </div>
          }
        </Fragment>
      )
    }
  }
}

const mapStateToProps = ({ user, form }) => ({
  user
})

const mapDispatchToProps = (dispatch) => {
  return {
    setTopNavAction: (data) => dispatch(setTopNavAction(data)),
    setSideNavAction: (data) => dispatch(setSideNavAction(data)),
    setExternalAccessProfile: (data) => dispatch(setExternalAccessProfile(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PageLayout)
