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
  SRC: path.resolve(__dirname, 'src'),
  JS: path.resolve(__dirname, 'src/js'),
  CSS: path.resolve(__dirname, 'src/css'),
  IMAGES: path.resolve(__dirname, 'src/images'),
  BUILD_OUTPUT: path.resolve(__dirname, 'out/dist')
};

// Export Webpack configuration
module.exports = {
  devtool: 'source-map',
  context: Paths.SRC,
  entry: {
    killrvideo: './webpack.js',
    vendor: Object.keys(packageJson.dependencies).filter(function(dep) { return cssDependencies.has(dep) === false; })
  },
  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    root: [
      Paths.JS, Paths.CSS, Paths.IMAGES
    ]
  },
  output: {
    path: Paths.BUILD_OUTPUT,
    filename: 'js/killrvideo.js',
    library: 'KillrVideo'
  },
  module: {
    loaders: [
      // Babel transpiler (see .babelrc file for presets)
      { test: /\.jsx?$/, include: Paths.SRC, loader: 'babel' },
      
      // Extract CSS files from third parties with url resolution disabled on the css-loader
      { test: /\.css$/, include: /node_modules/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?-url') },
      
      // Extract CSS files from our app that are referenced by require('') calls
      { test: /\.css$/, include: Paths.SRC, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      
      // Allow PNG images to be required from code
      { test: /\.png$/, include: Paths.SRC, loader: 'file?name=[path][name].[ext]' }
    ]
  },
  plugins: [
    // Split vendor files into separate bundle
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'js/vendor.js'
    }),
    
    // Minify and remove dead code with uglify
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      screw_ie8: true
    }),
    
    // Put CSS that's extracted into killrvideo.css
    new ExtractTextPlugin("css/killrvideo.css", { allChunks: true })
  ]
};