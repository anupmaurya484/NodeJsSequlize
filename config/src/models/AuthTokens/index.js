"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
function AuthTokensFactory(sequelize) {
    var auth_tokens = sequelize.define('auth_tokens', {
        auth_token_id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        tokens: sequelize_1.DataTypes.TEXT,
        user_id: sequelize_1.DataTypes.INTEGER,
        create_at: sequelize_1.DataTypes.DATE,
        company_id: sequelize_1.DataTypes.INTEGER,
        is_loggout: sequelize_1.DataTypes.INTEGER,
        last_updated_at: sequelize_1.DataTypes.DATE,
        organization_id: sequelize_1.DataTypes.INTEGER,
    }, {
        tableName: 'auth_tokens',
        timestamps: false,
        underscored: true,
    });
    auth_tokens.associate = function (models) {
    };
    return auth_tokens;
}
exports.default = AuthTokensFactory;
