"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function OrganizationRolesFactory(sequelize) {
    var organization_roles = sequelize.define('organization_roles', {
        organization_role_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        role_name: sequelize_1.DataTypes.STRING,
        is_system: sequelize_1.DataTypes.INTEGER,
        parent_organization_role_id: sequelize_1.DataTypes.INTEGER,
        is_active: sequelize_1.DataTypes.INTEGER,
        organization_id: sequelize_1.DataTypes.INTEGER,
        created_by: sequelize_1.DataTypes.INTEGER,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        created_date: sequelize_1.DataTypes.DATE,
        last_updated_date: sequelize_1.DataTypes.DATE,
        is_deleted: sequelize_1.DataTypes.INTEGER,
    }, {
        tableName: 'organization_roles',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['created_by', 'created_date', 'last_updated_date', 'last_updated_by'] },
        }
    });
    organization_roles.associate = function (models) {
        organization_roles.hasMany(models.menu_permission, {
            foreignKey: 'organization_role_id',
            targetKey: 'organization_role_id'
        });
    };
    return organization_roles;
}
exports.default = OrganizationRolesFactory;
