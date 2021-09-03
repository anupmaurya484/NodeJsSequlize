const HOSTNAME = window.location.hostname;
const PORT =  window.location.port;
export default {

    BASE_URL: `http://${HOSTNAME}:3000`,
    TENANT_BASE_URL: `http://<<tenant>>.${HOSTNAME}:${PORT}`,
    API_URL: `http://${HOSTNAME}:5000/api`,
    BASE_API_URL: `http://${HOSTNAME}:5000`,
    AUTH_URL: `http://${HOSTNAME}:3000/public/auth`,
    PORTAL_URL: `http://localhost:3000`,
    STUDIO_URL: `http://<<tenant>>.localhost:3003`,
    EXTERNAL_API_URL: "",

    apiUrl: "http://localhost:3000",
    authUrl: "http://localhost:3000/public/auth",

    TYPE_GRIDFS: "gridfs",
    TYPE_GDRIVE: "gdrive",
    TYPE_ONEDRIVE: "onedrive",
    TYPE_SHAREPOINT: "sharepoint",
    TYPE_NINTEX: "nintex",
    storageTypes: {
        "gridfs": "GridFS",
        "gdrive": "Google Drive",
        "onedrive": "One Drive",
        "sharepoint": "SharePoint",
    },

    systemMongoURI: 'mongodb+srv://flowngin:fl0wng1n@cluster0.owm0t.mongodb.net/<<TenantDomain>>?retryWrites=true&w=majority',
    googleRedirectUri: "http://localhost:3000/public/auth",
    googleApiKey: "AIzaSyAnOYVffZaaLrR8QMG9mEBjkwOy3NSTCEE",
    googleClientId: "524338847764-lsh59d2k7c6sqcgfd2rp5uv68a3a6k7i.apps.googleusercontent.com",
    googleScopes: 'profile email https://www.googleapis.com/auth/drive',
    googleDiscoveryOptions: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

    microsoftClientId: "8098b559-7719-4165-aace-1a6fc3598565",
    microsoftRedirectUri: "http://localhost:3000/public/auth",
    microsoftScopes: "user.read files.readwrite offline_access",
    microsoftLoginScopes: "user.read",
    sharepointScopes: "https://graph.microsoft.com/.default offline_access",
}