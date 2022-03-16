const { Router } = require('express');
const { check } = require('express-validator');
const { createCompany, getActiveCompanies, getAllCompanies, updateCompany, changeCompanyStatus, deleteCompany, getUserCompany } = require('../controllers/company');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a company
// POST: /api/{v}/company
router.post('/', [
    check('name', 'Name is requiered').not().isEmpty(),
    check('shortName', 'Short Name is requiered').not().isEmpty(),
    fieldValidation,
    tokenValidation,
    adminValidation
], createCompany);

// Get active companies
// GET: /api/{v}/company
router.get('/', [tokenValidation, userValidation], getActiveCompanies);

// Get all companies for administration
// GET: /api/{v}/company
router.get('/all', [tokenValidation, adminValidation], getAllCompanies);

// Updated a company
// PUT: /api/{v}/company/:id
router.put('/:id', [
    tokenValidation,
    adminValidation
], updateCompany);

// Change the status of a compnay
// PUT: /api/{v}/company/status/:id?type
router.put('/status/:id', [tokenValidation, adminValidation], changeCompanyStatus);

// Delete physically a company
// DELETE: /api/{v}/company/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteCompany);

// Get the user's company
// GET: /api/{v}/company/user
router.get('/user', [tokenValidation, userValidation], getUserCompany);

module.exports = router;