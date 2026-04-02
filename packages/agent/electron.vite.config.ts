import { defineConfig } from "electron-vite";
import path from "path";

export default defineConfig({
  main: {
    build: {
      outDir: "out/main",
      lib: {
        entry: path.resolve(__dirname, "src/main/main.ts"),
      },
      rollupOptions: {
        // Only native .node modules need external — everything else bundled
        external: ["better-sqlite3"],
      },
    },
  },
  preload: {
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
