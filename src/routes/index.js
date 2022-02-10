const express = require('express');

const app = express();

const roleRoute = require('./role');

app.use('/api/v1', roleRoute);

module.exports = app;