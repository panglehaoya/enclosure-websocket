const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.conf");

module.exports = merge(baseConfig, {
  mode: "development",
  entry: {
    demo: path.resolve(__dirname, "../src/demo.ts"),
  },
  devServer: {
    port: 3000,
    hot: true,
    static: {
      directory: path.resolve(__dirname, "../dist"),
    },
  },
});
