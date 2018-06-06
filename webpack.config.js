const path = require('path');

module.exports = {
    entry: {
      boot: './ArticleTemplates/assets/js/boot.js',
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        }
      ]
    },
    resolve: {
      modules: [
        path.resolve(__dirname, './ArticleTemplates/assets/js'),
        "node_modules"
      ]
    }
  };