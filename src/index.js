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
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${ process.env.PORT || 3000 }`);
});