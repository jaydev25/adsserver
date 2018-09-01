'use strict';
module.exports = (sequelize, DataTypes) => {
  var Subcategories = sequelize.define('Subcategories', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    catId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Categories', key: 'id' }
    },
    name: {
      allowNull: false,
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
  Subcategories.associate = function(models) {
    // associations can be defined here
    Subcategories.belongsTo(models.Categories, {foreignKey: 'catId', targetKey: 'id'});
  };
  return Subcategories;
};