const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@noble/hashes/crypto.js': path.resolve(__dirname, 'node_modules/@noble/hashes/crypto.js'),
};

module.exports = config;
