const { Router } = require('express');
const { check } = require('express-validator');
const { createServiceOrder, getActiveServiceOrder, getAllActiveServiceOrders, updateServiceOrder, changeServiceOrderStatus, deleteServiceOrder, getPendingServiceOrders, getCompleteServiceOrder, getClientServiceOrderByDni } = require('../controllers/serviceOrder');
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
router.get('/all', [tokenValidation, adminValidation], getAllActiveServiceOrders);

// Updated a service order
// PUT: /api/{v}/order/:id 
router.put('/:id', [tokenValidation, userValidation], updateServiceOrder);

// Change status of a service order
// PUT: /api/{v}/order/status/:id 
router.put('/status/:id', [tokenValidation, userValidation], changeServiceOrderStatus);

// Delete physically a serviceOrder
// DELETE: /api/{v}/order/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteServiceOrder);

// Get pending service orders
// GET: /api/{v}/order/pending
router.get('/pending', [tokenValidation, userValidation], getPendingServiceOrders);

// Get complete service orders
// GET: /api/{v}/order/single/detail
router.get('/single/detail', [tokenValidation, userValidation], getCompleteServiceOrder);

// Get client service orders
// GET: /api/{v}/order/client
router.get('/client', [tokenValidation, userValidation], getClientServiceOrderByDni);

module.exports = router;