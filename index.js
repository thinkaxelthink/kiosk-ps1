var express  = require('express'),
    mustache = require('mustache'),
    fs       = require('fs'),
    app      = express(),
    people   = {
      '+17189267887': 'Axel Esquite'
    },
    server;

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {

  var model = {
    //name: people[res.From] || "Monkey"
    name: "Monkey"
  },
  xml;

  xml = fs.readFileSync('views/monkey.xml', 'utf-8');
  xml = mustache.render(xml, model);

  res.writeHead( 200, {'Content-Type': 'text/xml'} );
  res.end(xml);
});

server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
