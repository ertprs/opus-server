const { Router } = require('express');
const { check } = require('express-validator');
const { createSurvey, getActiveSurveys, getAllSurveys, updateSurvey, changeSurveyStatus, deleteSurvey } = require('../controllers/survey');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a survey
// POST: /api/{v}/survey
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('startDate', 'Start date is required').not().isEmpty(),
        check('startDate', 'Start date must be a date').isDate(),
        check('startHour', 'Start hour is required').not().isEmpty(),
        check('endHour', 'End hour is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createSurvey);

// Get active surveys
// GET: /api/{v}/survey
router.get('/', [tokenValidation, userValidation], getActiveSurveys);

// Get all surveys for administration
// GET: /api/{v}/survey
router.get('/all', [tokenValidation, adminValidation], getAllSurveys);

// Update a survey
// GET: /api/{v}/survey/:survey
router.put('/:id', [tokenValidation, userValidation], updateSurvey);

// Change the status of a survey
// PUT: /api/{v}/survey/status/:id?type
router.put('/status/:id', [tokenValidation, userValidation], changeSurveyStatus);

// Delete physically a survey
// DELETE: /api/{v}/survey/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteSurvey );

module.exports = router;