var path = require('path');
var webpack = require('webpack');
var packageJson = require('./package.json');

// Dependencies in package.json that are only for CSS purposes
var cssDependencies = new Set([
  'bootstrap', 'bootswatch', 'font-awesome' 
]);

var Paths = {
  APP: path.resolve(__dirname, 'src/js'),
  BUILD_OUTPUT: path.resolve(__dirname, 'out/dist/webpack')
};

module.exports = {
  devtool: 'source-map',
  entry: {
    app: Paths.APP,
    vendor: Object.keys(packageJson.dependencies).filter(function(dep) { return cssDependencies.has(dep) === false; })
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
  plugins: [
    // Split vendor files into separate bundle
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js'
    }),
    // Minify and remove dead code with uglify
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      screw_ie8: true
    })
  ],
  module: {
    loaders: [
      // Babel transpiler (see .babelrc file for presets)
      { test: /\.jsx?$/, include: Paths.APP, loader: 'babel' }
    ]
  }
};