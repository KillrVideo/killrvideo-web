var path = require('path');

var Paths = {
  APP: path.resolve(__dirname, 'src/js'),
  BUILD_OUTPUT: path.resolve(__dirname, 'out/webpack')
};

module.exports = {
  entry: {
    app: Paths.APP
  },
  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    root: [
      Paths.APP
    ]
  },
  output: {
    path: Paths.BUILD_OUTPUT,
    filename: 'killrvideo.js'
  },
  module: {
    loaders: [
      // Babel transpiler (see .babelrc file for presets)
      {
        test: /\.jsx?$/,
        include: Paths.APP,
        loader: 'babel'
      }
    ]
  }
};