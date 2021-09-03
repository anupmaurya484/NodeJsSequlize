"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function CountryFactory(sequelize) {
    var country = sequelize.define('country', {
        country_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        country_name: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'country',
        timestamps: false,
        underscored: true,
    });
    country.associate = function (models) {
    };
    return country;
}
exports.default = CountryFactory;
