const { UserscriptPlugin } = require('webpack-userscript');

module.exports = {
  plugins: [new UserscriptPlugin({
    headers: {
      name: "bumble-next"
    },
    proxyScript: {
      baseUrl: 'http://127.0.0.1:12345',
      filename: '[basename].proxy.user.js',
    },
  })],
};
