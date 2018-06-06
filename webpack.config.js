const path = require('path');

module.exports = {
    entry: {
      boot: './ArticleTemplates/assets/js/boot.js',
      // article: './ArticleTemplates/assets/js/article.js'
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      path: path.resolve(__dirname, 'ArticleTemplates/assets/build')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
                presets: [
                  path.resolve(__dirname, 'node_modules/babel-preset-env')
                ],
            }
          }
        }
      ]
    }
  };