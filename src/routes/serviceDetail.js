const { Router } = require('express');
const { check } = require('express-validator');
const { createServiceDetail, updateServiceDetail, changeStatusServiceDetail, deleteServiceDetail } = require('../controllers/serviceDetail');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a service order detail
// POST: /api/{v}/detail
router.post('/', [
        check('cost', 'Cost is required').not().isEmpty(),
        check('cost', 'Cost must be greater than 0 and less than 9999').isFloat({ min: 0, max: 9999 }),
        check('serviceId', 'Service is required').not().isEmpty(), 
        check('serviceOrderId', 'Service order is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createServiceDetail);

// Updated a service order detail
// PUT: /api/{v}/detail/:id 
router.put('/:id', [ tokenValidation, userValidation ], updateServiceDetail);

// Change status of a service order detail
// PUT: /api/{v}/order/detail/:id 
router.put('/status/:id', [ tokenValidation, userValidation ], changeStatusServiceDetail);

// Delete physically a serviceOrder detail
// DELETE: /api/{v}/detail/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteServiceDetail);

module.exports = router;    