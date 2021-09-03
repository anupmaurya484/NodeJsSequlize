"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionController = void 0;
var CryptoJS = require("crypto-js");
var key = "dae17#!bf&saw8-5r";
var EncryptionController = /** @class */ (function () {
    function EncryptionController() {
    }
    EncryptionController.encrypt = function (password) {
        var ciphertext = CryptoJS.AES.encrypt(password, key).toString();
        return ciphertext;
    };
    EncryptionController.decrypt = function (password) {
        var bytes = CryptoJS.AES.decrypt(password, key);
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    };
    return EncryptionController;
}());
exports.EncryptionController = EncryptionController;
