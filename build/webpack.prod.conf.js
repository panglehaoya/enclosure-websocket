const path = require("path");
const baseConfig = require("./webpack.base.conf");
const { merge } = require("webpack-merge");
const isMinify = true;

module.exports = merge(baseConfig, {
  mode: "production",
  entry: {
    index: path.resolve(__dirname, "../src/index.ts"),
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    library: "phone-websocket",
    libraryTarget: "umd",
    filename: isMinify ? "[name].min.js" : "[name].js",
  },
});
