const { Router } = require('express');
const { check } = require('express-validator');
const { createRole, getActiveRoles, getAllRoles, updateRole } = require('../controllers/role');
const { fieldValidation } = require('../middlewares/fieldValidation');

const router = Router();

// Create a role
// POST: /api/{v}/role
router.post('/', [
    check('name', 'Name is requiered').not().isEmpty(),
    check('description', 'Description is requiered').not().isEmpty(),
    fieldValidation
    ], 
    createRole);

// Get active roles
// GET: /api/{v}/role
router.get('/', getActiveRoles);

// Get all roles
// GET /api/{v}/role/all
router.get('/all', getAllRoles);

// Update a role by id
// PUT /api/{v}/role/:id
router.put('/:id', updateRole);


module.exports = router;