
import { reject } from 'lodash';
import flowActions from '../flowActions';
import { Toast, IsJsonString, replaceVariableFunction } from '../helperFunctions';

const runClientSideActions = async (actionLits, state) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { submission, varVault, formschema, viewField } = state;
            let count = 0;
            // here we run a set of actions
            // e.g. get sharepoint list action => to get sharepoint items from sharepoint list and assign to variable
            // e.g. set data value action => to set a field value to variable value
            while (count < actionLits.length) {
                var action = actionLits[count];
                var resData = await callAction(varVault, action, submission, formschema);
                submission = resData.submission;
                varVault = resData.varVault;
                count++;
            }
            resData = await callActionForms(varVault, submission, formschema, viewField)
            resolve({ submission, varVault })
        } catch (err) {
            console.log(err);
            Toast("Something went wrong action execution", "error")
            resolve({ submission, varVault })
        }
    });
}

//Action Lists 
const callAction = (varVault, action, submission, formschema) => {
    return new Promise(async (resolve, reject) => {
        try {

            switch (action.name) {
                case "Call Web Service":
                    varVault = await callWebServices(varVault, action, submission, formschema);
                    break
                case "Collection Operation":
                    varVault = await callCollectionOperation(varVault, action, submission, formschema);
                    break
                case "Get Sharepoint List":
                    varVault = await getSharepointList(varVault, action);
                    break
                case "Set Form Component":
                    var resData = await setFormComponent(varVault, action, submission, formschema);
                    submission = resData.submission;
                    varVault = resData.varVault;
                    break
                case "Query Json":
                    varVault = await queryJson(varVault, action);
                    break
                case "Toast":
                    Toast(action.message, action.color);
                default:
                    console.log("run other actions")
                    break
            }

            //Replace Variable assing in the value <<>>
            if (action && typeof submission.data[action.comp] == 'string') {
                var gv = [], s, gvcount = 0, gvd = {};
                var regex = /\<<([0-9a-zA-Z.-_\/\']+)\>>/gm
                var value = submission.data[action.comp]

                while ((s = regex.exec(value)) !== null) {
                    if (s.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    gv.push(s[0]);
                }

                var stop = gv.length;
                while (gvcount < stop) {
                    var cntdata = gv[gvcount++];
                    var keys = cntdata.replace("<<", "").replace(">>", "");
                    var keysLists = keys.split(".");
                    var variableValue = IsJsonString(varVault[keysLists[0]]) ? JSON.parse(varVault[keysLists[0]]) : varVault[keysLists[0]];

                    if (keysLists.length == 1 && typeof variableValue == "string") {
                        variableValue = value.replaceAll(cntdata, variableValue);
                        submission.data[action.comp] = variableValue;
                    } else if (keysLists.length == 2 && typeof variableValue == "object") {
                        variableValue = value.replaceAll(cntdata, variableValue[keysLists[1]]);
                        submission.data[action.comp] = variableValue;
                    }
                }
            }

            resolve({ submission, varVault, action })
        } catch (err) {
            console.log(err);
            Toast("Something went wrong action execution", "error")
            resolve({ submission, varVault, action })
        }
    })
}

const callWebServices = (varVault, action, submission, formschema) => {
    return new Promise(async (resolve, reject) => {
        try {
            const requestData = {
                ...action,
                submission
            }
            var getData = await flowActions.callEndPoint(requestData);
            varVault[action.variable] = JSON.stringify(getData);
            resolve(varVault)
        } catch (err) {
            resolve(varVault)
        }
    })
}

const callCollectionOperation = (varVault, action, submission, formschema) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = 0;

            //Variable To Orignal Value 
            if ((action.requestType == 2) && action.filters && action.filters != "") {
                let ObjFilter = JSON.parse(action.filters);
                if (ObjFilter.length != 0) {
                    while ((ObjFilter.length - 1) >= count) {
                        ObjFilter[count].value = await replaceVariableFunction(ObjFilter[count].value, varVault, null);
                        ObjFilter[count].field = ObjFilter[count].field == "documentId" ? "_id" : ObjFilter[count].field;
                        count++;
                    }
                }
                action.filters = ObjFilter;
            }

            //Variable To Orignal Value 
            if (action.fetchRecordField && action.fetchRecordValue) {
                action.fetchRecordValue = await replaceVariableFunction(action.fetchRecordValue, varVault, null);
            }


            const requestData = {
                ...action,
                submission
            }
            
            var getDataSharePoint = await flowActions.callCollectionOperation(requestData);
            varVault[action.variable] = JSON.stringify(getDataSharePoint);
            resolve(varVault)
        } catch (err) {
            resolve(varVault)
        }
    })

}

