'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Publishers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      birthDate: {
        type: Sequelize.DATE
      },
      occupation: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING(400)
      },
      gender: {
        type: Sequelize.STRING
      },
      pincode: {
        type: Sequelize.INTEGER
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isPaymentVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paymentRequestId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.STRING
      },
      updatedBy: {
        allowNull: false,
        type: Sequelize.STRING
      }
    }).then(() => {
      queryInterface.addConstraint('Publishers', ['userId'], {
        type: 'unique',
        name: 'Publishers_unique_userId'
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Publishers');
  }
};