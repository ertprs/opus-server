const { Router } = require('express');
const { check } = require('express-validator');
const { createRole, getActiveRoles, getAllRoles, updateRole, changeRoleStatus, deleteRole } = require('../controllers/role');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a role
// POST: /api/{v}/role
router.post('/', [
        check('name', 'Name is requiered').not().isEmpty(),
        check('description', 'Description is requiered').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        adminValidation
    ],
    createRole);

// Get active roles
// GET: /api/{v}/role
router.get('/', [tokenValidation, userValidation], getActiveRoles);

// Get all roles
// GET /api/{v}/role/all
router.get('/all', [tokenValidation, adminValidation], getAllRoles);

// Update a role by id
// PUT /api/{v}/role/:id
router.put('/:id', [tokenValidation, adminValidation], updateRole);

// Change a role status
// PUT: /api/{v}/role/status/:id
router.put('/status/:id', [tokenValidation, adminValidation], changeRoleStatus);

// Delete a role
// DELETE: /api/{v}/role/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteRole);

module.exports = router;