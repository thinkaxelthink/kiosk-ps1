var m = require('./../lib/db'),
  fs = require('fs'),
  obj, countdown;

try {
  obj = JSON.parse(fs.readFileSync(process.env.PRODUCT_JSON_PATH || __dirname + '/kiosk_products.json'));
  countdown = obj.length;
} catch (e) {
  console.error('Failed to load and parse objects JSON', e);
}

db = new m({
  uri: process.env.MONGOLAB_URI || 'mongodb://localhost/kiosk'
}).connect();

db.collection.remove({}, function(err) {
  if (err) {
    console.log('error deleting old data.');
  }
  obj.forEach(function(val, idx, arr) {
    val.twilio_id = 1001+idx;
    db.create(val).save(onSave);
    console.log(idx, val.title);
  });
});


function onSave(err) {
  if (err) {
    console.log('Error on save!');
  } else {
    process.stdout.write('.');
    console.log(countdown--);
    if(countdown == 0) process.exit();
  }
}
