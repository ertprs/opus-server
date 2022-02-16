const { Router } = require('express');
const { check } = require('express-validator');
const { createClient, getActiveClients, getAllClients } = require('../controllers/client');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a client
// POST: /api/{v}/client
router.post('/', [
        check('hasWhatsapp', 'WhatsApp info is required').not().isEmpty(),
        check('personId', 'Person info is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createClient);

// Get active clients
// GET: /api/{v}/client
router.get('/', [tokenValidation, userValidation], getActiveClients);

// Get all clients for administration
// GET: /api/{v}/client/all
router.get('/all', [tokenValidation, adminValidation], getAllClients);

module.exports = router;