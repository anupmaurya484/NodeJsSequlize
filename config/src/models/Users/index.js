"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function UserFactory(sequelize) {
    var users = sequelize.define('users', {
        user_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        first_name: sequelize_1.DataTypes.STRING,
        last_name: sequelize_1.DataTypes.STRING,
        username: sequelize_1.DataTypes.STRING,
        password: sequelize_1.DataTypes.TEXT,
        email_address: sequelize_1.DataTypes.STRING,
        organization_id: sequelize_1.DataTypes.INTEGER,
        mobile_no: sequelize_1.DataTypes.STRING,
        parent_user_id: sequelize_1.DataTypes.INTEGER,
        is_verify: sequelize_1.DataTypes.INTEGER,
        is_deleted: sequelize_1.DataTypes.INTEGER,
        profile_logo: sequelize_1.DataTypes.STRING,
        address_line1: sequelize_1.DataTypes.STRING,
        address_line2: sequelize_1.DataTypes.STRING,
        city: sequelize_1.DataTypes.STRING,
        state_id: sequelize_1.DataTypes.INTEGER,
        country_id: sequelize_1.DataTypes.INTEGER,
        zipcode: sequelize_1.DataTypes.STRING,
        organization_role_id: sequelize_1.DataTypes.INTEGER,
        created_by: sequelize_1.DataTypes.INTEGER,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        created_date: sequelize_1.DataTypes.DATE,
        last_updated_date: sequelize_1.DataTypes.DATE,
    }, {
        tableName: 'users',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['created_by', 'created_date', 'last_updated_date', 'is_deleted', 'last_updated_by'] },
        }
    });
    users.associate = function (models) {
        users.belongsTo(models.organizations, {
            foreignKey: 'organization_id',
            targetKey: 'organization_id'
        });
    };
    return users;
}
exports.default = UserFactory;
