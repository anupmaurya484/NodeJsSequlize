"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = "production";
var server_1 = __importDefault(require("./src/server"));
var express = require("express");
var http = require("http");
var path = require("path");
var port = 3000;
var httpPort = process.env.PORT || port;
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.start = function () {
        var app = express();
        var httpServer = http.createServer(app);
        //Access Fornt-end code
        app.use("/", express.static(path.resolve(__dirname, './public/constantsys')));
        app.use("/worksnap", express.static(path.resolve(__dirname, './public/worksnap')));
        app.use("/myworksnap", express.static(path.resolve(__dirname, './public/myworksnap')));
        app.use("/portfolio", express.static(path.resolve(__dirname, './public/portfolio')));
        app.get('/*', function (req, res, next) { return next(); });

        //Import portfolio
        app.get('/', (req, res, next) => res.sendFile(path.resolve(__dirname, './public/constantsys', 'index.html')));
        app.get('/worksnap', (req, res, next) => res.sendFile(path.resolve(__dirname, './public/worksnap', 'index.html')));
        app.get('/myworksnap', (req, res, next) => res.sendFile(path.resolve(__dirname, './public/myworksnap', 'index.html')));
        app.get('/portfolio', (req, res, next) => res.sendFile(path.resolve(__dirname, './public/portfolio', 'index.html')));

        //listen on provided ports
        httpServer.listen(httpPort);
        //add error handler
        httpServer.on("error", this.onError);
        //start listening on port
        httpServer.on("listening", function () {
            new server_1.default(app);
            var addr = httpServer.address();
            var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
            console.log("Listening on " + bind);
        });
    };
    Main.onError = function (error) {
        if (error.syscall !== "listen") {
            throw error;
        }
        var bind = typeof httpPort === "string"
            ? "Pipe " + httpPort
            : "Port " + httpPort;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
    return Main;
}());
Main.start();
