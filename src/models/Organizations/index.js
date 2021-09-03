"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function OrganizationFactory(sequelize) {
    var organizations = sequelize.define('organizations', {
        organization_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        organization_name: sequelize_1.DataTypes.STRING,
        organization_type: sequelize_1.DataTypes.INTEGER,
        address_line1: sequelize_1.DataTypes.STRING,
        address_line2: sequelize_1.DataTypes.STRING,
        city: sequelize_1.DataTypes.STRING,
        state_id: sequelize_1.DataTypes.INTEGER,
        country_id: sequelize_1.DataTypes.INTEGER,
        zipcode: sequelize_1.DataTypes.INTEGER,
        mobile_no: sequelize_1.DataTypes.INTEGER,
        email_address: sequelize_1.DataTypes.STRING,
        is_active: sequelize_1.DataTypes.INTEGER,
        is_deleted: sequelize_1.DataTypes.INTEGER,
        created_date: sequelize_1.DataTypes.DATE,
        created_by: sequelize_1.DataTypes.INTEGER,
        last_updated_at: sequelize_1.DataTypes.DATE,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        valid_upto: sequelize_1.DataTypes.DATE,
    }, {
        tableName: 'organizations',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['created_date', 'created_by', 'last_updated_at', 'last_updated_by', 'is_deleted'] },
        }
    });
    organizations.associate = function (models) {
        organizations.belongsTo(models.users, {
            foreignKey: 'organization_id',
            targetKey: 'organization_id'
        });
    };
    return organizations;
}
exports.default = OrganizationFactory;
