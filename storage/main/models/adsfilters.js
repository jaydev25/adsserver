'use strict';
module.exports = (sequelize, DataTypes) => {
  var AdsFilters = sequelize.define('AdsFilters', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    adId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ads', key: 'id' }
    },
    filterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Filters', key: 'id' }
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
  AdsFilters.associate = function(models) {
    // associations can be defined here
    AdsFilters.belongsTo(models.Ads, {foreignKey: 'adId', targetKey: 'id'});
    AdsFilters.belongsTo(models.Filters, {foreignKey: 'filterId', targetKey: 'id'});
  };
  return AdsFilters;
};