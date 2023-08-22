const path = require('path');
const autoprefixer = require('autoprefixer');
const miniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
  {
    name: 'Flow Scripts',
    mode: "development" || "production",
    entry: './js/flow/flow.js',
    output: {
      filename: 'flow.bundle.js', path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'], // was 'es2015'
              cacheDirectory: false
            }
          }
        }
      ]
    }
  }];