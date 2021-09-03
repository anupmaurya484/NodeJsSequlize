import axios from 'axios';
import { showLoader, GetTenantName } from './helperFunctions';
import { decode, encode } from './crypto';
import API from '../config';
var config = { headers: { "Authorization": "Basic ZGVtb2NsaWVudDpkZW1vY2xpZW50c2VjcmV0", "tenant": GetTenantName() } };

var setAuthToken = () => {
  if (localStorage.access_token) {
    config.headers.Authorization = "Bearer " + decode(localStorage.access_token);
  }
}

var resetAuthToken = () => {
  config.headers.Authorization = "Basic ZGVtb2NsaWVudDpkZW1vY2xpZW50c2VjcmV0";
}

var axiosservice = (method, url, paylaod) => {
  console.log(config);
  url = API.BASE_API_URL + url;
  console.log(`call axios ${method} ` + url);
  console.log(paylaod);

  if ((paylaod && paylaod.IsNotLoader == undefined) || method=='GET') {
    showLoader(1)
  }

  return new Promise((resolve, rejects) => {
    switch (method) {
      case 'POST':
        axios.post(url, paylaod, config).then((res) => {
          //console.log(res.data);
          resolve(authorization(res.data));
        }).catch(err => {
          showLoader(0);
          //unauthorization();
        })
        break;
      case 'GET':
        axios.get(url, config).then(res => {
          resolve(authorization(res.data))
        }).catch(err => {
          console.log(err);
          showLoader(0);
        });
        break;
      case 'PUT':
        axios.put(url, paylaod, config).then(res => {
          resolve(authorization(res.data))
        }).catch(err => {
          showLoader(0)
        });
        break;
      case 'PATCH':
        axios.patch(url, paylaod, config).then(res => {
          resolve(authorization(res.data))
        }).catch(err => {
          showLoader(0)
        });
        break;
      case 'DELETE':
        axios.delete(url, config).then(res => {
          resolve(authorization(res.data))
        }).catch(err => {
          showLoader(0);
        });
        break;
      default:
        break;
    }
  });
}

var authorization = (res) => {
  if (res && res.status && res.status == 403) {
    unauthorization();
  }
  showLoader(0)
  return (res);
}

var unauthorization = () => {
  var paylaod = {
    access_token: decode(localStorage.access_token),
    refresh_token: decode(localStorage.refresh_token)
  }
  return new Promise((resolve, reject) => {
    var configRefersh = { timeout: 10000, headers: { "Authorization": "Basic ZGVtb2NsaWVudDpkZW1vY2xpZW50c2VjcmV0", "Content-Type": "application/json" } };
    axios.post("/api/refreshtoken", paylaod, configRefersh).then((res) => {
      console.log(res.data.data);
      var data = res.data.data
      localStorage.access_token = encode(data.access_token);
      localStorage.refresh_token = encode(data.refresh_token);
      window.location.reload();
      resolve(true)
    }).catch(err => {
      localStorage.clear();
      setAuthToken();
      window.location = '/';
      resolve(true)
    });
  });
}



export default {
  headers: config,
  setAuthToken: setAuthToken,
  resetAuthToken: resetAuthToken,
  apis: axiosservice
}


