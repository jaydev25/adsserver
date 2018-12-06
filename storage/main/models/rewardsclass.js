'use strict';
module.exports = (sequelize, DataTypes) => {
  var RewardsClass = sequelize.define('RewardsClass', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  RewardsClass.associate = function(models) {
    // associations can be defined here
    RewardsClass.hasMany(models.RewardsClass, {foreignKey: 'classId', sourceKey: 'id'});
  };
  return RewardsClass;
};