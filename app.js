
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');

Promise = require('bluebird');

const {
  connectToDatabase,
  globalResponseHeaders
} = require('./config');
const {
  errorHandler
} = require('./handlers');

dotenv.config();
const app = express();
const {
  bodyParserHandler,
  globalErrorHandler,
  fourOhFourHandler,
  fourOhFiveHandler
} = errorHandler;

connectToDatabase();

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json({
  type: '*/*'
}));
app.use(bodyParserHandler);

const {
  Orchestrator
} = require('./services');

app['cloud'] = new Orchestrator(app);

app.cloud.init();

app.use(globalResponseHeaders);


// Have Node serve the files for our built React app
app.use('/app',express.static(path.resolve(__dirname, './public/webapp'), {
  setHeaders: function(res, filePath) {
    res.contentType(path.basename(filePath));
  }
}));
app.use('/docs',express.static(path.resolve(__dirname, './public/docs'), {
  setHeaders: function(res, filePath) {
    res.contentType(path.basename(filePath));
    // res.type("text/html");
  }
}));
app.use('/demo',express.static(path.resolve(__dirname, './public/demo'), {
  setHeaders: function(res, filePath) {
    res.contentType(path.basename(filePath));
  }
}));
}));

app.get('*', fourOhFourHandler);

app.all('*', fourOhFiveHandler);

app.use(globalErrorHandler);

module.exports = app;
