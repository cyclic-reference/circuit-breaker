var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var htmlLoader = require('raw-loader');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var proxy = require('http-proxy-middleware');
var https = require('https');
var keepAliveAgent = new https.Agent({keepAlive: true});
const ProvidePlugin = require('webpack/lib/ProvidePlugin');

var proxyPeel = proxy('/hystrix', {
    target: 'https://web-service:3344',
    changeOrigin: true,               // needed for virtual hosted sites
    ws: true,
    secure: false,
    agent: keepAliveAgent
});

module.exports = {
    entry: {
        'stylez': './src/app/assets/css/sassy.sass',
        'app': './src/main.ts',
        'vendor': './src/vendor.ts',
        'polyfills': './src/polyfills.ts'

    },
    module: {
        rules: [
            {
                test: require.resolve('jquery'), use: [
                {
                    loader: 'expose-loader',
                    options: 'jQuery'
                }, {
                    loader: 'expose-loader',
                    options: '$'
                }
            ]
            },
            {
                test: require.resolve('d3'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'd3'
                    }
                ]
            },
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader',
                    {
                        loader: 'awesome-typescript-loader',
                        options: {configFileName: path.resolve(__dirname, 'src', 'tsconfig.json')}
                    }, 'angular2-template-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: [/node_modules/, /build/, /dist/, /angular-project/, /app/]
            },
            {
                test: /\.(html)$/,
                exclude: [/index\.html/],
                loader: "file-loader?name=templates/[name].[ext]"
            },
            {
                test: /\.(htm)$/,
                loader: "raw-loader"
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]',
                exclude: [/node_modules/, /build/, /dist/, /angular-project/, /gradle/]
            },
            {
                test: /\.css$/,
                exclude: [/build/, /dist/, /gradle/],
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
            {
                test: /\.s[ac]ss$/,
                exclude: [/build/, /dist/, /gradle/],
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            }
        ]
    },
    output: {
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            mangle: {
                keep_fnames: true
            }
        }),
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            path.resolve(__dirname, 'src'), // location of your src
            {} // a map of your routes
        ),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            d3: 'd3',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
            // In case you imported plugins individually, you must also require them here:
            Util: "exports-loader?Util!bootstrap/js/dist/util",
            Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
            Tether: 'tether'
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: 'body'
        }),
        new CleanWebpackPlugin(['dist', 'build'], {
            root: path.resolve(__dirname),
            verbose: true,
            dry: false,
            exclude: ['shared.js']
        }),
        new ExtractTextPlugin({
            filename: 'style.[contenthash].css',
            allChunks: true
        }),
        new BrowserSyncPlugin({
            // browse to http://localhost:3000/ during development,
            // ./dist directory is being served
            host: 'localhost',
            port: 3000,
            https: true,
            server: {baseDir: ['dist']},
            middleware: [proxyPeel]
        })
    ]
};
