const { Router } = require('express');
const { check } = require('express-validator');
const { createService } = require('../controllers/service');
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

module.exports = router;