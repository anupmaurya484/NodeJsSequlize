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
exports.EmployeeController = void 0;
var models_1 = __importDefault(require("../models"));
var authentication_controller_1 = require("./authentication_controller");
var resuable_controller_1 = require("./resuable_controller");
var encryption_controller_1 = require("./encryption_controller");
var moment_1 = __importDefault(require("moment"));
var jwt = require('jsonwebtoken');
var RC = new resuable_controller_1.ReusableController();
var EmployeeController = /** @class */ (function () {
    function EmployeeController(router) {
        this.API_V1(router);
    }
    EmployeeController.prototype.API_V1 = function (router) {
        var _this = this;
        router.put("/api/v1/AddUpdateEmployees", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, user_data, username, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        if (!!req.body.email_address) return [3 /*break*/, 1];
                        res.json({ "res": 0, "msg": "Please provide email address." });
                        return [3 /*break*/, 9];
                    case 1:
                        if (!!req.body.company_id) return [3 /*break*/, 2];
                        res.json({ "res": 0, "msg": "Please provide company information." });
                        return [3 /*break*/, 9];
                    case 2:
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        if (!!req.body.employee_id) return [3 /*break*/, 6];
                        return [4 /*yield*/, models_1.default.users.create({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                email_address: req.body.email_address,
                                mobile_no: req.body.mobile_no,
                                password: encryption_controller_1.EncryptionController.encrypt(RC.generateP()),
                                profile_logo: req.body.profile_logo,
                                user_role_id: 3,
                                company_id: req.body.company_id,
                                is_deleted: 0,
                            })];
                    case 3:
                        user_data = _b.sent();
                        username = req.body.first_name.substring(0, 4) + user_data.user_id + req.body.company_id;
                        return [4 /*yield*/, models_1.default.users.update({
                                username: username
                            }, {
                                where: { user_id: user_data.user_id }
                            })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, models_1.default.employees.create({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                email_address: req.body.email_address,
                                phone_no: req.body.mobile_no,
                                company_id: req.body.company_id,
                                user_id: user_data.user_id,
                                is_active: 1,
                                is_deleted: 0,
                                address: req.body.address,
                                state_id: req.body.state_id,
                                country_id: req.body.country_id,
                                zip_code: req.body.zip_code,
                                create_by: decoded.user_id,
                                role_type: req.body.role_type
                            })];
                    case 5:
                        _b.sent();
                        res.json({ "res": 1, "message": "Employee has been added successfully." });
                        return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, models_1.default.employees.update({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email_address: req.body.email_address,
                            phone_no: req.body.mobile_no,
                            address: req.body.address,
                            state_id: req.body.state_id,
                            country_id: req.body.country_id,
                            zip_code: req.body.zip_code,
                            last_updated_by: decoded.user_id,
                            last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                            role_type: req.body.role_type
                        }, {
                            where: { user_id: decoded.user_id }
                        })];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, models_1.default.users.update({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                email_address: req.body.email_address,
                                mobile_no: req.body.mobile_no,
                                profile_logo: req.body.profile_logo,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { user_id: decoded.user_id }
                            })];
                    case 8:
                        _b.sent();
                        res.json({ "res": 1, "message": "Employee has been updated successfully." });
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        e_1 = _b.sent();
                        res.json({ "res": 0, "message": e_1.message });
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        }); });
        router.get("/api/v1/GetAllEmployees", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, employee_data, e_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        if (!decoded.company_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, models_1.default.employees.findAll({
                                where: { is_deleted: 0, company_id: decoded.company_id },
                                include: [{
                                        required: true,
                                        model: models_1.default.users,
                                        where: { is_deleted: 0 },
                                        attributes: []
                                    }]
                            })];
                    case 1:
                        employee_data = _b.sent();
                        res.json({ "res": 1, "data": employee_data });
                        return [3 /*break*/, 3];
                    case 2:
                        res.json({ "res": 0, "message": "Something's went wrong." });
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_2 = _b.sent();
                        res.json({ "res": 0, "message": e_2.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        router.delete("/api/v1/DeleteEmployee/:employee_user_id", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, e_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!!req.params.employee_user_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide employee informaion." });
                        return [3 /*break*/, 5];
                    case 1:
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        return [4 /*yield*/, models_1.default.employees.update({
                                is_deleted: 1,
                                last_updated_by: decoded.user_id,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { user_id: req.params.employee_user_id }
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, models_1.default.users.update({
                                is_deleted: 1,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { user_id: req.params.employee_user_id }
                            })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, models_1.default.auth_tokens.update({
                                is_loggout: 1,
                                last_updated_at: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { user_id: req.params.employee_user_id }
                            })];
                    case 4:
                        _b.sent();
                        res.json({ "res": 1, "message": "Employee has been deleted successfully." });
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_3 = _b.sent();
                        res.json({ "res": 0, "message": e_3.message });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    return EmployeeController;
}());
exports.EmployeeController = EmployeeController;
