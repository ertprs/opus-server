const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Environment variables
require('dotenv').config();

const app = express();

// Security
app.use(helmet());
app.disable('x-powered-by');

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use(require('./routes/index'));

// Listen requests
app.listen(process.env.PORT || 4000, () => {
    console.log('\x1b[36m%s\x1b[0m', `Server running on port ${ process.env.PORT || 4000 }`);
});