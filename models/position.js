var mongoose = require('mongoose');
var DeviceSchema = require('./device');

var PositionSchema = new mongoose.Schema({
  lat: String,
  lon: String,
  alt: String,
  createdAt: Date,
  device: [DeviceSchema]
});

module.exports = PositionSchema