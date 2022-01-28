const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    index: path.resolve(__dirname, "../src/index.ts"),
  },
  module: {
   rules: [
     {
       test: /\.ts$/,
       use: ['babel-loader']
     }
   ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html')
    })
  ],
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].[hash:8].js",
  },
};