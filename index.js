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

  var model = {
    name: people[req.query.From] || "Monkey"
  },
  xml;

  xml = fs.readFileSync('views/monkey.xml', 'utf-8');
  xml = mustache.render(xml, model);

  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(xml);
});

app.post('/', function(req, res){
  console.log(req.body);
  var msg = '<Response><Say>Good bye</Say></Response>',
      path, stat;

  if(req.body && req.body.Digits){
    path = 'views/' + req.body.Digits  + '.xml';
    stat = fs.statSync(path);
    if(stat.isFile()){
      msg = fs.readFileSync(path, 'utf-8');
    } else {
      msg = mustache.render(fs.readFileSync('views/monkey.xml', 'utf-8'), model);
    }
  }

  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(msg);
});

server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
