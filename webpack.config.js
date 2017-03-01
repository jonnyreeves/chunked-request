const path = require('path');

module.exports = {
  entry: "./test/integ/chunked-request.spec.js",
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'integration-tests.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src|test|node_modules/,
        loader: 'babel-loader?cacheDirectory'
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  }
};