//Call SharePoint API 
const getSharepointList = (varVault, action) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!action.verified) resolve(varVault)
            var getDataSharePoint = await flowActions.getSharepointList(action);
            varVault[action.variable] = JSON.stringify(getDataSharePoint, null, 2);
            resolve(varVault)
        } catch (err) {
            console.log(err);
            Toast("Something went wrong action execution", "error")
            resolve(varVault)
        }
    });
}

//Set Component 
const setFormComponent = (varVault, action, submission, formschema) => {
    return new Promise(async (resolve, reject) => {
        try {

            // assign value to action.componentKey
            var data4assignment = action.type == "variable" ? varVault[action.value] : action.value;
            var type = formschema.components.find(x => x.key == action.comp) ? formschema.components.find(x => x.key == action.comp).type : '';

            //If dataTable 
            if (type == "dataTableCustomComp") {
                submission.data[action.comp] = { rows: typeof data4assignment == 'string' ? JSON.parse(data4assignment) : data4assignment }
            } if (type == "tocCustomComp") {
                const value = { rows: typeof data4assignment == 'string' ? JSON.parse(data4assignment) : data4assignment };
                submission.data[action.comp] = JSON.stringify(value.rows.map(x => ({ _id: x._id, name: x[action.option], formId: x.formId })));
            } else if (type == "select") {
                submission.data[action.comp] = typeof data4assignment == 'string' ? JSON.parse(data4assignment) : data4assignment
            } else {
                submission.data[action.comp] = typeof data4assignment == 'object' ? JSON.stringify(data4assignment, null, 2) : data4assignment;
            }

            resolve({ submission, varVault, action })
        } catch (err) {
            console.log(err);
            Toast("Something went wrong action execution", "error")
            resolve({ submission, varVault, action })
        }
    });
}

//Set Query Json
const queryJson = (varVault, action) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (Object.keys(varVault).length != 0) {
                const JSONData = action.formatType == "2" ? varVault[action.jsonData] : action.jsonData;
                var resdata = (typeof JSONData == 'string') ? JSON.parse(JSONData) : JSONData;
                if (action.query) {
                    var resdata = await flowActions.jpQuery((typeof JSONData == 'string') ? JSON.parse(JSONData) : JSONData, action.query);
                }
                varVault[action.variable] = resdata;
            }
            resolve(varVault)
        } catch (err) {
            console.log(err);
            Toast("Something went wrong action execution", "error")
            resolve(varVault)
        }
    });
}

const replaceVariable = (value, varVault, action) => {
    return new Promise(async (resolve, reject) => {
        try {

        } catch (err) {
            console.log(err);
            Toast("Something went wrong action execution", "error")
            resolve(varVault);
        }
    })
}

// Call Action Forms 
const callActionForms = async (varVault, submission, formschema, viewFields) => {
    try {
        let count = 0, components = viewFields;
        while (count < components.length) {
            let viewField = JSON.parse(components[count].component)
            if (viewField.key == "tocCustomComp" && viewField.toc_source == "Variable") {
                var data4assignment = varVault[viewField.toc_content];
                const value = typeof data4assignment == 'string' ? JSON.parse(data4assignment) : data4assignment
                submission.data[viewField.key] = value
            }
            count++;
        }
        return { submission, varVault }
    } catch (err) {
        return { submission, varVault }
    }
}

export default runClientSideActions