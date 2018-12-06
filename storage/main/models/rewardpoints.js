'use strict';
module.exports = (sequelize, DataTypes) => {
  var RewardPoints = sequelize.define('RewardPoints', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    duration: {
      type: DataTypes.INTEGER,
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
  RewardPoints.associate = function(models) {
    // associations can be defined here
  };
  return RewardPoints;
};