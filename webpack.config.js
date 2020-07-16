const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => {
  const config = {
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_fnames: true,
          }
        })
      ]
    },
    entry: {
      boot: './ArticleTemplates/assets/js/boot.js',
        'style-sync': './ArticleTemplates/assets/scss/style-sync.scss',
        'style-async': './ArticleTemplates/assets/scss/style-async.scss',
        'fonts-ios': './ArticleTemplates/assets/scss/fonts-ios.scss',
        'fonts-android': './ArticleTemplates/assets/scss/fonts-android.scss',
        'interactive': './ArticleTemplates/assets/scss/interactive.scss',
      },
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
      },
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            "babel-loader"
          ],
        },
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: ['babel-loader']
        },
        {
          test: /\.js$/,
          exclude: [
            /node_modules/,
            path.resolve(__dirname, "ArticleTemplates/assets/js/bootstraps/"),
            path.resolve(__dirname, "ArticleTemplates/assets/js/modules/")
          ],
          use: ['eslint-loader']
        },
        {
          test: /\.scss$/,
          use: [{
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
              options: {
                url: false,
                minimize: true,
                sourceMap: argv.mode !== 'production',
              }
          },
          {
            loader: 'sass-loader',
              options: {
                sourceMap: argv.mode !== 'production'
              }
          }]
        }]
      },
      resolve: {
        modules: [
          path.resolve(__dirname, 'ArticleTemplates/assets/js'),
            "node_modules"
        ]
      },
      plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
        new webpack.DefinePlugin({
          BUILD_NUMBER: process.env.BUILD_NUMBER || 0
        }),
        new CopyWebpackPlugin({
          patterns: [{
            from: './node_modules/curl/dist/curl',
            to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
          },
          {
            from: 'ArticleTemplates/assets/js/modules/mobile-range-slider.js',
            to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
          },
          {
            from: './node_modules/intersection-observer/intersection-observer.js',
            to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
          },
          {
            from: './node_modules/classlist-polyfill/src/index.js',
            to: path.resolve(__dirname, 'ArticleTemplates/assets/build/classlist-polyfill'),
          },
          {
            from: './node_modules/smooth-scroll/dist/smooth-scroll.polyfills.min.js',
            to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
          }],
        }),
        new MiniCssExtractPlugin({
          filename: "../css/[name].css",
          chunkFilename: "../css/[name].css",
        })],
    };
    
    if (argv.mode !== 'production') {
      config.devtool = 'source-map';
    }
    
    return config;
};
