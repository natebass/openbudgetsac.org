const path = require('path')

module.exports = /**
 * Runs exports.
 *
 * @param {any} env Input value.
 * @param {any} argv Input value.
 * @returns {any} Function result.
 */
(env, argv) => {
  const mode = argv && argv.mode ? argv.mode : 'production'
  const isProduction = mode === 'production'

  return {
    mode,
    devtool: isProduction ? false : 'eval-cheap-module-source-map',
    context: path.resolve(__dirname, 'js'),
    entry: './compare/index.jsx',
    output: {
      filename: 'compare.bundle.js',
      path: path.resolve(__dirname, 'js/dist')
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              cacheDirectory: false
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    }
  }
}
