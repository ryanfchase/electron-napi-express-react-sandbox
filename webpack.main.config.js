const CopyPlugin = require("copy-webpack-plugin");
const rules = require('./webpack.rules');

/*
rules.push({
  test: /\.json$/,
  loader: 'file-loader',
});
*/

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
        "./public/celestron-small-light.png",
      ]
    }),
  ],
};
