var _ = require('lodash'),
    mongoose = require ("mongoose"),
    settings = {
      uri: 'mongodb://localhost/kiosk',
      model_type: 'KioskObjects',
      schema: {
        title: String,
        twilio_id: Number,
        id: Number,
        provenance: String,
        description: String,
        handle: String,
        product_type: String,
        images: [mongoose.Schema.Types.Mixed]
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
