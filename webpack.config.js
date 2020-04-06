const path = require('path')

const webpack = require('webpack')
const GenerateJsonPlugin = require('generate-json-webpack-plugin')
const ExtensionReloader = require('webpack-extension-reloader')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')

const pkg = require('./package.json')

const distFolderName = 'unpacked-extension'

module.exports = (_, { mode }) => {
  const isProduction = mode === 'production'

  const manifest = {
    ...pkg.extensionManifest,
    version: pkg.version,
    description: pkg.description,
  }

  const config = {
    mode,
    devtool: 'inline-source-map',

    entry: {
      'content-script': path.join(__dirname, 'src', 'entry-content-script.js'),
      background: path.join(__dirname, 'src', 'entry-background.js'),
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, distFolderName),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    module: {
      rules: [
        {
          test: /\.(css$)/,
          use: ['style-loader', 'css-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg)/i,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        },
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['babel-plugin-styled-components'],
            },
          },
        },
      ],
    },

    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.DISPLAY_NAME': JSON.stringify(pkg.displayName),
        'process.env.VERSION': JSON.stringify(pkg.version),
      }),
      new GenerateJsonPlugin('manifest.json', manifest),
      new ExtensionReloader({
        manifest: path.resolve(__dirname, distFolderName, 'manifest.json'),
      }),
    ],
  }

  if (isProduction) {
    config.devtool = false
    config.plugins[config.plugins.length - 1] = new ZipPlugin({
      path: '../',
      filename: 'tako-github-file-tree.zip',
    })
  }

  return config
}
