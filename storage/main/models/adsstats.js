'use strict';
module.exports = (sequelize, DataTypes) => {
  var AdsStats = sequelize.define('AdsStats', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    statType: {
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
  AdsStats.associate = function(models) {
    // associations can be defined here
    AdsStats.belongsTo(models.Ads, {foreignKey: 'adId', targetKey: 'id'});
    AdsStats.belongsTo(models.Users, {foreignKey: 'userId', targetKey: 'id'});
  };
  AdsStats.afterUpdate(function(AdsStat) {
    // AdsStat.mood = 'happy'
    console.log('////////////////////', AdsStat);
    // const data = AdsStat.getDataValues();
    // return sequelize.models.RewardsClass.findOne({
    //   where: {
    //     id: data.classId
    //   }
    // }).then((result) => {
    //   console.log('????????????????????', result);
    // });
    return sequelize.Promise.resolve()
  })
  return AdsStats;
};