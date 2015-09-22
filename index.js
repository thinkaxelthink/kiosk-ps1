var express  = require('express'),
    bodyParser = require('body-parser'),
    mustache = require('mustache'),
    fs       = require('fs'),
    app      = express(),
    people   = {
      '+17189267887': 'Axel Esquite'
    },
    server;

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// middleware - handles any digits
app.use('/', function(req, res, next){
  if(req.query && req.query.digits){
    var xml = fs.readFileSync('views/' + req.query.digits  + '.xml', 'utf-8');

    res.writeHead( 200, {'Content-Type': 'text/xml'} );
    res.end(xml);
  }
  next();
});

app.get('/', function (req, res) {

  var msg = getMessage('intro');

  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(msg);
});

app.post('/', function(req, res){
  var msg = '<Response><Say>Good bye</Say></Response>',
      path, stat;

  if(req.body && req.body.Digits){
    msg = getMessage(req.body.Digits);
  }

  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(msg);
});

server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

function getMessage(file_name){
  var stat,
      msg,
      intro = 'views/intro.xml',
      path = 'views/' + file_name + '.xml';

  try {
    stat = fs.statSync(path);

    if(stat.isFile()){
      msg = fs.readFileSync(path, 'utf-8');
    }
  } catch(e) {
    msg = mustache.render(fs.readFileSync(intro, 'utf-8'));
  }

  return msg;
}
