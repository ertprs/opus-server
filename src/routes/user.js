const { Router } = require('express');
const { check } = require('express-validator');
const { createUser, getActiveUsers, getAllUsers, updateUser, changeUserStatus } = require('../controllers/user');
const { fieldValidation } = require('../middlewares/fieldValidation');

const router = Router();

// Create a user
// POST: /api/{v}/user
router.post('/', [
        check('email', 'Email requiered').not().isEmpty(),
        check('password', 'Password requiered').not().isEmpty(),
        check('companyId', 'Company is requiered').not().isEmpty(),
        check('personId', 'Person is requiered').not().isEmpty(),
        check('email', 'Email must be a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        fieldValidation
    ],
    createUser);

// Get active users
// GET: /api/{v}/user
router.get('/', getActiveUsers);

// Get all users for administration
// GET: /api/{v}/user
router.get('/all', getAllUsers);

// Update a user
// PUT: /api/{v}/user/:id
router.put('/:id', updateUser);

// Change the status of a user
// PUT: /api/{v}/user/status/:id?type
router.put('/status/:id', changeUserStatus);

/* 
// Delete physically a user
// DELETE: /api/{v}/user/:id
router.delete('/:id', deleteuser); 
*/

module.exports = router;