'use strict';
module.exports = (sequelize, DataTypes) => {
  var Filters = sequelize.define('Filters', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    filterType: {
      type: DataTypes.STRING
    },
    filter: {
      type: DataTypes.STRING
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
  Filters.associate = function(models) {
    // associations can be defined here
    Filters.hasMany(models.AdsFilters, {foreignKey: 'filterId', sourceKey: 'id'});
  };
  return Filters;
};