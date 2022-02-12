// Connecting with the server
const express = require('express');

// Instanciation of the app
const app = express();

// Routes 
const roleRoute = require('./role');
const companyRoute = require('./company');
const personRoute = require('./person');

app.use('/api/v1/role', roleRoute);
app.use('/api/v1/company', companyRoute);
app.use('/api/v1/person', personRoute);

module.exports = app;