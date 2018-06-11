const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require('path');

module.exports = (env, argv) => {
    const config = {
        entry: {
            boot: './ArticleTemplates/assets/js/boot.js',
            'garnett-style-sync': './ArticleTemplates/assets/scss/garnett-style-sync.scss',
            'garnett-style-async': './ArticleTemplates/assets/scss/garnett-style-async.scss',
            'fonts-ios': './ArticleTemplates/assets/scss/fonts-ios.scss',
            'fonts-android': './ArticleTemplates/assets/scss/fonts-android.scss',
            'outbrain': './ArticleTemplates/assets/scss/outbrain.scss',
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
                        "babel-loader",
                        {
                            loader: "eslint-loader",
                        }
                    ],
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
                        }
                    ]
                },
            ]
        },
        resolve: {
            modules: [
                path.resolve(__dirname, 'ArticleTemplates/assets/js'),
                "node_modules"
            ]
        },
        plugins: [
            new CopyWebpackPlugin([{
                    from: './node_modules/curl/dist/curl',
                    to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
                },
                {
                    from: './node_modules/mobile-range-slider/mobile-range-slider.js',
                    to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
                }, {
                    from: './node_modules/smooth-scroll/dist/smooth-scroll.min.js',
                    to: path.resolve(__dirname, 'ArticleTemplates/assets/build'),
                },
            ]),
            new MiniCssExtractPlugin({
                filename: "../css/[name].css",
                chunkFilename: "../css/[name].css",
            }),
        ],
    };

    if (argv.mode !== 'production') {
        config.devtool = 'source-map';
    }

    return config;
};