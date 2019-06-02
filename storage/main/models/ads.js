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
    pickup: {
      type: DataTypes.STRING
    },
    drop: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    catId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Categories', key: 'id' }
    },
    subcatId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Subcategories', key: 'id' }
    },
    classId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'RewardsClass', key: 'id' }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    Ads.belongsTo(models.RewardsClass, {foreignKey: 'classId', targetKey: 'id'});
    Ads.hasMany(models.AdsMedia, {foreignKey: 'adId', sourceKey: 'id'});
    Ads.hasMany(models.AdsStats, {foreignKey: 'adId', sourceKey: 'id'});
    Ads.hasMany(models.AdsFilters, {foreignKey: 'adId', sourceKey: 'id'});
  };
  return Ads;
};
