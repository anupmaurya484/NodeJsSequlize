"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumerationController = void 0;
var Enum = require('enum');
var EnumerationController = /** @class */ (function () {
    function EnumerationController() {
        this.organization_roles = new Enum({
            "superadmin": 1,
            "admin": 2
        });
    }
    return EnumerationController;
}());
exports.EnumerationController = EnumerationController;
