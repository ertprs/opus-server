const { Router } = require('express');
const { check } = require('express-validator');
const { createCompany, getActiveCompanies } = require('../controllers/company');
const { fieldValidation } = require('../middlewares/fieldValidation');

const router = Router();

// Create a role
// POST: /api/{v}/company
router.post('/', [
        check('name', 'Name is requiered').not().isEmpty(),
        fieldValidation
    ], createCompany);

// Get active roles
// GET: /api/{v}/role
router.get('/', getActiveCompanies);

module.exports = router;