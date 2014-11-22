var Velocity = require('velocity-animate/velocity');
var loadImage = require('./load-image');
var debug = require('./debug');

function Page() {
  this.el = document.querySelector('.img');
}

Page.prototype.start = function() {
  debug("chrome.runtime.sendMessage({action: getArtwork})");
  chrome.runtime.sendMessage({
    action: 'getArtwork'
  }, function(response) {
    debug("Recieved response", response.artwork);
    this.addImage(response.artwork);
  }.bind(this));
};

Page.prototype.enter = function() {
  Velocity(this.el, {
    opacity: [1, 0],
    scaleX: [1, 0.99],
    scaleY: [1, 0.99]
  }, {
    duration: 200
  });
};

Page.prototype.addImage = function(artwork) {
  debug("Adding artwork", artwork);

  if (!artwork || !artwork.imageUrl) return;

  var imageUrl = artwork.imageUrl;
  var el = this.el;
  el.href = artwork.url;
  document.title = artwork.title;

  loadImage(imageUrl, function() {
    el.style.backgroundImage = "url(" + imageUrl + ")";
    this.enter();
  }.bind(this));
};

var page = new Page();

page.start();
