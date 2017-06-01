var express = require('express'),
  app = express(),
  port = process.env.PORT || 5000,
  fs = require('fs'),
  scrape = require('website-scraper');

function deleteFolderRecursive (path) {
  if ( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

app.listen(port);

app.post('/parseurl', function (req, res) {
  if (req.method == 'POST') {
    var body = '';

    req.on('data', function (data) {
      body += data;

      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', function () {
      var url = JSON.parse(body).url,
        containsProtocol = /^https?:\/\//i,
        downloadFolder = './dist/tmp',
        options = {
          urls: [url],
          directory: downloadFolder,
          request: {
            timeout: 1000
          },
          sources: [
              {selector: 'img', attr: 'src'},
              {selector: 'link[rel="stylesheet"]', attr: 'href'},
              {selector: 'script', attr: 'src'}
            ]
        };

      if (!containsProtocol.test(url)) {
        options.urls = `https://${url}/`;
      }

      deleteFolderRecursive(downloadFolder);

      scrape(options).then(result => {
        res.setHeader('content-type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!result[0].type) {
          options.urls = `http://${url}/`;
          scrape(options).then(() => {
            res.end(JSON.stringify({result: true, domain: options.urls}));
          });
        } else {
          res.end(JSON.stringify({result: true, domain: options.urls}));
        }
      }).catch((err) => {
        console.log("An error ocurred", err);
      });

    });
  }
})
