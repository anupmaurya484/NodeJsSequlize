"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function ProjectAssignFactory(sequelize) {
    var project_assign = sequelize.define('project_assign', {
        project_assign_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        user_id: sequelize_1.DataTypes.INTEGER,
        project_id: sequelize_1.DataTypes.INTEGER,
        created_by: sequelize_1.DataTypes.INTEGER,
        last_updated_by: sequelize_1.DataTypes.INTEGER,
        note: sequelize_1.DataTypes.TEXT,
        created_date: sequelize_1.DataTypes.DATE,
        last_updated_date: sequelize_1.DataTypes.DATE,
        is_main: sequelize_1.DataTypes.INTEGER,
        is_deleted: sequelize_1.DataTypes.INTEGER,
    }, {
        tableName: 'project_assign',
        timestamps: false,
        underscored: true,
        defaultScope: {
            attributes: { exclude: ['created_by', 'created_date', 'last_updated_date', 'last_updated_by'] },
        }
    });
    project_assign.associate = function (models) {
    };
    return project_assign;
}
exports.default = ProjectAssignFactory;
