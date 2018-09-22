'use strict';
module.exports = (sequelize, DataTypes) => {
  var AdsMedia = sequelize.define('AdsMedia', {
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
    media: {
      type: DataTypes.STRING
    },
    mediaURL: {
      type: DataTypes.STRING
    },
    mediaType: {
      type: DataTypes.STRING
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
  AdsMedia.associate = function(models) {
    // associations can be defined here
    AdsMedia.belongsTo(models.Ads, {foreignKey: 'adId', targetKey: 'id'});
  };
  return AdsMedia;
};