'use strict';
module.exports = (sequelize, DataTypes) => {
  var Publishers = sequelize.define('Publishers', {
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
    address: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.STRING
    },
    pincode: {
      type: DataTypes.INTEGER
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isPaymentVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentRequestId: {
      type: DataTypes.STRING,
      defaultValue: false
    },
    paymentId: {
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
  Publishers.associate = function(models) {
    // associations can be defined here
    // Publishers.hasOne(models.Users, { foreignKey: 'userId' });
  };
  return Publishers;
};