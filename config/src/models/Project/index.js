"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function ProjectFactory(sequelize) {
    var project = sequelize.define('project', {
        project_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        project_name: sequelize_1.DataTypes.STRING,
        organization_id: sequelize_1.DataTypes.INTEGER,
        created_by: sequelize_1.DataTypes.INTEGER,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        description: sequelize_1.DataTypes.TEXT,
        created_date: sequelize_1.DataTypes.DATE,
        last_updated_date: sequelize_1.DataTypes.DATE,
        is_deleted: sequelize_1.DataTypes.INTEGER,
    }, {
        tableName: 'project',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['created_by', 'created_date', 'last_updated_date', 'last_updated_by', 'is_deleted'] },
        }
    });
    project.associate = function (models) {
    };
    return project;
}
exports.default = ProjectFactory;
