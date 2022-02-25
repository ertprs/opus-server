const { Router } = require('express');
const { check } = require('express-validator');
const { getServiceOrderByStatusOrder, completeAnStatus, finishServiceOrder } = require('../controllers/statusChange');

const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Get service orders by status in a company
// GET: /api/{v}/change/status
router.get('/status', [tokenValidation, userValidation], getServiceOrderByStatusOrder);

// Change the status by finishing the current status
// PUT: /api/{v}/change/:orderStatus
router.post('/', [ 
    check('serviceOrderId', 'Service order is required').not().isEmpty(), 
    fieldValidation, 
    tokenValidation, 
    userValidation
], completeAnStatus);

router.put('/finish/:serviceOrder', [tokenValidation, userValidation], finishServiceOrder);

module.exports = router;