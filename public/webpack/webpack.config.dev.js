const path = require('path');
const portfinder = require('portfinder')
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const config = {
  dev: {
    host: 'localhost', // can be overwritten by process.env.HOST
    assetsPublicPath: '/',
    proxyTable: { '/api/*': { target: 'http://localhost:5000' }, '/auth/google': { target: 'http://localhost:5000' }, '/auth/microsoft': { target: 'http://localhost:5000' } },
    port: 3003, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    devtool: 'eval-source-map',
    cacheBusting: true,
    cssSourceMap: false,
    disableHostCheck: true,
    compress: true,
  }
}

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
const dirname =
  module.exports = {
    devtool: 'inline-source-map',
    entry: ["react-hot-loader/patch", path.resolve(__dirname, '..', 'src/index.js')].filter(Boolean),
    mode: 'development',
    module: {
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                cache: true,
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: path.resolve(__dirname, '..'),

              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: path.resolve(__dirname, '..', "src"),
        },

        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: path.resolve(__dirname, '..', "src"),
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),

                plugins: [
                  "react-hot-loader/babel",
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent:
                            '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                        },
                      },
                    },
                  ],
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: false,
              },
            },
            // {
            //   test: /\.(js|jsx)$/i,
            //   exclude: /(node_modules|bower_components)/,
            //   use: ['babel-loader', 'eslint-loader']
            // },
            {
              test: /\.eot(\?v=\d+.\d+.\d+)?$/,
              use: ['file-loader']
            },
            {
              test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 10000,
                    mimetype: 'application/font-woff'
                  }
                }
              ]
            },
            {
              test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 10000,
                    mimetype: 'application/octet-stream'
                  }
                }
              ]
            },
            {
              test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 10000,
                    mimetype: 'image/svg+xml'
                  }
                }
              ]
            },
            {
              test: /\.(jpe?g|png|gif|ico|jfif)$/i,
              use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: '[name].[ext]'
                  }
                }
              ]
            },
            {
              test: /(\.css|\.scss|\.sass)$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true
                  }
                }, {
                  loader: 'postcss-loader',
                  options: {
                    plugins: () => [
                      require('autoprefixer')
                    ],
                    sourceMap: true
                  }
                },
                'resolve-url-loader?sourceMap',
                'sass-loader?sourceMap',
              ]
            }
          ],
        },

      ]
    },
    resolve: { extensions: ['*', '.js', '.jsx'] },
    output: {
      path: path.resolve(__dirname, '..', "dist"),
      publicPath: '/',
      filename: 'bundle.js'
    },
    devServer: {
      clientLogLevel: 'warning',
      historyApiFallback: true,
      hot: true,
      disableHostCheck: true,
      compress: true,
      host: HOST || config.dev.host,
      port: PORT || config.dev.port,
      open: config.dev.autoOpenBrowser,
      overlay: config.dev.errorOverlay
        ? { warnings: false, errors: true }
        : false,
      publicPath: config.dev.assetsPublicPath,
      proxy: config.dev.proxyTable,
      quiet: true, // necessary for FriendlyErrorsPlugin
      watchOptions: {
        poll: config.dev.poll,
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Glozic',
        template: 'public/index.html',
        minify: {
          removeComments: true,
          collapseWhitespace: true
        },
        inject: true
      }),
      new CopyWebpackPlugin([
        { from: 'public/images', to: 'images' },
        { from: 'public/manifest', to: 'manifest' }
      ])
    ]
  };

// module.exports = new Promise((resolve, reject) => {
//   portfinder.basePort = process.env.PORT || config.dev.port
//   portfinder.getPort((err, port) => {
//     if (err) {
//       reject(err)
//     } else {
//       // publish the new Port, necessary for e2e tests
//       process.env.PORT = port
//       // add port to devServer config
//       devWebpackConfig.devServer.port = port

//       // Add FriendlyErrorsPlugin
//       devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
//         compilationSuccessInfo: {
//           messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
//         },
//         onErrors: config.dev.notifyOnErrors
//           ? createNotifierCallback()
//           : undefined
//       }))

//       resolve(devWebpackConfig)
//     }
//   })
// })


// const createNotifierCallback = () => {
//   const notifier = require('node-notifier')
//   return (severity, errors) => {
//     if (severity !== 'error') return

//     const error = errors[0]
//     const filename = error.file && error.file.split('!').pop()

//     notifier.notify({
//       title: packageConfig.name,
//       message: severity + ': ' + error.name,
//       subtitle: filename || '',
//       icon: path.join(__dirname, 'logo.png')
//     })
//   }
// }