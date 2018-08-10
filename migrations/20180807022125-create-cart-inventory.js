'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cartInventories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' }
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      isCard: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue : 0,
      },
      isPayment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue : 0,
      },
      number_of_product : {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      basicAmount : {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      isDeleted : {
        type: Sequelize.BOOLEAN,
        defaultValue : 0,
        allowNull: false,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cartInventories');
  }
};