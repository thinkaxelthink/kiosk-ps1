var _ = require('lodash'),
    mongoose = require ("mongoose"),
    settings = {
      uri: 'mongodb://localhost/kiosk',
      model_type: 'KioskObjects',
      schema: {
        name: String,
        short_code: Number,
        variants: [{
            variant_type: String,
            dimensions: [{
              measurement: Number,
              unit: String,
              dimension: String
            }],
            materials: [String]
          }],
        origin: String,
        description: String
      }
    },
    schema,
    model;

function KioskMongo(options){
  settings   = _.extend(settings, options || {});
  schema     = new mongoose.Schema(settings.schema);

  model = mongoose.model(settings.model_type, schema);
  this.collection = model;

  return this;
}

KioskMongo.prototype.connect = function(){
  mongoose.connect(settings.uri, settings.onConnect || onConnect);
  return this;
};

KioskMongo.prototype.create = function(opts){
  return new model(opts);
};

function onConnect(err, res){
  if (err) { 
    console.log ('ERROR connecting to: ' + settings.uri + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + settings.uri);
  }
}

module.exports = KioskMongo
