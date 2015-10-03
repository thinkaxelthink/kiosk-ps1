var express  = require('express'),
    bodyParser = require('body-parser'),
    mustache = require('mustache'),
    fs       = require('fs'),
    app      = express(),
    mongo    = require('./lib/db'),
    server, db;

db = new mongo({
  uri: process.env.MONGOLAB_URI || 'mongodb://localhost/kiosk'
}).connect();

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// middleware - handles any digits
app.use('/', middleware);

server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

function middleware(req, res, next){
  var msg = '';

  if(req.body && req.body.Digits){
    db.collection.find({twilio_id: req.body.Digits}).exec(function(err, result){

      msg = getMessage(result[0]);

      sendResponse(res, msg);

      next(); 
    });
  } else {
    // render main menu
    msg = getMessage();

    sendResponse(res, msg);

    next(); 
  }
}

function sendResponse(res, msg) {
  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(msg);
}

function getMessage(data) {
  var xml;

  if(data){
    xml = mustache.render(
      fs.readFileSync('views/response.xml', 'utf-8'),
      data
    );
  } else {
    xml = fs.readFileSync('views/intro.xml', 'utf-8');
  }

  return xml;
}