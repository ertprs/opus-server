const { Router } = require('express');
const { check } = require('express-validator');
const { createClient, getActiveClients, getAllClients, updateClient, changeClientStatus, deleteClient, getClientByDni, registerClient } = require('../controllers/client');
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

// Updated a client
// PUT: /api/{v}/client/:id
router.put('/:id', [
    tokenValidation,
    userValidation
], updateClient);

// Change the status of a client
// PUT: /api/{v}/client/status/:id?type
router.put('/status/:id', [tokenValidation, userValidation], changeClientStatus);

// Delete physically a client
// DELETE: /api/{v}/client/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteClient);

// Get all clients for administration
// GET: /api/{v}/client/all
router.get('/find/dni/:dni', [tokenValidation, userValidation], getClientByDni);

// Register a new client
// POST: /api/{v}/client/register
router.post('/register', [
        check('dni', 'DNI is required').not().isEmpty(),
        check('names', 'Names are required').not().isEmpty(),
        check('lastNames', 'Lastnames are required').not().isEmpty(),
        check('mobilePhone', 'Mobile phone is required').not().isEmpty(),
        check('email', 'Email is required').not().isEmpty(),
        check('email', 'Email is invalid').isEmail(),
        fieldValidation,
        tokenValidation,
        userValidation,
    ], registerClient);

module.exports = router;