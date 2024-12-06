const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const OUTPUT_FOLDER_NAME = path.resolve(__dirname, "dist"); // Папка, куда всё заливаться сбилженный проект.

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    path: OUTPUT_FOLDER_NAME,
    filename: "bundle.js",
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
    new HtmlWebpackPlugin({
      template: "./public/index.html",
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
