import axios from './axiosService';
import jp from 'jsonpath';

const parseVariable = (str, data) => {
    var varNames = str.match(/(?<=\<\<).+?(?=\>\>)/g);
    console.log(varNames)
    varNames && varNames.map((varName, i) => {
        var regex = new RegExp("\<\<" + varName + "\>\>");
        str = str.replace(regex, data[varName]);
    })
    return str
}

var getSharepointList = (action) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (action.verified) {
                var reqData = {
                    url: action.url,
                    method: 'GET',
                    connId: action.connId,
                    dataSrcType: action.type,
                    tenant: action.tenant
                }
                axios.apis('POST', `/api/webrequest`, reqData)
                    .then(res => {
                        resolve(res)
                    }).catch(e => {
                        console.error(e)
                        reject(e)
                    })
            }
        } catch (err) {
            console.log(err.message);
            reject(err)
        }
    });
}

const callEndPoint = (action) => {
    return new Promise(async (resolve, reject) => {
        try {
            var reqData = {
                action,
                tenant: action.tenant
            }
            axios.apis('POST', `/api/callEndPoint`, reqData)
                .then(res => {
                    if (res.status) {
                        resolve(res)
                    } else {
                        reject(null)
                    }
                }).catch(e => {
                    reject(null)
                })
        } catch (err) {
            console.log(err.message);
            reject(err)
        }
    });
}

const callCollectionOperation = (action) => {
    return new Promise(async (resolve, reject) => {
        try {
            axios.apis('POST', `/api/callCollectionOperation`, action)
                .then(res => {
                    resolve(res)
                }).catch(e => {
                    console.error(e)
                    reject(e)
                });
        } catch (err) {
            console.log(err.message);
            reject(err)
        }
    });
}

var jpQuery = (obj, pathExp, count) => {
    if (typeof obj !== 'object' || obj === null) return null
    return count ? jp.query(obj, pathExp, count) : jp.query(obj, pathExp);
}

export default {
    parseVariable,
    getSharepointList,
    callCollectionOperation,
    callEndPoint,
    jpQuery
}

