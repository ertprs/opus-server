const { Router } = require('express');
const { check } = require('express-validator');
const { createPerson, getActivePeople, changePersonStatus, updatePerson, getAllPeople, deletePerson } = require('../controllers/person');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { userValidation, adminValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a person
// POST: /api/{v}/person
router.post('/', [
        check('names', 'Name are requiered').not().isEmpty(),
        check('lastNames', 'Last name are requiered').not().isEmpty(),
        check('dni', 'DNI is requiered').not().isEmpty(),
        check('dni').isLength({ min: 10, max: 13 }),
        check('mobilePhone', 'Mobile phone is requiered').not().isEmpty(),
        tokenValidation,
        userValidation,
        fieldValidation
    ],
    createPerson);

// Get active people
// GET: /api/{v}/person
router.get('/', [tokenValidation, userValidation], getActivePeople);

// Get all people for administration
// GET: /api/{v}/person
router.get('/all', [tokenValidation, adminValidation], getAllPeople);

// Update a person
// PUT: /api/{v}/person/:id
router.put('/:id', [tokenValidation, adminValidation], updatePerson);

// Change the status of a person
// PUT: /api/{v}/person/status/:id?type
router.put('/status/:id', [tokenValidation, adminValidation], changePersonStatus);

// Delete physically a person
// DELETE: /api/{v}/person/:id
router.delete('/:id', [tokenValidation, adminValidation], deletePerson);

module.exports = router;