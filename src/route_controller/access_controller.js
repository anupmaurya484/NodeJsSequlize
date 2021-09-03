"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessController = void 0;
var models_1 = __importDefault(require("../models"));
var encryption_controller_1 = require("./encryption_controller");
var authentication_controller_1 = require("./authentication_controller");
var resuable_controller_1 = require("./resuable_controller");
var mail_controller_1 = require("./mail_controller");
var enumeration_controller_1 = require("./enumeration_controller");
var moment_1 = __importDefault(require("moment"));
var jwt = require('jsonwebtoken');
var RC = new resuable_controller_1.ReusableController();
var MC = new mail_controller_1.MailController();
var EC = new enumeration_controller_1.EnumerationController();
var AccessController = /** @class */ (function () {
    function AccessController(router) {
        var _this = this;
        this.createDefaultRole = function (reqBody, organization_id) { return __awaiter(_this, void 0, void 0, function () {
            var role_array, organization_role_data, menu_list_1, menu_permission_data_1, menu_permission_val, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!(reqBody.organization_type == 1)) return [3 /*break*/, 4];
                        role_array = [{
                                role_name: "HR",
                                is_system: 0,
                                organization_id: organization_id,
                                created_by: reqBody.user_id,
                                is_active: 1,
                                is_deleted: 0
                            }, {
                                role_name: "Employee",
                                is_system: 0,
                                organization_id: organization_id,
                                created_by: reqBody.user_id,
                                is_active: 1,
                                is_deleted: 0
                            }];
                        return [4 /*yield*/, models_1.default.organization_roles.bulkCreate(role_array)];
                    case 1:
                        organization_role_data = _a.sent();
                        organization_role_data = JSON.parse(JSON.stringify(organization_role_data));
                        return [4 /*yield*/, models_1.default.menu.findAll({
                                where: { organization_type: reqBody.organization_type }
                            })];
                    case 2:
                        menu_list_1 = _a.sent();
                        menu_permission_data_1 = [];
                        organization_role_data.forEach(function (element) {
                            menu_list_1.forEach(function (ele) {
                                menu_permission_data_1.push({
                                    organization_role_id: element.organization_role_id,
                                    is_active: 1,
                                    menu_id: ele.menu_id,
                                    is_deleted: 0,
                                    created_by: reqBody.user_id
                                });
                            });
                        });
                        return [4 /*yield*/, models_1.default.menu_permission.bulkCreate(menu_permission_data_1)];
                    case 3:
                        menu_permission_val = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, true];
                    case 5:
                        e_1 = _a.sent();
                        return [2 /*return*/, ({ "res": 0, "message": e_1.message })];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.API_V1(router);
    }
    AccessController.prototype.API_V1 = function (router) {
        var _this = this;
        // Login api
        router.post("/api/v1/login", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var user_data, success, message, response, token, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        if (!!req.body.email_address) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide email address." });
                        return [3 /*break*/, 7];
                    case 1:
                        if (!!req.body.password) return [3 /*break*/, 2];
                        res.json({ "res": 0, "message": "Please provide password." });
                        return [3 /*break*/, 7];
                    case 2: return [4 /*yield*/, models_1.default.users.findOne({
                            where: { email_address: req.body.email_address, is_deleted: 0 },
                            include: [{
                                    model: models_1.default.organizations,
                                    required: false,
                                    where: { is_deleted: 0 },
                                    attributes: ["organization_id", "organization_type", "organization_name"]
                                }]
                        })];
                    case 3:
                        user_data = _a.sent();
                        if (!(user_data && encryption_controller_1.EncryptionController.decrypt(user_data.password) == req.body.password)) return [3 /*break*/, 6];
                        user_data = JSON.parse(JSON.stringify(user_data));
                        success = 0, message = "Login successfully.";
                        if (user_data.organization_role_id == 1) {
                            success = 1;
                        }
                        else if (user_data.is_verify == 1) {
                            success = 1;
                        }
                        else {
                            if (user_data.organization_role_id == EC.organization_roles.get("admin").value) {
                                message = "Organization has not been verify. Please verify your organization and login again.";
                            }
                            else {
                                message = "Your Account has not been verify. Please verify your account and login again.";
                            }
                        }
                        response = { "res": 0, "message": message };
                        if (!(success == 1)) return [3 /*break*/, 5];
                        token = jwt.sign({ user_id: user_data.user_id, organization_id: user_data.organization_id, timestamp: Math.floor(Date.now() / 1000) }, 'sec1!p#');
                        return [4 /*yield*/, models_1.default.auth_tokens.create({
                                user_id: user_data.user_id,
                                organization_id: user_data.organization_id,
                                tokens: token
                            })];
                    case 4:
                        _a.sent();
                        response = { "res": 1, "data": user_data, "message": "Login successfully.", "token": token };
                        _a.label = 5;
                    case 5:
                        res.json(response);
                        return [3 /*break*/, 7];
                    case 6:
                        res.json({ "res": 0, "message": "Invalid credentials. Please login again." });
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        res.json({ "res": 0, "message": e_2.message });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        //Registration api
        router.put("/api/v1/registration", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var self_1, organization_exist, user_exist, organization_data, password, user_data, token, ReqData, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        self_1 = this;
                        if (!!req.body.organization_name) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization name" });
                        return [3 /*break*/, 11];
                    case 1:
                        if (!!req.body.email_address) return [3 /*break*/, 2];
                        res.json({ "res": 0, "message": "Please provide organization email address" });
                        return [3 /*break*/, 11];
                    case 2:
                        if (!!req.body.mobile_no) return [3 /*break*/, 3];
                        res.json({ "res": 0, "message": "Please provide organization phone no." });
                        return [3 /*break*/, 11];
                    case 3:
                        if (!!req.body.organization_type) return [3 /*break*/, 4];
                        res.json({ "res": 0, "message": "Please provide organization type information." });
                        return [3 /*break*/, 11];
                    case 4: return [4 /*yield*/, models_1.default.organizations.findOne({
                            where: { email_address: req.body.email_address, is_deleted: 0 },
                            attribures: ["organization_id"]
                        })];
                    case 5:
                        organization_exist = _a.sent();
                        if (organization_exist) {
                            res.json({ "res": 0, "message": "Username/Email address is already exist." });
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, models_1.default.users.findOne({
                                where: { email_address: req.body.email_address, is_deleted: 0 },
                                attribures: ["user_id"]
                            })];
                    case 6:
                        user_exist = _a.sent();
                        if (user_exist) {
                            res.json({ "res": 0, "message": "Username/Email address is already exist." });
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, models_1.default.organizations.create({
                                organization_name: req.body.organization_name,
                                organization_type: req.body.organization_type,
                                address_line1: req.body.address_line1,
                                address_line2: req.body.address_line2,
                                city: req.body.city,
                                state_id: req.body.state_id,
                                country_id: req.body.country_id,
                                zip_code: req.body.zip_code,
                                mobile_no: req.body.mobile_no,
                                email_address: req.body.email_address,
                                is_active: 1,
                                is_deleted: 0,
                                created_by: req.body.user_id,
                                valid_upto: moment_1.default(new Date()).add(1, "years").format("YYYY-MM_DD")
                            })];
                    case 7:
                        organization_data = _a.sent();
                        password = (req.body.password) ? encryption_controller_1.EncryptionController.encrypt(req.body.password) : encryption_controller_1.EncryptionController.encrypt(RC.generateP());
                        user_data = {
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email_address: req.body.email_address,
                            mobile_no: req.body.mobile_no,
                            password: password,
                            username: req.body.username,
                            is_varify: 0,
                            profile_logo: req.body.profile_logo,
                            organization_role_id: EC.organization_roles.get("admin").value,
                            organization_id: organization_data.organization_id,
                            is_deleted: 0,
                            is_verify: 0,
                            created_by: req.body.user_id,
                        };
                        return [4 /*yield*/, models_1.default.users.create(user_data)];
                    case 8:
                        _a.sent();
                        token = jwt.sign({ timestamp: Math.floor(Date.now() / 1000), organization_id: organization_data.organization_id }, 'sec1!p#');
                        ReqData = {
                            templateName: "VerifyAccount",
                            firstname: req.body.first_name,
                            verify_code: token,
                            to_email_address: req.body.email_address
                        };
                        return [4 /*yield*/, self_1.createDefaultRole(req.body, organization_data.organization_id)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, MC.sendEmail(ReqData)];
                    case 10:
                        _a.sent();
                        res.json({ "res": 1, "message": "Company Registration has been done successfully.", "data": token });
                        _a.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        e_3 = _a.sent();
                        res.json({ "res": 0, "message": e_3.message });
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        }); });
        // update organization
        router.post("/api/v1/update-organization", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, e_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!!req.body.organization_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization information." });
                        return [3 /*break*/, 5];
                    case 1:
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        if (!decoded.user_id) return [3 /*break*/, 4];
                        return [4 /*yield*/, models_1.default.organizations.update({
                                organization_name: req.body.organization_name,
                                address_line1: req.body.address_line1,
                                address_line2: req.body.address_line2,
                                city: req.body.city,
                                state_id: req.body.state_id,
                                country_id: req.body.country_id,
                                zipcode: req.body.zipcode,
                                mobile_no: req.body.mobile_no,
                                last_updated_by: decoded.user_id,
                                last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { organization_id: req.body.organization_id }
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, models_1.default.users.update({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                profile_logo: req.body.profile_logo,
                                address_line1: req.body.address_line1,
                                address_line2: req.body.address_line2,
                                city: req.body.city,
                                state_id: req.body.state_id,
                                country_id: req.body.country_id,
                                zipcode: req.body.zipcode,
                                mobile_no: req.body.mobile_no,
                                last_updated_by: decoded.user_id,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { organization_id: req.body.organization_id, organization_role_id: EC.organization_roles.get("admin").value }
                            })];
                    case 3:
                        _b.sent();
                        res.json({ "res": 1, "message": "Oeganization information has been updated successfully." });
                        return [3 /*break*/, 5];
                    case 4:
                        res.json({ "res": 0, "message": "Something went's wrong." });
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_4 = _b.sent();
                        res.json({ "res": 0, "message": e_4.message });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        // Active Deactive company api
        router.post("/api/v1/active-deactive-organization", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!req.body.organization_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization information." });
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, models_1.default.organizations.update({
                            is_active: req.body.is_active,
                            last_updated_by: req.body.user_id,
                            last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                        }, {
                            where: { organization_id: req.body.organization_id }
                        })];
                    case 2:
                        _a.sent();
                        res.json({ "res": 1, "message": "Organization has been active/deactive successfully." });
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_5 = _a.sent();
                        res.json({ "res": 0, "message": e_5.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // Delete company Api
        router.delete("/api/v1/delete-organization/:organization_id", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!!req.params.organization_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide company information." });
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, models_1.default.company.update({
                            is_deleted: 1,
                            last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                        }, {
                            where: { organization_id: req.params.organization_id }
                        })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, models_1.default.users.update({
                                is_deleted: 1,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { organization_id: req.params.organization_id }
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, models_1.default.auth_tokens.update({
                                last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                                is_loggout: 1,
                            }, {
                                where: { organization_id: req.params.organization_id }
                            })];
                    case 4:
                        _a.sent();
                        res.json({ "res": 1, "message": "organization_id has been deleted successfully." });
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_6 = _a.sent();
                        res.json({ "res": 0, "message": e_6.message });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        // logout api
        router.get("/api/v1/logout", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var token, e_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                        return [4 /*yield*/, models_1.default.auth_tokens.update({
                                is_loggout: 1,
                                last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { tokens: token }
                            })];
                    case 1:
                        _b.sent();
                        res.json({ "res": 1, "message": "Logout Successfully." });
                        return [3 /*break*/, 3];
                    case 2:
                        e_7 = _b.sent();
                        res.json({ "res": 0, "message": e_7.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // Get username/password use info
        router.get("/api/v1/get-login-detail", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, user_data, e_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        if (!decoded.user_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_1.default.users.findOne({
                                where: { user_id: decoded.user_id, is_deleted: 0 },
                                attributes: ["user_id", "email_address", "password"]
                            })];
                    case 1:
                        user_data = _b.sent();
                        if (user_data) {
                            user_data.password = encryption_controller_1.EncryptionController.decrypt(user_data.password);
                            res.json({ "res": 1, "data": user_data });
                        }
                        else {
                            res.json({ "res": 0, "message": "user doesn't exist." });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        res.json({ "res": 0, "message": "Something's went worng." });
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_8 = _b.sent();
                        res.json({ "res": 0, "message": e_8.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // update username/password
        router.post("/api/v1/update-login-details", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, password, e_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        if (!decoded.user_id) return [3 /*break*/, 2];
                        password = encryption_controller_1.EncryptionController.encrypt(req.body.password);
                        return [4 /*yield*/, models_1.default.users.update({
                                username: req.body.username,
                                password: password,
                                last_updated_by: decoded.user_id,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { user_id: decoded.user_id }
                            })];
                    case 1:
                        _b.sent();
                        res.json({ "res": 1, "message": "Username/Password has been updated successfully." });
                        return [3 /*break*/, 3];
                    case 2:
                        res.json({ "res": 0, "message": "Something's went worng." });
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_9 = _b.sent();
                        res.json({ "res": 0, "message": e_9.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // get state 
        router.get("/api/v1/state", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var state_data, e_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, models_1.default.states.findAll()];
                    case 1:
                        state_data = _a.sent();
                        res.json({ "res": 1, "data": state_data });
                        return [3 /*break*/, 3];
                    case 2:
                        e_10 = _a.sent();
                        res.json({ "res": 0, "message": e_10.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // get country 
        router.get("/api/v1/country", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var country_data, e_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, models_1.default.country.findAll()];
                    case 1:
                        country_data = _a.sent();
                        res.json({ "res": 1, "data": country_data });
                        return [3 /*break*/, 3];
                    case 2:
                        e_11 = _a.sent();
                        res.json({ "res": 0, "message": e_11.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        //verify Account
        router.post("/api/v1/verify-account", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, verify_info, ReqData, e_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        if (!!req.body.token) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide token for verify account." });
                        return [3 /*break*/, 8];
                    case 1:
                        decoded = jwt.verify(req.body.token, 'sec1!p#');
                        if (!decoded.organization_id) return [3 /*break*/, 7];
                        return [4 /*yield*/, models_1.default.users.findOne({
                                where: { organization_id: decoded.organization_id, is_deleted: 0 },
                                attributes: ["organization_id", "first_name", "email_address", "is_verify"]
                            })];
                    case 2:
                        verify_info = _a.sent();
                        console.table(JSON.parse(JSON.stringify(verify_info)));
                        if (!(verify_info && verify_info.is_verify == 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, models_1.default.users.update({
                                is_verify: 1,
                                last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { organization_id: decoded.organization_id }
                            })];
                    case 3:
                        _a.sent();
                        ReqData = {
                            templateName: "Welcome",
                            firstname: verify_info.first_name,
                            to_email_address: verify_info.email_address
                        };
                        return [4 /*yield*/, MC.sendEmail(ReqData)];
                    case 4:
                        _a.sent();
                        res.json({ "res": 0, "message": "Account has been verify successfully." });
                        return [3 /*break*/, 6];
                    case 5:
                        res.json({ "res": 0, "message": "Account is already verify." });
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        res.json({ "res": 0, "message": "Account is not verify. Please contact to administrator." });
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_12 = _a.sent();
                        res.json({ "res": 0, "message": e_12.message });
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); });
    };
    AccessController.prototype.createDefaultEmployee = function (reqBody, company_id, user_id) {
        return __awaiter(this, void 0, void 0, function () {
            var user_data, username, e_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, models_1.default.users.create({
                                first_name: reqBody.first_name,
                                last_name: reqBody.last_name,
                                email_address: reqBody.email_address,
                                mobile_no: reqBody.mobile_no,
                                password: encryption_controller_1.EncryptionController.encrypt(RC.generateP()),
                                profile_logo: reqBody.profile_logo,
                                user_role_id: 3,
                                company_id: company_id,
                                is_deleted: 0,
                            })];
                    case 1:
                        user_data = _a.sent();
                        username = reqBody.first_name.substring(0, 4) + user_data.user_id + company_id;
                        return [4 /*yield*/, models_1.default.users.update({
                                username: username
                            }, {
                                where: { user_id: user_data.user_id }
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, models_1.default.employees.create({
                                first_name: reqBody.first_name,
                                last_name: reqBody.last_name,
                                email_address: reqBody.email_address,
                                phone_no: reqBody.mobile_no,
                                company_id: company_id,
                                user_id: user_data.user_id,
                                is_active: 1,
                                is_deleted: 0,
                                address: reqBody.address,
                                state_id: reqBody.state_id,
                                country_id: reqBody.country_id,
                                zip_code: reqBody.zip_code,
                                create_by: user_id,
                                role_type: 3
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, ({ "res": 1, "message": "Success" })];
                    case 4:
                        e_13 = _a.sent();
                        return [2 /*return*/, ({ "res": 0, "message": e_13.message })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AccessController;
}());
exports.AccessController = AccessController;
