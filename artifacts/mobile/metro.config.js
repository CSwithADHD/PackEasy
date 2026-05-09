const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /node_modules\/.pnpm\/@protobufjs\+aspromise[^/]*\/node_modules\/@protobufjs\/aspromise_tmp.*/,
  /node_modules\/.pnpm\/protobufjs[^/]*\/node_modules\/protobufjs_tmp.*/,
];

module.exports = config;
