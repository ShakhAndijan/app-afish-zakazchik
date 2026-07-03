const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const STUB = path.resolve(__dirname, 'stubs/empty.js');

// react-native-qrcode-svg → react-native-svg/css → css-tree (Node-only).
// Stub both problem modules so Metro can bundle on Android/iOS.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-svg/css' || moduleName === 'css-tree') {
    return { type: 'sourceFile', filePath: STUB };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
