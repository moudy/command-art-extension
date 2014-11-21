chrome.runtime.sendMessage({action: 'getArtwork'}, function(response) {
  var artwork = response.artwork;
  if (artwork) {
    var img = document.createElement('img');
    img.src = artwork.imageUrl;
    document.body.appendChild(img);
  }
});
