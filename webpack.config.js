const CopyWebpackPlugin = require('copy-webpack-plugin')

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
    },
    plugins: [
      new CopyWebpackPlugin([
        { 
          from: './node_modules/curl/dist/curl', 
          to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
        },
        { 
          from: './node_modules/mobile-range-slider/mobile-range-slider.js', 
          to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
        },
      ])
    ],
  };