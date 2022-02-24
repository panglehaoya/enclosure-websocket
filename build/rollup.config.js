import typescript from "@rollup/plugin-typescript";
import pkg from "../package.json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "../src/index.ts",
  output: [
    {
      file: pkg.module,
      format: "esm",
    },
  ],
  plugins: [typescript(), commonjs(), resolve()],
};
