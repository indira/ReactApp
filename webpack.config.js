//This will guve us whether we are running the build or the dev environment
const currentTask = process.env.npm_lifecycle_event
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin") //minimize the styles[hash].css file size
const HtmlWebpackPlugin = require("html-webpack-plugin")
const fse = require("fs-extra")

const postCSSPlugins = [require("postcss-import"), require("postcss-mixins"), require("postcss-simple-vars"), require("postcss-nested"), require("postcss-hexrgba"), require("autoprefixer")]

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy images", function () {
      fse.copySync("./app/images", "./dist/images")
    })
  }
}

let cssConfig = {
  test: /\.css$/,
  use: ["css-loader", { loader: "postcss-loader", options: { postcssOptions: { plugins: postCSSPlugins } } }]
}
//If there are more then one .html files we can use this
let pages = fse
  .readdirSync("./app")
  .filter(function (file) {
    return file.endsWith(".html")
  })
  .map(function (page) {
    return new HtmlWebpackPlugin({
      filename: page,
      template: `./app/${page}`
    })
  })

let config = {
  entry: "./app/Main.js",
  plugins: pages,
  module: {
    rules: [
      cssConfig,
      {
        test: /\.(jsx|js)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react", ["@babel/preset-env", { targets: { node: "12" } }]]
          }
        }
      }
    ]
  }
}

if (currentTask == "dev") {
  cssConfig.use.unshift("style-loader")
  config.output = {
    publicPath: "/",
    path: path.resolve(__dirname, "app"),
    filename: "bundled.js"
  }
  config.devServer = {
    port: 3000,
    static: {
      directory: path.join(__dirname, "app")
    },
    hot: true,
    liveReload: false,
    historyApiFallback: true
  }
  config.mode = "development"
}

if (currentTask == "build") {
  config.module.rules.push({
    test: /\.(jsx|js)$/,
    exclude: /(node_modules)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-react", "@babel/preset-env"]
      }
    }
  })
  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  config.output = {
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  }
  config.mode = "production"
  config.optimization = {
    splitChunks: { chunks: "all" },
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()]
  }
  config.plugins.push(new CssMinimizerPlugin(), new MiniCssExtractPlugin({ filename: "styles.[chunkhash].css" }), new RunAfterCompile())
}

module.exports = config
