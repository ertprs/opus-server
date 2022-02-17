const { Router } = require('express');
const { check } = require('express-validator');
const { createBrand, getActiveBrands, updateBrand, getAllBrands, changeBrandStatus, deleteBrand } = require('../controllers/brand');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a brand
// POST: /api/{v}/brand
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        adminValidation
    ],
    createBrand);

// Get active brands
// GET: /api/{v}/brands
router.get('/', [tokenValidation, userValidation], getActiveBrands);

// Get all brands
// GET: /api/{v}/brands/all
router.get('/all', [tokenValidation, adminValidation], getAllBrands);

// Update a brand by id
// PUT /api/{v}/brand/:id
router.put('/:id', [tokenValidation, adminValidation], updateBrand);

// Change the status of a brand
// PUT: /api/{v}/brand/status/:id?type
router.put('/status/:id', [tokenValidation, adminValidation], changeBrandStatus);

// Delete physically a company
// DELETE: /api/{v}/company/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteBrand);

module.exports = router;