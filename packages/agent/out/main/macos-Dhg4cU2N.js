"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("node:path");
const require$$0 = require("node:util");
const childProcess = require("node:child_process");
const node_url = require("node:url");
const __dirname$1 = path.dirname(node_url.fileURLToPath(require("url").pathToFileURL(__filename).href));
const execFile = require$$0.promisify(childProcess.execFile);
const binary = path.join(__dirname$1, "../main");
const parseMac = (stdout) => {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    console.error(error);
    throw new Error("Error parsing window data");
  }
};
const getArguments = (options) => {
  if (!options) {
    return [];
  }
  const arguments_ = [];
  if (options.accessibilityPermission === false) {
    arguments_.push("--no-accessibility-permission");
  }
  if (options.screenRecordingPermission === false) {
    arguments_.push("--no-screen-recording-permission");
  }
  return arguments_;
};
async function activeWindow(options) {
  const { stdout } = await execFile(binary, getArguments(options));
  return parseMac(stdout);
}
exports.activeWindow = activeWindow;
