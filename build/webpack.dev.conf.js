const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig, {
  mode: 'development',
  devServer: {
    port: 3000,
    hot: true,
    static: {
      directory: path.resolve(__dirname, '../dist')
    }
  }
})