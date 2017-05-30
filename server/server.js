var express = require('express'),
  app = express(),
  port = process.env.PORT || 5000,
  jsdom = require('jsdom');
const { JSDOM } = jsdom;

app.listen(port);

app.get('/parseurl/:url', function(req, res) {
  var options = {
    resources: "usable"
  }

  res.setHeader('content-type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');

  JSDOM.fromURL('http://' + req.params.url, options).then(dom => {
    res.end(dom.serialize());
  });
});
