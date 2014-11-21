var artworks = [];

var url;
var hasMadeRequest;

if ('production' === process.env.NODE_ENV) {
  url = 'http://localhost:3049/artworks';
} else {
  url = 'http://localhost:3049/artworks';
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
    if (!hasMadeRequest) return setTimeout(respond, 400);

    sendResponse({
      artwork: artworks.pop()
    });

    if (artworks.length < 5) getArtworks();
  }

  if (request.action === 'getArtwork') {
    respond();
  }

});

getArtworks();
