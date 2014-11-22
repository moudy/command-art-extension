var debug;

if ('production' === process.env.NODE_ENV) {
  debug = function () {};
} else {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift("[COMMAND-ART-DEBUG]");
    console.log.apply(console, args);
  };
}

module.exports = debug;
