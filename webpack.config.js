const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require('path');

module.exports = {
    entry: {
      boot: './ArticleTemplates/assets/js/boot.js',
      'garnett-style-sync': './ArticleTemplates/assets/scss/garnett-style-sync.scss',
      'garnett-style-async': './ArticleTemplates/assets/scss/garnett-style-async.scss',
      'fonts-ios': './ArticleTemplates/assets/scss/fonts-ios.scss',
      // 'fonts-android': './ArticleTemplates/assets/scss/fonts-android.scss',
      'outbrain': './ArticleTemplates/assets/scss/outbrain.scss',
      'interactive': './ArticleTemplates/assets/scss/interactive.scss',
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
        },
        {
          test: /\.scss$/,
          use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              "css-loader", // translates CSS into CommonJS
              "sass-loader" // compiles Sass to CSS
          ]
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [{
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                publicPath: '../img',
                emitFile: false,
              }
          }],
        },
        {
          test: /\.(otf|ttf)$/i,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: '../fonts',
              emitFile: false,
            }
          }],
        },
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
      ]),
      new MiniCssExtractPlugin({
        filename: "../css/[name].css",
        chunkFilename: "../css/[id].css",
      }),
    ],
  };

  // const CopyWebpackPlugin = require('copy-webpack-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// const path = require('path');

// module.exports = {
//     entry: {
//         'boot': './ArticleTemplates/assets/js/boot.js',
//         // 'garnett-style-sync': './ArticleTemplates/assets/scss/garnett-style-sync.scss',
//         // 'garnett-style-async': './ArticleTemplates/assets/scss/garnett-style-sync.scss',
//         // 'fonts-ios': './ArticleTemplates/assets/scss/fonts-ios.scss',
//         // 'fonts-android': './ArticleTemplates/assets/scss/fonts-android.scss',
//         // 'outbrain': './ArticleTemplates/assets/scss/outbrain.scss',
//         // 'interactive': './ArticleTemplates/assets/scss/interactive.scss',
//     },
//     output: {
//         filename: 'build/[name].js',
//         chunkFilename: 'build/[name].js',
//         path: path.resolve(__dirname, 'ArticleTemplates/assets'),
//     },
//     module: {
//         rules: [{
//                 test: /\.js$/,
//                 exclude: /node_modules/,
//                 loader: "babel-loader",
//             },
//             {
//                 test: /\.scss$/,
//                 use: [
//                     {
//                       loader: MiniCssExtractPlugin.loader,
//                       options: {
//                         publicPath: path.resolve(__dirname, 'ArticleTemplates/assets/css')
//                       }
//                     },
//                     "css-loader", // translates CSS into CommonJS
//                     "sass-loader" // compiles Sass to CSS
//                 ]
//             },
//             {
//               test: /\.(gif|png|jpe?g|svg)$/i,
//               use: [{
//                   loader: 'file-loader',
//                   options: {
//                     name: '[name].[ext]',
//                     publicPath: '../img',
//                     emitFile: false,
//                   }
//               }],
//             },
//             {
//               test: /\.(otf|ttf)$/i,
//               use: [{
//                 loader: 'file-loader',
//                 options: {
//                   name: '[name].[ext]',
//                   publicPath: '../fonts',
//                   emitFile: false,
//                 }
//               }],
//             },
//         ]
//     },
//     resolve: {
//         modules: [
//             path.resolve(__dirname, './ArticleTemplates/assets/js'),
//             "node_modules"
//         ]
//     },
//     plugins: [
//         new CopyWebpackPlugin([{
//                 from: './node_modules/curl/dist/curl',
//                 to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
//             },
//             {
//                 from: './node_modules/mobile-range-slider/mobile-range-slider.js',
//                 to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
//             },
//         ]),
//         new MiniCssExtractPlugin({
//             // Options similar to the same options in webpackOptions.output
//             // both options are optional
//             filename: "css/[name].css",
//             chunkFilename: "css/[id].css",
//         }),
//     ],
// };