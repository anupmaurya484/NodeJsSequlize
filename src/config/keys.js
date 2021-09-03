"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {};
if (process.env.NODE_ENV == "local") {
    config = {
        redirectDomain: "http:/localhost:8082"
    };
}
else {
    config = {
        redirectDomain: "http:/localhost:8082"
    };
}
module.exports = config;
