var path = require('path');
var webpack = require('webpack');

var Paths = {
  APP: path.resolve(__dirname, 'src/js'),
  BUILD_OUTPUT: path.resolve(__dirname, 'out/webpack')
};

module.exports = {
  entry: {
    app: Paths.APP,
    vendor: [
      'bluebird', 'classnames', 'falcor', 'falcor-http-datasource', 'jsuri', 'load-script', 'lodash', 
      'md5', 'moment', 'react', 'react-bootstrap', 'react-dom', 'react-dropzone', 'react-gemini-scrollbar', 
      'react-redux', 'react-router', 'react-router-redux', 'redux', 'redux-actions', 'redux-form', 
      'redux-logger', 'redux-promise-middleware', 'redux-thunk', 'reselect', 'socket.io-client', 'validate.js', 
      'xhr'
    ]
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
    new webpack.optimize.CommonsChunkPlugin({ 
      name: 'vendor',
      filename: 'vendor.js'
    })
  ],
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