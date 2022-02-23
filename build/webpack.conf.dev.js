const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: path.join(__dirname, "../src/demo/main.ts"),
  },
  devtool: "eval-cheap-module-source-map",
  resolve: {
    extensions: [".ts", ".vue", ".js"],
    alias: { "@": path.join(__dirname, "../src") },
  },
  devServer: {
    port: 3000,
    hot: true,
    contentBase: path.join(__dirname, "../dist"),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
        ],
      },
      {
        test: /\.ts/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "entry",
                  },
                ],
                [
                  "@babel/preset-typescript",
                  {
                    allExtensions: true,
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "../src/demo/index.html"),
    }),
  ],
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].[hash:6].js",
  },
};
