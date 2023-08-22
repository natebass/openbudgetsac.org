const path = require('path');
const autoprefixer = require('autoprefixer');
const miniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
  {
    name: "Site CSS",
    mode: "development" || "production",
    devtool: "eval-source-map",
    entry: "./css/main.scss",
    output: {
      path: path.join(__dirname, "dist"),
      filename: "main.css"
    },
    resolve: {
      extensions: ['.scss']
    },
    plugins: [
      new miniCssExtractPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.(scss)$/, use: [{
            loader: 'css-loader', // translates CSS into CommonJS modules
          }, {
            loader: 'postcss-loader', // Run post css actions
            options: {
              postcssOptions: {
                plugins: [autoprefixer]
              }
            }
          }, {
            loader: 'sass-loader' // compiles Sass to CSS
          }]
        }
      ]
    }
  },
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
  },
  {
    name: 'Compare React',
    mode: "development" || "production",
    entry: './js/compare/index.jsx',
    output: {
      filename: 'compare.bundle.js', path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.js', '.jsx', '.scss']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'], // was 'es2015'
              cacheDirectory: false
            }
          }
        },
        {
          test: /\.(scss)$/, use: [{
            loader: 'style-loader', // inject CSS to page
          }, {
            loader: 'css-loader', // translates CSS into CommonJS modules
          }, {
            loader: 'postcss-loader', // Run post css actions
            options: {
              plugins: function () { // post css plugins, can be exported to postcss.config.js
                return [precss, autoprefixer];
              }
            }
          }, {
            loader: 'sass-loader' // compiles Sass to CSS
          }]
        }
      ]
    }
  }];