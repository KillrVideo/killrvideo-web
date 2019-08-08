var webpack = require('webpack');
var path = require('path');
var combineLoaders = require('webpack-combine-loaders');

var SOURCE_DIR = path.resolve(__dirname, 'src');
var BUILD_DIR  = path.resolve(__dirname, 'src/public');

var dev = {
    devtool: 'module-source-map',
    entry: SOURCE_DIR + "/index.jsx",
    mode: "development",
    output: {
        path: BUILD_DIR,
        filename: "killrvideo-client.js",
    },
    module: {
        rules: [
            {
                test : /\.jsx?/,
                include : SOURCE_DIR,
                loader : 'babel-loader',
            },{
                test: /\.css$/,
                loader: combineLoaders([{loader: 'style-loader'},{loader: 'css-loader'}])
            },{
                test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
                loader: 'url-loader'
            },
        ]
    }
};

module.exports = [dev];

