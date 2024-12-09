const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
require("dotenv").config(); // Загружаем переменные окружения из файла .env

const OUTPUT_FOLDER_NAME = path.resolve(__dirname, "dist"); // Папка, куда всё заливаться сбилженный проект.

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    path: OUTPUT_FOLDER_NAME,
    filename: "bundle.js",
    clean: true, // Очищает выходную папку перед сборкой
  }, // выходной файл
  resolve: {
    extensions: [".tsx", ".ts", ".js", "jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      BASE_URL: JSON.stringify(process.env.BASE_URL),
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      baseUrl: process.env.BASE_URL,
    }),
  ],
  devServer: {
    static: {
      directory: OUTPUT_FOLDER_NAME,
    },
    port: 3000,
    historyApiFallback: true,
    compress: true,
  },
};
