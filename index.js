/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

var DeviceSchema = require('./models/device');
var PositionSchema = require('./models/position');

var Device = mongoose.model('Device', DeviceSchema);
var Position = mongoose.model('Position', PositionSchema);


app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  
  res.render('index');
});

app.get('/list', function (req, res) {
  
  res.render('index');
});

app.get('/track/:device', function (req, res) {
  
  var d = Device.findOne({ number: req.params.device }, function (err, d) {
  
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'could not find matching device'
      });
    }
    
    
    
    res.render('index', { device: d });
  });
});

app.post('/api/poll', function (req, res) {
  
  var device = req.body.device;
  var time = req.body.time;
  var lat = req.body.slot_lat;
  var lon = req.body.slot_long;
  var alt = req.body.slot_alt;
  
  if (device && time && lat && lon) {
    
    time *= 1000; // actoboard timestamp is in seconds
    
    console.log('Looking up existing device ...');
    Device.findOne({ number: device }, function (err, d) {
      
      console.log('Device : ', d);
      
      // Creates a position record which is assigned to a certain device
      var createPosition = function (device, cb) {
        
        console.log('Creating position ...');
        console.log('For device : ', device);
        
        var p = new Position({
          lat: lat,
          lon: lon,
          alt: alt,
          createdAt: new Date(time)
        });
        
        p.device.push(device);
        
        p.save(cb || function () {});
      };
      
      var done = function (err) {
        
        console.log('done');
        console.log(err);
        
        if (err) {
          res.status(500).json({ status: 'error' });
        } else {
          res.status(200).json({ status: 'success' });
        }
      };
      
      if (!d || err) { // Create the device if it doesn't exist
        console.log('Could not find matching device, creating one');
        d = new Device({ number: device, name: 'Fakename' });
        d.save(function (err) {
          console.log('Saved new device !');
          if (err) {
            console.error(err);
          }
          
          createPosition(d, done);
        });
      } else {
        console.log('Existing device found, creating position');
        createPosition(d, done);
      }
      
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Missing parameters'
    });
  }
});

/* istanbul ignore next */
if (!module.parent) {
  
  mongoose.connect(process.env.MONGOLAB_URI || 'localhost/akeru', function (err, obj) {
    if (!err) {
      console.log('Connected to MongoDB');
      app.listen(process.env.PORT || 3000);
      console.log('Express started on port ' + (process.env.PORT || 3000));
    } else {
      console.error(err);
    }
  });
}