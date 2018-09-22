'use strict';
module.exports = (sequelize, DataTypes) => {
  var AdminRoles = sequelize.define('AdminRoles', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    roleId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Roles', key: 'id' }
    },
    adminId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Admins', key: 'id' }
    },
    read: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    modify: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdBy: {
      allowNull: false,
      type: DataTypes.STRING
    },
    updatedBy: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });
  AdminRoles.associate = function(models) {
    // associations can be defined here
    AdminRoles.belongsTo(models.Roles, {foreignKey: 'roleId', targetKey: 'id'});
    AdminRoles.belongsTo(models.Admins, {foreignKey: 'adminId', targetKey: 'id'});
  };
  return AdminRoles;
};