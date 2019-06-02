const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan');
const responseTime = require('response-time');
const graphQLHTTP = require("express-graphql");
const routes = require('./routes');
const schema = require('./schema_graphql')
const app = express()

function defaultErrorHandler(error, req, res, next) {
  console.error(error)
  // TODO: If it's production, don't show the stack trace
  res.status(500).json({
    error: {
      message: `${error}`,
      stack: error.stack && error.stack.split(/\n/)
    }
  })
}

app.use(morgan('tiny'));

app.use(responseTime())

app.use(bodyParser.json({ strict: false }));

app.use('/v1', routes);

app.use('/graphql', graphQLHTTP({
  schema,
  graphiql: true
}))

app.use(defaultErrorHandler);

app.listen(3000);
