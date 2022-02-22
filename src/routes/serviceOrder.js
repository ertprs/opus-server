const { Router } = require('express');
const { check } = require('express-validator');
const { createServiceOrder, getActiveServiceOrder, getAllActiveServices } = require('../controllers/serviceOrder');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a service order
// POST: /api/{v}/order
router.post('/', [
        check('observation', 'Observation is required').not().isEmpty(),
        check('problemDescription', 'Problem description is required').not().isEmpty(),
        check('clientId', 'Client is required').not().isEmpty(),
        check('modelId', 'Model is required').not().isEmpty(),
        check('statusId', 'Service status is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createServiceOrder);

// Get company's active service order
// GET: /api/{v}/order
router.get('/', [tokenValidation, userValidation], getActiveServiceOrder);

// Get all service orders
// GET: /api/{v}/order/all
router.get('/all', [tokenValidation, adminValidation], getAllActiveServices);

module.exports = router;