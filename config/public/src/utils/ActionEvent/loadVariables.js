import queryString from 'query-string';
import axios from '../axiosService';
import { replaceVariableFunction } from '../helperFunctions';

export const loadExtData = async (extSources, props) => {
  return new Promise(async (resolve, reject) => {
    try {
      const queryStringObjet = queryString.parse(location.search);
      var extData = {}, count = 0;

      //Load Query String Input Variable
      extSources = await loadExtDataInputVariable(extSources);

      extSources.forEach(source => {
        if (source.type == "Input Variable") {
          extData[source.var] = source.defaultValue;
        }
      });

      const InputVariable = extSources.filter(x => x.type == "Input Variable")

      // //Load Variables
      while ((extSources.length - 1) >= count) {
        try {
          var source = extSources[count];
          var propsUser = { user: props.user }
          const exraDataRes = await loadExrVariable({ extData, source, propsUser, queryStringObjet, InputVariable, extSources })
          if (exraDataRes.status) extData = exraDataRes.data;
          count++;
        } catch (err) {
          count++;
          console.log(err);
        }
      }
      resolve(extData);
    } catch (err) {
      console.log(err);
      console.log(err.message);
    }
  });
}

export const loadExrVariable = async (reqPayload) => {
  try {
    let { extData, source, propsUser: props, queryStringObjet, InputVariable, ref, extSources } = reqPayload;
    //Get Filter Value
    //Load Filters and Query String
    if (source.filters && source.filters.length != 0) {
      source.filters.forEach(x => {
        if (x.value.search("{{") >= 0) {
          const findInput = InputVariable.find(y => y.var == x.value.replaceAll("{{", "").replaceAll("}}", ""));
          if (findInput) {
            x["queryString"] = findInput.queryString;
            x.value = findInput.defaultValue;
          }
        }
      });
    }

    const loadPayload = { extData, source, props, queryStringObjet, InputVariable, ref, extSources }

    switch (source.type) {
      case 'Json':
        extData[source.var] = source.defaultValue
        break;
      case 'Object':
        if (source.var == 'user') {
          extData[source.var] = props.user.User_data;
        } else {
          var reqData = {
            method: 'GET',
            connId: source.connId,
            dataSrcType: source.type,
            tenant: source.tenant,
            isObject: true,
            query: {}
          }

          //Condition of collection
          if (source.filters) {
            source.filters.forEach(x => {
              if (x.queryString) {
                var objKey = queryStringObjet[x.queryString]
                if ((x.field == "documentId") && objKey) {
                  reqData.query["_id"] = x.value;
                } else if (objKey) {
                  reqData.query[x.field] = x.value;
                }
              }
            });
          }

          if (Object.keys(reqData.query).length == 0) {
            extData[source.var] = null;
          } else {
            const res = await axios.apis('POST', `/api/webRequestCollection`, reqData)
            const result = (res.status && res.result && res.result.length == 1) ? res.result[0] : {};
            extData[source.var] = { ...result, connId: source.connId, tenant: source.tenant };
          }
        }
        break;
      case 'Collection':

        var reqData = {
          method: 'GET',
          connId: source.connId,
          dataSrcType: source.type,
          tenant: source.tenant,
          query: {}
        }

        //Condition of collection
        if (source.filters) {
          source.filters.forEach(x => {
            if (x.queryString) {
              var objKey = queryStringObjet[x.queryString]
              if ((x.field == "documentId") && objKey) {
                reqData.query["_id"] = x.value;
              } else if (objKey) {
                reqData.query[x.field] = x.value;
              }
            }
          });
        }

        const res = await axios.apis('POST', `/api/webRequestCollection`, reqData)
        const result = (res.status && res.result && res.result.length != 0) ? res.result : [];
        extData[source.var] = result
        break;
      case 'Sharepoint':
      case 'Web request':
        var reqData = {
          url: source.url,
          method: 'GET',
          connId: source.connId,
          dataSrcType: source.type,
          tenant: source.tenant
        }
        const resWebrequest = await axios.apis('POST', `/api/webrequest`, reqData)
        extData[source.var] = resWebrequest
        break;
      case 'Text':
        extData[source.var] = source.defaultValue;
        break;
      case 'Number':
        extData[source.var] = source.defaultValue
        break;
      case 'TextExpression':
        const textExpressionData = await replaceVariableFunction(source.defaultValue, extData, { refence: 'viewPage', source: source, loadPayload })
        extData[source.var] = textExpressionData.replaceAll(/\n/g, "<br />");
        break;
      case 'NumberExpression':
        const numberExpressionData = await replaceVariableFunction(source.defaultValue, extData, { refence: 'viewPage', source: source, loadPayload })
        extData[source.var] = Number(numberExpressionData);
        break;
      case 'CheckboxExpression':
        const checkboxExpressionData = await replaceVariableFunction(source.defaultValue, extData, { refence: 'viewPage', source: source, loadPayload })
        extData[source.var] = checkboxExpressionData;
        break;
      case 'DatetimeExpression':
        const datetimeExpressionData = await replaceVariableFunction(source.defaultValue, extData, { refence: 'viewPage', source: source, loadPayload })
        extData[source.var] = datetimeExpressionData;
        break;
    }
    return { status: true, data: extData };
  } catch (err) {
    console.log(err);
    return { status: false }
  }
}

const loadExtDataInputVariable = async (extSources) => {
  return new Promise(async (resolve, reject) => {
    try {

      let queryStringObjet = queryString.parse(location.search);
      var count = 0;
      while ((extSources.length - 1) >= count) {
        console.log("count=>", count);
        var source = extSources[count];
        if (source.type == "Input Variable") {
          extSources[count]["queryString"] = extSources[count].defaultValue;
          extSources[count].defaultValue = queryStringObjet[source.defaultValue] ? queryStringObjet[source.defaultValue] : ""
        }
        count++;
      }
      resolve(extSources)
    } catch (err) {
      console.log(err);
      console.log(err.message);
      resolve(extSources)
    }
  });
}