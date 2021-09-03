import { toast } from 'react-toastify';
import constant from './constant'
import 'react-toastify/dist/ReactToastify.min.css'
import API from '../config';
import auth from "../actions/auth";
import parser from 'cron-parser';
import jp from 'jsonpath';
import { HotFormulaParser, SUPPORTED_FORMULAS } from './hotFormula';
import { loadExrVariable } from "./ActionEvent/loadVariables"

const $ = require('jquery');
let datatableIds = []
$.DataTable = require('datatables.net');


//cron expression generator
export function cronGenerator(interval, dateTime, dayofmonth, month, dayofweek) {
  var m = dateTime ? dateTime.split(":")[1] : "*"
  var h = (interval === 'hourly') ? '*' : dateTime ? dateTime.split(":")[0] : "*"
  var dom = !dayofmonth || interval !== 'monthly' ? "*" :
    Object.keys(dayofmonth).filter(key => dayofmonth[key] === true)
  var mth = !month ? '*' : month
  var dow = !dayofweek || !['weekly', 'monthly'].includes(interval) ? '*' :
    Object.keys(dayofweek).filter(key => dayofweek[key] === true)
  return `${m} ${h} ${dom} ${mth} ${dow}`
}

export function printSchedules(cron, startDateTime, endDateTime, limit, isRepeating) {
  const scheduleArray = [];
  const start = startDateTime ? startDateTime : new Date();
  const end = endDateTime;
  var options = {
    currentDate: start,
    ...endDateTime && { endDate: isRepeating ? end : start },
    iterator: true
  };
  var interval = parser.parseExpression(cron, options);
  var count = 0;

  while (true && count < (limit ? limit : 365)) {
    try {
      count++
      var obj = interval.next();
      scheduleArray.push(obj.value.toString());
    } catch (e) {
      //console.log("e:",e)
      break;
    }
  }

  return (scheduleArray)
}

// check whether a string is empty or only contain whitespaces
export function isEmptyString(string) {
  return "anup"///^\s*$/.test(string)
}

// beautify JSON object to string with 2 spaces indentation
export function stringifyPrettyJSON(object) {
  return JSON.stringify(object, undefined, 2)
}

// check if straing is in valid json format
export function isValidJson(json) {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

export function getBase64Url(url, callback) {
  return new Promise((resolve, reject) => {
    try {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        }
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    } catch (err) {
      console.log(err);
      resolve(url);
    }
  });
}

// allow user to make indentation with tab when editing JSON string in textarea
export function handleTabPressedOnJSONTextarea(event, textarea) {
  if (event.keyCode === 9) {
    event.preventDefault()

    let v = textarea.value,
      s = textarea.selectionStart,
      e = textarea.selectionEnd

    textarea.value = v.substring(0, s) + '\t' + v.substring(e)
    textarea.selectionStart = textarea.selectionEnd = s + 1
  }
}

export function getUrl() {
  return API.BASE_URL;
}

export function showLoader(is_show) {
  if (document.getElementById('app-loader')) {
    if (is_show) {
      return document.getElementById('app-loader').style.display = "block";
    } else {
      return document.getElementById('app-loader').style.display = "none";
    }
  }
}

export function ParseFloat(str, val) {
  str = str.toString();
  str = str.slice(0, (str.indexOf(".")) + val + 1);
  return Number(str);
}

export function checkTenatLogin() {
  var result = true;
  if (GetTenantName() == "portal" || GetTenantName() == "portal-dev") {
    result = false
  }
  return result;
}

export function getHostInfo() {
  var url = window.location.host;
  var temp_data = {
    hostName: API.BASE_URL,
    emailDomain: ""
  }
  if (url != API.BASE_URL) {
    temp_data.hostName = window.location.host.split(".")[0];
    temp_data.emailDomain = temp_data.hostName + ".com"
  }
  return temp_data
}

export function getQueryString() {
  return decodeURI(window.location.search).replace('?', '').split('&').map(param => param.split('=')).reduce((values, [key, value]) => {
    values[key] = value
    return values
  }, {})
}

