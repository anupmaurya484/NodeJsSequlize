"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function MenuFactory(sequelize) {
    var menu = sequelize.define('menu', {
        menu_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        menu_name: sequelize_1.DataTypes.STRING,
        organization_type: sequelize_1.DataTypes.INTEGER
    }, {
        tableName: 'menu',
        timestamps: false,
        underscored: true,
    });
    menu.associate = function (models) {
    };
    return menu;
}
exports.default = MenuFactory;
