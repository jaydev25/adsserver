var config    = require('./config').config;  // we use node-config to handle environments
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
      ssl: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }

});

// export connection
module.exports.sequelize = sequelize;