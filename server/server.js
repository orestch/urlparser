var express = require('express'),
  app = express(),
  port = process.env.PORT || 5000,
  jsdom = require('jsdom'),
  fs = require('fs');

const scrape = require('website-scraper');
const { JSDOM } = jsdom;

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

app.listen(port);

app.get('/parseurl/:url', function(req, res) {
  var downloadFolder = './dist/tmp';

  res.setHeader('content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  deleteFolderRecursive(downloadFolder);

  let options = {
      urls: [`https://${req.params.url}/`],
      directory: downloadFolder,
  };

  console.log(options.urls);

  scrape(options).then(result => {
    res.end(JSON.stringify({result: true, filename: "index.html", folder: downloadFolder}));
  }).catch((err) => {
      console.log("An error ocurred", err);
  });
});
