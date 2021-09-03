"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function USerRolesFactory(sequelize) {
    var user_roles = sequelize.define('user_roles', {
        user_role_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        role_name: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'user_roles',
        timestamps: false,
        underscored: true,
    });
    user_roles.associate = function (models) {
    };
    return user_roles;
}
exports.default = USerRolesFactory;
