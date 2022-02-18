const { Router } = require('express');
const { check } = require('express-validator');
const { createServiceStatus, getActiveServiceStatus, getAllServiceStatus, updateServiceStatus, changeStatusOfServiceStatus, deleteServiceStatus } = require('../controllers/serviceStatus');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a service status
// POST: /api/{v}/status
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('order', 'Order is required').not().isEmpty(),
        check('order', 'Order value is not correct').isFloat({ min: 0, max: 9999 }),
        check('cost', 'Cost must be greater than 0 and less than 9999').isFloat({ min: 0, max: 9999 }),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createServiceStatus);

// Get active service status for the user's company
// GET: /api/{v}/status
router.get('/', [tokenValidation, userValidation], getActiveServiceStatus);

// Get all service status
// GET: /api/{v}/status/all
router.get('/all', [tokenValidation, adminValidation], getAllServiceStatus);

// Updated a service status
// PUT: /api/{v}/status/:id
router.put('/:id', [ tokenValidation, userValidation ], updateServiceStatus);

// Change the status of a service status
// PUT: /api/{v}/status/status/:id?type
router.put('/status/:id', [tokenValidation, userValidation], changeStatusOfServiceStatus);

// Delete physically a service status
// DELETE: /api/{v}/status/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteServiceStatus);

module.exports = router;