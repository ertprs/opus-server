const { Router } = require('express');
const { check } = require('express-validator');
const { createService, getActiveServices, getAllServices, updateService, changeServiceStatus, deleteService } = require('../controllers/service');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a service
// POST: /api/{v}/service
router.post('/', [
        check('name', 'Name info is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createService);

// Get active services
// GET: /api/{v}/services
router.get('/', [tokenValidation, userValidation], getActiveServices);

// Get all services
// GET: /api/{v}/services
router.get('/all', [tokenValidation, adminValidation], getAllServices);

// Update a service by id
// PUT /api/{v}/service/:id
router.put('/:id', [tokenValidation, userValidation], updateService);

// Change the status of a service
// PUT: /api/{v}/service/status/:id?type
router.put('/status/:id', [tokenValidation, userValidation], changeServiceStatus);

// Delete physically a service
// DELETE: /api/{v}/service/:id
router.delete('/:id', deleteService);

module.exports = router;