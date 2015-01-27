var mongoose = require('mongoose');

var DeviceSchema = new mongoose.Schema({
  number: String,
  name: String
});


module.exports = DeviceSchema;