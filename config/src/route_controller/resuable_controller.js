"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReusableController = void 0;
var ReusableController = /** @class */ (function () {
    function ReusableController() {
    }
    ReusableController.prototype.generateP = function () {
        var pass = '';
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';
        for (var i = 1; i <= 8; i++) {
            var char = Math.floor(Math.random()
                * str.length + 1);
            pass += str.charAt(char);
        }
        return pass;
    };
    return ReusableController;
}());
exports.ReusableController = ReusableController;
