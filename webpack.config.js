var path = require('path');

var webpack = require('webpack');
var HtmlPlugin = require('html-webpack-plugin');

var candela = require('candela/webpack');

module.exports = candela({
  devtool: 'cheap-module-source-map',
  entry: {
    index: './src/index.js',
    test: './test/dataWindow.js'
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js'
  },
  resolve: {
    alias: {
      '~': path.resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        ]
      },
      {
        test: /\.jade$/,
        use: 'jade-loader'
      },
      {
        test: /\.css$/,
        use: 'css-loader'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.yml$/,
        exclude: /node_modules/,
        use: [
          'json-loader',
          'yaml-loader'
        ]
      },
      {
        test: /data\/streaming_output.json$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      template: './src/index.template.ejs',
      title: 'Reduxstrap!',
      chunks: [
        'index'
      ]
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ],
  node: {
    fs: 'empty'
  }
});
