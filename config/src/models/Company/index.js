"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function CompanyFactory(sequelize) {
    var company = sequelize.define('company', {
        company_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        company_name: sequelize_1.DataTypes.STRING,
        company_email: sequelize_1.DataTypes.STRING,
        company_phone: sequelize_1.DataTypes.STRING,
        is_active: sequelize_1.DataTypes.INTEGER,
        is_deleted: sequelize_1.DataTypes.INTEGER,
        create_at: sequelize_1.DataTypes.DATE,
        create_by: sequelize_1.DataTypes.INTEGER,
        last_updated_at: sequelize_1.DataTypes.DATE,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        valid_upto: sequelize_1.DataTypes.DATE,
        address: sequelize_1.DataTypes.STRING,
        state_id: sequelize_1.DataTypes.INTEGER,
        country_id: sequelize_1.DataTypes.INTEGER,
        zip_code: sequelize_1.DataTypes.INTEGER,
    }, {
        tableName: 'company',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['create_at', 'create_by', 'last_updated_at', 'last_updated_by', 'is_deleted'] },
        }
    });
    company.associate = function (models) {
        company.belongsTo(models.users, {
            foreignKey: 'company_id',
            targetKey: 'company_id'
        });
    };
    return company;
}
exports.default = CompanyFactory;
