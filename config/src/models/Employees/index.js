"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function EmployeesFactory(sequelize) {
    var employees = sequelize.define('employees', {
        employee_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        first_name: sequelize_1.DataTypes.STRING,
        last_name: sequelize_1.DataTypes.STRING,
        email_address: sequelize_1.DataTypes.STRING,
        user_id: sequelize_1.DataTypes.INTEGER,
        company_id: sequelize_1.DataTypes.INTEGER,
        phone_no: sequelize_1.DataTypes.STRING,
        is_active: sequelize_1.DataTypes.INTEGER,
        is_deleted: sequelize_1.DataTypes.INTEGER,
        address: sequelize_1.DataTypes.STRING,
        state_id: sequelize_1.DataTypes.INTEGER,
        country_id: sequelize_1.DataTypes.INTEGER,
        zip_code: sequelize_1.DataTypes.INTEGER,
        create_by: sequelize_1.DataTypes.INTEGER,
        create_date: sequelize_1.DataTypes.DATE,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        last_updated_date: sequelize_1.DataTypes.DATE,
        role_type: sequelize_1.DataTypes.INTEGER
    }, {
        tableName: 'employees',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['create_by', 'create_date', 'last_updated_by', 'last_updated_date', 'is_deleted'] },
        }
    });
    employees.associate = function (models) {
        employees.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'user_id'
        });
    };
    return employees;
}
exports.default = EmployeesFactory;
