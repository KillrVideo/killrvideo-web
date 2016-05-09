var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');


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

var PROJECT_DIR = path.resolve(__dirname, '..');

// Path constants
var Paths = {
  SRC: path.resolve(PROJECT_DIR, 'src/client'),
  JS: path.resolve(PROJECT_DIR, 'src/client/js'),
  CSS: path.resolve(PROJECT_DIR, 'src/client/css'),
  IMAGES: path.resolve(PROJECT_DIR, 'src/client/images'),
  BUILD_OUTPUT: path.resolve(PROJECT_DIR, 'dist/client')
};

// Plugins for the build
var plugins = [
  // Split vendor files into separate bundle
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'js/vendor.js'
  }),
  
  // Put CSS that's extracted into killrvideo.css
  new ExtractTextPlugin('css/killrvideo.css', { allChunks: true }),
  
  // Bootswatch references relative paths to fonts that are actually in Bootstrap, so use a special resolver
  // to help find those files (see resolver implementation above)
  new webpack.ResolverPlugin([ BootswatchPlugin ])
];

// For production builds (i.e. release builds), add some plugins
if (process.env.NODE_ENV === 'production') {
  // Let code know we're in a produciton environment (should get rid of code in react and elsewhere that
  // uses checks for the environment, thus making bundles smaller)
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }));
  
  // Minify and remove dead code with uglify
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    screw_ie8: true
  }));
} else {
  // Allow live reload when doing a dev build with watch
  plugins.push(new LiveReloadPlugin());
}

// Export Webpack configuration
module.exports = {
  devtool: 'source-map',
  context: Paths.SRC,
  entry: {
    killrvideo: './webpack.js',
    vendor: [ 
      'bluebird', 'classnames', 'falcor', 'falcor-http-datasource', 'gemini-scrollbar', 'jsuri', 'load-script',
      'lodash', 'md5', 'moment', 'react', 'react-bootstrap', 'react-dom', 'react-dropzone', 'react-gemini-scrollbar',
      'react-redux', 'react-router', 'react-router-redux', 'redux', 'redux-actions', 'redux-form', 'redux-logger',
      'redux-promise-middleware', 'redux-thunk', 'reselect', 'socket.io-client', 'validate.js', 'xhr'
    ]
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
  plugins: plugins
};