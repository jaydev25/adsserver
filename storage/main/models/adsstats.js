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
  AdsStats.afterUpdate(function(AdsStat, options) {
    // AdsStat.mood = 'happy'
    const data = AdsStat.get();
    return sequelize.models.Ads.findOne({
      include: [{
        model: sequelize.models.RewardsClass,
        required: true
      }],
      where: {
        id: data.adId
      },
      raw: true
    }).then((ad) => {
      const createdAt = new Date(data.createdAt);
      const updatedAt = new Date(data.updatedAt);
      data.duration = 0;
      data.duration += (updatedAt.getTime() - createdAt.getTime()) / 1000;
      if (data.duration > 10) {
        const beforeRewards = options.user.points;
        return sequelize.models.Rewards.findOrCreate({
          where: {
            userId: data.userId,
            adId: data.adId
          },
          defaults: {
            userId: data.userId,
            adId: data.adId,
            beforeRewards: beforeRewards,
            rewardPoints: ad['RewardsClass.points'],
            afterRewards: beforeRewards + ad['RewardsClass.points'],
            createdBy: options.user.email,
            updatedBy: options.user.email
          }
        }).spread((record, isNewRecord) => {
          if (isNewRecord) {
            return sequelize.models.Users.update({
              points: beforeRewards + ad['RewardsClass.points']
            }, {
              where: {
                id: data.userId
              }
            }).then(() => {
              return sequelize.Promise.resolve();
            }).catch(e => {
              console.log(e);
            });
          } else {
            return sequelize.Promise.resolve();
          }
        });
      } else {
        return sequelize.Promise.resolve();
      }
    });
  })
  return AdsStats;
};
