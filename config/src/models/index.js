"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Users_1 = __importDefault(require("./Users"));
var OrgnationzationRoles_1 = __importDefault(require("./OrgnationzationRoles"));
var AuthTokens_1 = __importDefault(require("./AuthTokens"));
var Organizations_1 = __importDefault(require("./Organizations"));
var ProjectAssign_1 = __importDefault(require("./ProjectAssign"));
var Project_1 = __importDefault(require("./Project"));
var Menu_1 = __importDefault(require("./Menu"));
var MenuPermission_1 = __importDefault(require("./MenuPermission"));
var Country_1 = __importDefault(require("./Country"));
var State_1 = __importDefault(require("./State"));
var sequelize_1 = require("sequelize");
var SequelizeConfig = /** @class */ (function () {
    function SequelizeConfig() {
        var that = this;
        var sql = {
            host: "localhost",
            database: 'worksnap',
            username: 'root',
            password: '',
            dialect: 'mysql',
            logging: console.log,
            timezone: '+05:30'
        };
        if (process.env.NODE_ENV == "local") {
            console.log("Local DB Server Structure Model");
        } else if (process.env.NODE_ENV == "development") {
            console.log("Developing DB Server Structure Model");
            sql = {
                // host: "worksnap.c1bkh0kpsr0y.us-east-1.rds.amazonaws.com/",
                host: "database-1.caizot31jlws.us-east-2.rds.amazonaws.com",
                database: 'worksnap',
                username: 'admin',
                password: 'dinky1996',
                dialect: 'mysql',
                logging: console.log,
                timezone: '+05:30'
            };
        } else {
            console.log("Production DB Server Structure Model");
            sql = {
                host: "localhost",
                database: 'worksnap',
                username: 'constantsys',
                password: '!!!@@@###constantsys',
                dialect: 'mysql',
                logging: console.log,
                timezone: '+05:30'
            };
        }

        console.log(sql);

        var sequelize = new sequelize_1.Sequelize(sql.database, sql.username, sql.password, sql);
        this.db = {
            sequelize: sequelize,
            Sequelize: sequelize_1.Sequelize,
            users: Users_1.default(sequelize),
            organization_roles: OrgnationzationRoles_1.default(sequelize),
            auth_tokens: AuthTokens_1.default(sequelize),
            organizations: Organizations_1.default(sequelize),
            project_assign: ProjectAssign_1.default(sequelize),
            project: Project_1.default(sequelize),
            menu: Menu_1.default(sequelize),
            menu_permission: MenuPermission_1.default(sequelize),
            country: Country_1.default(sequelize),
            states: State_1.default(sequelize),
        };
        Object.keys(that.db).forEach(function (model) {
            if ('associate' in that.db[model]) {
                that.db[model].associate(that.db);
            }
        });
    }
    return SequelizeConfig;
}());
exports.default = new SequelizeConfig().db;
