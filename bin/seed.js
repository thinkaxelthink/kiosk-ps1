var m = require('./../lib/db'),
    fs = require('fs'),
    obj;

try {
  obj = JSON.parse(fs.readFileSync(__dirname + '/objects.json'))
} catch(e) {
  console.error('Failed to load and parse objects JSON', e);
}

db = new m({
  uri: process.env.MONGOLAB_URI || 'mongodb://localhost/kiosk'
}).connect();

db.collection.remove({}, function(err) {
  if (err) {
      console.log ('error deleting old data.');
    }
});

obj.forEach(function(val, idx, arr){
  db.create(val).save(onSave);
});

function onSave(err){
  if (err) console.log ('Error on save!')
}
