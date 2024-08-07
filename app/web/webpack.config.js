const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (env) => {
  return {
    mode: env.mode ?? 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].[contenthash].js',
      clean: true
    },
    plugins: [
      new HtmlWebpackPlugin({template: path.resolve(__dirname, 'public', 'index.html')}),
    ],
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js']
    },
    devtool: 'inline-source-map',
    devServer: {
      port: 3000,
      open: true
    }
  }
}