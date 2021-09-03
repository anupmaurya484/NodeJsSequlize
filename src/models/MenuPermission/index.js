"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function MenuPermissionFactory(sequelize) {
    var menu_permission = sequelize.define('menu_permission', {
        menu_permission_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        menu_id: sequelize_1.DataTypes.INTEGER,
        organization_role_id: sequelize_1.DataTypes.INTEGER,
        is_active: sequelize_1.DataTypes.INTEGER,
        is_deleted: sequelize_1.DataTypes.INTEGER,
        created_by: sequelize_1.DataTypes.INTEGER,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        created_date: sequelize_1.DataTypes.DATE,
        last_updated_date: sequelize_1.DataTypes.DATE,
    }, {
        tableName: 'menu_permission',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['created_by', 'created_date', 'last_updated_date', 'last_updated_by'] },
        }
    });
    menu_permission.associate = function (models) {
        menu_permission.belongsTo(models.menu, {
            foreignKey: 'menu_id',
            targetKey: 'menu_id'
        });
    };
    return menu_permission;
}
exports.default = MenuPermissionFactory;
