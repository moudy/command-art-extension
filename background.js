var loadImage = require('./load-image');

var artworks = [];
var apiOrigin;
var hasMadeRequest;

if ('production' === process.env.NODE_ENV) {
  apiOrigin = 'https://command-art.herokuapp.com';
} else {
  apiOrigin = 'http://localhost:3049';
}

var url = apiOrigin+'/artworks';

function preload (artworksToPreload) {
  artworksToPreload.forEach(function (a) {
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

function getArtworks() {
  var request = createCORSRequest('GET', url);
  if (!request) {
    throw new Error('CORS not supported');
  }

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      if (data.artworks) {
        artworks = artworks.concat(data.artworks);
      }
      console.log('request');
      hasMadeRequest = true;
    }
  };

  request.onerror = function(error) {
    console.log("Error", error);
  };

  request.send();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  function respond () {
    console.log('hasMadeRequest', hasMadeRequest, artworks);
    if (!hasMadeRequest) {
      return setTimeout(respond, 400);
    }

    sendResponse({
      artwork: artworks.shift()
    });

    preload(artworks.slice(0,3));
    if (artworks.length < 5) getArtworks();
  }

  if (request.action === 'getArtwork') {
    respond();
  }

});

getArtworks();
