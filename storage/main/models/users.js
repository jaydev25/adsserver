'use strict';
if (process.env.NODE_ENV === 'development') {
  const bcrypt = require('bcrypt-nodejs');
} else {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
}

module.exports = (sequelize, DataTypes) => {
  var Users = sequelize.define('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING
    },
    contact: {
      type: DataTypes.STRING
    },
    isVerified: {
      type: DataTypes.BOOLEAN
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
    timestamps: true,
    hooks: {
      // beforeValidate: hashPassword
    }
  });
  Users.associate = function(models) {
    // associations can be defined hered
    Users.hasOne(models.Publishers, { foreignKey: 'userId' });
    Users.hasOne(models.Subscribers, { foreignKey: 'userId' });
    Users.hasOne(models.Admins, { foreignKey: 'userId' });
    Users.hasMany(models.Ads, {foreignKey: 'userId', sourceKey: 'id'});
    Users.hasOne(models.VerificationToken, {
      as: 'verificationtoken',
      foreignKey: 'userId',
      foreignKeyConstraint: true,
    });
  };
  return Users;
};