const HOSTNAME = window.location.hostname;

export default {
    BASE_URL: `https://${HOSTNAME}`, //'http://ec2co-ecsel-1jec5qw27ib3j-1470569080.ap-southeast-1.elb.amazonaws.com',
    TENANT_BASE_URL: `http://<<tenant>>.${HOSTNAME}`,
    API_URL: `https://${HOSTNAME}/api`, //'http://ec2co-ecsel-1jec5qw27ib3j-1470569080.ap-southeast-1.elb.amazonaws.com/api',
    BASE_API_URL: `https://${HOSTNAME}`,  //"http://ec2co-ecsel-1jec5qw27ib3j-1470569080.ap-southeast-1.elb.amazonaws.com",
    AUTH_URL: `https://${HOSTNAME}/public/auth`,
    PORTAL_URL: `https://portal.flowngin.com`,
    STUDIO_URL: `https://<<tenant>>.flowngin.dev`,

    apiUrl: "https://portal.flowngin.com",
    authUrl: "https://portal.flowngin.com/public/auth",

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
    googleRedirectUri: "https://portal.flowngin.com/public/auth",
    googleApiKey: "AIzaSyAnOYVffZaaLrR8QMG9mEBjkwOy3NSTCEE",
    googleClientId: "524338847764-lsh59d2k7c6sqcgfd2rp5uv68a3a6k7i.apps.googleusercontent.com",
    googleScopes: 'profile email https://www.googleapis.com/auth/drive',
    googleDiscoveryOptions: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

    microsoftClientId: "8098b559-7719-4165-aace-1a6fc3598565",
    microsoftRedirectUri: "https://portal.flowngin.com/public/auth",
    microsoftScopes: "user.read files.readwrite offline_access",
    microsoftLoginScopes: "user.read",
    sharepointScopes: "https://graph.microsoft.com/.default offline_access",
}