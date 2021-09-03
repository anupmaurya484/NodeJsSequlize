"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function StateFactory(sequelize) {
    var states = sequelize.define('states', {
        state_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        state_name: sequelize_1.DataTypes.STRING,
        country_id: sequelize_1.DataTypes.INTEGER
    }, {
        tableName: 'states',
        timestamps: false,
        underscored: true,
    });
    states.associate = function (models) {
    };
    return states;
}
exports.default = StateFactory;
