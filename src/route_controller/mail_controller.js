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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
var nodemailer = __importStar(require("nodemailer"));
var smtpTransport = require("nodemailer-smtp-transport");
var path = require('path');
var fs = require('fs');
var config = require('../config/keys');
var MailController = /** @class */ (function () {
    function MailController() {
    }
    MailController.prototype.sendEmail = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var self, mailOptions, TemplatePayload, _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        self = this;
                        mailOptions = {
                            from: "dinkykapadia50@gmail.com",
                            to: payload.to_email_address,
                            // subject: payload.emailSubject, // Subject line
                            html: null,
                            host: payload.host ? payload.host : "portal"
                        };
                        TemplatePayload = {
                            recipient_email: payload.to_email_address
                        };
                        if (payload.templateName) {
                            TemplatePayload = {
                                filename: payload.templateName + ".html",
                                recipient_name: payload.firstname,
                                recipient_email: payload.to_email_address
                            };
                        }
                        _a = payload.templateName;
                        switch (_a) {
                            case "VerifyAccount": return [3 /*break*/, 1];
                            case "Welcome": return [3 /*break*/, 3];
                            case "ForgetPassword": return [3 /*break*/, 5];
                            case "NewTenantRequest": return [3 /*break*/, 7];
                            case "TenantAccountApproved": return [3 /*break*/, 9];
                            case "AddNewUsers": return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1:
                        TemplatePayload["link"] = config.redirectDomain + "/login?verifycode=" + payload.verify_code;
                        mailOptions.subject = "Wokrsnap Email verification";
                        _b = mailOptions;
                        return [4 /*yield*/, self.GetEmailTemplete(TemplatePayload)];
                    case 2:
                        _b.html = _h.sent();
                        return [3 /*break*/, 14];
                    case 3:
                        mailOptions.subject = "Worksnap Welcome";
                        TemplatePayload["link"] = config.redirectDomain;
                        _c = mailOptions;
                        return [4 /*yield*/, self.GetEmailTemplete(TemplatePayload)];
                    case 4:
                        _c.html = _h.sent();
                        return [3 /*break*/, 14];
                    case 5:
                        TemplatePayload["link"] = payload.link;
                        mailOptions.subject = "Worksnap Account Password Reset!";
                        _d = mailOptions;
                        return [4 /*yield*/, self.GetEmailTemplete(TemplatePayload)];
                    case 6:
                        _d.html = _h.sent();
                        return [3 /*break*/, 14];
                    case 7:
                        TemplatePayload["link"] = config.redirectDomain + "/login";
                        TemplatePayload["Username"] = payload.TenantUsername;
                        TemplatePayload["CompanyName"] = payload.TenantCompanyName;
                        mailOptions.subject = "New Tenant Request";
                        _e = mailOptions;
                        return [4 /*yield*/, self.GetEmailTemplete(TemplatePayload)];
                    case 8:
                        _e.html = _h.sent();
                        return [3 /*break*/, 14];
                    case 9:
                        TemplatePayload["link"] = payload.link;
                        TemplatePayload["CompanyName"] = payload.CompanyName;
                        TemplatePayload["CompanyEmail"] = payload.CompanyEmail;
                        TemplatePayload["DomainUrl"] = payload.DomainUrl;
                        mailOptions.subject = "Approve Tenant Request";
                        _f = mailOptions;
                        return [4 /*yield*/, self.GetEmailTemplete(TemplatePayload)];
                    case 10:
                        _f.html = _h.sent();
                        return [3 /*break*/, 14];
                    case 11:
                        TemplatePayload["link"] = payload.link;
                        TemplatePayload["CompanyName"] = payload.CompanyName;
                        TemplatePayload["CompanyEmail"] = payload.CompanyEmail;
                        mailOptions.subject = "Welcome To " + payload.CompanyName;
                        _g = mailOptions;
                        return [4 /*yield*/, self.GetEmailTemplete(TemplatePayload)];
                    case 12:
                        _g.html = _h.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        mailOptions.html = payload.emailBody;
                        return [3 /*break*/, 14];
                    case 14:
                        if (!mailOptions.html) return [3 /*break*/, 16];
                        return [4 /*yield*/, self.nodemailersendMail(mailOptions)];
                    case 15:
                        _h.sent();
                        return [2 /*return*/, true];
                    case 16: return [2 /*return*/, false];
                }
            });
        });
    };
    MailController.prototype.GetEmailTemplete = function (reqData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        fs.readFile(path.resolve(__dirname, '..', 'assets/email_templates', reqData.filename), 'utf8', function (err, data) {
                            if (err)
                                resolve(false);
                            var htmlBody = data, gv = [], regex = /\$([0-9a-zA-Z-_\/\']+)\$/gm, s;
                            while ((s = regex.exec(htmlBody)) !== null) {
                                if (s.index === regex.lastIndex) {
                                    regex.lastIndex++;
                                }
                                gv.push(s[0]);
                            }
                            gv.forEach(function (element) {
                                switch (element) {
                                    case "$recipient_name$":
                                        htmlBody = htmlBody.replace(element, reqData.recipient_name);
                                        break;
                                    case "$link$":
                                        htmlBody = htmlBody.replace(element, reqData.link);
                                        break;
                                    case "$Username$":
                                        htmlBody = htmlBody.replace(element, reqData.Username);
                                        break;
                                    case "$CompanyName$":
                                        htmlBody = htmlBody.replace(element, reqData.CompanyName);
                                        break;
                                    case "$CompanyEmail$":
                                        htmlBody = htmlBody.replace(element, reqData.CompanyEmail);
                                        break;
                                    case "$DomainUrl$":
                                        htmlBody = htmlBody.replace(element, reqData.DomainUrl);
                                        break;
                                }
                            });
                            resolve(htmlBody);
                        });
                    })];
            });
        });
    };
    MailController.prototype.nodemailersendMail = function (mailOptions) {
        return new Promise(function (resolve, reject) {
            var Transport = nodemailer.createTransport(smtpTransport({
                // service: 'smtp',
                // host: 'email-smtp.us-east-2.amazonaws.com',
                // port: 587,
                // secureConnection: true,
                // auth: {
                //   user: 'AKIAQG3LYNZBB7UUJG4N',
                //   pass: 'BIWhstIHkp9NbK8DozXZWcbjNh2fJ35qmKsqIK6jejBw'
                // }
                service: "gmail",
                auth: {
                    user: 'dinkykapadia50@gmail.com',
                    pass: 'dinkyk@19'
                }
            }));
            Transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("Email Failed..." + error.message);
                    resolve(false);
                }
                else {
                    console.log("Email Send...");
                    resolve(true);
                }
            });
        });
    };
    return MailController;
}());
exports.MailController = MailController;
