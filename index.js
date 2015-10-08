var express  = require('express'),
    bodyParser = require('body-parser'),
    mustache = require('mustache'),
    fs       = require('fs'),
    _        = require('lodash'),
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
    console.log('Received => '+ req.body.Digits);

    db.collection.find({twilio_id: req.body.Digits}).exec(function(err, result){

//      console.log('Found Record => ', result[0]);

      var model = _.defaults(result[0] || getMenuOptionTargets(req.body.Digits), {
        is_kiosk_object: true,
        bell_path: process.env.HEROKU_URL + '/sounds/bell.mp3',
        pause_music_path: process.env.HEROKU_URL + '/sounds/popcorn.mp3',
        birdsong_path: process.env.HEROKU_URL + '/sounds/birdsong.mp3'
      })
      
      msg = getMessage(model);

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

function getMenuOptionTargets(digits){
  var targets = [null, null,
      'about.xml',
      'credits.xml',
      'news.xml',
      'birdsong.xml',
  ], template;

  if(targets[digits]){
    template = fs.readFileSync('views/' + targets[digits], 'utf-8');

    return {is_kiosk_object: false, menu_option: template};
  } else {
    return null;
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
