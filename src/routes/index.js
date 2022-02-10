// Connecting with the server
const express = require('express');

// Instanciation of the app
const app = express();

// Routes 
const roleRoute = require('./role');

app.use('/api/v1/role', roleRoute);

module.exports = app;