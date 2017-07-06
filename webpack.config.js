const path = require('path');
const webpack = require('webpack');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');



module.exports = {
  resolve: {
    extensions: ['.js', '.vue'],
    modules: [
      path.join(__dirname, 'node_modules'),
    ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  entry: {
    'dd-tappable': path.join(__dirname, 'src/dd-tappable.js'),
    'test/simple/index': path.join(__dirname, 'src/test/simple/index.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  devServer: {
    contentBase: 'dist',
    port: 8080,
    inline: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader?presets[]=es2015',
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments  : false,
        semicolons: true,
      },
    }),
    new WebpackBuildNotifierPlugin({
      title: 'My Project Webpack Build',
      // sound: 'Funk',
      successSound: 'Funk',
      warningSound: 'Funk',
      failureSound: 'Basso',
      // logo: path.resolve("./img/favicon.png"),
      // suppressSuccess: true
    }),
  ],
}
