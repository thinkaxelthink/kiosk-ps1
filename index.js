var express  = require('express'),
    bodyParser = require('body-parser'),
    mustache = require('mustache'),
    fs       = require('fs'),
    app      = express(),
    mongo    = require('./lib/db'),
    people   = {
      '+17189267887': 'Axel Esquite'
    },
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

  //var xml = getMessage((req.body && req.body.Digits) ? req.body.Digits : 'intro');

  if(req.body && req.body.Digits){
    db.collection.find({short_code: req.body.Digits}).exec(function(err, result){
      var msg;

      result[0].getDimension = getDimension;


      msg = mustache.render(
        fs.readFileSync('views/response.xml', 'utf-8'),
        result[0]
      );

      res.writeHead( 200, {'Content-Type': 'text/xml'} );
      res.end(msg);
      next(); 
    });
  }
/*
  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(xml);
  next();
*/
}

function getMessage(file_name){
  var stat, msg,
      intro = 'views/intro.xml',
      path = 'views/' + file_name + '.xml';

  db.collection.find({short_code: file_name}).exec(onExec);

/*
  try {
    stat = fs.statSync(path);

    if(stat.isFile()){
      msg = fs.readFileSync(path, 'utf-8');
    }
  } catch(e) {
    msg = mustache.render(fs.readFileSync(intro, 'utf-8'));
  }

  return msg;
*/
}

function onExec(err, res){
  var msg = mustache.render(
        fs.readFileSync('views/response.xml', 'utf-8'),
        res
      );

 res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(msg);
  next(); 
}

function getDimension(){
  // look for width and height
  // create string for concatenation of the phrase:
  // {width} {unit} by {height} {unit} by {depth} {unit}
  var str, w, w_unit, h, h_unit;

  w      = _.result(_.find(this.variants.dimensions, {'dimension': 'width'}), 'measurement');
  w_unit = _.result(_.find(this.variants.dimensions, {'dimension': 'width'}), 'unit');
  h      = _.result(_.find(this.variants.dimensions, {'dimension': 'height'}), 'measurement');
  h_unit = _.result(_.find(this.variants.dimensions, {'dimension': 'height'}), 'unit');
  str    = '<say>' + w + ' ' + w_unit + ' by ' + h + ' ' + h_unit + '</say>';
  // if there is a volumetric dimension add that to the string
  // return it to the template
  return str;
}
