var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var packageJson = require('./package.json');

// Dependencies in package.json that are only for CSS purposes
var cssDependencies = new Set([
  'bootstrap', 'bootswatch', 'font-awesome' 
]);

// Path constants
var Paths = {
  JS: path.resolve(__dirname, 'src/js'),
  CSS: path.resolve(__dirname, 'src/css'),
  BUILD_OUTPUT: path.resolve(__dirname, 'out/dist/webpack')
};

// Export Webpack configuration
module.exports = {
  devtool: 'source-map',
  entry: {
    killrvideo: Paths.JS,
    vendor: Object.keys(packageJson.dependencies).filter(function(dep) { return cssDependencies.has(dep) === false; })
  },
  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    root: [
      Paths.JS, Paths.CSS
    ]
  },
  output: {
    path: Paths.BUILD_OUTPUT,
    filename: 'killrvideo.js'
  },
  module: {
    loaders: [
      // Babel transpiler (see .babelrc file for presets)
      { test: /\.jsx?$/, include: Paths.JS, loader: 'babel' },
      
      // Extract CSS files from third parties with url resolution disabled on the css-loader
      { test: /\.css$/, include: /node_modules/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?-url') },
      
      // Extract CSS files from our app that are referenced by require('') calls
      { test: /\.css$/, include: Paths.CSS, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }
    ]
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
    }),
    
    // Put CSS that's extracted into a file named after the chunk (i.e. killrvideo.css)
    new ExtractTextPlugin("[name].css")
  ]
};