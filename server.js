/* eslint no-console: 0 */
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.js';

//DEBUG: On localhost, we want to force the system to be on production (becauses
//it requires live production data), but still use the hot reloading. To be
//fair, is server.js ever used in a non-localhost context? (shaun 20170425)
const isProduction = false;  //NODE_ENV=production is set in package.json, but isProduction=false is used to force hot reloading 
//const isProduction = process.env.NODE_ENV === 'production';

const port = isProduction ? process.env.PORT : 4000;
const app = express();
const indexHtml = path.join(__dirname, 'dist/index.html');

if (!isProduction) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(indexHtml));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(indexHtml);
  });
}

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }

  console.info('==> Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
