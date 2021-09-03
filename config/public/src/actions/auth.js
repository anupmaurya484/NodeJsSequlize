import { GetTenantName } from '../utils/helperFunctions';
import { decode } from '../utils/crypto';

var request_headers = { headers: { "Authorization": "Basic ZGVtb2NsaWVudDpkZW1vY2xpZW50c2VjcmV0", "Tenant": GetTenantName() } };

const auth = {
  headers: request_headers,
  setAuthToken() {
    if (localStorage.access_token) {
      request_headers.headers.Authorization = "Bearer " + decode(localStorage.access_token);
    }
  },
  resetAuthToken() {
    request_headers.headers.Authorization = "Basic ZGVtb2NsaWVudDpkZW1vY2xpZW50c2VjcmV0"
  }
}

export default auth