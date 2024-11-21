const path = require('path');
const { UserscriptPlugin } = require('webpack-userscript');
const dev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '<project-name>.user.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
  },
  proxyScript: {
    baseUrl: 'http://127.0.0.1:12345',
    filename: '[basename].proxy.user.js',
  },
  plugins: [
    new UserscriptPlugin({
      headers(original) {
        if (dev) {
          return {
            ...original,
            version: `${original.version}-build.[buildNo]`,
          }
        }

        return original;
      },
    }),
  ],
};
