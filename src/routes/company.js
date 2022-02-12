const { Router } = require('express');
const { check } = require('express-validator');
const { createCompany, getActiveCompanies, getAllCompanies, updateCompany, changeCompanyStatus, deleteCompany } = require('../controllers/company');
const { fieldValidation } = require('../middlewares/fieldValidation');

const router = Router();

// Create a company
// POST: /api/{v}/company
router.post('/', [
    check('name', 'Name is requiered').not().isEmpty(),
    fieldValidation
], createCompany);

// Get active companies
// GET: /api/{v}/role
router.get('/', getActiveCompanies);

// Get all companies for administration
// GET: /api/{v}/role
router.get('/all', getAllCompanies);

// Updated a company
// PUT: /api/{v}/company/:id
router.put('/:id', [
    check('name', 'Name is requiered').not().isEmpty(),
    fieldValidation
], updateCompany);

// Change the status of a compnay
// PUT: /api/{v}/company/status/:id?type
router.put('/status/:id', changeCompanyStatus);

// Delete physically a company
// DELETE: /api/{v}/company/:id
router.delete('/:id', deleteCompany);


module.exports = router;