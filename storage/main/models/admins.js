'use strict';
module.exports = (sequelize, DataTypes) => {
  var Admins = sequelize.define('Admins', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'Users', key: 'id' }
    },
    city: {
      type: DataTypes.STRING
    },
    state: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    birthDate: {
      type: DataTypes.DATE
    },
    occupation: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      default: true
    },
    points: {
      type: DataTypes.INTEGER,
      default: 0
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
  Admins.associate = function(models) {
    // associations can be defined here
    // Admins.hasOne(models.Users, { foreignKey: 'userId' });
    Admins.hasMany(models.AdminRoles, {foreignKey: 'adminId', sourceKey: 'id'});
  };
  return Admins;
};