import typescript from "@rollup/plugin-typescript";
import pkg from "../package.json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import { babel, getBabelOutputPlugin } from "@rollup/plugin-babel";
// import { uglify } from "rollup-plugin-uglify";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.module,
      format: "esm",
      // plugins: [
      //   getBabelOutputPlugin({
      //     presets: [["@babel/preset-env", { modules: false }]],
      //   }),
      // ],
    },
  ],
  plugins: [typescript(), commonjs(), resolve()],
};
