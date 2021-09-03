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
exports.OrganizationController = void 0;
var models_1 = __importDefault(require("../models"));
var authentication_controller_1 = require("./authentication_controller");
var jwt = require('jsonwebtoken');
var moment_1 = __importDefault(require("moment"));
var OrganizationController = /** @class */ (function () {
    function OrganizationController(router) {
        this.organizationRoles(router);
    }
    OrganizationController.prototype.organizationRoles = function (router) {
        var _this = this;
        // add organization role organization wise
        router.put("/api/v1/add-update-role", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var organization_role_data_1, menu_permission_data_1, menu_permission_val, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        if (!!req.body.organization_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization information." });
                        return [3 /*break*/, 6];
                    case 1:
                        if (!!req.body.role_name) return [3 /*break*/, 2];
                        res.json({ "res": 0, "message": "Please provide role name." });
                        return [3 /*break*/, 6];
                    case 2:
                        if (!!req.body.organization_type) return [3 /*break*/, 3];
                        res.json({ "res": 0, "message": "Please provide organization type." });
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, models_1.default.organization_roles.create({
                            role_name: req.body.role_name,
                            is_system: 0,
                            is_active: 1,
                            organization_id: req.body.organization_id,
                            created_by: req.body.user_id,
                            parent_organization_role_id: req.body.parent_organization_role_id
                        })];
                    case 4:
                        organization_role_data_1 = _a.sent();
                        organization_role_data_1 = JSON.parse(JSON.stringify(organization_role_data_1));
                        menu_permission_data_1 = [];
                        req.body.menu_list.forEach(function (ele) {
                            menu_permission_data_1.push({
                                organization_role_id: organization_role_data_1.organization_role_id,
                                is_active: ele.is_active,
                                menu_id: ele.menu_id,
                                is_deleted: 0,
                                created_by: req.body.user_id
                            });
                        });
                        return [4 /*yield*/, models_1.default.menu_permission.bulkCreate(menu_permission_data_1)];
                    case 5:
                        menu_permission_val = _a.sent();
                        organization_role_data_1["menu_permission"] = menu_permission_val;
                        res.json({ "res": 1, "data": organization_role_data_1, "message": "New role has been created successfully." });
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        res.json({ "res": 0, "message": e_1.message });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        router.delete("/api/v1/delete-role/:organization_role_id", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var decoded, e_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!!req.params.organization_role_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization role information." });
                        return [3 /*break*/, 5];
                    case 1:
                        decoded = jwt.verify((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1], 'sec1!p#');
                        if (!decoded.user_id) return [3 /*break*/, 4];
                        return [4 /*yield*/, models_1.default.organization_roles.update({
                                is_deleted: 1,
                                last_updated_by: decoded.user_id,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { organization_role_id: req.params.organization_role_id }
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, models_1.default.menu_permission.update({
                                is_deleted: 1,
                                last_updated_by: decoded.user_id,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            }, {
                                where: { organization_role_id: req.params.organization_role_id }
                            })];
                    case 3:
                        _b.sent();
                        res.json({ "res": 1, "message": "Organization role has been deleted successfully." });
                        return [3 /*break*/, 5];
                    case 4:
                        res.json({ "res": 0, "message": "Something went's wrong." });
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_2 = _b.sent();
                        res.json({ "res": 0, "message": e_2.message });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        router.post("/api/v1/get-roles/:organization_id", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var limit, offset, organization_role_data, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!req.params.organization_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization information." });
                        return [3 /*break*/, 3];
                    case 1:
                        limit = 10, offset = 0;
                        if (req.body.page_record) {
                            limit = req.body.page_record;
                        }
                        if (req.body.page_no) {
                            offset = (limit * req.body.page_no) - limit;
                        }
                        return [4 /*yield*/, models_1.default.organization_roles.findAndCountAll({
                                where: { organization_id: req.params.organization_id, is_deleted: 0 },
                                include: [{
                                        separate: true,
                                        model: models_1.default.menu_permission,
                                        include: [{
                                                required: true,
                                                model: models_1.default.menu,
                                            }],
                                        offset: 0
                                    }],
                                limit: limit,
                                offset: offset
                            })];
                    case 2:
                        organization_role_data = _a.sent();
                        organization_role_data = JSON.parse(JSON.stringify(organization_role_data));
                        res.json({ "res": 1, "data": organization_role_data });
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        res.json({ "res": 0, "message": e_3.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        router.post("/api/v1/update-menu-permission", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var menu_permission_array_1, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!req.body.user_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide user information." });
                        return [3 /*break*/, 3];
                    case 1:
                        menu_permission_array_1 = [];
                        req.body.menu_permission.forEach(function (element) {
                            menu_permission_array_1.push({
                                is_active: element.is_active,
                                menu_permission_id: element.menu_permission_id,
                                last_updated_by: req.body.user_id,
                                last_updated_date: moment_1.default(new Date()).format("YYYY-MM-DD HH:mm:ss")
                            });
                        });
                        return [4 /*yield*/, models_1.default.menu_permission.bulkCreate(menu_permission_array_1, {
                                updateOnDuplicate: ["menu_permission_id", "is_active", "last_updated_by", "last_updated_date"]
                            })];
                    case 2:
                        _a.sent();
                        res.json({ "res": 1, "message": "Menu permission has been updated successully." });
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        res.json({ "res": 0, "message": e_4.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        router.get("/api/v1/get-menu-list/:organization_type", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var menu_list, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!req.params.organization_type) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization type." });
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, models_1.default.menu.findAll({
                            where: { organization_type: req.params.organization_type }
                        })];
                    case 2:
                        menu_list = _a.sent();
                        res.json({ "res": 1, "data": menu_list });
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
        router.get("/api/v1/get-role-list/:organization_id", authentication_controller_1.AuthenticationController.Authenticate, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var data, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!req.params.organization_id) return [3 /*break*/, 1];
                        res.json({ "res": 0, "message": "Please provide organization information." });
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, models_1.default.organization_roles.findAll({
                            where: { organization_id: req.params.organization_id, is_deleted: 0 },
                            attributes: ["organization_role_id", "role_name"]
                        })];
                    case 2:
                        data = _a.sent();
                        res.json({ "res": 1, "data": data });
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_6 = _a.sent();
                        res.json({ "res": 0, "message": e_6.message });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    return OrganizationController;
}());
exports.OrganizationController = OrganizationController;
