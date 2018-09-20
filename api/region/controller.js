const countries = require('./countries.json');
const states = require('./states.json');
const cities = require('./cities.json');

const getRegionData = (req, res) => {
  res.status(200).json({
    countries: countries,
    states: states,
    cities: cities
  })
};

module.exports = {
  getRegionData: getRegionData
};