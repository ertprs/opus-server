const { Router } = require('express');
const { check } = require('express-validator');
const { createPerson, getActivePeople } = require('../controllers/person');
const { fieldValidation } = require('../middlewares/fieldValidation');

const router = Router();

// Create a person
// POST: /api/{v}/person
router.post('/', [
        check('names', 'Name are requiered').not().isEmpty(),
        check('lastNames', 'Last name are requiered').not().isEmpty(),
        check('dni', 'DNI is requiered').not().isEmpty(),
        check('mobilePhone', 'Mobile phone is requiered').not().isEmpty(),
        fieldValidation
    ],
    createPerson);

// Get active people
// GET: /api/{v}/person
router.get('/', getActivePeople);

// Get all people for administration
// GET: /api/{v}/person
router.get('/all', getActivePeople);

module.exports = router;