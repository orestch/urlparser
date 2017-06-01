  /**
   * Parses URL into hostname and params
   * @param {String} url
   * @returns {Object} Parsed URL
   */
   function parseUrl(url) {
    var url = url || window.location.href,
      parsedUrl = url.match(/^(?:([a-z][a-z0-9\+-\.]+):?\/\/)?(([^:\/\\?#]*)(?::([0-9]*))?)?([^\\?#]*)(\?([^#]*))?(#(.*))?$/i),
      params = parsedUrl[6] || null,
      paramsObj = {};


    if (params) {
      params.match(/\w+=\w*/g).forEach(function(paramString) {
        var splittedParam = paramString.split('=');

        return paramsObj[splittedParam[0]] = splittedParam[1];
      });
    }

    return {
      href: parsedUrl[0] || "",
      protocol: parsedUrl[1] || "",
      host: parsedUrl[2] || "",
      hostname: parsedUrl[3] || "",
      port: parsedUrl[4] || "",
      pathname: parsedUrl[5] || "",
      queryParams: JSON.stringify(paramsObj) || "",
      hash: parsedUrl[9] || "",
      type: getUrlType(parsedUrl[0]) || ""
    };
  }

  function getUrlType(urlString) {
    var patternAbsolute = /^https?:\/\//i;

    if (patternAbsolute.test(urlString)) {
      return "absolute";
    } else if (!patternAbsolute.test(urlString)) {
      return "relative";
    }

    return null;
  }

  this.onmessage = function(e) {
    var rawUrls = e.data.body.links,
      parsedUrls = [];

    parsedUrls = rawUrls.map(url => parseUrl(url))

    if (parsedUrls.length > 0) {
      return this.postMessage({result: parsedUrls});
    }

    return null;
  }
