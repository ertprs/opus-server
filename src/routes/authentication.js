const { Router } = require('express');
const { check } = require('express-validator');
const { authenticateUser, renewToken } = require('../controllers/authentication');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');

const router = Router();

// Authenticate a user
// POST: /api/{v}/auth/login
router.post('/login', [
        check('email', 'Email requiered').not().isEmpty(),
        check('password', 'Password requiered').not().isEmpty(),
        check('email', 'Email must be a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        fieldValidation
    ],
    authenticateUser);

// Renew authentication values
// GET: /api/{v}/auth/renew
router.get('/renew', tokenValidation ,renewToken);


module.exports = router;