// convert data URL base64 format to Blob
export function dataURLtoBlob(dataURL) {
  // convert base64 to raw binary data held in a string
  const byteString = atob(dataURL.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

// download files from object URL
export function downloadURI(uri, name) {
  let link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// extract data from double angle brackets string pattern: <<data>
export function getDataFromStringPattern(rawString) {
  const pattern = /^<<\S+>>$/
  let data = rawString
  let isPatternExist = false

  if (pattern.test(rawString)) {
    data = rawString.slice(2, rawString.length - 2)
    isPatternExist = true
  }

  return { data, isPatternExist }
}

// recursive function to do math calculation on string formula input
// use case: mathCalculation("1 * 2 + 4 / 2 - 6")
export function mathCalculation(formula) {
  const plusOperator = '+'
  const minusOperator = '-'
  const multiplyOperator = '*'
  const divideOperator = '/'

  if (formula.indexOf(plusOperator) > 0) {
    const operands = formula.split(plusOperator)
    let total = 0

    operands.forEach(operand => {
      total = total + mathCalculation(operand)
    })

    return total
  }

  else if (formula.indexOf(minusOperator) > 0) {
    const operands = formula.split(minusOperator)
    let total = 0

    operands.forEach((operand, index) => {
      if (index === 0) {
        total = mathCalculation(operand)
      }
      else {
        total = total - mathCalculation(operand)
      }
    })

    return total
  }

  else if (formula.indexOf(multiplyOperator) > 0) {
    const operands = formula.split(multiplyOperator)
    let total = 1

    operands.forEach(operand => {
      total = total * mathCalculation(operand)
    })

    return total
  }

  else if (formula.indexOf(divideOperator) > 0) {
    const operands = formula.split(divideOperator)
    let total = 1

    operands.forEach((operand, index) => {
      if (index === 0) {
        total = mathCalculation(operand)
      }
      else {
        total = total / mathCalculation(operand)
      }
    })

    return total
  }

  return Number(formula)
}

// compute field value based on value of other fields
export function computeValueByFormula(properties, formData) {
  let newFormData = { ...formData }

  Object.keys(properties).forEach(key => {
    if (properties[key].formula) {
      const formula = properties[key].formula

      let operands = formula.replace(/\+|-|\*|\//g, ' ').split(' ')
      operands = operands.map(operand => formData[operand])

      if (properties[key].type === 'number') {
        const operators = formula.replace(/\w/g, '').split('')
        const updatedFormula = operands.map(operand => operators.length > 0 ? operand + operators.shift() : operand).join('')
        newFormData[key] = mathCalculation(updatedFormula)
      }
      else if (properties[key].type === 'string') {
        newFormData[key] = operands.join(' ')
      }
    }
    else if (properties[key].type === 'array') {
      if (formData[key] !== undefined) {
        newFormData[key] = newFormData[key].map((item, childKey) =>
          computeValueByFormula(properties[key].items.properties, newFormData[key][childKey])
        )
      }
    }
  })

  return newFormData
}

// open and close materialize css modal with input id
export function openCloseModal(id, action) {
  let modal = document.getElementById(id)
  let instance// = M.Modal.getInstance(modal)
  if (action === 'open') instance.open()
  else if (action === 'close') instance.close()
}

// replace undefined object values with new values
// e.g. replace with empty string: replaceUndefinedValueWithNewValue(object, '')
export function replaceUndefinedValueWithNewValue(object, newValue) {
  return Object.keys(object).reduce((obj, key) => {
    let value = newValue

    if (object[key] !== undefined) {
      value = object[key]
    }

    return {
      ...obj,
      [key]: value
    }
  }, {})
}


export function GenerateKey() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function Toast(message, type, autoClose) {
  toast.configure({
    autoClose: autoClose || 1000,
    draggable: false,
    closeOnClick: true,
    pauseOnHover: true
    //etc you get the idea
  });

  switch (type) {
    case 'success':
      toast.success(message)
      break;
    case 'error':
      toast.error(message)
      break;
    case 'warn':
      toast.warn(message)
      break;
    case 'info':
      toast.info(message)
      break;
    default:
      toast(message, { className: 'custom-toastify' })
      break;
  }
}

export function GetAppName(props) {
  const { isLoggedIn, UserApps, app_id } = props;
  let rootPath = "";
  if (isLoggedIn && UserApps && app_id && app_id != "") {
    if (app_id == "5f190371db85375976b48101")
      rootPath = "/dashboard";
    else if (app_id == "5f190371db85375976b48102")
      rootPath = "/admin";
    else if (app_id == "5f190371db85375976b48103")
      rootPath = "/shared-forms-list";
    else if (UserApps.length != 0)
      rootPath = "/" + UserApps.find(x => x._id == app_id).name
    else
      rootPath = "";
  }
  return rootPath;
}

export function GetAppData(user, layout) {
  const { isLoggedIn, UserApps, app_id } = user;

  const isSideNav = (layout.isSideNav || layout.isSideNav === false) ? layout.isSideNav : true;
  const isTopNav = (layout.isTopNav || layout.isTopNav === false) ? layout.isTopNav : true;

  let is_portalApp = 1;
  if (isLoggedIn && UserApps && app_id && app_id != "" && UserApps.length != 0 && UserApps.find(x => x._id == app_id)) {
    var selectd = UserApps.find(x => x._id == app_id);
    // isSideNav = selectd.isSideNav === false ? false : true;
    // isTopNav = selectd.isTopNav === false ? false : true;
    is_portalApp = selectd.application_type === 2 ? 0 : 1;
  }
  return { isSideNav, isTopNav, is_portalApp };
}

export function GetTenantName() {
  var WebURL = window.location.host;
  const is_dev_mode = AppDeveloperMode()
  var return_host = "portal";
  var TenantHost = window.location.host.split(".")[0].split(":")[0]
  if (TenantHost == "localhost" || TenantHost == "flowngin" || TenantHost == "glozic") {
    return_host = is_dev_mode ? "portal-dev" : 'portal';
  } else {
    return_host = is_dev_mode ? TenantHost + "-dev" : TenantHost;
  }
  return return_host;
}

export function fullUrlPathPDF(FileName) {
  return API.BASE_API_URL + "/pdfhtml/upload/" + FileName.replace(".html", "");
}

export function hiddenDatabasePassword(dbUrl) {
  return dbUrl.split("@").length >= 2 ? dbUrl.replace(dbUrl.split("@")[0].split(":")[2], "*********") : dbUrl;
}

export function GetDataBase(dbBase) {
  try {
    dbBase = dbBase.split("@")
    if (dbBase.length >= 2) {
      dbBase = dbBase[1].split("/")[1].split("?")[0]
    } else {
      dbBase = dbBase[0].split("/")[3].split("?")[0]
    }
    return dbBase
  } catch (err) {
    return dbBase
  }
}
export function ChangeDataName(dbBase, dbName) {
  try {
    var temp = dbBase.split("@");
    if (temp.length == 1) {
      //"mongodb://constantsys.com:27018/glozic"
      var temp1 = temp[0].split("://")[0];//["mongodb", "constantsys.com:27018/glozic"]
      var temp2 = temp[0].split("://")[1];//["mongodb", "constantsys.com:27018/glozic"]
      var temp3 = temp2.split("/")[0];//["constantsys.com:27018", "glozic"]
      var temp4 = temp2.split("/")[1].split("?").length != 1 ? temp2.split("/")[1].split("?")[1] : "";//"authSource=admin&readPreference=primary&ssl=false"
      var result = temp1 + "://" + temp3 + "/" + dbName + (temp4 ? ('?' + temp4) : "");
      return result;
    } else if (temp.length == 2) {
      var temp1 = temp[0]; //["mongodb://**** *****", "constantsys.com:27018/glozic"]
      var temp3 = temp[1].split("/")[0]; // constantsys.com:27018
      var temp4 = temp[1].split("/")[1].split("?").length != 1 ? temp[1].split("/")[1].split("?")[1] : "";//"authSource=admin&readPreference=primary&ssl=false"
      var result = temp1 + "@" + temp3 + "/" + dbName + (temp4 ? ('?' + temp4) : "");
      return result;
    }
  } catch (err) {
    console.log(err.message);
    return dbBase
  }
}



export function SetFormSchemaDefaultAndComputedValue(formschema, payload) {
  //debugger
  let data = typeof formschema == "string" ? formschema : JSON.stringify(formschema);
  var collectionForm = data, gv = [], regex = /\$([0-9a-zA-Z-_\/\']+)\$/gm, s;
  while ((s = regex.exec(collectionForm)) !== null) {
    if (s.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    gv.push(s[0]);
  }
  gv.forEach(element => {
    switch (element) {
      case "$user_fullname$":
        collectionForm = collectionForm.replace(element, payload.User_data ? (payload.User_data.firstname + " " + payload.User_data.lastname) : "");
        break;
      case "$user_firstname$":
        collectionForm = collectionForm.replace(element, payload.User_data ? (payload.User_data.firstname) : "");
        break;
      case "$user_lastname$":
        collectionForm = collectionForm.replace(element, payload.User_data ? (payload.User_data.lastname) : "");
        break;
      case "$user_email$":
        collectionForm = collectionForm.replace(element, payload.User_data ? (payload.User_data.email) : "");
        break;
      case "$user_mobile$":
        collectionForm = collectionForm.replace(element, payload.User_data ? (payload.User_data.mobile) : "");
        break;
    }
  });
  return typeof formschema == "string" ? collectionForm : JSON.parse(collectionForm);
}

export function pdfHTMLStringReplace(html, data) {

  Object.keys(data).forEach(ele => {
    html = html.replace('[' + ele + ']', data[ele]);
    html = html.replace('name="data' + data[ele] + '"', 'value="' + data[ele] + '"');
    html = html.replace('value=""', '');
  });
  return html
}

export function isValidProfileURL(baseUrl, url) {
  var result = "";
  if (url && url.search("://") >= 0) {
    result = url
  } else if (url != "") {
    result = baseUrl + '/download?filename=' + url;
  } else {
    result = 'https://cdn1.iconfinder.com/data/icons/avatar-3/512/Manager-512.png';
  }
  return result
}

export function AppDesign(path) {
  let result = window.location.pathname.split("/")[1] == "design" ? true : false
  result = (path) ? (result ? '/design' : "") : result;
  return (result);
}

export function accessLevel(access_roles, role_id) {
  return constant.levels.filter(x => access_roles.includes(x.key)).map(x => x.id).includes(role_id)
}

export function AppDeveloperMode() {
  let result = true;
  if (process.env.NODE_ENV == 'development') {
    const is_dev_mode = window.location.host.search("3003") >= 0 ? true : false;
    result = is_dev_mode;
  } else {
    const is_dev_mode = window.location.host.search(".dev") >= 0 ? true : false;
    result = is_dev_mode;
  }
  return result;
}

export function databaseUrlProtected(url) {
  var user = url.split("@")[0].split("//")[1].split(":")[0]
  var password = url.split("@")[0].split("//")[1].split(":")[1]
  var url_db = url.replace(user, '<user>');
  url_db = url_db.replace(password, '<password>');
}

export function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function rexExpvariable(data) {
  try {
    console.log(data);
    let varString = ""
    const varLists = data.filter(x => ["Object", "Input Variable"].includes(x.type));
    varLists.forEach((x) => {
      if (x.var == "user" && x.type == "Object") {
        varString += "\\$user.firstname\\$?|\\$user.lastname\\$?|\\$user.email\\$?|\\$user.gender\\$?|\\$user.phone\\$?|\\$user.mobile\\$?|"
      } else if (x.type == "Object") {
        if (x.options) {
          const tempData = JSON.parse(x.options);
          if (tempData.columns) {
            const options = tempData.columns;
            options.forEach(y => {
              varString += `\\$${x.var}.${y.dataField}\\$?|`
            })
          }
        }
      } else {
        varString += `\\$${x.var}\\$?|`
      }
    });

    console.log(`${varString.substr("", varString.length - 1)}`, 'gi');
    let re = new RegExp(`${varString.substr("", varString.length - 1)}`, 'gi');
    return re;
  } catch (e) {
    console.log(e);
    return /|/gi;
  }
}

export function whitelistVariable(data, isAction) {
  try {
    let varString = []
    console.log(data);
    if (isAction) {
      let varLists = data.concat(data.filter(x => ["Object", "Input Variable"].includes(x.variableType)));
      varLists.forEach((x) => {
        if (x.name == "user" && (x.variableType == "Object")) {
          ["{{user.firstname}}", "{{user.lastname}}", "{{user.email}}", "{{user.gender}}", "{{user.phone}}", "{{user.mobile}}"].forEach(ele => {
            varString.push({ value: ele, title: ele });
          })
        } else if (x.variableType == "Object") {
          // const tempData = JSON.parse(x.options);
          // if (tempData.columns) {
          //   const options = tempData.columns;
          //   options.forEach(y => {
          //     let name = `{{${x.var}.${y.dataField}}}`;
          //     varString.push({ value: name, title: name });
          //   })
          // }
        } else {
          let name = `{{${x.name}}}`
          varString.push({ value: name, title: name });
        }
      });
    } else {
      let varLists = data.filter(x => ["Object", "Input Variable"].includes(x.type));
      varLists.forEach((x) => {
        if (x.var == "user" && (x.type == "Object" || x.variableType == "Object")) {
          ["{{user.firstname}}", "{{user.lastname}}", "{{user.email}}", "{{user.gender}}", "{{user.phone}}", "{{user.mobile}}"].forEach(ele => {
            varString.push({ value: ele, title: ele });
          })
        } else if (x.type == "Object" || x.variableType == "Object") {
          const tempData = JSON.parse(x.options);
          if (tempData.columns) {
            const options = tempData.columns;
            options.forEach(y => {
              let name = `{{${x.var}.${y.dataField}}}`;
              varString.push({ value: name, title: name });
            })
          }
        } else {
          let name = `{{${x.var}}}`
          varString.push({ value: name, title: name });
        }
      });
    }

    return varString
  } catch (err) {
    return [];
  }
}

export function getObjectKey(string, index, variable) {
  try {
    var result = "";
    if (string.split("[[{").length >= 2) {
      let stringArrya = string.split("],[");
      if (variable) {
        stringArrya.forEach(ele => {
          let data = JSON.parse(ele.replace("[[{", "[{").replace("}]]", "}]"));
          if (data && data.length != 0 && (data[0].value.search(variable) >= 0)) {
            result = data[0].value.replaceAll("{{", "").replaceAll("}}", "").split(".")[index];
            return false;
          }
        });
      } else {
        stringArrya.forEach(ele => {
          let data = JSON.parse(ele.replace("[[{", "[{").replace("}]]", "}]"));
          if (data && data.length != 0) {
            result = data[0].value.replaceAll("{{", "").replaceAll("}}", "").split(".")[index];
            return false;
          }
        });
      }

      // result = JSON.parse(string)[0][0].value.replaceAll("{{", "").replaceAll("}}", "").split(".")[index];
    } else {
      result = string.replaceAll("{{", "").replaceAll("}}", "").split(".")[index];
    }
    return result
  } catch (err) {
    debugger
    console.log(err);
    return string
  }
}

export async function replaceVariableFunction(string, Variables, options) {
  try {
    var gv = [], s;
    const regex1 = /\[([[.*+?^$(){[\]}:@"0-9a-zA-Z-_., \/\']+)\]/gm; // "[[{value:{{user.name}}]]"
    const regex2 = /\{{([0-9a-zA-Z-_., \/\']+)\}}/gm; // {{user.firstname}}
    [regex1, regex2].forEach(ele => {
      while ((s = ele.exec(string)) !== null) {
        if (s.index === ele.lastIndex) {
          ele.lastIndex++;
        }
        gv.push(s[0]);
      }
    });

    for (let index = 0; index < gv.length; index++) {
      const objectKey = getObjectKey(gv[index], 0);
      let variable = Variables[objectKey];
      if (!variable && variable != "" && options) {
        const getSource = options.loadPayload.extSources.find(x => x.var == objectKey);
        if (getSource) {
          options.loadPayload.source = getSource;
          console.log(options.loadPayload);
          const loadExrVariableData = await loadExrVariable(options.loadPayload);
          variable = loadExrVariableData.status ? loadExrVariableData.data[objectKey] : "";
        } else {
          variable = "";
        }
      }

      if (variable && typeof variable == "object") {
        const objectKe2 = getObjectKey(gv[index], 1, objectKey);
        string = string.replace(gv[index], variable[objectKe2])
      } else if (variable) {
        string = string.replace(gv[index], variable)
      }
    }

    string = HotFormulaParser(string)
    //return (string.replaceAll(/\n/g, "<br />"))
    return (string)
  } catch (err) {
    console.log(err);
    return string
  }
}

export function reconfigViewField(components_data, viewField) {
  let key = "";
  console.log(viewField);
  let submission_data = {}
  viewField.forEach(x => submission_data[x.key] = "")

  const submission = submission_data
  const components = components_data
  let submissions = [
    { "title": "Created", "key": "createdTime", "visible": false, "length": "0" },
    { "title": "Created By", "key": "createdBy", "visible": false, "length": "0" },
    { "title": "Modified", "key": "modifiedTime", "visible": false, "length": "0" },
    { "title": "Modified By", "key": "modifiedBy", "visible": false, "length": "0" }
  ];
  components.map(componentObj => {
    Object.keys(submission).map(x => {
      const pathEditgridExp = "$..*[?(@.key== '" + x + "')]";
      const Components = jp.query(componentObj, pathEditgridExp, 1000);
      const componentArray = Components.filter((v, i, a) => a.findIndex(t => (t.key === v.key)) === i);
      if (componentArray.length != 0) {
        const component = componentArray[0];
        if (component.type == "editgrid") {
          let obj = { "title": component.label, "key": component.key, "visible": true, viewFields: [], "length": "0" };
          Object.keys(submission).map(y => {
            const pathEditgridExp2 = "$..*[?(@.key== '" + y + "')]";
            const Components2 = jp.query({ object: component.componentComponents }, pathEditgridExp2, 1000);
            const component2 = Components2.filter((v, i, a) => a.findIndex(t => (t.key === v.key)) === i)[0];
            if (component2) {
              let obj2 = { "title": component2.label, "key": component2.key, "visible": true, "length": "0" };
              obj.viewFields.push(obj2)
            }
          });
          obj.viewFields = obj.viewFields.filter((v, i, a) => a.findIndex(t => (t.key === v.key)) === i);
          submissions.push(obj)
        } else {
          let obj = { "title": component.label, "key": component.key, "visible": true, "length": "0" };
          submissions.push(obj)
        }
      }
    });
  });
  submissions = submissions.filter((v, i, a) => a.findIndex(t => (t.key === v.key)) === i);
  submissions = submissions.filter((v, i) => v.key != "submit")
  return submissions;
}

export async function callDataTableFormio(DataTableList) {
  let count = 0, DataTableListLength = DataTableList.length;
  while (count < DataTableListLength) {
    let dataTableCustomComp = DataTableList[count];
    if (dataTableCustomComp && (dataTableCustomComp.table_source == "JSON" || dataTableCustomComp.table_source == "Variable")) {
      let dataTableObject = {};
      dataTableObject = dataTableCustomComp.json_config;
      if (dataTableCustomComp.table_source == "Variable") {
        let columns = [];
        dataTableCustomComp.table_th.forEach((ele, i) => {
          ele["key"] = ele.label.toUpperCase().replaceAll(" ", "")
          if (i == 0) {
            columns.push({
              'data': ele.key,
              "defaultContent": "",
              'name': ele.label,
              render: function (data, type, row) {
                if (!datatableIds.some(x => x.documentId == row.documentId)) {
                  datatableIds.push(row["=allDetails"]);
                }
                return data;
              }
            });
          } else {
            columns.push({ 'data': ele.key, "defaultContent": "", 'name': ele.label });
          }
        });

        if (dataTableCustomComp.enableActionCol && dataTableCustomComp.action_column_lists && dataTableCustomComp.action_column_lists.length) {
          console.log(dataTableCustomComp.action_column_lists);
          var button = "<div class='d-flex'>"
          dataTableCustomComp.action_column_lists.forEach(ele => {
            button += '<button  id="' + ele.actionName + '" class="dt-action btn ' + ele.className + '">' + ele.label + '</button>';
          });
          button += "</div>";
          console.log(button);
          columns.push({ render: function (data, type, full) { return button; } });
        }

        dataTableObject = {
          "paging": true,
          "pageLength": 10,
          "processing": true,
          "serverSide": true,
          'ajax': {
            'type': 'POST',
            'url': API.BASE_API_URL + '/api/datatable-collections-list',
            "data": function (c) {
              c.collectionId = dataTableCustomComp.connId;
              c.columnslists = dataTableCustomComp.table_th;
            },
            "beforeSend": function (xhr) {
              xhr.setRequestHeader('Authorization', auth.headers.headers.Authorization);
              xhr.setRequestHeader('Tenant', auth.headers.headers.Tenant);
            }
          },
          'columns': columns,
          "columnDefs": [
            {
              "searchable": false,
              "orderable": false,
              "targets": 0
            }
          ]
        }
      }
      if (dataTableCustomComp.enableDataTableConfig) {
        dataTableObject = { ...dataTableObject, ...dataTableCustomComp.json_datatable_config }
      }
      if (document.getElementById(dataTableCustomComp.key)) {
        $("#" + dataTableCustomComp.key).DataTable(dataTableObject);
      }
      count++;
    } else {
      count++;
    }
  }
  showLoader(0)
}

export function datatableIdLists() {
  return datatableIds;
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
