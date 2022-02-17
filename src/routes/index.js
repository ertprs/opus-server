// Connecting with the server
const express = require('express');

// Instanciation of the app
const app = express();

// Default version of the API
const version = process.env.API_VERSION;

// Routes 
const roleRoute = require('./role');
const companyRoute = require('./company');
const personRoute = require('./person');
const userRoute = require('./user');
const authRoute = require('./authentication');
const clientRoute = require('./client');
const serviceRoute = require('./service');

app.use(`/api/${ version }/role`, roleRoute);
app.use(`/api/${ version }/company`, companyRoute);
app.use(`/api/${ version }/person`, personRoute);
app.use(`/api/${ version }/user`, userRoute);
app.use(`/api/${ version }/auth`, authRoute);
app.use(`/api/${ version }/client`, clientRoute);
app.use(`/api/${ version }/service`, serviceRoute);

module.exports = app;