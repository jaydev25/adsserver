'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AdminRoles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roleId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Roles', key: 'id' }
      },
      adminId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Admins', key: 'id' }
      },
      read: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      modify: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
      queryInterface.addConstraint('AdminRoles', ['roleId', 'adminId'], {
        type: 'unique',
        name: 'AdminRoles_unique_role_admin'
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AdminRoles');
  }
};