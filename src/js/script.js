(function() {
  var browserWindow = document.querySelector('.browser__window-js'),
    gotoUrlBtn = document.querySelector('.browser__goto-url-btn-js'),
    addressBar = document.querySelector('.browser__address-bar-js'),
    worker = registerWorker('js/worker.js'),
    parseLinksUrl = "http://localhost:5000/parseurl/";

  function init() {
    bindEvents();
  }

  function bindEvents() {
    gotoUrlBtn.addEventListener('click', gotoURL, false);
    addressBar.addEventListener('keyup', gotoURL, false);
    worker.addEventListener('message', addTooltips, false);
  }

  function createXHR(url, method, callback, async){
    try {
      var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');

      if ("withCredentials" in xhr){
          xhr.open("get", url, async);
      } else if (typeof XDomainRequest != "undefined"){
          xhr = new XDomainRequest();
          xhr.open(method, url);
      } else {
          xhr = null;
      }

      xhr.onreadystatechange = function () {
        return xhr.readyState === 4 && callback && callback(xhr.responseText);
      }
    } catch (e) {
      console.log(e);
    }

    return xhr;
  }

  function registerWorker(workerName) {
    if (window.Worker) {
      var myWorker = new Worker(workerName);
    }

    return myWorker;
  }

  function sendMessageToWorker(data) {
    var message = {
      body: data
    };

    worker.postMessage(message);
  }

  function sendLinksToWorker(pageHTML) {
    var links = [];

    browserWindow.innerHTML = pageHTML;

    if(browserWindow.innerHTML) {
      links = document.getElementsByTagName ('a');

      links = [].map.call(links, link => link.href);

      sendMessageToWorker(links);
    }
  }

  function gotoURL(e) {
    var url = addressBar.value;

    if((e.type === 'click' && e.target.nodeName === 'button') || (e.type === 'keyup' && e.keyCode == 13)) {

      var request = createXHR(parseLinksUrl + url, "get", sendLinksToWorker, true);

      if (request){
          return request.send();
      }
    }

    return false;
  }

  function createTooltipText(tooltipObj) {
    var result = "";

    for(var key in tooltipObj) {
      if (tooltipObj.hasOwnProperty(key) && tooltipObj[key]) {
        result += key + ": " + tooltipObj[key] + '<br>';
      }
    }

    return result;
  }


  function addTooltips(e) {
    var parsedUrls = e.data.result;

    links = document.getElementsByTagName ('a');
    links = [].forEach.call(links, link => {
      link.className = 'tooltip';

      var linkHref = link.getAttribute('href');

      var tooltiptext = document.createElement("span");
      tooltiptext.className = "tooltiptext";

      var tooltip = parsedUrls.find(parsedUrl => parsedUrl.href === linkHref);

      tooltiptext.innerHTML = createTooltipText(tooltip);

      link.appendChild(tooltiptext);
    });
  }

  init();
})();
