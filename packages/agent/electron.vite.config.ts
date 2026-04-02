import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path from "path";

// ESM-only packages must be bundled, not externalized
// These packages must be bundled into main.js, not externalized
// ESM-only packages + workspace packages + their deps
const BUNDLE_PACKAGES = [
  "electron-store",
  "conf",
  "dot-prop",
  "env-paths",
  "atomically",
  "active-win",
  "@time-tracker/shared",
  "zod",
];

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: BUNDLE_PACKAGES })],
    build: {
      outDir: "out/main",
      lib: {
        entry: path.resolve(__dirname, "src/main/main.ts"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/preload",
      lib: {
        entry: path.resolve(__dirname, "src/main/preload.ts"),
      },
    },
  },
  renderer: {
    root: "src/renderer",
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: path.resolve(__dirname, "src/renderer/index.html"),
      },
    },
  },
});
