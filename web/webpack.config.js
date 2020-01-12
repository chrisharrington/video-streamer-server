const path = require('path'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

const devMode = true;//process.env.NODE_ENV !== 'production';

module.exports = {
    mode: devMode ? 'development' : 'production',
    entry: path.resolve(__dirname, './app.tsx'),
    output: {
        filename: 'app.bundle.js',
        publicPath: '/',
        path: path.resolve(__dirname, './dist')
    },
    devtool: 'source-map',
    resolve: {
        alias: {
            '@web': __dirname
        },
        extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.jsx'
        ],
        modules: [
            '../node_modules',
            __dirname,
            path.resolve(__dirname, '../')
        ]
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)?$/,
                exclude: /node_modules/,
                include: __dirname,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.join(__dirname, '../tsconfig.json')
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')
                            ],
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
        ]
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router': 'ReactRouter',
        'react-router-dom': 'ReactRouterDOM'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            inject: true,
            hash: true
        }),
        
        new MiniCssExtractPlugin({
            filename: 'app.bundle.css',
            chunkFIlename: '[id].css'
        })
    ],
    devServer: {
        historyApiFallback: true
    }
}