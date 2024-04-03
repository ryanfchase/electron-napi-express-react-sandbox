const CopyPlugin = require("copy-webpack-plugin");
const rules = require('./webpack.rules');

module.exports = {
  entry: './src/main.js',
  module: {
    rules: rules,
  },
  plugins: [
    // we only want to copy in images used for the app icon and favicon
    new CopyPlugin({
      patterns: [
        "./public/celestron-small.jpg",
        "./public/celestron.ico",
        "./public/celestron-small-light.png",
        "./public/wifi-technology.avif",
        "./public/wifi-technology.png",
        "./src/splash.html"
      ]
    }),
  ],
};
