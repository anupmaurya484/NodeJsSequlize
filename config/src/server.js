"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __importStar(require("express"));
var bodyParser = __importStar(require("body-parser"));
var morgan_1 = __importDefault(require("morgan"));
var errorhandler_1 = __importDefault(require("errorhandler"));
// Import Controllers
var access_controller_1 = require("./route_controller/access_controller");
var encryption_controller_1 = require("./route_controller/encryption_controller");
var authentication_controller_1 = require("./route_controller/authentication_controller");
var dashboard_controller_1 = require("./route_controller/dashboard_controller");
var employee_controller_1 = require("./route_controller/employee_controller");
var resuable_controller_1 = require("./route_controller/resuable_controller");
var mail_controller_1 = require("./route_controller/mail_controller");
var enumeration_controller_1 = require("./route_controller/enumeration_controller");
var organization_controller_1 = require("./route_controller/organization_controller");
var project_controller_1 = require("./route_controller/project_controller");
var Server = /** @class */ (function () {
    function Server(app) {
        this.router = express.Router();
        //create expressjs application
        this.app = app;
        //User App router in the app
        this.app.use("/rest/api/v1", this.router);
        //configure application
        this.config();
        //add api For Rest API
        this.api();
    }
    Server.prototype.api = function () {
        var _this = this;
        this.app.use("/rest/", function (req, res, next) {
            _this.app.use("/rest", _this.router);
            _this.app.get("/rest/api", function (req, res) { return res.send("Server start....."); });
            new access_controller_1.AccessController(_this.router);
            new encryption_controller_1.EncryptionController();
            new authentication_controller_1.AuthenticationController();
            new dashboard_controller_1.DashboardController(_this.router);
            new employee_controller_1.EmployeeController(_this.router);
            new resuable_controller_1.ReusableController();
            new mail_controller_1.MailController();
            new enumeration_controller_1.EnumerationController();
            new organization_controller_1.OrganizationController(_this.router);
            new project_controller_1.ProjectController(_this.router);
            next();
        });
    };
    /**
   * Configure application
   *
   * @class Server
   * @method config
   */
    Server.prototype.config = function () {
        var self = this;
        //mount logger
        this.app.use(morgan_1.default("dev"));
        //mount json form parser    
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,crossdomain,withcredentials,Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin");
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            next();
        });
        // Authenticate user with supplied bearer token Over
        //mount query string parser
        this.app.use(bodyParser.urlencoded({ extended: true }));
        // catch 404 and forward to error handler
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        //error handling
        this.app.use(errorhandler_1.default());
    };
    return Server;
}());
exports.default = Server;
