import { nodeResolve } from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

export default [
  // JavaScript bundle
  {
    input: "src/logger.js",
    output: {
      file: "dist/logger.js",
      format: "es",
      sourcemap: false,
    },
    plugins: [nodeResolve()],
  },
  // TypeScript declarations
  {
    input: "src/logger.d.ts",
    output: {
      file: "dist/logger.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
