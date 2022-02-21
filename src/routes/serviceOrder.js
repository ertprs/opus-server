const { Router } = require('express');
const { check } = require('express-validator');
const { createServiceOrder } = require('../controllers/serviceOrder');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a service status
// POST: /api/{v}/status
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

module.exports = router;    