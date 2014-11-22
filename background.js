var loadImage = require('./load-image');
var debug = require('./debug');

var RETRY_DELAY = 500;
var PRELOAD_COUNT = 5;
var MIN_ARTWORKS_COUNT = 10;
var artworks = [];
var apiOrigin;
var hasMadeRequest;

if ('production' === process.env.NODE_ENV) {
  apiOrigin = 'http://www.command-art.com';
} else {
  apiOrigin = 'http://localhost:3049';
}

debug("Starting with origin: " + apiOrigin);

var url = apiOrigin + '/artworks';


function preload(artworksToPreload) {
  artworksToPreload.forEach(function(a) {
    debug("Preloading " + a.imageUrl);
    loadImage(a.imageUrl);
  });
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest !== "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

function getArtworks(done) {
  var request = createCORSRequest('GET', url);
  if (!request) {
    throw new Error('CORS not supported');
  }

  var isDone;

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      if (data.artworks) {
        artworks = artworks.concat(data.artworks);
        preload(artworks.slice(0, PRELOAD_COUNT - 1));
      }
      debug("Response: " + data.artworks);
      hasMadeRequest = true;
    } else {
      debug("Response Error: " + request.status);
    }
    if (done && !isDone) {
      isDone = true;
      done();
    }
  };

  request.onerror = function(error) {
    debug("Response Error: " + error);
    isDone = true;
    if (done && !isDone) {
      isDone = true;
      done();
    }
  };

  request.send();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var isAsync;

  function respond() {
    if (artworks.length) {
      debug("Has artworks: ", artworks);

      var artwork = artworks.shift();
      debug("Sending artwork response: ", artwork);
      sendResponse({
        artwork: artwork
      });

      preload(artworks.slice(0, PRELOAD_COUNT - 1));
      if (artworks.length < MIN_ARTWORKS_COUNT) getArtworks();
    } else if (!hasMadeRequest) {
      debug("Has not made request, retrying in " + RETRY_DELAY + "ms");
      isAsync = true;
      setTimeout(respond, RETRY_DELAY);
    } else {
      isAsync = true;
      getArtworks(respond);
    }

    return isAsync;
  }

  if (request.action === 'getArtwork') {
    return respond();
  }

});

getArtworks();
