var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var packageJson = require('./package.json');

// Plugin to help resolve bootswatch relative paths
var BootswatchPlugin = {
  // Apply plugin to the resolver
  apply: function(resolver) {
    // Part of the path to bootswatch files
    var bootswatchPath = 'node_modules' + path.sep + 'bootswatch' + path.sep;
    
    // Plugin will process files
    resolver.plugin('file', function(request, callback) {
      // Look for requests that are relative paths inside bootswatch
      if (request.path.indexOf(bootswatchPath) !== -1 && request.request.startsWith('..')) {
        // Resolve relative to the bootstrap CSS folder instead
        var newRequest = {
          path: path.resolve(request.path, '../../bootstrap/dist/css'),
          request: request.request,
          query: request.query,
          directory: request.directory
        };
        this.doResolve(['file'], newRequest, callback);
      } else {
        callback();
      }
    });
  }
}

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
      
      // Extract CSS files from our app that are referenced by require('') calls and have assets that are required
      // in the CSS file append '../' to the URLs (i.e. so fonts required will be calls to ../fonts/[name].[ext])
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader', { publicPath: '../' }) },
      
      // Allow PNG images to be required from code
      { 
        test: /\.png$/, 
        include: Paths.SRC, 
        loader: 'file',
        query: { name: 'images/[name].[ext]' } 
      },
      
      // Allow font loading (to support third party CSS referencing fonts)
      { 
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d\.\d\.\d)?$/, 
        loader: 'file',
        query: { name: 'fonts/[name].[ext]' }
      }
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
    new ExtractTextPlugin("css/killrvideo.css", { allChunks: true }),
    
    // Bootswatch references relative paths to fonts that are actually in Bootstrap, so use a special resolver
    // to help find those files (see resolver implementation above)
    new webpack.ResolverPlugin([ BootswatchPlugin ])
  ]
};