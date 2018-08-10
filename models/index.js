'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var CONFIG    = require('../config/config.json')[env];
var db        = {};

const sequelize = new Sequelize(CONFIG.database, CONFIG.username, CONFIG.password, {
  host: CONFIG.host,
  dialect: CONFIG.dialect,
  port: "3306",
  operatorsAliases: false
});

var User = sequelize.import('user'),
	Cartinventory = sequelize.import('cartinventory'),
	Product = sequelize.import('product');

  
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.User = User;
db.Cartinventory = Cartinventory;
db.Product = Product;

Product.hasOne(Cartinventory, {
  foreignKey: 'productId'
});

User.hasOne(Cartinventory, {
  foreignKey: 'userId'
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
