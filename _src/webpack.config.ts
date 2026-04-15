const path = require('node:path');

module.exports = /**
 * Build the compare-page webpack configuration.
 *
 * @param {unknown} _env CLI environment values.
 * @param {{mode?: string}} argv CLI arguments.
 * @returns {import('webpack').Configuration} Webpack configuration object.
 */
(_env: unknown, argv: {mode?: string} = {}) => {
  const mode = argv.mode ?? 'production';
  const isProduction = mode === 'production';

  return {
    mode,
    devtool: isProduction ? false : 'eval-cheap-module-source-map',
    context: path.resolve(__dirname, 'js'),
    entry: './compare/index.tsx',
    output: {
      filename: 'compare.bundle.js',
      path: path.resolve(__dirname, 'generated/js/dist'),
    },
    performance: {
      hints: false,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /(node_modules|bower_components|generated)/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: false,
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  };
};
