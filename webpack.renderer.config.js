const rules = require('./webpack.rules');
// const CopyPlugin = require("copy-webpack-plugin");

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push(
  {
    test: /\.(png|jpe?g|gif|avif|svg|webp)$/i,
    loader: 'file-loader',
    options: {
      outputPath: 'images'
    }
  }
)

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
};
