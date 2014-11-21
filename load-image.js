module.exports = function loadImage(url, done) {
  var i = new Image();
  var isLoaded;

  i.addEventListener('load', function () {
    if (done && !isLoaded) done(url);
  }, false);

  i.src = url;

  if (i.complete || i.readyState) {
    isLoaded = true;
    if (done) done(url);
  }
};

