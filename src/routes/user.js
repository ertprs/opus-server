const { Router } = require('express');
const { check } = require('express-validator');
const { createUser, getActiveUsers, getAllUsers, updateUser, changeUserStatus, deleteUser, changePassword } = require('../controllers/user');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create an user
// POST: /api/{v}/user
router.post('/', [
        check('email', 'Email requiered').not().isEmpty(),
        check('password', 'Password requiered').not().isEmpty(),
        check('companyId', 'Company is requiered').not().isEmpty(),
        check('personId', 'Person is requiered').not().isEmpty(),
        check('email', 'Email must be a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        fieldValidation,
        tokenValidation,
        adminValidation
    ],
    createUser);

// Get active users
// GET: /api/{v}/user
router.get('/', [tokenValidation, userValidation], getActiveUsers);

// Get all users for administration
// GET: /api/{v}/user
router.get('/all', [tokenValidation, adminValidation], getAllUsers);

// Update an user
// PUT: /api/{v}/user/:id
router.put('/:id', [tokenValidation, userValidation], updateUser);

// Change the status of an user
// PUT: /api/{v}/user/status/:id?type
router.put('/status/:id', [tokenValidation, adminValidation], changeUserStatus);

// Delete physically an user
// DELETE: /api/{v}/user/:id
router.delete('/:id', deleteUser);

// Change the user's password
// PUT: /api/{v}/user/change/password
router.put('/change/password', [
    check('oldPassword', 'Current password requiered').not().isEmpty(),
    check('password', 'Password requiered').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    fieldValidation,
    tokenValidation,
    userValidation
], changePassword);

module.exports = router;