'use strict';
module.exports = (sequelize, DataTypes) => {
  var Ads = sequelize.define('Ads', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    ageGroup: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      default: true
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
  Ads.associate = function(models) {
    // associations can be defined here
    Ads.belongsTo(models.Users, {foreignKey: 'userId', targetKey: 'id'});
    Ads.belongsTo(models.Categories, {foreignKey: 'catId', targetKey: 'id'});
    Ads.belongsTo(models.Subcategories, {foreignKey: 'subcatId', targetKey: 'id'});
    Ads.hasMany(models.AdsMedia, {foreignKey: 'adId', sourceKey: 'id'});
    Ads.hasMany(models.AdsFilters, {foreignKey: 'adId', sourceKey: 'id'});
  };
  return Ads;
};